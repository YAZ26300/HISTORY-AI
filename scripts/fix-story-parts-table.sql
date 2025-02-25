-- Script pour corriger la table story_parts et ses politiques
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'story_parts'
);

-- 2. Désactiver RLS pour permettre un accès complet à la table
ALTER TABLE public.story_parts DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier les contraintes de clé étrangère
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='story_parts';

-- 4. Vérifier si des tentatives d'insertion ont échoué
SELECT COUNT(*) FROM story_parts;

-- 5. Tester l'insertion manuelle d'une partie d'histoire pour une histoire existante
-- Remplacer l'UUID par celui d'une histoire existante de votre table stories
DO $$
DECLARE
  story_id_var UUID;
BEGIN
  -- Récupérer l'ID d'une histoire existante
  SELECT id INTO story_id_var FROM stories LIMIT 1;
  
  IF story_id_var IS NOT NULL THEN
    -- Insérer une partie de test
    INSERT INTO story_parts (story_id, part_number, text_content, image_url)
    VALUES (
      story_id_var,
      1,
      'Ceci est une partie de test insérée manuellement pour vérifier la fonctionnalité.',
      'https://via.placeholder.com/800x600?text=Image+de+test'
    );
    
    RAISE NOTICE 'Partie de test insérée avec succès pour l''histoire %', story_id_var;
  ELSE
    RAISE NOTICE 'Aucune histoire trouvée dans la table stories';
  END IF;
END $$;

-- 6. Vérifier si l'insertion a réussi
SELECT * FROM story_parts ORDER BY created_at DESC LIMIT 5;

-- 7. Reconfigurer les politiques RLS avec des règles plus permissives
-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Users can insert parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can update parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Users can delete parts for their own stories" ON public.story_parts;
DROP POLICY IF EXISTS "Allow authenticated users to read all story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Allow authenticated users to insert story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Allow authenticated users to update story parts" ON public.story_parts;
DROP POLICY IF EXISTS "Allow authenticated users to delete story parts" ON public.story_parts;

-- 8. Créer des politiques plus permissives
-- Réactiver RLS avec des politiques simplifiées
ALTER TABLE public.story_parts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire toutes les parties d'histoire
CREATE POLICY "Allow authenticated users to read all story parts" 
  ON public.story_parts 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés d'insérer des parties d'histoire
CREATE POLICY "Allow authenticated users to insert story parts" 
  ON public.story_parts 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour toutes les parties d'histoire
CREATE POLICY "Allow authenticated users to update all story parts" 
  ON public.story_parts 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer toutes les parties d'histoire
CREATE POLICY "Allow authenticated users to delete all story parts" 
  ON public.story_parts 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 9. Vérifier les politiques actuelles
SELECT * FROM pg_policies WHERE tablename = 'story_parts'; 