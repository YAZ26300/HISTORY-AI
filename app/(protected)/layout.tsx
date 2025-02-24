'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../lib/supabase';
import { Home, PenTool, BookOpen, LogOut } from 'lucide-react';

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
        } bg-[var(--card-background)] border-r border-[var(--border-color)] transition-all duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
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

          <nav className="flex-1 px-2 py-4">
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

          <div className="p-4 border-t border-[var(--border-color)]">
            <button
              onClick={handleSignOut}
              className={`flex items-center px-4 py-3 w-full rounded-lg text-[var(--text-color)] hover:bg-[var(--hover-color)] transition-colors`}
            >
              <LogOut className="w-6 h-6" />
              {isOpen && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 