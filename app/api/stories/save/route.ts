import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPdfBuffer } from '../../../../lib/pdf'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { story, theme, age_range, images } = await request.json()
    
    if (!story || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'La génération de PDF nécessite du contenu et des images' }, 
        { status: 400 }
      )
    }

    // Créer un client Supabase avec la gestion de cookies pour Next.js 15
    const cookieStore = cookies()
    
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

    // Récupérer la session utilisateur pour obtenir l'ID utilisateur
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé, veuillez vous connecter' }, { status: 401 })
    }
    
    // Vérifier si les buckets existent et les créer au besoin
    try {
      // Vérifier/créer le bucket principal pour les PDFs
      const { data: buckets } = await supabase.storage.listBuckets();
      const pdfBucketExists = buckets?.some(b => b.name === bucketName);
      const coverBucketExists = buckets?.some(b => b.name === coverBucketName);
      
      if (!pdfBucketExists) {
        console.log(`Création du bucket ${bucketName}`);
        await supabase.storage.createBucket(bucketName, { public: false });
      }
      
      if (!coverBucketExists) {
        console.log(`Création du bucket ${coverBucketName}`);
        await supabase.storage.createBucket(coverBucketName, { public: false });
      }
    } catch (bucketError: any) {
      console.error('Erreur lors de la vérification/création des buckets:', bucketError);
      return NextResponse.json(
        { 
          error: 'Problème avec le stockage Supabase', 
          details: bucketError.message 
        }, 
        { status: 500 }
      );
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
        let imageData: ArrayBuffer | null = null
        
        if (firstImageUrl.startsWith('data:')) {
          // Extraire les données base64
          const base64Data = firstImageUrl.split(',')[1]
          imageData = Buffer.from(base64Data, 'base64')
        } else {
          // C'est une URL, la télécharger
          const response = await fetch(firstImageUrl)
          imageData = await response.arrayBuffer()
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

    // Extraire le titre de l'histoire (première ligne ou premiers mots)
    const title = story.split('\n')[0].substring(0, 100) // Limiter à 100 caractères
    
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
          // Colonne supprimée car elle n'existe pas dans le schéma
          // cover_image_path: coverImagePath
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