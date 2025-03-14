import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LessonCard from '@/components/teacher/LessonCard';
type Lesson = {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
};
const RecentLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchLessons();
  }, []);
  const fetchLessons = async () => {
    try {
      setLoading(true);
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/login');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('lessons').select('*').eq('created_by', user.user.id).order('created_at', {
        ascending: false
      }).limit(6);
      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to load lessons'
      });
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };
  const handleViewAllLessons = () => {
    navigate('/teacher/lessons');
  };
  return;
};
export default RecentLessons;