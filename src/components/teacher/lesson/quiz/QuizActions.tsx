
import React, { useState } from 'react';
import { Loader2, Save, Trash, Pencil, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QuizActionsProps {
  quizId: string | null;
  quizTitle: string;
  isEditMode: boolean;
  isPublished: boolean;
  onPublishChange: (publish: boolean) => Promise<void>;
  onEditQuiz: () => void;
  onPreviewQuiz: () => Promise<void>;
  onTitleUpdate: (newTitle: string) => Promise<void>;
  onDeleteQuiz: () => Promise<void>;
  onAddQuestion: () => Promise<void>;
}

const QuizActions: React.FC<QuizActionsProps> = ({ 
  quizId,
  quizTitle,
  isEditMode,
  isPublished,
  onPublishChange,
  onEditQuiz,
  onPreviewQuiz,
  onTitleUpdate,
  onDeleteQuiz,
  onAddQuestion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(quizTitle);
  
  const handleSaveTitle = async () => {
    await onTitleUpdate(editedTitle);
    setIsEditing(false);
  };
  
  return (
    <div className="border-b pb-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Quiz title"
                className="max-w-md"
              />
              <Button size="sm" onClick={handleSaveTitle}>Save</Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(quizTitle);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{quizTitle || "Quiz Title"}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="ml-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {isEditMode ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onPreviewQuiz}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onEditQuiz}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this quiz and all its questions. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteQuiz}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isPublished}
            onCheckedChange={onPublishChange}
            id="published-status"
          />
          <label
            htmlFor="published-status"
            className="text-sm font-medium cursor-pointer"
          >
            {isPublished ? 'Published' : 'Draft'}
          </label>
        </div>
        
        {isEditMode && (
          <Button size="sm" onClick={onAddQuestion}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizActions;
