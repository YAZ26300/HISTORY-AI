'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Heading, Text, Flex, Box } from '@radix-ui/themes';
import { Wand2, Save, Download, Check } from 'lucide-react';
import { Vortex } from '../../../app/components/ui/vortex';
import { SpotlightButton } from '../../../app/components/ui/spotlight-button';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

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

// Définir les thèmes disponibles
const themes = {
  "Aventure": ["Forêt enchantée", "Océan mystérieux", "Montagne magique", "Jungle sauvage", "Îles perdues"],
  "Fantaisie": ["Dragons et chevaliers", "Fées et lutins", "Sorciers et potions", "Créatures mythiques", "Mondes parallèles"],
  "Science-Fiction": ["Voyage spatial", "Robots et IA", "Civilisations extraterrestres", "Futur de la Terre", "Technologies magiques"],
  "Animaux": ["Ferme joyeuse", "Animaux sauvages", "Vie marine", "Insectes curieux", "Animaux qui parlent"],
  "Éducatif": ["Découverte de la nature", "Voyage dans le corps humain", "Histoire et civilisations", "Sciences amusantes", "Exploration géographique"]
};

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

const LoadingStory = () => {
  const phrases = [
    "L'imagination s'éveille doucement...",
    "Les mots dansent et s'assemblent...",
    "Les personnages prennent vie...",
    "Un monde magique se dessine...",
    "Les couleurs s'épanouissent...",
    "L'histoire se tisse délicatement...",
    "La magie opère...",
    "Les rêves prennent forme..."
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <Heading size="6" className="text-blue-500">
          Création de votre histoire magique...
        </Heading>
        
        <div className="relative h-8 overflow-hidden">
          {phrases.map((phrase, index) => (
            <motion.div
              key={index}
              className="absolute w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -20]
              }}
              transition={{
                duration: 3,
                delay: index * 2,
                repeat: Infinity,
                repeatDelay: phrases.length * 2 - 3
              }}
            >
              <Text size="2" color="gray">
                {phrase}
              </Text>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((part) => (
          <motion.div
            key={part}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: part * 0.2 }}
            className="space-y-4"
          >
            <Card className="w-full h-32 animate-pulse bg-blue-500/10" />
            <Card className="w-full h-48 animate-pulse bg-blue-500/10" />
          </motion.div>
        ))}
      </div>
    </div>
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
  return (
    <div className="space-y-6 lg:space-y-8 p-4">
      <div className="flex justify-between items-center">
        <Heading size="6">Votre Histoire</Heading>
        
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${isSaved 
              ? 'bg-green-500 text-white' 
              : isSaving 
                ? 'bg-blue-300 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          {isSaved ? (
            <>
              <Check size={16} />
              Sauvegardée
            </>
          ) : isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={16} />
              Sauvegarder en PDF
            </>
          )}
        </button>
      </div>
      
      {storyParts.map((part, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="space-y-4"
        >
          <Card>
            <Heading size="5">Partie {index + 1}</Heading>
            <Text as="div" size="2" className="mt-4 whitespace-pre-wrap lg:text-3">
              {part.text}
            </Text>
          </Card>

          <Card>
            <div className="relative w-full h-48 lg:h-64 rounded-lg overflow-hidden">
              <Image
                src={part.image}
                alt={`Illustration partie ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default function CreateStory() {
  const [theme, setTheme] = useState('');
  const [age, setAge] = useState('');
  const [title, setTitle] = useState('');
  const [characters, setCharacters] = useState('');
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
  }, []);

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
    } catch (error: any) {
      console.error('Error generating story:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de l\'histoire');
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
          return part;
        }
        
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
      
      console.log('Envoi de la requête de sauvegarde');
      const response = await fetch('/api/stories/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || `Histoire de ${characters} dans ${theme}`,
          theme,
          ageRange: age,
          storyParts: optimizedStoryParts,
          userId,
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
        <Card>
          <Heading size="8" mb="4">Créer une Histoire</Heading>
          <Text size="3" color="gray" mb="6">
            Utilisez l'IA pour créer une histoire unique et magique
          </Text>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Thème de l'histoire
              </label>
              <input
                type="text"
                placeholder="Ex: La forêt enchantée, L'espace, Les pirates..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Âge de l'enfant
              </label>
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un âge</option>
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Personnages principaux
              </label>
              <textarea
                placeholder="Décrivez les personnages de votre histoire..."
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${isLoading 
                  ? 'bg-blue-300 text-white cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Créer l'histoire
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text color="red">{error}</Text>
            </div>
          )}
        </Card>
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
              <Card>
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
              </Card>
            </motion.div>
          ) : (
            <div className="w-[calc(100%-4rem)] mx-auto rounded-md h-screen overflow-hidden">
              <Vortex
                backgroundColor="black"
                rangeY={800}
                particleCount={500}
                baseHue={120}
                className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
              >
                <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
                  Prêt à créer une histoire magique ?
                </h2>
                <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
                  Laissez votre imagination prendre vie et créez des histoires uniques pour vos enfants
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                  <button
                    onClick={() => {}}
                    className="px-6 py-3 rounded-lg bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    Commencer l'aventure
                  </button>
                </div>
              </Vortex>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Flex>
  );
}