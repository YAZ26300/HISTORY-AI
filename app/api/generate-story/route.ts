import { NextResponse } from 'next/server';
import { HfInference } from "@huggingface/inference";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Configuration du client Hugging Face
const hf = new HfInference(HUGGINGFACE_API_KEY || '');

interface StoryPart {
  text: string;
  image: string;
}

export async function POST(request: Request) {
  if (!HUGGINGFACE_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { theme, age, characters, imageStyle } = await request.json();

    // Amélioration du prompt pour forcer le français et la structure
    const storyPrompt = `Crée une histoire pour enfants de ${age} ans sur le thème "${theme}" avec les personnages suivants: ${characters}.

RÈGLES IMPORTANTES:
1. Réponds UNIQUEMENT en français
2. L'histoire DOIT commencer DIRECTEMENT par "PARTIE 1:"
3. L'histoire DOIT avoir EXACTEMENT trois parties
4. Chaque partie DOIT commencer par "PARTIE 1:", "PARTIE 2:", "PARTIE 3:"
5. Chaque partie doit faire environ 100 mots
6. Utilise un langage simple et des phrases courtes
7. L'histoire doit être adaptée aux enfants de ${age} ans

Format EXACT attendu:
PARTIE 1: [histoire]
PARTIE 2: [histoire]
PARTIE 3: [histoire]`;
    
    console.log('Envoi de la requête pour l\'histoire');
    
    const chatCompletion = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: "Tu es un conteur d'histoires pour enfants professionnel qui crée des histoires en trois parties. Tu dois ABSOLUMENT répondre en français et suivre le format demandé."
          },
          {
            role: "user",
            content: storyPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

    const storyText = chatCompletion.choices[0].message.content;
    console.log('Texte généré:', storyText);

    // Nettoyer et diviser l'histoire en parties avec une expression régulière plus robuste
    const parts = storyText?.split(/PARTIE [1-3]:/)
      .filter(Boolean)  // Enlever les chaînes vides
      .map(part => part.trim())  // Enlever les espaces au début et à la fin
      .filter(part => part.length > 0);  // Enlever les parties qui seraient vides après le trim
    console.log('Parties détectées:', parts);

    let storyParts: string[];

    if (!parts || parts.length !== 3) {
      console.error('Nombre de parties incorrect:', parts?.length);
      console.error('Contenu des parties:', parts);
      
      // Réessayer avec un prompt plus strict
      const retryPrompt = `${storyPrompt}\n\nATTENTION: Tu DOIS absolument suivre ce format EXACT, sans aucun texte avant ou après:\n\nPARTIE 1: [Première partie de l'histoire]\nPARTIE 2: [Deuxième partie de l'histoire]\nPARTIE 3: [Troisième partie de l'histoire]`;
      
      console.log('Réessai avec un prompt plus strict');
      
      const retryCompletion = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: "Tu es un conteur d'histoires pour enfants professionnel. Tu DOIS créer une histoire en EXACTEMENT trois parties, chacune commençant par 'PARTIE X:'. Ne réponds RIEN d'autre que l'histoire formatée exactement comme demandé."
          },
          {
            role: "user",
            content: retryPrompt
          }
        ],
        temperature: 0.3,  // Température plus basse pour plus de conformité
        max_tokens: 500,
      });

      const retryText = retryCompletion.choices[0].message.content;
      console.log('Texte généré (2ème essai):', retryText);
      
      const retryParts = retryText?.split(/PARTIE [1-3]:/)
        .filter(Boolean)
        .map(part => part.trim())
        .filter(part => part.length > 0);
      console.log('Parties détectées (2ème essai):', retryParts);

      if (!retryParts || retryParts.length !== 3) {
        throw new Error('L\'histoire n\'a pas été correctement divisée en trois parties, même après une seconde tentative');
      }

      // Utiliser les parties du second essai si elles sont valides
      storyParts = retryParts;
    } else {
      storyParts = parts;
    }

    if (storyParts.length !== 3) {
      throw new Error('L\'histoire n\'a pas été correctement divisée en trois parties');
    }
    
    // Générer une illustration pour chaque partie avec un meilleur modèle
    const illustrations = await Promise.all(
      storyParts.map(async (part: string, index: number) => {
        console.log(`Génération de l'image pour la partie ${index + 1}`);
        
        // Adapter le prompt en fonction du style choisi
        let stylePrompt = "children's book style";
        
        switch(imageStyle) {
          case 'disney':
            stylePrompt = "disney animation style, colorful, cute";
            break;
          case 'pixar':
            stylePrompt = "pixar animation style, 3D, detailed, vibrant";
            break;
          case 'watercolor':
            stylePrompt = "watercolor illustration, soft colors, hand-painted, artistic";
            break;
          case 'cartoon':
            stylePrompt = "cartoon style, flat colors, simple, cute";
            break;
          case 'storybook':
            stylePrompt = "traditional storybook illustration, detailed, warm colors";
            break;
          default:
            stylePrompt = "children's book style, disney pixar style"; 
        }
        
        const imagePrompt = `children's book illustration of ${characters} in ${theme}, ${part.substring(0, 100)}..., ${stylePrompt}, child-friendly, vibrant colors, digital art, high quality`;

        try {
          const image = await hf.textToImage({
            model: "runwayml/stable-diffusion-v1-5",
            inputs: imagePrompt,
            parameters: {
              num_inference_steps: 50,
              guidance_scale: 7.5,
              negative_prompt: "ugly, blurry, poor quality, dark, scary, realistic, photographic, text, watermark, signature, bad anatomy, bad proportions",
            }
          });

          if (!image) {
            throw new Error('La génération de l\'image a échoué');
          }

          const buffer = Buffer.from(await image.arrayBuffer());
          const base64 = buffer.toString('base64');
          return `data:image/jpeg;base64,${base64}`;
        } catch (error: any) {
          console.error(`Erreur lors de la génération de l'image ${index + 1}:`, error);
          // Utiliser une URL d'image de placeholder plus fiable
          return `https://via.placeholder.com/1024x1024/FFB6C1/333333.png?text=Illustration+${index + 1}`;
        }
      })
    );

    // Combiner l'histoire et les illustrations
    const storyWithIllustrations: StoryPart[] = storyParts.map((part: string, index: number) => ({
      text: part,
      image: illustrations[index],
    }));

    return NextResponse.json({ 
      story: storyWithIllustrations,
      message: "Histoire et illustrations générées avec succès." 
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du contenu:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du contenu', 
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}