
/**
 * API Service for Pollinations AI API
 */

/**
 * Generates a roast based on an image
 */
export const generateImageRoast = async (
  base64Image: string,
  intensity: 'light' | 'medium' | 'dark' = 'medium',
  persona: string = 'Savage Comedian'
): Promise<{ roast: string; finalBurn: string; ratings: Record<string, number> }> => {
  try {
    // Prepare the request body for image analysis
    const analysisRequestBody = {
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this selfie for a humorous roast. Focus on visible features, style, background, and expression.` 
            },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}` 
              } 
            }
          ]
        }
      ],
      model: "mistralai-large",
      code: "beesknees",
      jsonMode: false
    };

    // First request: Analyze the image
    const analysisResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisRequestBody)
    });

    if (!analysisResponse.ok) {
      throw new Error(`Image analysis failed: ${analysisResponse.statusText}`);
    }

    const analysisResult = await analysisResponse.text();

    // Second request: Generate the roast based on the analysis
    const intensityDescriptions = {
      light: "Be playful and funny while roasting. Keep it light and humorous with witty observations.",
      medium: "Be sassy and clever while roasting. Include some sharper jokes but maintain a fun tone.",
      dark: "Be absolutely savage but hilarious. Don't hold back, but still make it humorous rather than mean."
    };

    const roastRequestBody = {
      messages: [
        {
          role: "system",
          content: `You are ${persona}, a hilarious AI roast master. ${intensityDescriptions[intensity]} 
                   Create a humorous, exaggerated roast with witty observations about the person's selfie.
                   Include a funny one-liner at the end as a "FINAL BURN". Also generate ratings on a scale of 5-30% 
                   for the following categories: Creativity, Confidence, Style, Mystery, and Self-Awareness.
                   Format your response as JSON with 'roast', 'finalBurn', and 'ratings' fields.`
        },
        {
          role: "user",
          content: `Based on this selfie analysis, create a hilarious roast: ${analysisResult}`
        }
      ],
      model: "mistralai-large",
      code: "beesknees",
      jsonMode: true
    };

    // Make the roast request
    const roastResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roastRequestBody)
    });

    if (!roastResponse.ok) {
      throw new Error(`Roast generation failed: ${roastResponse.statusText}`);
    }

    // Parse the response
    const roastData = await roastResponse.json();
    
    // Handle both potential response formats
    let formattedResponse;
    
    if (typeof roastData === 'string') {
      try {
        formattedResponse = JSON.parse(roastData);
      } catch (e) {
        // If it can't be parsed as JSON, create a default structure
        formattedResponse = {
          roast: roastData,
          finalBurn: "If selfies were a crime, yours would be a life sentence.",
          ratings: {
            Creativity: 20,
            Confidence: 15,
            Style: 10,
            Mystery: 5,
            "Self-Awareness": 30
          }
        };
      }
    } else {
      formattedResponse = roastData;
    }
    
    return {
      roast: formattedResponse.roast || "This selfie is beyond my roasting abilities!",
      finalBurn: formattedResponse.finalBurn || "If selfies were a crime, yours would be a life sentence.",
      ratings: formattedResponse.ratings || {
        Creativity: 20,
        Confidence: 15,
        Style: 10,
        Mystery: 5,
        "Self-Awareness": 30
      }
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(`Failed to generate roast: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generates a roast based on text input
 */
export const generateTextRoast = async (
  text: string,
  intensity: 'light' | 'medium' | 'dark' = 'medium',
  persona: string = 'Savage Comedian'
): Promise<{ roast: string; finalBurn: string; ratings: Record<string, number> }> => {
  try {
    const intensityDescriptions = {
      light: "Be playful and funny while roasting. Keep it light and humorous with witty observations.",
      medium: "Be sassy and clever while roasting. Include some sharper jokes but maintain a fun tone.",
      dark: "Be absolutely savage but hilarious. Don't hold back, but still make it humorous rather than mean."
    };

    const requestBody = {
      messages: [
        {
          role: "system",
          content: `You are ${persona}, a hilarious AI roast master. ${intensityDescriptions[intensity]} 
                   Create a humorous, exaggerated roast with witty observations about the user's text.
                   Include a funny one-liner at the end as a "FINAL BURN". Also generate ratings on a scale of 5-30% 
                   for the following categories: Creativity, Confidence, Style, Mystery, and Self-Awareness.
                   Format your response as JSON with 'roast', 'finalBurn', and 'ratings' fields.`
        },
        {
          role: "user",
          content: `Roast me based on this text: ${text}`
        }
      ],
      model: "mistralai-large",
      code: "beesknees",
      jsonMode: true
    };

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Roast generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both potential response formats
    let formattedResponse;
    
    if (typeof data === 'string') {
      try {
        formattedResponse = JSON.parse(data);
      } catch (e) {
        formattedResponse = {
          roast: data,
          finalBurn: "If words were crimes, yours would deserve a life sentence.",
          ratings: {
            Creativity: 20,
            Confidence: 15,
            Style: 10,
            Mystery: 5,
            "Self-Awareness": 30
          }
        };
      }
    } else {
      formattedResponse = data;
    }
    
    return {
      roast: formattedResponse.roast || "This text is beyond my roasting abilities!",
      finalBurn: formattedResponse.finalBurn || "If words were crimes, yours would deserve a life sentence.",
      ratings: formattedResponse.ratings || {
        Creativity: 20,
        Confidence: 15,
        Style: 10,
        Mystery: 5,
        "Self-Awareness": 30
      }
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(`Failed to generate roast: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Generate a random seed for each request
export const generateRandomSeed = (): number => {
  return Math.floor(Math.random() * 1000000);
};
