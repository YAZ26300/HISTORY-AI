'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import StoryList from '../../../app/components/stories/StoryList'
import { SpotlightButton } from '../../../app/components/ui/spotlight-button'
import { Plus } from 'lucide-react'

export default function Stories() {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Histoires</h1>
          <p className="text-gray-600 mt-2">
            Retrouvez toutes vos histoires magiques
          </p>
        </div>
        <SpotlightButton
          text="Créer une nouvelle histoire"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => router.push('/create')}
        />
      </div>
      
      <StoryList />
    </div>
  )
} 