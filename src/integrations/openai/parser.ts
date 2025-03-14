
interface LessonData {
  sections: any[];
  metadata?: any;
}

export const parseLesson = (data: any): LessonData => {
  try {
    if (!data || !data.sections || !Array.isArray(data.sections)) {
      throw new Error('Invalid lesson data structure');
    }
    
    // Here we would normally transform/validate the data
    // But for simplicity we'll just return it as is
    return {
      sections: data.sections,
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error('Error parsing lesson data:', error);
    throw error;
  }
};
