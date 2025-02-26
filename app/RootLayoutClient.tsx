'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Home, PenTool, Menu, X } from 'lucide-react';
import { SpotlightButton } from './components/ui/spotlight-button';
import { Toaster } from 'react-hot-toast';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Toaster pour les notifications */}
      <Toaster position="top-right" />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <SpotlightButton
          icon={isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          text=""
        />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed w-64 h-full border-r border-[var(--border-color)] p-4 bg-[var(--background-color)]">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-lg font-semibold">Histoire AI</span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/" className="nav-link">
              <Home className="w-5 h-5" />
              Accueil
            </Link>
            <Link href="/create" className="nav-link">
              <PenTool className="w-5 h-5" />
              Créer une histoire
            </Link>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop avec flou */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm bg-black/50"
              />

              {/* Sidebar mobile */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                className="lg:hidden fixed w-64 h-full bg-[var(--background-color)] border-r border-[var(--border-color)] p-4 z-50"
              >
                <div className="flex items-center gap-2 mb-8">
                  <BookOpen className="w-8 h-8 text-blue-500" />
                  <span className="text-lg font-semibold">Histoire AI</span>
                </div>
                
                <nav className="space-y-2">
                  <Link 
                    href="/" 
                    className="nav-link"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    Accueil
                  </Link>
                  <Link 
                    href="/create" 
                    className="nav-link"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <PenTool className="w-5 h-5" />
                    Créer une histoire
                  </Link>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="w-full min-h-screen">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8 lg:pl-72">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 