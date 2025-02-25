'use client';

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import StoryList from '../../../app/components/stories/StoryList'

// Interface pour les statistiques
interface StoryStats {
  count: number;
  latestStory: string | null;
  favoriteTheme: string | null;
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StoryStats>({
    count: 0,
    latestStory: null,
    favoriteTheme: null
  })

  useEffect(() => {
    checkUser()
    loadStats()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  // Utiliser useCallback pour éviter des rendus inutiles
  const loadStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return;

      // 1. Récupérer toutes les histoires de l'utilisateur
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error;
      
      if (!stories || stories.length === 0) {
        return; // Aucune histoire, garder les statistiques par défaut
      }

      // 2. Compter le nombre d'histoires
      const count = stories.length;
      
      // 3. Récupérer la dernière histoire (première dans le tableau car trié par date décroissante)
      const latestStory = stories[0].title;
      
      // 4. Déterminer le thème favori (le plus utilisé)
      const themeCounts: Record<string, number> = {};
      stories.forEach(story => {
        const theme = story.theme || 'Non spécifié';
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
      
      let favoriteTheme: string | null = null;
      let maxCount = 0;
      
      Object.entries(themeCounts).forEach(([theme, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteTheme = theme;
        }
      });
      
      // 5. Mettre à jour les statistiques
      setStats({
        count,
        latestStory,
        favoriteTheme
      });
      
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-color)]">Tableau de bord</h1>
        <p className="text-gray-400 mt-2">
          Bienvenue sur votre espace personnel History AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Histoires créées</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.count}</p>
        </div>
        
        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Dernière histoire</h3>
          <p className="text-gray-400">{stats.latestStory || "Aucune histoire créée"}</p>
        </div>

        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Thème favori</h3>
          <p className="text-gray-400">{stats.favoriteTheme || "-"}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-color)]">Vos dernières histoires</h2>
        <StoryList onStoryUpdate={loadStats} />
      </div>
    </div>
  )
} 