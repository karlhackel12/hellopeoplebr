
import React from 'react';
import { Brain, MessageSquare, Mic, BookOpen, BarChart2, Settings } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "AI Conversation Partner",
      description: "Practice speaking with our intelligent AI that adapts to your language level and provides natural conversation experiences."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Personalized Feedback",
      description: "Receive instant corrections and suggestions to improve your pronunciation, grammar, and vocabulary usage."
    },
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Voice Recognition",
      description: "Advanced speech technology analyzes your pronunciation and helps you sound like a native speaker."
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Adaptive Learning Path",
      description: "Lessons that adjust to your progress and focus on areas where you need the most improvement."
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed analytics on vocabulary retention, speaking confidence, and overall proficiency."
    },
    {
      icon: <Settings className="h-10 w-10 text-primary" />,
      title: "Customizable Experience",
      description: "Choose learning goals, topics of interest, and preferred learning pace to create a personalized language journey."
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-secondary/30">
      <div className="container px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Reimagine How You Learn Languages
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform combines cutting-edge AI technology with proven language learning methodologies for a truly effective experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative bg-background border border-border/60 rounded-xl p-8 transition-all duration-300 hover:shadow-md group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="mb-5">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
