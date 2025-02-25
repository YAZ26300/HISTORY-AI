'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../../lib/supabase';
import GoogleLogin from '../../components/auth/GoogleLogin';
import EmailAuth from '../../components/auth/EmailAuth';
import { SpotlightCard } from '../../components/ui/spotlight-card';
import { LockKeyhole } from 'lucide-react';

// Styles pour le fond animé
const BackgroundGradient = () => (
  <div className="fixed inset-0 z-[-1] bg-black">
    <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900"></div>
    <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
    {[...Array(5)].map((_, i) => (
      <div 
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 400 + 100}px`,
          height: `${Math.random() * 400 + 100}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: ['#3B82F6', '#4338CA', '#6366F1', '#8B5CF6', '#A78BFA'][i % 5],
          filter: 'blur(80px)',
          opacity: 0.15,
          transform: 'translate(-50%, -50%)',
          animation: `float-${i} ${Math.random() * 10 + 15}s ease-in-out infinite alternate`
        }}
      />
    ))}
  </div>
);

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
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundGradient />
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundGradient />
      
      <SpotlightCard 
        className="w-full max-w-md p-8 rounded-2xl border-[#333] bg-[#121212]"
        spotlightColor="rgba(99, 102, 241, 0.4)"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <LockKeyhole size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Connexion</h1>
        <p className="text-gray-400 text-center mb-8">
          Connectez-vous pour créer des histoires magiques
        </p>

        <div className="space-y-6">
          <div className="flex justify-center gap-4 mb-6 bg-[#1e1e1e] rounded-lg p-1">
            <button
              onClick={() => setAuthMethod('email')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'email'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                authMethod === 'google'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
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
      </SpotlightCard>
    </div>
  );
} 