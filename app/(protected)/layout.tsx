'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../lib/supabase';
import { Home, PenTool, BookOpen, LogOut, User } from 'lucide-react';

// Composant pour afficher l'avatar et l'email de l'utilisateur
const UserProfile = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setEmail(session.user.email || null);
          
          // Générer un avatar avec DiceBear basé sur l'email
          const seed = session.user.email || 'default';
          
          // Choisir un style aléatoire parmi ces styles disponibles
          const styles = [
            'adventurer', 'avataaars', 'bottts', 'fun-emoji', 
            'lorelei', 'micah', 'miniavs', 'open-peeps', 
            'personas', 'pixel-art', 'thumbs'
          ];
          const randomStyle = styles[Math.floor(Math.random() * styles.length)];
          
          // Générer l'URL de l'avatar avec le style aléatoire
          const avatarApiUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}`;
          setAvatarUrl(avatarApiUrl);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, []);

  // Régénérer un nouvel avatar avec un style différent
  const regenerateAvatar = () => {
    if (!email) return;
    
    const seed = email || 'default';
    const styles = [
      'adventurer', 'avataaars', 'bottts', 'fun-emoji', 
      'lorelei', 'micah', 'miniavs', 'open-peeps', 
      'personas', 'pixel-art', 'thumbs'
    ];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(newAvatarUrl);
  };

  if (isLoading || !email) {
    return (
      <div className="flex items-center p-4 border-t border-[var(--border-color)]">
        <div className="w-10 h-10 rounded-full bg-[var(--hover-color)] animate-pulse"></div>
        <div className="ml-3 flex-1 h-4 bg-[var(--hover-color)] animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-b border-[var(--border-color)] flex items-center">
      <button 
        onClick={regenerateAvatar} 
        className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--card-background)] border border-[var(--border-color)] hover:border-blue-400 transition-colors"
        title="Changer d'avatar"
      >
        {avatarUrl && (
          <Image 
            src={avatarUrl} 
            alt="Avatar utilisateur" 
            width={40} 
            height={40} 
            className="object-cover"
          />
        )}
      </button>
      <div className="ml-3 overflow-hidden">
        <p className="text-sm font-medium text-[var(--text-color)] truncate">
          {email}
        </p>
        <p className="text-xs text-gray-500">
          Utilisateur connecté
        </p>
      </div>
    </div>
  );
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const supabase = createBrowserSupabaseClient();

  const handleSignOut = async () => {
    try {
      // Rediriger vers la page de déconnexion qui effectuera une déconnexion complète
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: Home },
    { href: '/create', label: 'Créer une histoire', icon: PenTool },
    { href: '/stories', label: 'Mes histoires', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-[var(--background-color)]">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-[var(--card-background)] border-r border-[var(--border-color)] transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4">
          {isOpen ? (
            <h2 className="text-xl font-bold text-[var(--text-color)]">History AI</h2>
          ) : (
            <h2 className="text-xl font-bold text-[var(--text-color)]">HA</h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-[var(--hover-color)] text-[var(--text-color)]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M15 19l-7-7 7-7" : "M9 19l7-7-7-7"}
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors text-[var(--text-color)] ${
                  pathname === item.href
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'hover:bg-[var(--hover-color)]'
                }`}
              >
                <Icon className="w-6 h-6" />
                {isOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Afficher le profil utilisateur uniquement si le sidebar est ouvert */}
        {isOpen && <UserProfile />}

        <div className="p-4">
          <button
            onClick={handleSignOut}
            className={`flex items-center px-4 py-3 w-full rounded-lg text-[var(--text-color)] hover:bg-[var(--hover-color)] transition-colors`}
          >
            <LogOut className="w-6 h-6" />
            {isOpen && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 