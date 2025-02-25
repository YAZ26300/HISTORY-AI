'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@radix-ui/themes';
import { X, ChevronLeft, ChevronRight, BookOpen, Volume, Volume2, FileText } from 'lucide-react';
import { SpotlightButton } from '../ui/spotlight-button';
import useSound from 'use-sound';

interface BookViewProps {
  storyParts: {
    text: string;
    image: string;
  }[];
  title: string;
  onClose: () => void;
  pdfUrl?: string; // URL du PDF téléchargé si disponible
}

const BookView = ({ storyParts, title, onClose, pdfUrl }: BookViewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animation, setAnimation] = useState<'slideLeft' | 'slideRight' | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Effets sonores
  const [playPageFlip] = useSound('/sounds/page-flip.mp3', { 
    volume: 0.5,
    soundEnabled,
    interrupt: true
  });
  
  const [playBookOpen] = useSound('/sounds/book-open.mp3', { 
    volume: 0.6,
    soundEnabled
  });
  
  const [playBookClose] = useSound('/sounds/book-close.mp3', { 
    volume: 0.6,
    soundEnabled
  });

  // Structure des pages: [couverture, ...parties (texte+image), fin]
  useEffect(() => {
    // Calculer le nombre total de pages
    // Couverture + pages de contenu (une par partie) + fin
    const total = 1 + storyParts.length + 1;
    setTotalPages(total);
    
    // Afficher des informations de débogage sur les parties de l'histoire
    console.log(`BookView: Nombre de parties d'histoire reçues: ${storyParts.length}`);
    if (storyParts.length === 0) {
      console.log('BookView: Aucune partie d\'histoire disponible, utilisation du PDF uniquement');
      // Si aucune partie d'histoire n'est disponible, basculer automatiquement vers le PDF
      if (pdfUrl) {
        console.log("Pas de parties d'histoire, affichage automatique du PDF");
        setShowPdf(true);
      }
    } else {
      console.log('BookView: Parties d\'histoire disponibles:', storyParts.map((part, idx) => ({
        partie: idx + 1,
        textLength: part.text?.length || 0,
        imageUrl: part.image?.substring(0, 50) + '...'
      })));
    }
    
    // Simuler un court chargement
    setTimeout(() => {
      setIsLoaded(true);
      // Jouer le son d'ouverture du livre après le chargement
      if (soundEnabled) {
        try {
          playBookOpen();
        } catch (e) {
          console.error("Erreur lors de la lecture du son:", e);
        }
      }
    }, 1000);
  }, [storyParts, playBookOpen, soundEnabled, pdfUrl]);

  // Effet pour charger le PDF dans l'iframe lorsque showPdf change
  useEffect(() => {
    if (showPdf && pdfUrl && pdfContainerRef.current) {
      console.log("Affichage du PDF avec l'URL:", pdfUrl);
      
      // Vider le conteneur avant d'ajouter quoi que ce soit
      while (pdfContainerRef.current.firstChild) {
        pdfContainerRef.current.removeChild(pdfContainerRef.current.firstChild);
      }
      
      // Ajouter une notification ou une info pour informer l'utilisateur
      if (!storyParts || storyParts.length === 0) {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'pdf-notification';
        notificationDiv.innerHTML = `
          <div class="info-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Cette histoire n'a pas encore de parties structurées. Le PDF original est affiché.</span>
          </div>
        `;
        pdfContainerRef.current.appendChild(notificationDiv);
      }
      
      // Créer et ajouter l'iframe pour le PDF
      const iframe = document.createElement('iframe');
      iframe.src = pdfUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      pdfContainerRef.current.appendChild(iframe);
    }
  }, [showPdf, pdfUrl, storyParts]);

  const handleClose = () => {
    if (soundEnabled) {
      try {
        playBookClose();
      } catch (e) {
        console.error("Erreur lors de la lecture du son:", e);
      }
    }
    // Petit délai avant de fermer
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setAnimation('slideLeft');
      if (soundEnabled) {
        try {
          playPageFlip();
        } catch (e) {
          console.error("Erreur lors de la lecture du son:", e);
        }
      }
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimation(null);
      }, 300);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setAnimation('slideRight');
      if (soundEnabled) {
        try {
          playPageFlip();
        } catch (e) {
          console.error("Erreur lors de la lecture du son:", e);
        }
      }
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setAnimation(null);
      }, 300);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const togglePdfView = () => {
    setShowPdf(!showPdf);
  };

  // Fonction pour obtenir le contenu de la page actuelle
  const getCurrentPageContent = () => {
    // Si on affiche le PDF
    if (showPdf && pdfUrl) {
      return (
        <div className="book-page book-page-pdf" ref={pdfContainerRef}>
          {/* Le PDF sera inséré ici par useEffect */}
        </div>
      );
    }
    
    // Page de couverture
    if (currentPage === 0) {
      return (
        <div className="book-page book-page-cover">
          <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <h1 className="text-white text-4xl font-bold mb-8 tracking-tight">{title}</h1>
            <div className="text-white/80 text-lg my-8">
              Une histoire magique créée avec IA
            </div>
            {storyParts.length === 0 && pdfUrl && (
              <div className="bg-blue-900/50 p-4 rounded-lg mb-6">
                <p className="text-white text-sm">
                  Cette histoire n'a pas de parties structurées pour le mode livre.
                  Le PDF va s'afficher automatiquement.
                </p>
                <button 
                  onClick={() => setShowPdf(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Voir le PDF maintenant
                </button>
              </div>
            )}
            <div className="mt-8 text-white/60 text-sm">
              <div className="flex items-center justify-center">
                <ChevronRight className="w-4 h-4 mr-1" />
                <span>Cliquez sur la flèche droite pour commencer l'aventure</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Dernière page
    if (currentPage === totalPages - 1) {
      return (
        <div className="book-page book-page-end">
          <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <h2 className="text-white text-3xl font-bold mb-6">Fin de l'histoire</h2>
            <p className="text-white/80 my-8">
              Merci d'avoir lu cette histoire magique !
            </p>
            {pdfUrl && (
              <button 
                onClick={() => setShowPdf(true)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Voir le PDF complet
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Pages de contenu (index 1 à totalPages-2)
    const storyIndex = currentPage - 1;
    const part = storyParts[storyIndex];
    
    // Vérifier si la partie existe
    if (!part || !part.text) {
      return (
        <div className="book-page book-page-error">
          <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-red-900/20">
            <h2 className="text-white text-2xl font-bold mb-6">Partie manquante</h2>
            <p className="text-white/80 my-4">
              Cette partie de l'histoire n'est pas disponible.
            </p>
            {pdfUrl && (
              <button 
                onClick={() => setShowPdf(true)}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Voir le PDF complet à la place
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="book-page book-page-content">
        <div className="grid md:grid-cols-2 h-full">
          {/* Côté texte */}
          <div className="p-6 md:p-8 flex flex-col h-full bg-white">
            <Badge size="2" variant="soft" color="blue" className="mb-4 self-start">
              Partie {storyIndex + 1}
            </Badge>
            <div className="prose prose-sm flex-1 overflow-auto book-text-content text-gray-800">
              {part.text}
            </div>
          </div>
          
          {/* Côté image */}
          <div className="flex items-center justify-center p-4 h-full bg-white">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image
                src={part.image}
                alt={`Illustration partie ${storyIndex + 1}`}
                fill
                className="object-contain book-image"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={storyIndex < 2}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Animations pour les transitions de page
  const getAnimationVariants = () => {
    if (animation === 'slideLeft') {
      return {
        initial: { x: 0, opacity: 1 },
        animate: { x: -50, opacity: 0 },
        exit: { x: 50, opacity: 0 },
        transition: { duration: 0.3 }
      };
    } else if (animation === 'slideRight') {
      return {
        initial: { x: 0, opacity: 1 },
        animate: { x: 50, opacity: 0 },
        exit: { x: -50, opacity: 0 },
        transition: { duration: 0.3 }
      };
    } else {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
      };
    }
  };

  const animationVariants = getAnimationVariants();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
    >
      {/* Chargement initial */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/70"
          >
            <div className="text-white text-xl mb-4">Préparation de votre livre...</div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin" />
            </div>
            <div className="text-gray-400 text-sm">
              Chargement des illustrations et mise en page
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center">
        {/* Bouton fermer */}
        <div className="absolute top-4 right-4 z-10">
          <SpotlightButton
            text=""
            icon={<X size={20} />}
            onClick={handleClose}
          />
        </div>
        
        {/* Contrôles supplémentaires */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          {/* Contrôle du son */}
          <SpotlightButton
            text=""
            icon={soundEnabled ? <Volume2 size={20} /> : <Volume size={20} className="text-gray-500" />}
            onClick={toggleSound}
          />
          
          {/* Basculer entre vue livre et PDF */}
          {pdfUrl && (
            <SpotlightButton
              text=""
              icon={<FileText size={20} className={showPdf ? "text-blue-500" : ""} />}
              onClick={togglePdfView}
            />
          )}
        </div>
        
        {/* Navigation du livre */}
        <div className="w-full flex justify-between items-center px-4 mb-4">
          <SpotlightButton
            text="Page précédente"
            icon={<ChevronLeft size={20} />}
            onClick={goToPrevPage}
            disabled={currentPage === 0 || !isLoaded || showPdf}
          />
          <div className="text-white flex flex-col items-center">
            <div className="flex items-center mb-2">
              <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
              {showPdf ? (
                <span>Visualisation du PDF</span>
              ) : (
                <span>Page {currentPage + 1} sur {totalPages}</span>
              )}
            </div>
            {!showPdf && (
              <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentPage / (totalPages - 1)) * 100}%` }}
                />
              </div>
            )}
          </div>
          <SpotlightButton
            text="Page suivante"
            icon={<ChevronRight size={20} />}
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 || !isLoaded || showPdf}
          />
        </div>
        
        {/* Le livre */}
        <div className="flex-1 w-full overflow-hidden">
          {isLoaded && (
            <motion.div 
              key={showPdf ? "pdf-view" : currentPage}
              initial={animationVariants.initial}
              animate={animationVariants.animate}
              exit={animationVariants.exit}
              transition={animationVariants.transition}
              className="w-full h-full flex items-center justify-center"
            >
              <div className="book-container w-full h-full max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl">
                {getCurrentPageContent()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Styles pour le livre */}
      <style jsx global>{`
        .book-container {
          background: white;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          transition: transform 0.3s ease;
        }
        
        .book-container:hover {
          transform: translateY(-5px);
        }
        
        .book-page {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .book-page-cover {
          background: linear-gradient(135deg, #1a365d 0%, #3182ce 100%);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.3);
        }
        
        .book-page-end {
          background: linear-gradient(135deg, #3182ce 0%, #1a365d 100%);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.3);
        }
        
        .book-page-content {
          background: white;
        }
        
        .book-page-pdf {
          background: white;
        }
        
        .pdf-notification {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          pointer-events: none;
        }
        
        .info-bar {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: rgba(59, 130, 246, 0.15);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
          color: #3182ce;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .info-icon {
          margin-right: 10px;
          flex-shrink: 0;
          color: #3182ce;
        }
        
        .book-text-content {
          font-family: 'Georgia', serif;
          line-height: 1.7;
          text-align: justify;
        }
        
        .book-image {
          transition: transform 0.5s ease;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .book-image:hover {
          transform: scale(1.02);
        }
        
        .book-page-error {
          background: linear-gradient(135deg, #3182ce 0%, #1a365d 100%);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.3);
        }
        
        @media (max-width: 768px) {
          .book-page-content {
            overflow-y: auto;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default BookView; 