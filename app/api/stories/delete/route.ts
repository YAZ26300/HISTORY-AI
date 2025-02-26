import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    // Extraire l'ID de l'histoire de l'URL
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('id');

    if (!storyId) {
      return NextResponse.json(
        { error: 'ID de l\'histoire manquant' },
        { status: 400 }
      );
    }

    // Récupérer le token d'authentification de l'en-tête
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Créer un client Supabase avec le token d'authentification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('Tentative de suppression de l\'histoire:', storyId, 'par l\'utilisateur:', user.id);

    try {
      // 1. Récupérer les informations de l'histoire
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .eq('user_id', user.id)
        .single();

      if (storyError || !story) {
        console.error('Histoire non trouvée:', storyError);
        return NextResponse.json(
          { error: 'Histoire non trouvée ou accès non autorisé' },
          { status: 404 }
        );
      }

      console.log('Histoire trouvée:', story.id, 'titre:', story.title);

      // 2. Supprimer les parties de l'histoire
      const { error: partsError } = await supabase
        .from('story_parts')
        .delete()
        .eq('story_id', storyId);

      if (partsError) {
        console.error('Erreur lors de la suppression des parties:', partsError);
      } else {
        console.log('Parties de l\'histoire supprimées avec succès');
      }

      // 3. Supprimer le PDF associé
      if (story.pdf_path) {
        const { error: pdfError } = await supabase.storage
          .from('story-pdfs')
          .remove([story.pdf_path]);

        if (pdfError) {
          console.error('Erreur lors de la suppression du PDF:', pdfError);
        } else {
          console.log('PDF supprimé avec succès:', story.pdf_path);
        }
      }

      // 4. Supprimer l'histoire elle-même
      const { error: deleteError } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      console.log('Histoire supprimée avec succès:', storyId);

      return NextResponse.json({
        success: true,
        message: 'Histoire supprimée avec succès'
      });

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'histoire', details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'histoire', details: error.message },
      { status: 500 }
    );
  }
} 