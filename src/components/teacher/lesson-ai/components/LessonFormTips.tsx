
import React from 'react';

const LessonFormTips: React.FC = () => {
  return (
    <div className="mt-4 text-sm text-muted-foreground">
      <p className="font-medium">Tips for better English lessons:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Be specific in your title (e.g., "Past Tense Verbs" instead of "Grammar")</li>
        <li>Add clear instructions to focus on specific aspects (conversation, writing, etc.)</li>
        <li>The generated lesson will include vocabulary, key phrases, and quiz questions</li>
      </ul>
    </div>
  );
};

export default LessonFormTips;
