'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ColourfulText } from './components/ui/colourful-text';
import { SpotlightButton } from './components/ui/spotlight-button';
import { SpotlightCard } from './components/ui/spotlight-card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden bg-[var(--background-color)]">
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30" />
          <div className="absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_80%)]" />
        </motion.div>

        <div className="text-center relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Créez des <ColourfulText text="histoires magiques" /> <br />
            pour vos enfants
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Laissez l'intelligence artificielle donner vie à votre imagination
          </p>
          <Link href="/create">
            <SpotlightButton text="Commencer une histoire" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Comment ça <ColourfulText text="fonctionne" /> ?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <SpotlightCard spotlightColor="rgba(56, 189, 248, 0.3)" className="flex flex-col items-center text-center p-10">
            <div className="text-6xl mb-6">🎨</div>
            <h3 className="text-2xl font-semibold mb-4">1. Choisissez votre thème</h3>
            <p className="text-lg text-gray-400">Sélectionnez le sujet de votre histoire et l'âge de votre enfant</p>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.3)" className="flex flex-col items-center text-center p-10">
            <div className="text-6xl mb-6">✏️</div>
            <h3 className="text-2xl font-semibold mb-4">2. Personnalisez</h3>
            <p className="text-lg text-gray-400">Ajoutez vos personnages et laissez libre cours à votre imagination</p>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.3)" className="flex flex-col items-center text-center p-10">
            <div className="text-6xl mb-6">✨</div>
            <h3 className="text-2xl font-semibold mb-4">3. Créez la magie</h3>
            <p className="text-lg text-gray-400">L'IA génère une histoire unique avec de magnifiques illustrations</p>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
} 