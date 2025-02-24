'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, TextField, TextArea, Button, Card, Heading, Text, Flex, Box } from '@radix-ui/themes';
import { Wand2 } from 'lucide-react';
import { Vortex } from '../../../app/components/ui/vortex';
import { SpotlightButton } from '../../../app/components/ui/spotlight-button';

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

const StoryDisplay = ({ storyParts }: { storyParts: StoryPart[] }) => {
  return (
    <div className="space-y-6 lg:space-y-8 p-4">
      <Heading size="6">Votre Histoire</Heading>
      
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
  const [characters, setCharacters] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setStoryParts([]);
    setCurrentStep(1);

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
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error generating story:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de l\'histoire');
    } finally {
      setIsLoading(false);
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
            <Card>
              <Flex direction="column" gap="3">
                <label className="font-medium" htmlFor="theme">
                  Thème de l'histoire
                </label>
                <TextField.Root>
                  <TextField.Slot>
                    <input
                      id="theme"
                      type="text"
                      placeholder="Ex: La forêt enchantée, L'espace, Les pirates..."
                      value={theme}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTheme(e.target.value)}
                      required
                      className="w-full bg-transparent border-none focus:outline-none"
                    />
                  </TextField.Slot>
                </TextField.Root>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="3">
                <label className="font-medium" htmlFor="age">
                  Âge de l'enfant
                </label>
                <Select.Root value={age} onValueChange={setAge} required>
                  <Select.Trigger placeholder="Sélectionnez un âge" />
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>Tranches d'âge</Select.Label>
                      <Select.Item value="3-5">3-5 ans</Select.Item>
                      <Select.Item value="6-8">6-8 ans</Select.Item>
                      <Select.Item value="9-12">9-12 ans</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Card>

            <Card>
              <Flex direction="column" gap="3">
                <label className="font-medium" htmlFor="characters">
                  Personnages principaux
                </label>
                <TextArea
                  id="characters"
                  placeholder="Décrivez les personnages de votre histoire..."
                  value={characters}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCharacters(e.target.value)}
                  required
                />
              </Flex>
            </Card>

            <SpotlightButton
              disabled={isLoading}
              text={isLoading ? 'Création en cours...' : 'Créer l\'histoire'}
              icon={<Wand2 className="w-4 h-4" />}
              fullWidth
            />
          </form>

          {error && (
            <Card className="mt-8 bg-red-500/10 border-red-500/50">
              <Text color="red">{error}</Text>
            </Card>
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
                  <StoryDisplay storyParts={storyParts} />
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
                  <SpotlightButton text="Commencer l'aventure" />
                </div>
              </Vortex>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Flex>
  );
}