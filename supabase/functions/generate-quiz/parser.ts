
// Helper function to parse potential markdown from model output
export function parseModelOutput(output: string | string[]): any {
  try {
    // If output is an array, join it
    let outputText = Array.isArray(output) ? output.join("") : output;

    // Try to find JSON in markdown code blocks
    const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse the entire text as JSON
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Error parsing model output:", error);
    throw new Error("Failed to parse AI model output as JSON");
  }
}

// Validate and fix question structure
export function validateAndFixQuestions(questions: any[]): any[] {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }

  return questions
    .filter(q => {
      // Basic validation
      return (
        q && 
        typeof q.question_text === 'string' && 
        q.question_text.trim() !== '' &&
        Array.isArray(q.options) && 
        q.options.length >= 2
      );
    })
    .map(q => {
      // Find correct answer
      const correctOptionIndex = q.options.findIndex((opt: any) => opt.is_correct === true);
      
      // If no correct answer is marked, mark the first one as correct
      if (correctOptionIndex === -1) {
        q.options[0].is_correct = true;
      }
      
      // Ensure all options have the is_correct property
      q.options = q.options.map((opt: any, index: number) => ({
        option_text: opt.option_text || `Option ${index + 1}`,
        is_correct: Boolean(opt.is_correct)
      }));
      
      return {
        question_text: q.question_text,
        question_type: 'multiple_choice',
        points: 1,
        options: q.options
      };
    });
}

// Generate fallback questions if model fails
export function generateFallbackQuestions(count: number): any[] {
  const fallbackQuestions = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question_text: `Sample question ${i + 1}`,
      question_type: "multiple_choice",
      points: 1,
      options: [
        { option_text: "First option (correct)", is_correct: true },
        { option_text: "Second option", is_correct: false },
        { option_text: "Third option", is_correct: false },
        { option_text: "Fourth option", is_correct: false }
      ]
    });
  }
  
  return fallbackQuestions;
}
