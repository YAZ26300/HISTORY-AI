-- Table pour stocker les métadonnées des histoires
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  age_range TEXT,
  pdf_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte de clé étrangère pour lier à la table des utilisateurs
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Politiques RLS (Row Level Security) pour la table stories
-- Permet aux utilisateurs de voir uniquement leurs propres histoires
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de lire leurs propres histoires
CREATE POLICY "Users can view their own stories" 
  ON public.stories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs authentifiés d'insérer leurs propres histoires
CREATE POLICY "Users can insert their own stories" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres histoires
CREATE POLICY "Users can update their own stories" 
  ON public.stories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres histoires
CREATE POLICY "Users can delete their own stories" 
  ON public.stories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer un index sur user_id pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);

-- Créer un index sur created_at pour les tris par date
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);

-- Instructions pour configurer le stockage
/*
Pour configurer le bucket 'story-pdfs', exécuter ces instructions dans l'interface SQL de Supabase :

1. Créer le bucket si nécessaire :
   SELECT storage.create_bucket('story-pdfs', { public: true });

2. Mettre en place les politiques RLS pour le stockage :
   -- Permettre à tous les utilisateurs authentifiés de lire tous les objets 
   CREATE POLICY "Allow public read access" 
     ON storage.objects 
     FOR SELECT 
     USING (bucket_id = 'story-pdfs');

   -- Permettre à tous les utilisateurs authentifiés d'insérer leurs propres objets
   CREATE POLICY "Allow authenticated users to upload objects" 
     ON storage.objects 
     FOR INSERT 
     WITH CHECK (
       bucket_id = 'story-pdfs' AND 
       auth.uid() IS NOT NULL AND 
       (storage.foldername(name))[1] = auth.uid()::text
     );

   -- Permettre aux utilisateurs authentifiés de mettre à jour leurs propres objets
   CREATE POLICY "Allow users to update their own objects" 
     ON storage.objects 
     FOR UPDATE 
     USING (
       bucket_id = 'story-pdfs' AND 
       auth.uid() IS NOT NULL AND 
       (storage.foldername(name))[1] = auth.uid()::text
     );

   -- Permettre aux utilisateurs authentifiés de supprimer leurs propres objets
   CREATE POLICY "Allow users to delete their own objects" 
     ON storage.objects 
     FOR DELETE 
     USING (
       bucket_id = 'story-pdfs' AND 
       auth.uid() IS NOT NULL AND 
       (storage.foldername(name))[1] = auth.uid()::text
     );
*/ 