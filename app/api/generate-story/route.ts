import { NextResponse } from 'next/server';
import { HfInference } from "@huggingface/inference";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Configuration du client Hugging Face
const hf = new HfInference(HUGGINGFACE_API_KEY || '');

interface StoryPart {
  text: string;
  image: string;
}

export async function POST(request: Request) {
  if (!OPENROUTER_API_KEY || !HUGGINGFACE_API_KEY) {
    return NextResponse.json(
      { error: 'API keys not configured' },
      { status: 500 }
    );
  }

  try {
    const { theme, age, characters } = await request.json();

    // Générer l'histoire avec un modèle moins coûteux
    const systemPrompt = `Tu es un conteur d'histoires pour enfants professionnel. Ta tâche est de créer des histoires divisées en EXACTEMENT trois parties.
RÈGLES IMPORTANTES:
1. L'histoire DOIT avoir EXACTEMENT trois parties
2. Chaque partie DOIT commencer par les marqueurs exacts: "PARTIE 1:", "PARTIE 2:", "PARTIE 3:"
3. Chaque partie doit faire environ 100 mots
4. Utilise un langage simple et des phrases courtes
5. L'histoire doit être adaptée à l'âge indiqué
6. Commence DIRECTEMENT avec "PARTIE 1:" sans aucune introduction ou texte avant
7. Ne mets pas de titre ni de description avant de commencer l'histoire

Format EXACT attendu (commence directement comme ça):
PARTIE 1: [texte de la première partie]
PARTIE 2: [texte de la deuxième partie]
PARTIE 3: [texte de la troisième partie]`;

    const storyPrompt = `Crée une histoire pour enfants de ${age} ans sur le thème "${theme}" avec les personnages suivants: ${characters}. COMMENCE DIRECTEMENT avec "PARTIE 1:" sans aucune introduction.`;
    
    console.log('Sending story request to AI model');
    
    const storyResponse = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Histoire pour Enfants - AI',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-2.1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: storyPrompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stop: ["\n\n", "PARTIE 4:"],
      }),
    });

    const storyData = await storyResponse.json();
    console.log('Story Response:', storyData);

    if (!storyResponse.ok || storyData.error) {
      console.error('Story API Error:', storyData);
      throw new Error(`Failed to generate story: ${storyData.error?.message || 'Unknown error'}`);
    }

    if (!storyData.choices?.[0]?.message?.content) {
      console.error('Invalid story response format:', storyData);
      throw new Error('Invalid response format from story API');
    }

    let storyText = storyData.choices[0].message.content;
    
    // Nettoyer le texte pour s'assurer qu'il commence par PARTIE 1:
    storyText = storyText.replace(/^[\s\S]*?(PARTIE 1:)/, '$1');
    console.log('Generated story text:', storyText);

    // Diviser l'histoire en parties
    const parts = storyText.match(/PARTIE [1-3]:([\s\S]*?)(?=PARTIE [1-3]:|$)/g);
    const storyParts: string[] = parts ? parts.map((part: string) => 
      part.replace(/PARTIE [1-3]:/, '').trim()
    ) : [];

    console.log('Parsed story parts:', storyParts);

    if (storyParts.length !== 3) {
      throw new Error('L\'histoire n\'a pas été correctement divisée en trois parties');
    }
    
    // Générer une illustration pour chaque partie avec Hugging Face
    const illustrations = await Promise.all(
      storyParts.map(async (part: string, index: number) => {
        console.log(`Generating image for part ${index + 1} with Hugging Face`);
        
        const imagePrompt = `children's book illustration, ${characters} in a ${theme} scene, ${part.substring(0, 100)}..., colorful, cute, child-friendly, cartoon style, vibrant colors, digital art, high quality`;

        try {
          // Générer l'image avec Stable Diffusion via Hugging Face
          const image = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: imagePrompt,
            parameters: {
              num_inference_steps: 30,
              guidance_scale: 7.5,
              negative_prompt: "ugly, blurry, poor quality, dark, scary, realistic, photographic",
            }
          });

          // Convertir le blob en base64
          const buffer = Buffer.from(await image.arrayBuffer());
          const base64 = buffer.toString('base64');
          const imageUrl = `data:image/jpeg;base64,${base64}`;

          return imageUrl;
        } catch (error: any) {
          console.error(`Error generating image for part ${index + 1}:`, error);
          // En cas d'erreur, utiliser une image placeholder
          return `https://placehold.co/1024x1024.png/FFB6C1/333333?text=Illustration+${index + 1}`;
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
    console.error('Error generating content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate content', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 