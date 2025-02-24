'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../../lib/supabase';
import GoogleLogin from '../../components/auth/GoogleLogin';
import EmailAuth from '../../components/auth/EmailAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // Nettoyer les données d'authentification existantes au chargement de la page
    const cleanupAuth = async () => {
      try {
        // Vérifier s'il y a une session existante
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Si nous sommes sur la page de connexion et qu'une session existe déjà,
        // vérifier si nous devons rediriger ou nettoyer
        if (session && !error) {
          console.log('Session existante détectée');
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
          return;
        }
        
        // Nettoyage des cookies et du stockage local
        console.log('Nettoyage des données d\'authentification');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        
        document.cookie.split(";").forEach((c) => {
          if (c.includes('sb-') || c.includes('supabase')) {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
          }
        });
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
      } finally {
        setLoading(false);
      }
    };

    cleanupAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Connexion</h1>
        <p className="text-gray-600 text-center mb-8">
          Connectez-vous pour créer des histoires magiques
        </p>

        <div className="space-y-6">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'email'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'google'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              Google
            </button>
          </div>

          {authMethod === 'email' ? (
            <EmailAuth redirectUrl={redirectUrl} />
          ) : (
            <div className="flex justify-center">
              <GoogleLogin redirectUrl={redirectUrl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 