'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Heading, Text, Flex, Box, Badge } from '@radix-ui/themes';
import { Wand2, Save, Download, Check, Sparkles, BookOpen } from 'lucide-react';
import { Vortex } from '../../../app/components/ui/vortex';
import { SpotlightButton } from '../../../app/components/ui/spotlight-button';
import { SpotlightCard } from '../../../app/components/ui/spotlight-card';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import LoadingStory from '../../components/LoadingStory';
import BookView from '../../components/stories/BookView';

interface StoryPart {
  text: string;
  image: string;
}

interface StoryResponse {
  story: StoryPart[];
  message: string;
  error?: string;
  details?: string;
}

interface SaveResponse {
  success: boolean;
  message: string;
  pdfUrl?: string;
  error?: string;
  details?: string;
}

// Définir les thèmes disponibles avec des icônes/couleurs
const themes = [
  { id: "foret", label: "Forêt enchantée", category: "Aventure", color: "rgba(16, 185, 129, 0.3)" },
  { id: "ocean", label: "Océan mystérieux", category: "Aventure", color: "rgba(14, 165, 233, 0.3)" },
  { id: "espace", label: "Voyage spatial", category: "Science-Fiction", color: "rgba(99, 102, 241, 0.3)" },
  { id: "dragons", label: "Dragons et chevaliers", category: "Fantaisie", color: "rgba(168, 85, 247, 0.3)" },
  { id: "animaux", label: "Animaux qui parlent", category: "Animaux", color: "rgba(236, 72, 153, 0.3)" },
  { id: "pirates", label: "Pirates et trésors", category: "Aventure", color: "rgba(245, 158, 11, 0.3)" },
  { id: "fees", label: "Fées et lutins", category: "Fantaisie", color: "rgba(139, 92, 246, 0.3)" },
  { id: "robots", label: "Robots et IA", category: "Science-Fiction", color: "rgba(59, 130, 246, 0.3)" },
];

// Définir les tranches d'âge
const ageRanges = ["3-5 ans", "6-8 ans", "9-12 ans"];

const StepIndicator = ({ step, currentStep, title, description }: {
  step: number;
  currentStep: number;
  title: string;
  description: string;
}) => {
  const isActive = currentStep >= step;
  
  return (
    <motion.div 
      className={`flex items-center gap-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
      animate={{ opacity: isActive ? 1 : 0.5 }}
    >
      <motion.div 
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
        animate={{ scale: isActive ? 1.1 : 1 }}
      >
        {step}
      </motion.div>
      <div>
        <Text weight="bold">{title}</Text>
        <Text size="2" color="gray">{description}</Text>
      </div>
    </motion.div>
  );
};

const StoryDisplay = ({ 
  storyParts, 
  onSave, 
  isSaving,
  isSaved 
}: { 
  storyParts: StoryPart[], 
  onSave: () => void, 
  isSaving: boolean,
  isSaved: boolean
}) => {
  const [isBookViewOpen, setIsBookViewOpen] = useState(false);
  const [storyTitle, setStoryTitle] = useState("Histoire Magique");

  useEffect(() => {
    // Extraction d'un titre basé sur la première partie
    if (storyParts.length > 0 && storyParts[0].text) {
      // Récupérer la première phrase ou une portion du texte pour le titre
      const firstPart = storyParts[0].text;
      const firstSentence = firstPart.split('.')[0].trim();
      setStoryTitle(firstSentence.length > 50 
        ? firstSentence.substring(0, 50) + '...' 
        : firstSentence);
    }
  }, [storyParts]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex justify-between items-center mb-6">
        <Heading size="6" className="text-[var(--text-color)]">Votre Histoire Magique</Heading>
        
        <div className="flex space-x-3">
          <SpotlightButton
            text="Lire en format livre"
            icon={<BookOpen size={16} />}
            onClick={() => setIsBookViewOpen(true)}
          />
          
          <SpotlightButton
            text={isSaved ? 'Histoire sauvegardée' : isSaving ? 'Sauvegarde...' : 'Sauvegarder l\'histoire'}
            icon={isSaved ? 
              <Check size={16} /> : 
              isSaving ? 
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 
              <Save size={16} />
            }
            disabled={isSaving || isSaved}
            onClick={onSave}
          />
        </div>
      </div>
      
      <div className="space-y-10 my-8">{storyParts.map((part, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="space-y-6"
        >
          <SpotlightCard className="p-6" spotlightColor={`rgba(${56 + index * 20}, ${130 + index * 10}, ${246 - index * 10}, 0.3)`}>
            <Badge size="2" variant="soft" color="blue" className="mb-3">Partie {index + 1}</Badge>
            <Text as="div" size="3" className="whitespace-pre-wrap text-[var(--text-color)]">
              {part.text}
            </Text>
          </SpotlightCard>

          <SpotlightCard className="overflow-hidden" spotlightColor="rgba(139, 92, 246, 0.3)">
            <div className="relative w-full h-64 lg:h-80">
              <Image
                src={part.image}
                alt={`Illustration partie ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </SpotlightCard>
        </motion.div>
      ))}</div>

      {/* Modal de vue livre */}
      <AnimatePresence>
        {isBookViewOpen && (
          <BookView 
            storyParts={storyParts} 
            title={storyTitle}
            onClose={() => setIsBookViewOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CreateStory() {
  const [theme, setTheme] = useState('');
  const [age, setAge] = useState('7-9');
  const [title, setTitle] = useState('');
  const [characters, setCharacters] = useState('');
  const [imageStyle, setImageStyle] = useState('disney');
  const [isLoading, setIsLoading] = useState(false);
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setStoryParts([]);
    setCurrentStep(1);
    setIsSaved(false);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          age,
          characters,
          imageStyle,
        }),
      });

      setCurrentStep(2);
      const data: StoryResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setCurrentStep(3);
      setStoryParts(data.story);
      
      // Générer un titre pour l'histoire
      const storyTitle = `Histoire de ${characters} dans ${theme}`;
      setTitle(storyTitle);
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating story:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'histoire');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveStory = async () => {
    if (!userId || storyParts.length === 0 || isSaving) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      // Préparation des données : réduire la taille des images base64 si nécessaire
      const optimizedStoryParts = storyParts.map(part => {
        // Si l'image est une URL (non base64), la conserver telle quelle
        if (!part.image.startsWith('data:image')) {
          console.log('Image non base64 détectée:', part.image.substring(0, 50) + '...');
          return part;
        }
        
        console.log('Image base64 détectée, taille:', part.image.length);
        
        // Pour les images base64, conserver juste l'URL si elles sont trop grandes
        if (part.image.length > 500000) { // 500 KB limite
          console.log('Image trop volumineuse, utilisation du placeholder');
          return {
            ...part,
            image: `https://via.placeholder.com/800x600/FFB6C1/333333.png?text=Illustration+Histoire`
          };
        }
        
        return part;
      });
      
      console.log('Envoi de la requête de sauvegarde avec', optimizedStoryParts.length, 'parties');
      const response = await fetch('/api/stories/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: optimizedStoryParts.map(part => part.text).join('\n\n'),
          theme,
          age_range: age,
          images: optimizedStoryParts.map(part => part.image),
          storyParts: optimizedStoryParts,
        }),
      });
      
      // Vérifier si la réponse est JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Réponse non-JSON reçue: ${await response.text()}`);
      }
      
      const data: SaveResponse = await response.json();
      
      if (!data.success) {
        // Message personnalisé selon le type d'erreur
        let errorMessage = data.error || 'Une erreur est survenue lors de la sauvegarde';
        
        if (data.details) {
          errorMessage += `: ${data.details}`;
        }
        
        // Instructions spécifiques pour les erreurs de RLS
        if (data.error === 'Erreur de permission' || 
            (data.details && data.details.includes('row-level security policy'))) {
          errorMessage += "\n\nInstructions pour l'administrateur: Veuillez vérifier les politiques RLS dans Supabase pour la table 'stories' et le bucket 'story-pdfs'.";
        }
        
        // Instructions spécifiques pour l'erreur de bucket manquant
        if (data.error === 'Bucket de stockage non disponible') {
          errorMessage += "\n\nPour créer le bucket dans Supabase:\n1. Allez dans la section Storage de votre projet Supabase\n2. Cliquez sur 'Nouveau bucket'\n3. Nommez-le 'story-pdfs'\n4. Assurez-vous que les politiques RLS sont configurées pour permettre aux utilisateurs authentifiés d'accéder à leurs fichiers";
        }
        
        throw new Error(errorMessage);
      }
      
      setIsSaved(true);
      router.push('/stories');
    } catch (error: any) {
      console.error('Error saving story:', error);
      setError(error.message || 'Une erreur est survenue lors de la sauvegarde de l\'histoire');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Flex 
      className="min-h-screen flex-col lg:flex-row gap-8 p-4 lg:p-8"
    >
      <div className="w-full lg:w-[40%] lg:sticky lg:top-8 lg:self-start">
        <SpotlightCard className="p-6" spotlightColor="rgba(59, 130, 246, 0.3)">
          <Heading size="6" mb="4" className="text-[var(--text-color)]">Créer une Histoire Magique</Heading>
          <Text size="2" className="text-gray-400 mb-6">
            Utilisez l'IA pour créer une histoire unique et merveilleuse pour votre enfant
          </Text>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--text-color)]">
                Choisissez un thème
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themes.map((themeOption) => (
                  <div 
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.label)}
                    className={`
                      cursor-pointer rounded-lg p-3 border transition-all duration-300
                      ${theme === themeOption.label 
                        ? 'border-blue-500 bg-blue-500/10 shadow-md' 
                        : 'border-[var(--border-color)] hover:border-blue-400/50 bg-[var(--card-background)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-color)]">{themeOption.label}</span>
                      {theme === themeOption.label && <Check className="w-4 h-4 text-blue-500" />}
                    </div>
                    <Badge size="1" className="mt-2" variant="soft" color="gray">{themeOption.category}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mt-3">
                <label htmlFor="imageStyle" className="block text-sm font-medium text-[var(--text-color)]">
                  Style des illustrations
                </label>
                <select
                  id="imageStyle"
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--card-background)] text-[var(--text-color)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="disney">Style Disney</option>
                  <option value="pixar">Style Pixar</option>
                  <option value="watercolor">Aquarelle</option>
                  <option value="cartoon">Dessin animé</option>
                  <option value="storybook">Livre d'images traditionnel</option>
                </select>
              </div>
              
              {/* Option pour un thème personnalisé */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Ou saisissez un thème personnalisé..."
                  value={theme && !themes.some(t => t.label === theme) ? theme : ''}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--card-background)] text-[var(--text-color)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--text-color)]">
                Âge de l'enfant
              </label>
              <div className="flex flex-wrap gap-3">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAge(range)}
                    className={`
                      px-4 py-2 rounded-full transition-all
                      ${age === range 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                        : 'bg-[var(--card-background)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-blue-400'
                      }
                    `}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--text-color)]">
                Personnages principaux
              </label>
              <textarea
                placeholder="Décrivez les personnages de votre histoire..."
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--card-background)] text-[var(--text-color)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
              />
            </div>

            <SpotlightButton
              text={isLoading ? 'Création en cours...' : 'Créer l\'histoire'}
              icon={isLoading ? 
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 
                <Sparkles className="w-5 h-5" />
              }
              disabled={isLoading}
              onClick={() => !isLoading && handleSubmit(new Event('submit') as any)}
              fullWidth={true}
            />
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <Text color="red">{error}</Text>
            </div>
          )}
        </SpotlightCard>
      </div>

      <div className="w-full lg:w-[60%]">
        <AnimatePresence>
          {(isLoading || storyParts.length > 0) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <SpotlightCard className="p-6" spotlightColor="rgba(124, 58, 237, 0.3)">
                {isLoading ? (
                  <LoadingStory />
                ) : (
                  <StoryDisplay 
                    storyParts={storyParts} 
                    onSave={handleSaveStory} 
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                )}
              </SpotlightCard>
            </motion.div>
          ) : (
            <div className="w-full rounded-lg h-[70vh] overflow-hidden">
              <Vortex
                backgroundColor="#050505"
                rangeY={800}
                particleCount={800}
                baseHue={220}
                className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center space-y-8"
                >
                  <h2 className="text-white text-3xl md:text-6xl font-bold text-center">
                    Créez une histoire magique pour votre enfant
                  </h2>
                  <p className="text-white/80 text-lg md:text-2xl max-w-xl mx-auto">
                    Laissez l'intelligence artificielle donner vie à votre imagination
                  </p>
                </motion.div>
              </Vortex>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Flex>
  );
}