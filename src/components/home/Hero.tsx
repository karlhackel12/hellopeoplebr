
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-6 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-5 py-1 px-3 border border-border bg-background/80 backdrop-blur-sm rounded-full animate-fade-in">
            <p className="text-sm font-medium text-foreground/80">
              Language Learning Reimagined with AI
            </p>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            Learn Languages <span className="text-gradient">Naturally</span> with AI Conversations
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up animate-delay-100">
            Experience language learning that adapts to you. Practice real conversations with our
            AI language partners and get personalized feedback to achieve fluency faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up animate-delay-200">
            <Link to="/register">
              <Button size="lg" className="font-medium w-full sm:w-auto px-8">
                Get started free
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="font-medium w-full sm:w-auto px-8">
                Try a free lesson
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in animate-delay-300">
            No credit card required. Free plan includes 5 lessons per week.
          </p>
        </div>
        
        {/* Hero Image - Language Learning Platform Preview */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/60 animate-scale-in animate-delay-400">
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-background relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-4 animate-pulse-light">
                  <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </div>
                <p className="text-lg font-medium">Watch how HelloPeople works</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center flex-col animate-pulse-light">
        <p className="text-sm text-muted-foreground mb-2">Scroll to explore</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
      </div>
    </section>
  );
};

export default Hero;
