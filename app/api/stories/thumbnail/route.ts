import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Récupérer le paramètre de chemin du PDF
  const url = new URL(request.url);
  const pdfPath = url.searchParams.get('pdfPath');
  
  if (!pdfPath) {
    return NextResponse.json(
      { error: 'Le chemin du PDF est requis' },
      { status: 400 }
    );
  }

  try {
    // Créer un client Supabase côté serveur avec la clé anonyme
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Option avancée: Vérifier si l'on peut extraire une image du PDF
    // Cette partie est commentée car elle est complexe à implémenter dans une API Next.js
    /*
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('story-pdfs')
      .download(pdfPath);
    
    if (downloadError) {
      console.error('Erreur lors du téléchargement du PDF:', downloadError);
      // Continuer avec l'image de repli au lieu d'échouer
    } else {
      // Ici on pourrait extraire la première image du PDF
      // avec une bibliothèque comme pdf.js, mais c'est complexe
    }
    */

    // Générer une URL d'image basée sur le nom du fichier
    const fileName = pdfPath.split('/').pop() || 'story';
    const seed = encodeURIComponent(fileName);
    
    // Construire l'URL DiceBear avec des paramètres optimisés pour notre design
    const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=0369a1,1d4ed8,4338ca,a855f7,6366f1&backgroundType=gradientLinear`;
    
    // Retourner l'URL de l'image au lieu de faire une redirection
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error: any) {
    console.error('Erreur lors de la génération de la miniature:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la miniature', details: error.message },
      { status: 500 }
    );
  }
} 