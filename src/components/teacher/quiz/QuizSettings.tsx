
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

interface QuizSettingsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  passPercent: number;
  setPassPercent: (percent: number) => void;
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
  saving: boolean;
  onSave: () => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  passPercent,
  setPassPercent,
  isPublished,
  setIsPublished,
  saving,
  onSave,
}) => {
  return (
    <div className="bg-muted p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4">Quiz Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="quiz-title">Quiz Title</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="pass-percent">Passing Percentage</Label>
          <Input
            id="pass-percent"
            type="number"
            min="1"
            max="100"
            value={passPercent}
            onChange={(e) => setPassPercent(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
      <div className="mb-6">
        <Label htmlFor="quiz-description">Description (Optional)</Label>
        <Textarea
          id="quiz-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter quiz description"
          className="mt-1"
        />
      </div>
      <div className="flex items-center space-x-2 mb-6">
        <Switch
          id="published"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="published">Publish Quiz</Label>
      </div>
      <Button onClick={onSave} disabled={saving || !title} className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Quiz Settings'}
      </Button>
    </div>
  );
};

export default QuizSettings;
