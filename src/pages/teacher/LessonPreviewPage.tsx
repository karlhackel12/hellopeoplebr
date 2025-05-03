import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { LessonPreview } from '@/components/teacher/LessonPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const LessonPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lessons')
          .select('title, content')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setLesson(data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error('Error', {
          description: 'Failed to load lesson preview'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [id]);
  
  const handleBack = () => {
    navigate('/teacher/lessons');
  };
  
  return (
    <TeacherLayout>
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto p-4 md:p-8'}`}>
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Lições
          </Button>
          
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Visualização da Lição</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <p>Carregando visualização da lição...</p>
          </div>
        ) : lesson ? (
          <LessonPreview 
            content={lesson.content || ''} 
            title={lesson.title} 
            lessonId={id}
          />
        ) : (
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Lição não encontrada</h3>
            <p className="text-muted-foreground mb-4">A lição solicitada não pôde ser encontrada.</p>
            <Button onClick={handleBack}>Voltar para Lições</Button>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default LessonPreviewPage;
