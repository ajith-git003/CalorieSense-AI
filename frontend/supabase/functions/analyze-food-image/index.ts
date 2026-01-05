import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing food image...');

    const systemPrompt = `You are CalorieSense AI, a nutrition expert that analyzes food images. When shown an image of food, identify the food items and provide accurate nutritional information.
    
IMPORTANT: Return ONLY valid JSON with no additional text. The response must be parseable JSON.

Analyze the food in the image and estimate the nutritional values for what you see.

Return this exact JSON structure:
{
  "name": "Food Name (be specific about what you see)",
  "calories": 250,
  "protein": 10,
  "carbs": 30,
  "fat": 8,
  "fiber": 3,
  "sugar": 5,
  "sodium": 200,
  "servingSize": "1 plate (estimated 300g)",
  "servingSizes": ["1 plate", "100g", "1 serving"],
  "description": "Brief description of what you see in the image",
  "image": "appropriate food emoji like 🍛 or 🥗",
  "confidence": "high/medium/low",
  "detectedItems": ["item1", "item2"]
}

Be accurate with:
- Indian foods: dosa, idli, biryani, curry, dal, roti, paratha
- Street food: vada pav, pav bhaji, samosa, bonda, poha
- Common foods: rice, chicken, vegetables, fruits
- Mixed plates: identify individual components

If the image is unclear or not food, return:
{
  "name": "Unknown Food",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "sugar": 0,
  "sodium": 0,
  "servingSize": "Unknown",
  "servingSizes": ["Unknown"],
  "description": "Could not identify food in the image",
  "image": "❓",
  "confidence": "low",
  "detectedItems": []
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide detailed nutritional information. Identify all food items visible and estimate calories, protein, carbs, and fat.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON response
    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      nutritionData = {
        name: "Detected Food",
        calories: 300,
        protein: 10,
        carbs: 35,
        fat: 12,
        fiber: 3,
        sugar: 5,
        sodium: 200,
        servingSize: "1 serving",
        servingSizes: ["1 serving", "100g"],
        description: "Food detected from image",
        image: "🍽️",
        confidence: "low",
        detectedItems: []
      };
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
