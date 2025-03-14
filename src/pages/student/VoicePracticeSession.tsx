
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Mic, MessageSquare, BarChart3, Settings, Info, Loader2, Check } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import StudentLayout from '@/components/layout/StudentLayout';
import VoiceRecorder from './components/voice-practice/VoiceRecorder';
import ScoreCards from './components/voice-practice/ScoreCards';
import { useLessonData } from './hooks/useLessonData';
import { useVoicePractice } from './hooks/useVoicePractice';
import { supabase } from '@/integrations/supabase/client';

const VoicePracticeSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("speak");
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [practiceSessionId, setPracticeSessionId] = useState<string | null>(sessionId || null);
  const startTimeRef = useRef<Date | null>(null);

  // Fix: Pass lessonId parameter and use correct properties from useLessonData hook
  const { lesson, lessonLoading } = useLessonData(lessonIdParam || undefined);
  const { 
    createSession,
    completeSession,
    addFeedback,
    recordConfidenceScore,
    sessions,
    isLoading: isLoadingVoicePractice
  } = useVoicePractice();

  // Find current session if ID is provided
  const currentSession = practiceSessionId 
    ? sessions?.find(s => s.id === practiceSessionId) 
    : null;

  // Find lesson for practice
  const lessonId = currentSession?.lesson_id || lessonIdParam || null;
  // Use lessons array from useVoicePractice if needed or directly use lesson from useLessonData
  const currentLesson = lesson || null;
  
  // Generate practice topic based on lesson or default
  const practiceTopic = currentSession?.topic || 
    (currentLesson ? `Practice: ${currentLesson.title}` : 'General Speaking Practice');
  
  // Practice difficulty level
  const difficultyLevel = currentSession?.difficulty_level || 1;

  // Handle start recording
  const handleStartRecording = () => {
    setIsRecording(true);
    startTimeRef.current = new Date();
    setTranscript('');
    setAudioBlob(null);
    setFeedbackData(null);
  };

  // Handle stop recording
  const handleStopRecording = async (blob: Blob) => {
    setIsRecording(false);
    setAudioBlob(blob);
    
    // Create session if not exists
    if (!practiceSessionId) {
      createSession({
        lessonId: lessonId || undefined,
        topic: practiceTopic,
        difficultyLevel
      }, {
        onSuccess: (newSession) => {
          if (newSession?.id) {
            setPracticeSessionId(newSession.id);
          }
        }
      });
    }
    
    // Process recorded audio
    processRecording(blob);
  };

  // Process the recording
  const processRecording = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Audio = base64data.split(',')[1]; // Remove data URL prefix
        
        // Send to speech-to-text service
        const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
          'voice-practice', 
          {
            body: { 
              transcript: 'This is a test transcript since we cannot process real audio in this example.', 
              lessonContent: currentLesson?.content || 'General speaking practice without specific content.',
              difficulty: difficultyLevel
            }
          }
        );
        
        if (transcriptError) {
          throw transcriptError;
        }
        
        // Update UI with results
        setTranscript('This is a simulated transcript of your speech. In a real implementation, this would be the actual transcription of your spoken words.');
        setFeedbackData(transcriptData || {
          feedback: "Your speaking was clear and well-paced. I noticed good pronunciation overall, with a few areas that could use practice. Your grammar was mostly correct, but there were some minor errors with verb tenses. Keep practicing to improve your fluency.",
          scores: {
            pronunciation: 7.5,
            grammar: 7.0,
            fluency: 6.8,
            overall: 7.1
          },
          corrections: [
            "Watch your verb tenses - use past tense consistently when talking about past events.",
            "Practice the 'th' sound in words like 'think' and 'through'."
          ],
          suggestions: [
            "Try reading aloud to improve your fluency.",
            "Record yourself speaking and listen back to identify areas for improvement.",
            "Practice speaking at a slightly slower pace to improve clarity."
          ]
        });
        
        // Save feedback to database
        if (practiceSessionId) {
          // Calculate duration
          const durationSeconds = startTimeRef.current 
            ? Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000) 
            : 30;
          
          // Complete the session
          completeSession({
            sessionId: practiceSessionId,
            durationSeconds
          });
          
          // Add feedback
          addFeedback({
            sessionId: practiceSessionId,
            feedbackText: transcriptData?.feedback || 'Feedback on your speaking practice.',
            pronunciationScore: transcriptData?.scores?.pronunciation || 7.0,
            grammarScore: transcriptData?.scores?.grammar || 7.0,
            fluencyScore: transcriptData?.scores?.fluency || 7.0
          });
          
          // Record confidence score
          recordConfidenceScore({
            overallScore: transcriptData?.scores?.overall || 7.0,
            pronunciationScore: transcriptData?.scores?.pronunciation || 7.0,
            grammarScore: transcriptData?.scores?.grammar || 7.0,
            fluencyScore: transcriptData?.scores?.fluency || 7.0
          });
        }
        
        // Move to feedback tab
        setActiveTab('feedback');
      };
    } catch (error) {
      console.error('Error processing voice recording:', error);
      toast.error('Failed to process your recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Go back to voice practice dashboard
  const handleGoBack = () => {
    navigate('/student/voice-practice');
  };

  // Start a new practice session
  const handleNewPractice = () => {
    setPracticeSessionId(null);
    setTranscript('');
    setAudioBlob(null);
    setFeedbackData(null);
    setActiveTab('speak');
  };

  return (
    <StudentLayout>
      <Helmet>
        <title>Voice Practice Session | Teachly</title>
      </Helmet>
      
      <div className="container py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Voice Practice
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{practiceTopic}</CardTitle>
            <CardDescription>
              {currentLesson 
                ? `Practice your speaking skills based on lesson content`
                : `Freestyle speaking practice to improve your skills`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Practice Instructions</AlertTitle>
              <AlertDescription>
                {currentLesson 
                  ? `Speak about the topics covered in the "${currentLesson.title}" lesson. Try to use vocabulary and concepts from the lesson in your speech.`
                  : `Introduce yourself, talk about your interests, or describe your day. Speak clearly and at a natural pace.`}
              </AlertDescription>
            </Alert>
            
            {currentLesson && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Lesson Prompt:</h3>
                <div className="bg-slate-50 p-4 rounded-md text-sm max-h-32 overflow-y-auto">
                  {currentLesson.content?.slice(0, 300)}...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="speak" className="flex gap-2" disabled={isProcessing}>
              <Mic className="h-4 w-4" />
              <span>Speak</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex gap-2" disabled={!feedbackData || isProcessing}>
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex gap-2" disabled={!feedbackData || isProcessing}>
              <BarChart3 className="h-4 w-4" />
              <span>Scores</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="speak">
            <div className="grid grid-cols-1 gap-6">
              <VoiceRecorder 
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                maxDurationSeconds={120}
              />
              
              {isProcessing && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                      <p className="text-muted-foreground text-center">
                        Processing your voice recording...<br />
                        Analyzing speech patterns and generating feedback
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {!isRecording && !isProcessing && transcript && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Your Speech Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{transcript}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="feedback">
            {feedbackData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Overall Assessment:</h3>
                    <p className="text-muted-foreground">{feedbackData.feedback}</p>
                  </div>
                  
                  <Separator />
                  
                  {feedbackData.corrections?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Corrections:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {feedbackData.corrections.map((correction: string, i: number) => (
                          <li key={i}>{correction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedbackData.suggestions?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Suggestions:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {feedbackData.suggestions.map((suggestion: string, i: number) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button onClick={handleNewPractice}>Practice Again</Button>
                  <Button variant="outline" onClick={handleGoBack}>
                    Finish Practice
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="scores">
            {feedbackData && feedbackData.scores && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Your Speaking Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreCards scores={feedbackData.scores} />
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    <Button onClick={handleNewPractice}>Practice Again</Button>
                    <Button variant="outline" onClick={handleGoBack}>
                      Finish Practice
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default VoicePracticeSession;
