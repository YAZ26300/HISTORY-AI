import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Créer un client Supabase côté serveur avec la clé anonyme
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Vérifier les variables d'environnement
    const envCheck = {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey
    };

    // Vérifier la connexion à Supabase
    let storageData = null;
    let storageError = null;
    try {
      const result = await supabase.storage.getBucket('story-pdfs');
      storageData = result.data;
      storageError = result.error;
    } catch (error: any) {
      storageError = error;
    }

    // Vérifier l'existence de la table stories
    let tablesData = null;
    let tablesError = null;
    try {
      const result = await supabase
        .from('stories')
        .select('count')
        .limit(1);
      tablesData = result.data;
      tablesError = result.error;
    } catch (error: any) {
      tablesError = error;
    }

    return NextResponse.json({
      success: true,
      message: 'Test de connexion à Supabase',
      env: envCheck,
      storage: {
        success: !storageError,
        error: storageError ? storageError.message : null,
        bucket: storageData
      },
      db: {
        success: !tablesError,
        error: tablesError ? tablesError.message : null,
        data: tablesData
      }
    });
  } catch (error: any) {
    console.error('Erreur lors du test de Supabase:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du test de connexion',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 