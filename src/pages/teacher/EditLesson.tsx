import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Loader2, Save, FileText, Eye, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditLesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { trackEvent } = useAnalytics();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);
  
  const fetchLesson = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setTitle(data.title || '');
      setContent(data.content || '');
      setIsPublished(data.is_published || false);

      // Track lesson edit view
      trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
        page: 'lesson_edit',
        lesson_id: id,
        lesson_published: data.is_published || false
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/teacher/lessons');
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Track lesson update
      trackEvent(ANALYTICS_EVENTS.TEACHER.LESSON_UPDATED, {
        lesson_id: id,
        content_length: content.length,
        is_published: isPublished
      });
      
      toast.success('Lesson saved successfully!');
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsPublished(true);
      
      // Track lesson publication
      trackEvent(ANALYTICS_EVENTS.TEACHER.LESSON_PUBLISHED, {
        lesson_id: id,
        title_length: title.length
      });
      
      toast.success('Lição publicada com sucesso!', {
        description: 'Lembre-se de atribuir esta lição aos alunos específicos na página de Tarefas.'
      });
      setShowPublishConfirm(false);
    } catch (error) {
      console.error('Error publishing lesson:', error);
      toast.error('Falha ao publicar lição', {
        description: 'Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.'
      });
    } finally {
      setPublishing(false);
    }
  };
  
  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsPublished(false);
      
      // Track lesson unpublication
      trackEvent(ANALYTICS_EVENTS.TEACHER.LESSON_UPDATED, {
        lesson_id: id,
        action: 'unpublish'
      });
      
      toast.success('Lesson unpublished successfully!');
      setShowUnpublishConfirm(false);
    } catch (error) {
      console.error('Error unpublishing lesson:', error);
      toast.error('Failed to unpublish lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setPublishing(false);
    }
  };
  
  const handlePreview = () => {
    // Track preview click
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: 'lesson_preview',
      lesson_id: id
    });
    
    navigate(`/teacher/lessons/preview/${id}`);
  };
  
  if (loading) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TeacherLayout>
    );
  }
  
  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-2 p-0 -ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para lições
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Editar Lição</h1>
            <p className="text-muted-foreground mt-1">
              Faça alterações no conteúdo da sua lição
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className={isMobile ? "hidden" : ""}>Visualizar</span>
            </Button>
            
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnpublishConfirm(true)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className={isMobile ? "hidden" : ""}>Publicada</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowPublishConfirm(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className={isMobile ? "hidden" : ""}>Publicar</span>
              </Button>
            )}
          </div>
        </div>
        
        <Card className="w-full border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Lição</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Insira o título da lição"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo da Lição</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Insira o conteúdo da lição em formato Markdown"
                  className="mt-1 font-mono h-64"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use Markdown para formatar o conteúdo da sua lição
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !title.trim()}
                  className="w-full md:w-auto gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar Lição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja publicar esta lição? Uma vez publicada, ela ficará visível para os alunos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish}
              disabled={publishing}
              className="gap-2"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publicar Lição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishConfirm} onOpenChange={setShowUnpublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Despublicar Lição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja despublicar esta lição? Ela não ficará mais visível para os alunos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnpublish}
              disabled={publishing}
              className="gap-2"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Despublicar Lição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TeacherLayout>
  );
};

export default EditLesson;
