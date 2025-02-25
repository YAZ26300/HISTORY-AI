'use client';

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Story {
  id: string
  title: string
  theme?: string
  age_range?: string
  pdf_path: string
  created_at: string
}

export default function StoryList() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  async function loadStories() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function downloadPDF(pdfPath: string, title: string) {
    try {
      const bucketName = 'story-pdfs';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(pdfPath)
      
      if (error) throw error

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600">
          Vous n'avez pas encore d'histoires
        </h3>
        <p className="mt-2 text-gray-500">
          Commencez à créer votre première histoire magique !
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <div key={story.id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
          {story.theme && (
            <p className="text-gray-600 mb-1">Thème : {story.theme}</p>
          )}
          {story.age_range && (
            <p className="text-gray-600 mb-4">Age : {story.age_range}</p>
          )}
          <button
            onClick={() => downloadPDF(story.pdf_path, story.title)}
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Télécharger le PDF
          </button>
        </div>
      ))}
    </div>
  )
} 