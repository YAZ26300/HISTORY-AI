import { NextResponse } from 'next/server';

// Pour l'instant, nous utilisons des données statiques
// Dans une vraie application, cela viendrait d'une base de données
const mockStories = [
  {
    id: '1',
    title: 'Le Dragon et la Princesse',
    preview: 'Dans un royaume lointain, une princesse courageuse se lie d\'amitié avec un dragon solitaire...',
    image: '/images/dragon-princess.jpg',
    createdAt: '2024-02-23T12:00:00Z',
    age: '6-8',
  },
  {
    id: '2',
    title: 'Les Aventures Spatiales de Tom',
    preview: 'Tom découvre une mystérieuse carte stellaire qui le mène à une aventure extraordinaire dans l\'espace...',
    image: '/images/space-adventure.jpg',
    createdAt: '2024-02-22T15:30:00Z',
    age: '9-12',
  },
  {
    id: '3',
    title: 'La Forêt Magique',
    preview: 'Au cœur d\'une forêt enchantée, un petit lapin découvre un monde rempli de créatures magiques...',
    image: '/images/magic-forest.jpg',
    createdAt: '2024-02-21T09:15:00Z',
    age: '3-5',
  },
];

export async function GET() {
  // Simuler un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json({
    stories: mockStories,
  });
} 