
import React from 'react';

const LessonErrorState: React.FC = () => {
  return (
    <div className="text-center py-24">
      <h2 className="text-2xl font-semibold">Lesson Not Found</h2>
      <p className="text-muted-foreground">The requested lesson could not be found.</p>
    </div>
  );
};

export default LessonErrorState;
