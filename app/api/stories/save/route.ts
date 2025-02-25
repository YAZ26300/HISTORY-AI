import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';

interface StoryPart {
  text: string;
  image: string;
}

export async function POST(request: Request) {
  try {
    // Récupérer le corps de la requête
    const { title, theme, ageRange, storyParts, userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Validation des entrées
    if (!title || !Array.isArray(storyParts) || storyParts.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides', 
          details: 'Le titre et au moins une partie d\'histoire sont requis'
        },
        { status: 400 }
      );
    }

    // Créer un client Supabase côté serveur avec la clé anonyme
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    console.log('URL Supabase:', supabaseUrl);
    console.log('Clé utilisée:', supabaseAnonKey ? 'Définie' : 'Non définie');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Vérifier si le bucket existe
    const bucketName = 'story-pdfs';
    
    // Contourner la vérification du bucket pour tester directement
    console.log('DEBUG: Tentative d\'utilisation directe du bucket:', bucketName);
    
    /* Commenté pour contourner la vérification
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError && bucketError.message.includes('Bucket not found')) {
      console.error(`Le bucket ${bucketName} n'existe pas`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bucket de stockage non disponible',
          details: `Le bucket "${bucketName}" n'existe pas. Veuillez demander à l'administrateur de le créer dans la console Supabase.`
        },
        { status: 500 }
      );
    } else if (bucketError) {
      console.error('Erreur lors de la vérification du bucket:', bucketError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la vérification du bucket de stockage',
          details: bucketError.message || 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
    */

    // Générer le PDF
    console.log('DEBUG: Génération du PDF...');
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Ajouter le titre
    doc.setFontSize(24);
    doc.text(title, 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Ajouter les métadonnées
    doc.setFontSize(12);
    if (theme) {
      doc.text(`Thème: ${theme}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (ageRange) {
      doc.text(`Âge recommandé: ${ageRange}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Ajouter chaque partie de l'histoire
    doc.setFontSize(14);
    for (let i = 0; i < storyParts.length; i++) {
      const part = storyParts[i];
      
      // Ajouter le titre de la partie
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Partie ${i + 1}`, 20, yPosition);
      yPosition += 10;
      
      // Ajouter le texte de la partie
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Diviser le texte en plusieurs lignes
      const splitText = doc.splitTextToSize(part.text, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7 + 15;
      
      // Essayer d'ajouter l'image si présente et valide
      try {
        if (part.image && part.image.startsWith('data:image')) {
          // Ajouter une nouvelle page pour l'image
          doc.addPage();
          yPosition = 20;
          
          // Ajouter l'image au PDF
          doc.addImage(part.image, 'JPEG', 20, yPosition, 170, 100);
          yPosition += 110;
        }
      } catch (imageError) {
        console.error(`Erreur lors de l'ajout de l'image ${i + 1}:`, imageError);
        // Continuer sans ajouter l'image
      }
      
      // Si ce n'est pas la dernière partie, ajouter une nouvelle page
      if (i < storyParts.length - 1) {
        doc.addPage();
        yPosition = 20;
      }
    }
    
    // Convertir le PDF en buffer pour Node.js
    const pdfOutput = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfOutput);
    
    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const pdfPath = `${userId}/${timestamp}_${safeTitle}.pdf`;
    
    // Télécharger le PDF dans Supabase Storage
    console.log('DEBUG: Tentative de téléchargement du PDF dans le bucket:', bucketName);
    console.log('DEBUG: Chemin du fichier:', pdfPath);
    
    try {
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(pdfPath, buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
        });
      
      console.log('DEBUG: Résultat upload:', uploadError ? 'Erreur' : 'Succès', uploadData);
      
      if (uploadError) {
        console.error('Erreur lors du téléchargement du PDF:', uploadError);
        
        if (uploadError.message.includes('row-level security policy')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Erreur de permission',
              details: 'Vous n\'avez pas les droits nécessaires pour télécharger des fichiers. Veuillez vérifier les politiques RLS dans Supabase.'
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors du téléchargement du PDF',
            details: uploadError?.message || 'Erreur inconnue'
          },
          { status: 500 }
        );
      }
    } catch (uploadCatchError: any) {
      console.error('Exception lors du téléchargement:', uploadCatchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Exception lors du téléchargement',
          details: uploadCatchError.message || 'Erreur non identifiée'
        },
        { status: 500 }
      );
    }
    
    // Récupérer l'URL publique du PDF
    console.log('DEBUG: Récupération de l\'URL publique');
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(pdfPath);
    
    // Enregistrer les métadonnées dans la table stories
    console.log('DEBUG: Enregistrement des métadonnées dans la base de données');
    try {
      const { error: dbError } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          title,
          theme,
          age_range: ageRange,
          pdf_path: pdfPath,
        });
      
      if (dbError) {
        console.error('Erreur lors de l\'enregistrement des métadonnées:', dbError);
        
        // Si l'erreur est due à la politique RLS
        if (dbError.message.includes('row-level security policy')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Erreur de permission',
              details: 'Vous n\'avez pas les droits nécessaires pour insérer des données. Veuillez vérifier les politiques RLS dans Supabase.',
              pdfUrl: publicUrl // On renvoie quand même l'URL du PDF
            },
            { status: 403 }
          );
        }
        
        // Si la table n'existe pas
        if (dbError.message.includes('relation "stories" does not exist')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Table manquante',
              details: 'La table "stories" n\'existe pas. Veuillez exécuter le script de création des tables dans Supabase.',
              pdfUrl: publicUrl // On renvoie quand même l'URL du PDF
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors de l\'enregistrement des métadonnées',
            details: dbError?.message || 'Erreur inconnue',
            pdfUrl: publicUrl // On renvoie quand même l'URL du PDF
          },
          { status: 500 }
        );
      }
    } catch (dbCatchError: any) {
      console.error('Exception lors de l\'accès à la base de données:', dbCatchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Exception lors de l\'accès à la base de données',
          details: dbCatchError.message || 'Erreur non identifiée',
          pdfUrl: publicUrl // On renvoie quand même l'URL du PDF
        },
        { status: 500 }
      );
    }
    
    console.log('DEBUG: Tout s\'est bien passé!');
    return NextResponse.json({
      success: true,
      message: 'Histoire sauvegardée avec succès',
      pdfUrl: publicUrl,
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'histoire:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la sauvegarde de l\'histoire',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 