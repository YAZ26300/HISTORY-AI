'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import StoryList from '../../../components/stories/StoryList'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUser()
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre espace personnel History AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Histoires créées</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Dernière histoire</h3>
          <p className="text-gray-600">Aucune histoire créée</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Thème favori</h3>
          <p className="text-gray-600">-</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Vos dernières histoires</h2>
        <StoryList />
      </div>
    </div>
  )
} 