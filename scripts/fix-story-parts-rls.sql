-- Script pour corriger les politiques RLS de la table story_parts
-- À exécuter dans l'interface SQL de Supabase

-- Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'story_parts'
);

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Users can insert parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can update parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can delete parts for their own stories" ON public.story_parts;

-- Désactiver temporairement RLS pour vérifier si c'est la source du problème
ALTER TABLE public.story_parts DISABLE ROW LEVEL SECURITY;

-- Vérifier le contenu de la table
SELECT COUNT(*) FROM public.story_parts;

-- Réactiver RLS avec une politique simplifiée
ALTER TABLE public.story_parts ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour permettre à tous les utilisateurs authentifiés de lire toutes les parties d'histoire
CREATE POLICY "Allow authenticated users to read all story parts" 
  ON public.story_parts 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés d'insérer des parties d'histoire
CREATE POLICY "Allow authenticated users to insert story parts" 
  ON public.story_parts 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres parties d'histoire
CREATE POLICY "Allow authenticated users to update story parts" 
  ON public.story_parts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres parties d'histoire
CREATE POLICY "Allow authenticated users to delete story parts" 
  ON public.story_parts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s 
      WHERE s.id = story_parts.story_id AND s.user_id = auth.uid()
    )
  );

-- Vérifier les politiques actuelles
SELECT * FROM pg_policies WHERE tablename = 'story_parts'; 