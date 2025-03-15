
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Sparkles, FileText, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LessonPreview from '@/components/teacher/lesson/LessonPreview';
import QuizPreview from '@/components/teacher/quiz/QuizPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import GardenLoader from '@/components/ui/garden-loader';

interface LessonGeneratorProps {
  onSave: (lessonData: {
    title: string;
    content: string;
    structured_content?: any;
    quiz_questions?: any[];
    publish?: boolean;
  }) => void;
  isSaving: boolean;
}

type GenerationPhase = 
  | 'idle' 
  | 'loading' 
  | 'analyzing'
  | 'generating'
  | 'retrying'
  | 'complete' 
  | 'error';

interface FormState {
  title: string;
  level: string;
  instructions: string;
}

const LessonGenerator: React.FC<LessonGeneratorProps> = ({ onSave, isSaving }) => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    level: 'beginner',
    instructions: '',
  });
  
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [retryCount, setRetryCount] = useState(0);
  const [generationTimer, setGenerationTimer] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  
  // Save form state to local storage (as draft)
  useEffect(() => {
    if (formState.title.trim()) {
      const draftData = JSON.stringify(formState);
      localStorage.setItem('lesson_generator_draft', draftData);
      setDraftSaved(true);
    }
  }, [formState]);
  
  // Load draft from local storage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('lesson_generator_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormState(parsedDraft);
        setDraftSaved(true);
      } catch (e) {
        console.error('Error parsing saved draft:', e);
      }
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setDraftSaved(false);
  };
  
  const handleLevelChange = (value: string) => {
    setFormState(prev => ({ ...prev, level: value }));
    setDraftSaved(false);
  };
  
  const clearDraft = () => {
    localStorage.removeItem('lesson_generator_draft');
    setFormState({
      title: '',
      level: 'beginner',
      instructions: '',
    });
    setDraftSaved(false);
  };
  
  const resetGeneration = () => {
    setGeneratedLesson(null);
    setGeneratedQuiz(null);
    setGenerationPhase('idle');
    setError(null);
    setErrorDetails(null);
    setRetryCount(0);
    if (generationTimer) {
      clearTimeout(generationTimer);
      setGenerationTimer(null);
    }
  };
  
  useEffect(() => {
    return () => {
      if (generationTimer) {
        clearTimeout(generationTimer);
      }
    };
  }, [generationTimer]);
  
  const generateLesson = useCallback(async (isRetry = false) => {
    if (!formState.title.trim()) {
      toast.error('Por favor, digite um título para a lição');
      return;
    }
    
    try {
      if (!isRetry) {
        resetGeneration();
      }
      
      if (isRetry) {
        setGenerationPhase('retrying');
        setRetryCount(prev => prev + 1);
        toast.info('Tentando gerar a lição novamente...', {
          description: `Tentativa ${retryCount + 1}`
        });
      } else {
        setGenerationPhase('loading');
      }
      
      const loadingStateTimer = setTimeout(() => {
        setGenerationPhase('analyzing');
        
        const generatingTimer = setTimeout(() => {
          setGenerationPhase('generating');
        }, 3000);
        
        setGenerationTimer(generatingTimer as unknown as number);
      }, 2000);
      
      setGenerationTimer(loadingStateTimer as unknown as number);
      
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          title: formState.title,
          level: formState.level,
          instructions: formState.instructions
        }
      });
      
      if (generationTimer) {
        clearTimeout(generationTimer);
        setGenerationTimer(null);
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Falha ao gerar conteúdo da lição');
      }
      
      if (response.data.status === 'failed') {
        throw new Error(response.data.error || 'Geração de conteúdo falhou');
      }
      
      if (response.data.status === 'succeeded') {
        setGeneratedLesson(response.data.lesson);
        setGeneratedQuiz(response.data.quiz);
        setGenerationPhase('complete');
        toast.success('Lição gerada com sucesso!');
      } else {
        throw new Error('Geração de conteúdo falhou com um erro desconhecido');
      }
    } catch (error: any) {
      console.error('Error generating lesson:', error);
      
      if (generationTimer) {
        clearTimeout(generationTimer);
        setGenerationTimer(null);
      }
      
      setGenerationPhase('error');
      setError(error.message || 'Ocorreu um erro inesperado');
      
      let details = null;
      try {
        if (typeof error.message === 'string' && error.message.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const jsonData = JSON.parse(error.message.substring(jsonStart));
          details = jsonData.details || jsonData.error || null;
        }
      } catch (e) {
        details = null;
      }
      
      setErrorDetails(details);
      
      const isTimeout = error.message && (
        error.message.includes('timed out') || 
        error.message.includes('timeout') || 
        error.message.includes('504')
      );
      
      if (isTimeout) {
        toast.error('Tempo limite excedido', {
          description: 'A geração da lição está demorando muito. Tente usar um título mais curto ou menos instruções específicas.'
        });
      } else {
        toast.error('Falha ao gerar lição', {
          description: 'Por favor, tente novamente ou modifique os parâmetros de entrada'
        });
      }
    }
  }, [formState, retryCount, generationTimer]);
  
  const [publishOnSave, setPublishOnSave] = useState(false);
  
  const handleSave = () => {
    if (!generatedLesson) {
      toast.error('Não há conteúdo de lição para salvar');
      return;
    }
    
    const formattedContent = `
# ${formState.title}

## Description
${generatedLesson.description}

## Key Phrases
${generatedLesson.keyPhrases.map((item: any) => 
  `- **${item.phrase}** - ${item.translation} (${item.usage})`
).join('\n')}

## Vocabulary
${generatedLesson.vocabulary.map((item: any) => 
  `- **${item.word}** (${item.partOfSpeech}) - ${item.translation}`
).join('\n')}
`;
    
    onSave({
      title: formState.title,
      content: formattedContent,
      structured_content: generatedLesson,
      quiz_questions: generatedQuiz?.questions,
      publish: publishOnSave
    });
    
    // Clear draft after successful save
    clearDraft();
  };
  
  const getLoadingMessage = () => {
    switch (generationPhase) {
      case 'loading':
        return 'Preparando para gerar lição...';
      case 'analyzing':
        return 'Analisando requisitos de conteúdo...';
      case 'generating':
        return 'Criando sua lição e quiz...';
      case 'retrying':
        return `Tentando novamente (tentativa ${retryCount})...`;
      default:
        return 'Gerando sua lição...';
    }
  };
  
  const renderForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título da Lição</Label>
        <Input 
          id="title"
          name="title"
          placeholder="ex. Present Simple Tense"
          value={formState.title}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="level">Nível de Dificuldade</Label>
        <Select
          value={formState.level}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Iniciante</SelectItem>
            <SelectItem value="intermediate">Intermediário</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="instructions">Instruções Especiais (Opcional)</Label>
        <Textarea
          id="instructions"
          name="instructions"
          placeholder="ex. Foco em vocabulário de negócios, inclua exemplos de áudio, etc."
          value={formState.instructions}
          onChange={handleChange}
          className="mt-1"
          rows={3}
        />
      </div>
      
      <div className="pt-4">
        {draftSaved && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Save className="h-3 w-3" /> Rascunho salvo
          </p>
        )}
        
        <Button 
          onClick={() => generateLesson(false)} 
          disabled={generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying' || !formState.title.trim()}
          className="w-full md:w-auto gap-2"
        >
          {generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {getLoadingMessage()}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Conteúdo da Lição
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  const renderPreview = () => {
    if (generationPhase === 'loading' || generationPhase === 'analyzing' || generationPhase === 'generating' || generationPhase === 'retrying') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4">
            <GardenLoader 
              className="h-12 w-12 text-primary" 
              duration={generationPhase === 'loading' ? 'quick' : generationPhase === 'analyzing' ? 'standard' : 'extended'} 
            />
          </div>
          <h2 className="text-xl font-medium mb-2">{getLoadingMessage()}</h2>
          <p className="text-muted-foreground max-w-md">
            {generationPhase === 'retrying' 
              ? 'Estamos tentando novamente. Isso pode levar um minuto ou dois...'
              : 'Isso pode levar um minuto ou dois. Estamos criando uma lição completa com exercícios e quiz...'}
          </p>
          {generationPhase === 'generating' && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground">
                Dica: Para uma geração mais rápida, tente usar títulos mais simples e menos instruções específicas.
              </p>
            </div>
          )}
        </div>
      );
    }
    
    if (generationPhase === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-medium mb-2">Falha na Geração</h2>
          <p className="text-muted-foreground max-w-md mb-4">
            {error || "Algo deu errado ao gerar sua lição."}
          </p>
          {errorDetails && (
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {errorDetails}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetGeneration}>Começar Novamente</Button>
            <Button 
              onClick={() => generateLesson(true)} 
              className="gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
          {retryCount >= 3 && (
            <p className="text-sm text-muted-foreground mt-4">
              Número máximo de tentativas alcançado. Tente modificar o título para algo mais curto ou simplificar as instruções.
            </p>
          )}
        </div>
      );
    }
    
    if (generationPhase === 'complete' && generatedLesson) {
      return (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">Conteúdo da Lição</TabsTrigger>
              <TabsTrigger value="quiz">Quiz ({generatedQuiz?.questions?.length || 0} Questões)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <LessonPreview lesson={generatedLesson} title={formState.title} />
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-4">
              {generatedQuiz?.questions?.length > 0 ? (
                <QuizPreview 
                  questions={generatedQuiz.questions.map((q: any, index: number) => ({
                    id: `preview-${index}`,
                    question_text: q.question_text,
                    question_type: 'multiple_choice',
                    options: q.options.map((opt: any, optIndex: number) => ({
                      id: `preview-opt-${index}-${optIndex}`,
                      option_text: opt.option_text,
                      is_correct: opt.is_correct
                    }))
                  }))}
                  title={`${formState.title} Quiz`}
                  passPercent={70}
                  isPreview={true}
                />
              ) : (
                <div className="text-center py-12 bg-muted rounded-md">
                  <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground opacity-60" />
                  <p className="text-muted-foreground">Nenhuma questão de quiz gerada</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 pt-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="publish-checkbox"
                checked={publishOnSave}
                onChange={(e) => setPublishOnSave(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="publish-checkbox" className="text-sm font-medium">
                Publicar imediatamente
              </label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={resetGeneration}>
                Regenerar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Salvando...' : 'Salvar Lição'}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">Gerar uma Lição</h2>
        <p className="text-muted-foreground max-w-md">
          Preencha o formulário à esquerda e clique em 'Gerar Conteúdo da Lição' para criar uma lição completa com quiz.
        </p>
      </div>
    );
  };
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
      <div className={isMobile ? "col-span-1" : "md:col-span-1"}>
        <Card className="h-full">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {renderForm()}
          </CardContent>
        </Card>
      </div>
      
      <div className={isMobile ? "col-span-1" : "md:col-span-2"}>
        <Card className="h-full">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {renderPreview()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonGenerator;
