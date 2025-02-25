-- Requêtes SQL à exécuter dans Supabase pour créer les politiques de sécurité
CREATE POLICY "Allow public read access for story images" ON storage.objects FOR SELECT USING (bucket_id = 'story-images');
CREATE POLICY "Allow authenticated users to upload story images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'story-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to update their own story images" ON storage.objects FOR UPDATE USING (bucket_id = 'story-images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow users to delete their own story images" ON storage.objects FOR DELETE USING (bucket_id = 'story-images' AND auth.role() = 'authenticated');
