'use client';

import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '../../../lib/supabase';

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('1. Début de la déconnexion');
        
        // Récupérer une nouvelle instance de Supabase
        const supabase = createBrowserSupabaseClient();
        
        console.log('2. Déconnexion de Supabase');
        // Déconnexion de toutes les sessions
        await supabase.auth.signOut({ scope: 'global' });
        
        console.log('3. Suppression de TOUS les cookies');
        // Supprimer tous les cookies sans exception
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
        
        console.log('4. Nettoyage complet du stockage local');
        // Effacer complètement localStorage et sessionStorage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error('Erreur lors du nettoyage du stockage local:', e);
        }
        
        console.log('5. Suppression des clés spécifiques');
        // Supprimer spécifiquement les tokens Supabase et autres clés d'authentification
        try {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('supabase.auth.refreshToken');
          localStorage.removeItem('sb-refresh-token');
          localStorage.removeItem('sb-access-token');
          localStorage.removeItem('supabase-auth-token');
        } catch (e) {
          console.error('Erreur lors de la suppression des clés spécifiques:', e);
        }
        
        console.log('6. Redirection forcée avec rechargement complet');
        // Attendre un court délai pour s'assurer que tous les nettoyages sont terminés
        setTimeout(() => {
          // Utiliser replace pour éviter que la page soit conservée dans l'historique
          window.location.replace('/?logout=' + Date.now());
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // Redirection en cas d'erreur
        window.location.replace('/?error=logout_failed');
      }
    };

    performLogout();

    // Fonction de nettoyage en cas de montage/démontage rapide du composant
    return () => {
      // Assurer que les redirections sont toujours effectuées même si le composant est démonté
      setTimeout(() => {
        if (document.location.pathname.includes('logout')) {
          window.location.replace('/');
        }
      }, 1500);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Déconnexion en cours...</h1>
        <p className="text-gray-600 mb-8">Vous allez être redirigé vers la page d'accueil.</p>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
} 