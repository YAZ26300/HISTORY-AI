import { supabase } from '../supabase'

export async function saveStoryAsPDF(
  userId: string,
  title: string,
  pdfFile: File,
  theme?: string,
  ageRange?: string
) {
  try {
    // 1. Upload du PDF
    const pdfPath = `${userId}/${Date.now()}-${title}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('story-pdfs')
      .upload(pdfPath, pdfFile)
    
    if (uploadError) throw uploadError

    // 2. Sauvegarde des métadonnées dans la table stories
    const { error: dbError } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        title,
        theme,
        age_range: ageRange,
        pdf_path: pdfPath
      })

    if (dbError) throw dbError

    return { success: true, pdfPath }
  } catch (error) {
    console.error('Error saving story:', error)
    return { success: false, error }
  }
} 