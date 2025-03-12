/**
 * Extracts JSON from model output
 */
export function parseModelOutput(output: string | string[]): any {
  try {
    // If output is an array, join it
    const outputText = Array.isArray(output) ? output.join("") : output;
    
    // Try to find JSON in markdown code blocks first
    const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse JSON from code block", e);
      }
    }
    
    // Look for JSON object with curly braces
    const jsonObjectMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON from object match", e);
      }
    }
    
    // Last resort: try to parse the entire output as JSON
    return JSON.parse(outputText);
  } catch (error) {
    console.error("Error parsing model output:", error);
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Validates and fixes quiz question data
 */
export function validateAndFixQuestions(questions: any[]): any[] {
  if (!Array.isArray(questions)) {
    console.error("Invalid questions format, not an array:", questions);
    return [];
  }
  
  const validatedQuestions = [];
  
  for (const question of questions) {
    if (!question.question_text || !question.options || !Array.isArray(question.options)) {
      console.log(`Skipping invalid question: ${JSON.stringify(question)}`);
      continue;
    }
    
    // Ensure points is valid
    if (!question.points || question.points < 1 || question.points > 5) {
      question.points = 1;
    }
    
    // Ensure question type is valid
    if (!question.question_type) {
      question.question_type = "multiple_choice";
    }
    
    // Ensure exactly one correct answer
    const correctOptions = question.options.filter((o: any) => o.is_correct);
    if (correctOptions.length !== 1) {
      // Fix the correct answers - make the first option correct if none are
      if (correctOptions.length === 0 && question.options.length > 0) {
        question.options[0].is_correct = true;
      } 
      // If multiple correct answers, keep only the first one correct
      else if (correctOptions.length > 1) {
        let foundCorrect = false;
        question.options = question.options.map((option: any) => {
          if (option.is_correct && !foundCorrect) {
            foundCorrect = true;
            return option;
          }
          return { ...option, is_correct: false };
        });
      }
    }
    
    // Ensure we have exactly 4 options
    if (question.options.length < 4) {
      // Add dummy options if needed
      while (question.options.length < 4) {
        question.options.push({
          option_text: `Additional option ${question.options.length + 1}`,
          is_correct: false
        });
      }
    } else if (question.options.length > 4) {
      // Trim to 4 options, but make sure we keep the correct one
      const correctOptionIndex = question.options.findIndex((o: any) => o.is_correct);
      if (correctOptionIndex >= 0) {
        const correctOption = question.options[correctOptionIndex];
        
        // Filter to keep the correct option and 3 others
        const incorrectOptions = question.options
          .filter((o: any) => !o.is_correct)
          .slice(0, 3);
          
        question.options = [correctOption, ...incorrectOptions];
      } else {
        question.options = question.options.slice(0, 4);
        question.options[0].is_correct = true;
      }
    }
    
    validatedQuestions.push(question);
  }
  
  return validatedQuestions;
}

/**
 * Generates fallback questions if AI generation fails
 */
export function generateFallbackQuestions(numQuestions = 5): any[] {
  const questions = [];
  
  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      question_text: `Question ${i + 1} (AI generation failed - please regenerate)`,
      points: 1,
      question_type: "multiple_choice",
      options: [
        { option_text: "Option A", is_correct: true },
        { option_text: "Option B", is_correct: false },
        { option_text: "Option C", is_correct: false },
        { option_text: "Option D", is_correct: false }
      ]
    });
  }
  
  return questions;
}
