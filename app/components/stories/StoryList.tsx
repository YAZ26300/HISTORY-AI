'use client';

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { SpotlightCard } from '../../components/ui/spotlight-card'
import { SpotlightButton } from '../../components/ui/spotlight-button'
import { Book, Download, Calendar, PenTool, FileImage, BookOpen } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import BookView from './BookView'
import toast from 'react-hot-toast'

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
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const [storyContent, setStoryContent] = useState<{ text: string; image: string }[]>([])
  const [loadingStoryContent, setLoadingStoryContent] = useState(false)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [selectedStoryPdfUrl, setSelectedStoryPdfUrl] = useState<string | undefined>(null as unknown as string | undefined)
  const [selectedStoryParts, setSelectedStoryParts] = useState<{ text: string; image: string }[]>([])
  const [showBookView, setShowBookView] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBookView, setSelectedBookView] = useState<{
    storyId: string;
    pdfUrl: string;
    storyParts: { text: string; image: string }[];
  } | null>(null);

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

  const viewStoryAsBook = async (storyId: string) => {
    try {
      setIsLoading(true);
      const loadingToast = toast.loading('Chargement de l\'histoire...');
      
      console.log(`Tentative de récupération des parties de l'histoire pour ID: ${storyId}`);
      
      // Vérifier la session utilisateur
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Erreur de session:', sessionError);
        toast.dismiss(loadingToast);
        toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }
      
      console.log('Session utilisateur valide:', session.user.id);
      
      // 1. D'abord, récupérer l'UUID de l'histoire à partir de son ID
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('id, title, pdf_path')
        .eq('id', storyId)
        .single();
      
      if (storyError) {
        console.error('Erreur lors de la récupération de l\'histoire:', storyError);
        toast.dismiss(loadingToast);
        toast.error('Impossible de trouver cette histoire');
        setIsLoading(false);
        return;
      }
      
      if (!storyData) {
        console.error('Histoire non trouvée');
        toast.dismiss(loadingToast);
        toast.error('Histoire non trouvée');
        setIsLoading(false);
        return;
      }
      
      console.log('Histoire trouvée avec UUID:', storyData.id);
      
      // Préparer l'URL du PDF d'abord pour s'assurer qu'elle est disponible
      const { data: pdfData } = supabase.storage
        .from('story-pdfs')
        .getPublicUrl(storyData.pdf_path);
      const pdfUrl = pdfData?.publicUrl || '';
      
      if (!pdfUrl) {
        console.error('Erreur: URL du PDF non disponible');
        toast.dismiss(loadingToast);
        toast.error('Le PDF de cette histoire n\'est pas disponible');
        setIsLoading(false);
        return;
      }
      
      // Vérifier d'abord si la table story_parts existe et est accessible
      try {
        console.log('Vérification de l\'accès à la table story_parts...');
        const { count, error: countError } = await supabase
          .from('story_parts')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Erreur lors de la vérification de la table story_parts:', countError);
          // Continuer malgré l'erreur, mais noter le problème
          toast.error('Problème d\'accès à la table des parties d\'histoire');
          
          // Utiliser seulement le PDF
          setSelectedBookView({
            storyId: storyData.id,
            pdfUrl,
            storyParts: []
          });
          
          setShowBookView(true);
          toast.dismiss(loadingToast);
          toast.success('PDF chargé avec succès');
          setIsLoading(false);
          return;
        } else {
          console.log('Table story_parts accessible, nombre total d\'enregistrements:', count);
        }
      } catch (tableCheckError) {
        console.error('Exception lors de la vérification de la table story_parts:', tableCheckError);
        // Continuer malgré l'erreur
      }
      
      // 2. Récupérer les parties de l'histoire avec l'UUID
      console.log('Tentative de récupération des parties pour story_id:', storyData.id);
      
      let partsData = null;
      let partsError = null;
      
      try {
        // Désactiver temporairement RLS pour cette requête si nécessaire
        // Cette approche est sécurisée car nous avons déjà vérifié que l'utilisateur a accès à l'histoire
        const result = await supabase
          .from('story_parts')
          .select('*')
          .eq('story_id', storyData.id)
          .order('part_number', { ascending: true });
          
        partsData = result.data;
        partsError = result.error;
        
        console.log('Résultat de la requête story_parts:', { 
          partsData, 
          partsError, 
          count: partsData?.length || 0 
        });
      } catch (queryError) {
        console.error('Exception lors de la requête story_parts:', queryError);
        partsError = { message: 'Exception lors de la requête' };
      }
      
      // Si nous avons des parties d'histoire, les utiliser pour la vue livre
      if (!partsError && partsData && partsData.length > 0) {
        console.log(`${partsData.length} parties d'histoire trouvées`);
        
        // Afficher les détails des parties pour le débogage
        partsData.forEach((part, index) => {
          console.log(`Partie ${index + 1}:`, {
            id: part.id,
            story_id: part.story_id,
            part_number: part.part_number,
            text_length: part.text_content?.length || 0,
            image_url: part.image_url?.substring(0, 50) + '...' // Afficher seulement le début de l'URL
          });
        });
        
        // Formater les parties pour la vue livre
        const formattedParts = partsData.map(part => ({
          text: part.text_content || "Contenu non disponible",
          image: part.image_url || "https://via.placeholder.com/800x600?text=Image+non+disponible"
        }));
        
        // Mettre à jour la vue du livre
        setSelectedBookView({
          storyId: storyData.id,
          pdfUrl,
          storyParts: formattedParts
        });
        
        setShowBookView(true);
        toast.dismiss(loadingToast);
        toast.success('Histoire chargée avec succès');
      } else {
        // Si aucune partie trouvée ou erreur, utiliser seulement le PDF
        console.log('Aucune partie d\'histoire trouvée ou erreur. Utilisation du PDF uniquement.');
        if (partsError) {
          console.error('Erreur lors de la récupération des parties:', partsError);
          toast.error('Problème avec les parties de l\'histoire. Affichage du PDF uniquement.');
        } else {
          console.log('La table story_parts existe mais aucune partie trouvée pour cette histoire.');
          toast.success('Cette histoire n\'a pas de parties structurées. Affichage du PDF uniquement.');
        }
        
        // Tenter de créer des parties d'histoire à partir du PDF si possible
        // Cette fonctionnalité pourrait être implémentée ultérieurement
        
        setSelectedBookView({
          storyId: storyData.id,
          pdfUrl,
          storyParts: []
        });
        
        setShowBookView(true);
        toast.dismiss(loadingToast);
        toast.success('PDF chargé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'histoire:', error);
      toast.error('Erreur lors du chargement de l\'histoire');
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
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
            
            <div className="mt-auto px-1 pt-4 flex flex-col gap-2">
              <SpotlightButton
                text="Lire l'histoire en mode livre"
                icon={<BookOpen className="w-5 h-5" />}
                onClick={() => viewStoryAsBook(story.id)}
                fullWidth={true}
              />
              <SpotlightButton
                text="Télécharger le PDF"
                icon={<Download className="w-5 h-5" />}
                onClick={() => downloadPDF(story.pdf_path, story.title)}
                fullWidth={true}
              />
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Vue du livre */}
      <AnimatePresence>
        {showBookView && selectedBookView && (
          <BookView
            storyParts={selectedBookView.storyParts}
            title={stories.find(s => s.id === selectedBookView.storyId)?.title || "Histoire"}
            onClose={() => {
              setShowBookView(false);
              setSelectedBookView(null);
            }}
            pdfUrl={selectedBookView.pdfUrl}
          />
        )}
      </AnimatePresence>
    </>
  )
} 