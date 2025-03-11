
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { LessonFormValues } from './lesson-editor/useLessonForm';

interface AILessonGeneratorProps {
    onSubmit: (data: LessonFormValues) => void;
    isLoading: boolean;
}

// Local form schema just for the generator, with additional fields
const generatorFormSchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters.",
    }),
    content: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    topic: z.string().optional(),
    keywords: z.string().optional(),
    instructions: z.string().optional(),
});

type GeneratorFormValues = z.infer<typeof generatorFormSchema>;

const AILessonGenerator: React.FC<AILessonGeneratorProps> = ({ onSubmit, isLoading }) => {
    const navigate = useNavigate();
    const form = useForm<GeneratorFormValues>({
        resolver: zodResolver(generatorFormSchema),
        defaultValues: {
            title: "",
            content: "",
            level: "beginner",
            topic: "",
            keywords: "",
            instructions: "",
        },
    });

    const handleSubmit = (values: GeneratorFormValues) => {
        // Convert to LessonFormValues for the parent component
        const lessonFormValues: LessonFormValues = {
            title: values.title,
            content: values.content || '',
            estimated_minutes: 15, // Default value
            is_published: false,
            contentSource: 'ai_generated',
            // Store additional generator values in metadata
            generationMetadata: {
                level: values.level,
                topic: values.topic,
                keywords: values.keywords,
                instructions: values.instructions,
            }
        };
        
        onSubmit(lessonFormValues);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">AI Lesson Generator</CardTitle>
                <CardDescription>Generate lesson content using AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lesson Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief lesson description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select lesson level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Topic (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lesson Topic" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keywords (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Keywords for the lesson" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button disabled={isLoading} type="submit">
                            {isLoading ? (
                                <>
                                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Lesson <Brain className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default AILessonGenerator;
