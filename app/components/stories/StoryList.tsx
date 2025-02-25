'use client';

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { SpotlightCard } from '../../components/ui/spotlight-card'
import { SpotlightButton } from '../../components/ui/spotlight-button'
import { Book, Download, Calendar, PenTool, FileImage } from 'lucide-react'

interface Story {
  id: string
  title: string
  theme?: string
  age_range?: string
  pdf_path: string
  created_at: string
  cover_image_path?: string
}

// Props du composant StoryList
interface StoryListProps {
  onStoryUpdate?: () => void;
}

export default function StoryList({ onStoryUpdate }: StoryListProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({})

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
      
      // Chargement des histoires
      setStories(data || [])
      
      // Générer des URLs pour les images de couverture
      const urls: Record<string, string> = {}
      
      for (const story of data || []) {
        if (story.cover_image_path) {
          try {
            const { data: urlData } = supabase.storage
              .from('story-covers')
              .getPublicUrl(story.cover_image_path)
            
            if (urlData?.publicUrl) {
              urls[story.id] = urlData.publicUrl
            }
          } catch (err) {
            console.error('Erreur lors de la récupération de l\'URL de couverture:', err)
          }
        }
      }
      
      setCoverUrls(urls)
      
      // Notifier le parent que les histoires ont été chargées
      if (onStoryUpdate) {
        onStoryUpdate();
      }
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir une image de couverture pour une histoire
  function getCoverImage(story: Story): string | null {
    // Si nous avons une URL stockée pour cette histoire, l'utiliser
    if (story.id && coverUrls[story.id]) {
      return coverUrls[story.id]
    }
    
    // Sinon, générer une image de secours basée sur le titre
    const seed = encodeURIComponent(story.title || 'story')
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=0369a1,1d4ed8,4338ca,a855f7,6366f1&backgroundType=gradientLinear`
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <SpotlightCard 
        className="text-center py-16 my-6 flex flex-col items-center justify-center gap-4" 
        spotlightColor="rgba(59, 130, 246, 0.3)"
      >
        <Book className="w-16 h-16 text-blue-400 mb-2" />
        <h3 className="text-2xl font-medium text-[var(--text-color)]">
          Vous n'avez pas encore d'histoires
        </h3>
        <p className="mt-2 text-gray-400">
          Commencez à créer votre première histoire magique !
        </p>
      </SpotlightCard>
    )
  }

  // Formater la date en français
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <SpotlightCard 
          key={story.id} 
          className="overflow-hidden flex flex-col h-full"
          spotlightColor="rgba(59, 130, 246, 0.3)"
        >
          <div className="relative w-full h-44 mb-4 overflow-hidden rounded-lg">
            {getCoverImage(story) ? (
              <>
                <Image
                  src={getCoverImage(story)!}
                  alt={`Couverture de ${story.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 z-10"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-purple-500/50 flex items-center justify-center">
                <FileImage className="w-12 h-12 text-white/60" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded shadow-sm">
                    {story.theme || "Histoire"}
                  </span>
                </div>
                <div className="flex items-center text-xs text-white/90 bg-black/40 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(story.created_at)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-1">
            <h3 className="text-xl font-semibold mb-3 text-[var(--text-color)]">{story.title}</h3>
            
            <div className="flex items-center gap-2 mb-3">
              {story.age_range && (
                <div className="flex items-center text-gray-400 text-sm rounded-full bg-[var(--card-background)] border border-[var(--border-color)] px-3 py-1.5">
                  <PenTool className="w-3.5 h-3.5 mr-1.5" />
                  <span>{story.age_range}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-auto px-1 pt-4">
            <SpotlightButton
              text="Télécharger le PDF"
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadPDF(story.pdf_path, story.title)}
              fullWidth={true}
            />
          </div>
        </SpotlightCard>
      ))}
    </div>
  )
} 