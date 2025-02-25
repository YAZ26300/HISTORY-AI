import jsPDF from 'jspdf';

interface PdfGenerationInput {
  story: string;
  images: string[];
}

export async function getPdfBuffer({ story, images }: PdfGenerationInput): Promise<Buffer> {
  // Créer un nouveau document PDF
  const doc = new jsPDF();
  
  // Extraire le titre (première ligne)
  const lines = story.split('\n');
  const title = lines[0].trim();
  
  // Position verticale courante
  let yPosition = 20;
  
  // Ajouter le titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Ajouter le contenu de l'histoire
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Retirer le titre du contenu à afficher
  const storyContent = lines.slice(1).join('\n').trim();
  
  // Diviser le contenu de l'histoire en paragraphes
  const paragraphs = storyContent.split('\n\n');
  
  // Traiter chaque paragraphe
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') continue;
    
    // Diviser le paragraphe en lignes qui tiennent dans la largeur de la page
    const splitText = doc.splitTextToSize(paragraph, 170);
    
    // Vérifier si le paragraphe tiendra sur la page actuelle
    if (yPosition + (splitText.length * 7) > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Ajouter le paragraphe
    doc.text(splitText, 20, yPosition);
    yPosition += splitText.length * 8 + 10;
  }
  
  // Ajouter les images
  if (images && images.length > 0) {
    for (const imageUrl of images) {
      try {
        // Ajouter une nouvelle page pour chaque image
        doc.addPage();
        
        // Ajouter l'image (si c'est une URL data)
        if (imageUrl.startsWith('data:')) {
          doc.addImage(imageUrl, 'JPEG', 20, 20, 170, 100);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'image:', error);
        // Continuer sans ajouter cette image
      }
    }
  }
  
  // Convertir le PDF en Buffer pour Node.js
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
} 