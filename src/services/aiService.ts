export const getExerciseExplanation = async (title: string, description: string): Promise<string> => {
  const apiKey = process.env.EXPO_PUBLIC_AI_API_KEY;

  if (!apiKey) {
    // Simulate network latency for mock response
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `🚀 ¡Modo Guerra Activado para ${title}!\n\nEste ejercicio es brutal para tu progreso. ${description}\n\n**Tips de Postura:**\n- Mantén la espalda recta y el abdomen contraído en todo momento.\n- Controla la respiración: exhala en el esfuerzo máximo.\n- Concéntrate en el músculo que estás trabajando, la conexión mente-músculo es clave.\n\n¡No te rindas, cada repetición cuenta para forjar tu mejor versión!`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un entrenador militar estricto y motivador experto en fitness. Tu objetivo es explicar ejercicios brevemente y dar consejos clave de postura, manteniendo una actitud de "Modo Guerra". Usa un tono directo, enérgico y motivador en español.'
          },
          {
            role: 'user',
            content: `Explícame brevemente y dame tips de postura para este ejercicio:\n\nEjercicio: ${title}\nDescripción: ${description}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching AI explanation:", error);
    return "Error al conectar con la IA. ¡Pero no necesitas una máquina que te diga que sigas empujando! Mantén la forma estricta y sigue adelante.";
  }
};
