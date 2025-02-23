'use client';

import { useState } from 'react';
import Image from 'next/image';
import LoadingStory from '../components/LoadingStory';

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

export default function CreateStory() {
  const [theme, setTheme] = useState('');
  const [age, setAge] = useState('');
  const [characters, setCharacters] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyParts, setStoryParts] = useState<StoryPart[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setStoryParts([]);

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

      const data: StoryResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setStoryParts(data.story);
    } catch (error: any) {
      console.error('Error generating story:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de l\'histoire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-center">Créer une Nouvelle Histoire</h1>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="card">
          <label className="block mb-2 font-semibold" htmlFor="theme">
            Thème de l'histoire
          </label>
          <input
            type="text"
            id="theme"
            className="input-field"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: La forêt enchantée, L'espace, Les pirates..."
            required
          />
        </div>

        <div className="card">
          <label className="block mb-2 font-semibold" htmlFor="age">
            Âge de l'enfant
          </label>
          <select
            id="age"
            className="input-field"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          >
            <option value="">Sélectionnez un âge</option>
            <option value="3-5">3-5 ans</option>
            <option value="6-8">6-8 ans</option>
            <option value="9-12">9-12 ans</option>
          </select>
        </div>

        <div className="card">
          <label className="block mb-2 font-semibold" htmlFor="characters">
            Personnages principaux
          </label>
          <textarea
            id="characters"
            className="input-field min-h-[100px]"
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            placeholder="Décrivez les personnages de votre histoire..."
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Création en cours...' : 'Créer l\'histoire'}
        </button>
      </form>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {isLoading && <LoadingStory />}

      {storyParts.length > 0 && !isLoading && (
        <div className="mt-12 space-y-12">
          {storyParts.map((part, index) => (
            <div key={index} className="space-y-8">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Partie {index + 1}</h2>
                <div className="prose max-w-none">
                  {part.text.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                  <Image
                    src={part.image}
                    alt={`Illustration partie ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => window.print()}
            className="btn-primary w-full mt-8"
          >
            Imprimer l'histoire
          </button>
        </div>
      )}
    </div>
  );
} 