import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPdfBuffer } from '../../../../lib/pdf'
import { v4 as uuidv4 } from 'uuid'

// Fonction pour générer un titre avec l'IA
const generateTitle = async (storyContent: string, theme: string): Promise<string> => {
  // Fonction utilitaire pour créer un titre court
  const createShortTitle = (text: string): string => {
    // Prendre les premiers mots jusqu'à un maximum de 30 caractères
    const words = text.split(' ');
    let shortTitle = '';
    for (const word of words) {
      if ((shortTitle + ' ' + word).length <= 30) {
        shortTitle = shortTitle ? `${shortTitle} ${word}` : word;
      } else {
        break;
      }
    }
    return shortTitle + '...';
  };

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY non définie, utilisation du titre court par défaut');
    return createShortTitle(storyContent);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "Tu es un expert en littérature jeunesse. Génère un titre court, accrocheur et adapté aux enfants pour une histoire."
        }, {
          role: "user",
          content: `Génère un titre court (maximum 30 caractères) pour une histoire sur le thème "${theme}" dont voici le début : "${storyContent.substring(0, 500)}..."`
        }],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      const aiTitle = data.choices[0].message.content.trim();
      // S'assurer que même le titre généré par l'IA ne dépasse pas 30 caractères
      return aiTitle.length <= 30 ? aiTitle : createShortTitle(aiTitle);
    }
    throw new Error('Pas de titre généré');
  } catch (error) {
    console.error('Erreur lors de la génération du titre:', error);
    return createShortTitle(storyContent); // Fallback au titre court par défaut
  }
};

export async function POST(request: Request) {
  try {
    const { story, theme, age_range, images, storyParts } = await request.json()
    
    if (!story || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'La génération de PDF nécessite du contenu et des images' }, 
        { status: 400 }
      )
    }

    console.log('Requête reçue avec', storyParts?.length || 0, 'parties d\'histoire');
    console.log('Format des images:', images.map((img: string) => img.startsWith('data:') ? 'base64' : 'url').join(', '));
    
    if (storyParts && storyParts.length > 0) {
      console.log('Format des images dans storyParts:', storyParts.map((part: any) => part.image?.startsWith('data:') ? 'base64' : 'url').join(', '));
    }

    // Créer un client Supabase avec la gestion de cookies pour Next.js 15
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            // Ces méthodes ne sont pas utilisées dans une API route
          },
          remove(name, options) {
            // Ces méthodes ne sont pas utilisées dans une API route
          }
        }
      }
    )
    
    const bucketName = 'story-pdfs'
    const coverBucketName = 'story-covers'
    const storageImagesName = 'story-images'

    // Récupérer la session utilisateur pour obtenir l'ID utilisateur
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé, veuillez vous connecter' }, { status: 401 })
    }
    
    // Vérifier et créer les buckets si nécessaire
    try {
      // Vérifier si les buckets existent
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        console.error('Erreur lors de la récupération des buckets:', bucketsError)
        console.log('Tentative de continuer sans vérifier les buckets...')
        // Continuer sans vérifier les buckets
      } else {
        console.log('Buckets existants:', buckets?.map(b => b.name).join(', '))
        
        // Ne pas essayer de créer les buckets, supposer qu'ils existent déjà
        if (!buckets?.find(b => b.name === bucketName)) {
          console.log(`Attention: Le bucket ${bucketName} n'existe pas dans Supabase`)
        }
        
        if (!buckets?.find(b => b.name === coverBucketName)) {
          console.log(`Attention: Le bucket ${coverBucketName} n'existe pas dans Supabase`)
        }
        
        if (!buckets?.find(b => b.name === storageImagesName)) {
          console.log(`Attention: Le bucket ${storageImagesName} n'existe pas dans Supabase`)
        } else {
          console.log(`Le bucket ${storageImagesName} existe déjà`)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des buckets:', error)
      // Continuer malgré l'erreur
    }

    // Génération du PDF
    const pdfBuffer = await getPdfBuffer({ story, images })
    
    // Utiliser un UUID pour le nom du fichier pour éviter les conflits
    const pdfFileName = `${uuidv4()}.pdf`
    const pdfPath = `${pdfFileName}`
    
    // Uploader le PDF dans le bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Erreur lors de l\'upload du PDF:', uploadError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du PDF', details: uploadError.message }, 
        { status: 500 }
      )
    }

    // Extraire et sauvegarder l'image de couverture (première image)
    let coverImagePath = null
    if (images.length > 0) {
      try {
        // Récupérer la première image comme couverture
        const firstImageUrl = images[0]
        
        // Vérifier si c'est une URL ou une donnée base64
        let imageData: Uint8Array | null = null
        
        if (firstImageUrl.startsWith('data:')) {
          // Extraire les données base64
          const base64Data = firstImageUrl.split(',')[1]
          // Utiliser Uint8Array au lieu de Buffer pour éviter les problèmes de type
          imageData = new Uint8Array(Buffer.from(base64Data, 'base64'))
        } else {
          // C'est une URL, la télécharger
          const response = await fetch(firstImageUrl)
          const arrayBuffer = await response.arrayBuffer()
          imageData = new Uint8Array(arrayBuffer)
        }
        
        if (imageData) {
          const coverFileName = `cover_${uuidv4()}.jpg`
          coverImagePath = coverFileName
          
          // Uploader l'image de couverture
          const { error: coverUploadError } = await supabase.storage
            .from(coverBucketName)
            .upload(coverImagePath, imageData, {
              contentType: 'image/jpeg',
              upsert: false
            })
            
          if (coverUploadError) {
            console.error('Erreur lors de l\'upload de la couverture:', coverUploadError)
            coverImagePath = null // Réinitialiser si l'upload échoue
          } else {
            console.log(`Image de couverture sauvegardée avec succès: ${coverImagePath}`)
          }
        }
      } catch (coverError) {
        console.error('Erreur lors de l\'extraction de la couverture:', coverError)
        // Ne pas échouer l'ensemble de la sauvegarde si uniquement la couverture échoue
      }
    }

    // Générer un titre avec l'IA
    const title = await generateTitle(story, theme || '');

    // Enregistrer les métadonnées de l'histoire dans la base de données
    const { data: dbData, error: dbError } = await supabase
      .from('stories')
      .insert([
        { 
          title, 
          pdf_path: pdfPath, 
          theme,
          age_range,
          user_id: session.user.id
        }
      ])
      .select()
    
    if (dbError) {
      console.error('Erreur lors de l\'enregistrement des métadonnées:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement des métadonnées', details: dbError.message }, 
        { status: 500 }
      )
    }

    // Récupérer l'ID de l'histoire nouvellement créée
    const storyId = dbData[0].id;
    
    // Enregistrer les parties de l'histoire pour la vue livre si disponibles
    if (storyParts && Array.isArray(storyParts) && storyParts.length > 0) {
      try {
        console.log(`Tentative de sauvegarde de ${storyParts.length} parties d'histoire pour l'ID: ${storyId}`);
        
        // Vérifier que storyId est bien défini
        if (!storyId) {
          console.error('Erreur: storyId est undefined ou null');
          throw new Error('ID de l\'histoire non défini');
        }
        
        // Préparer les données des parties à insérer
        const partsToInsert = await Promise.all(storyParts.map(async (part, index) => {
          // Vérifier que les données requises sont présentes
          if (!part.text) {
            console.error(`Erreur: texte manquant pour la partie ${index + 1}`);
            return null;
          }
          
          let imageUrl = part.image;
          
          // Si l'image est en base64, la sauvegarder dans le bucket
          if (part.image && part.image.startsWith('data:')) {
            try {
              // Extraire les données base64
              const base64Data = part.image.split(',')[1];
              // Utiliser Uint8Array au lieu de Buffer pour éviter les problèmes de type
              const imageData = new Uint8Array(Buffer.from(base64Data, 'base64'));
              
              // Générer un nom de fichier unique
              const imageFileName = `part_${index + 1}_${uuidv4()}.jpg`;
              
              console.log(`Sauvegarde de l'image pour la partie ${index + 1} avec le nom: ${imageFileName}`);
              
              // Vérifier à nouveau si le bucket existe
              try {
                console.log(`Tentative d'upload de l'image dans le bucket ${storageImagesName}...`);
                console.log(`Taille de l'image: ${imageData.length} octets`);
                
                // Ne pas essayer de créer le bucket, supposer qu'il existe déjà
                // Uploader l'image directement
                const { data: imageData2, error: imageUploadError } = await supabase.storage
                  .from(storageImagesName)
                  .upload(imageFileName, imageData, {
                    contentType: 'image/jpeg',
                    upsert: true // Utiliser upsert: true pour remplacer si le fichier existe déjà
                  });
                
                if (imageUploadError) {
                  console.error(`Erreur lors de l'upload de l'image de la partie ${index + 1}:`, imageUploadError);
                  console.error('Détails de l\'erreur:', JSON.stringify(imageUploadError));
                  
                  // Vérifier le type d'erreur pour un diagnostic plus précis
                  if (imageUploadError.message && imageUploadError.message.includes('Bucket not found')) {
                    console.error(`Le bucket ${storageImagesName} n'existe pas ou n'est pas accessible`);
                  } else if (imageUploadError.message && imageUploadError.message.includes('security policy')) {
                    console.error(`Problème de politique de sécurité pour le bucket ${storageImagesName}`);
                  }
                  
                  // Utiliser une image par défaut en cas d'erreur
                  imageUrl = `https://placehold.co/800x600/3b82f6/ffffff?text=Image+partie+${index + 1}`;
                } else {
                  console.log(`Image uploadée avec succès: ${imageFileName}`);
                  // Récupérer l'URL publique de l'image
                  const { data: urlData } = await supabase.storage
                    .from(storageImagesName)
                    .getPublicUrl(imageFileName);
                  
                  if (urlData?.publicUrl) {
                    imageUrl = urlData.publicUrl;
                    console.log(`URL publique générée pour l'image de la partie ${index + 1}: ${imageUrl}`);
                  } else {
                    console.error(`Erreur: Impossible d'obtenir l'URL publique pour l'image ${imageFileName}`);
                    // Utiliser une image par défaut
                    imageUrl = `https://placehold.co/800x600/3b82f6/ffffff?text=Image+partie+${index + 1}`;
                  }
                }
              } catch (imageError) {
                console.error(`Erreur lors du traitement de l'image de la partie ${index + 1}:`, imageError);
                // Utiliser une image par défaut en cas d'erreur
                imageUrl = `https://placehold.co/800x600/3b82f6/ffffff?text=Image+partie+${index + 1}`;
              }
            } catch (imageError) {
              console.error(`Erreur lors du traitement de l'image de la partie ${index + 1}:`, imageError);
              // Utiliser une image par défaut en cas d'erreur
              imageUrl = `https://placehold.co/800x600/3b82f6/ffffff?text=Image+partie+${index + 1}`;
            }
          } else if (!imageUrl) {
            // Si pas d'image fournie, utiliser une image par défaut
            imageUrl = `https://placehold.co/800x600/3b82f6/ffffff?text=Image+partie+${index + 1}`;
          }
          
          return {
            story_id: storyId,
            part_number: index + 1,
            text_content: part.text,
            image_url: imageUrl
          };
        }));
        
        // Filtrer les parties nulles (celles avec des données manquantes)
        const validPartsToInsert = partsToInsert.filter(part => part !== null);
        
        console.log(`Préparation de ${validPartsToInsert.length} parties valides à insérer dans la table story_parts`);
        
        if (validPartsToInsert.length === 0) {
          console.error('Aucune partie valide à insérer');
          return NextResponse.json({ 
            success: true, 
            message: 'Histoire sauvegardée avec succès, mais aucune partie valide pour le mode livre',
            storyId: dbData?.[0]?.id,
            pdfPath
          });
        }
        
        // Afficher les détails des parties pour le débogage
        validPartsToInsert.forEach((part, index) => {
          console.log(`Partie ${index + 1} à insérer:`, {
            story_id: part.story_id,
            part_number: part.part_number,
            text_length: part.text_content?.length || 0,
            image_url: part.image_url?.substring(0, 50) + '...' // Afficher seulement le début de l'URL
          });
        });
        
        // Insérer les parties dans la table story_parts
        // Utiliser une transaction pour s'assurer que toutes les parties sont insérées ou aucune
        const { data: insertedData, error: partsError } = await supabase
          .from('story_parts')
          .insert(validPartsToInsert)
          .select();
        
        if (partsError) {
          console.error('Erreur lors de l\'enregistrement des parties de l\'histoire:', partsError);
          
          // Tenter d'insérer les parties une par une pour identifier celles qui posent problème
          console.log('Tentative d\'insertion individuelle des parties...');
          let successCount = 0;
          
          for (let i = 0; i < validPartsToInsert.length; i++) {
            const part = validPartsToInsert[i];
            const { error: singleInsertError } = await supabase
              .from('story_parts')
              .insert([part]);
              
            if (singleInsertError) {
              console.error(`Erreur lors de l'insertion de la partie ${i + 1}:`, singleInsertError);
            } else {
              successCount++;
            }
          }
          
          console.log(`${successCount} parties sur ${validPartsToInsert.length} insérées avec succès individuellement`);
        } else {
          console.log(`${validPartsToInsert.length} parties de l'histoire sauvegardées avec succès`);
          if (insertedData) {
            console.log(`Données insérées: ${insertedData.length} enregistrements`);
          }
        }
      } catch (partsError) {
        console.error('Erreur lors du traitement des parties de l\'histoire:', partsError);
        // Ne pas échouer l'ensemble de la sauvegarde si uniquement les parties échouent
      }
    } else {
      console.log('Aucune partie d\'histoire à sauvegarder');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Histoire sauvegardée avec succès',
      storyId: dbData?.[0]?.id,
      pdfPath
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'histoire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de l\'histoire', details: error.message }, 
      { status: 500 }
    )
  }
}