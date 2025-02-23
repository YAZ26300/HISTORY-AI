'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  preview: string;
  image: string;
  createdAt: string;
  age: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        const data = await response.json();
        setStories(data.stories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="text-center">
          <h1 className="mb-8">Mes Histoires</h1>
          <div className="card max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore d'histoires sauvegardées.
            </p>
            <Link href="/create" className="btn-primary inline-block">
              Créer ma première histoire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="text-center mb-12">
        <h1 className="mb-4">Mes Histoires</h1>
        <Link href="/create" className="btn-primary inline-block">
          Créer une nouvelle histoire
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div key={story.id} className="card transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{story.preview}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Pour {story.age} ans</span>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
            <Link
              href={`/stories/${story.id}`}
              className="btn-primary w-full mt-4"
            >
              Lire l'histoire
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 