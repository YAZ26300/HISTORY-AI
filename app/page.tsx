import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-primary animate-float">
          Histoires Magiques pour Enfants
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Créez des histoires merveilleuses avec l'aide de l'intelligence artificielle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-secondary">Créer une Histoire</h2>
          <p className="text-gray-600 mb-6">
            Laissez libre cours à votre imagination et créez une histoire unique
          </p>
          <Link href="/create" className="btn-primary inline-block">
            Commencer une histoire
          </Link>
        </div>

        <div className="card transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-secondary">Mes Histoires</h2>
          <p className="text-gray-600 mb-6">
            Retrouvez toutes vos histoires sauvegardées
          </p>
          <Link href="/stories" className="btn-primary inline-block">
            Voir mes histoires
          </Link>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-secondary">
          Comment ça marche ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2">1. Choisissez un thème</h3>
            <p className="text-gray-600">
              Sélectionnez le sujet de votre histoire
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">2. Personnalisez</h3>
            <p className="text-gray-600">
              Ajoutez des personnages et des détails
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">3. Créez la magie</h3>
            <p className="text-gray-600">
              Laissez l'IA générer une histoire unique
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
