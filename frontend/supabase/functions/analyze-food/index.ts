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
    const { foodName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing food: ${foodName}`);

    const systemPrompt = `You are CalorieSense AI, a nutrition expert. When given a food name, provide accurate nutritional information.
    
IMPORTANT: Return ONLY valid JSON with no additional text. The response must be parseable JSON.

For the given food, estimate the nutritional values for a typical serving size.

Return this exact JSON structure:
{
  "name": "Food Name",
  "calories": 250,
  "protein": 10,
  "carbs": 30,
  "fat": 8,
  "fiber": 3,
  "sugar": 5,
  "sodium": 200,
  "servingSize": "1 cup (240g)",
  "servingSizes": ["1 cup (240g)", "100g", "1 serving"],
  "description": "Brief description of the food",
  "image": "appropriate food emoji like 🍛 or 🥗"
}

Be accurate with Indian foods, street foods, homemade dishes, and regional cuisines. Include foods like:
- South Indian: dosa, idli, sambar, vada, upma
- North Indian: roti, paratha, dal, paneer dishes
- Street food: vada pav, pav bhaji, samosa, bonda, poha
- Common foods: oats, eggs, rice, chapati, etc.

If you're unsure, provide reasonable estimates based on typical ingredients.`;

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
          { role: 'user', content: `Analyze this food and provide nutritional information: "${foodName}"` }
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
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return default values if parsing fails
      nutritionData = {
        name: foodName,
        calories: 200,
        protein: 5,
        carbs: 25,
        fat: 8,
        fiber: 2,
        sugar: 3,
        sodium: 150,
        servingSize: "1 serving",
        servingSizes: ["1 serving", "100g"],
        description: `Estimated nutritional values for ${foodName}`,
        image: "🍽️"
      };
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
