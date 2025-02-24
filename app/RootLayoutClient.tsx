'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Home, PenTool, Menu, X } from 'lucide-react';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-blue-500" />
        ) : (
          <Menu className="w-6 h-6 text-blue-500" />
        )}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-[var(--border-color)] p-4 bg-[var(--background-color)]">
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", bounce: 0.25 }}
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
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
} 