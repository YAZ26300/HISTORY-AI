'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import StoryList from '../../../app/components/stories/StoryList'

// Interface pour les statistiques
interface StoryStats {
  totalStories: number;
  totalCharacters: number;
  averageLength: number;
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StoryStats>({
    totalStories: 0,
    totalCharacters: 0,
    averageLength: 0
  })

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
    return session
  }

  const loadStats = async () => {
    const session = await checkUser()
    if (!session) return

    try {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', session.user.id)

      if (error) throw error

      const totalStories = stories?.length || 0
      const totalCharacters = stories?.reduce((acc, story) => acc + (story.content?.length || 0), 0) || 0
      const averageLength = totalStories > 0 ? Math.round(totalCharacters / totalStories) : 0

      setStats({
        totalStories,
        totalCharacters,
        averageLength
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    checkUser()
    loadStats()
  }, [checkUser, loadStats, supabase.auth, router])

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Histoires créées</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.totalStories}</p>
        </div>
        
        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Total des caractères</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.totalCharacters}</p>
        </div>

        <div className="bg-[var(--card-background)] p-6 rounded-xl shadow-sm border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">Longueur moyenne</h3>
          <p className="text-3xl font-bold text-green-400">{stats.averageLength}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 text-[var(--text-color)]">Vos dernières histoires</h2>
        <StoryList onStoryUpdate={loadStats} />
      </div>
    </div>
  )
} 