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

-- Nouvelle table pour stocker les parties d'histoire pour la vue livre
CREATE TABLE IF NOT EXISTS public.story_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID NOT NULL,
  part_number INTEGER NOT NULL,
  text_content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte de clé étrangère pour lier à la table des histoires
  CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE,
  
  -- Contrainte d'unicité pour éviter les doublons (une histoire ne peut pas avoir deux parties avec le même numéro)
  UNIQUE(story_id, part_number)
);

-- Politiques RLS pour la table story_parts
ALTER TABLE public.story_parts ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Users can insert parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can update parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can delete parts for their own stories" ON public.story_parts;

-- Politique pour permettre aux utilisateurs authentifiés de lire leurs propres parties d'histoire
CREATE POLICY "Users can view their own story parts" 
  ON public.story_parts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Politique pour permettre aux utilisateurs authentifiés d'insérer leurs propres parties d'histoire
CREATE POLICY "Users can insert parts for their own stories" 
  ON public.story_parts 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres parties d'histoire
CREATE POLICY "Users can update parts for their own stories" 
  ON public.story_parts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres parties d'histoire
CREATE POLICY "Users can delete parts for their own stories" 
  ON public.story_parts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Créer un index sur story_id pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_story_parts_story_id ON public.story_parts(story_id);

-- Créer un index sur part_number pour les tris
CREATE INDEX IF NOT EXISTS idx_story_parts_part_number ON public.story_parts(part_number);

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