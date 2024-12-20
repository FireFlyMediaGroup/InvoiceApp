'use client';

import { useState, type KeyboardEvent } from 'react';
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { Textarea } from "app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "app/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Save, Send } from 'lucide-react';
import { RISK_MATRIX_QUESTIONS } from "lib/risk-matrix-config";
import type { 
  RiskSection, 
  RiskScore,
  RiskAnswer,
} from "types/risk-matrix";
import { RISK_SECTIONS } from "types/risk-matrix";
import { Progress } from "app/components/ui/progress";
import { RiskMatrixDisplay } from "app/components/risk-matrix/RiskMatrixDisplay";
import { analyzeRiskMatrix, generateCompleteRiskMatrix } from "lib/risk-matrix";

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  site: z.string().min(1, 'Site is required'),
  description: z.string().min(1, 'Description is required'),
  assessmentDate: z.string().min(1, 'Assessment date is required'),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedScore: z.union([
      z.literal(1),
      z.literal(3),
      z.literal(5),
      z.literal(30)
    ]) as z.ZodType<RiskScore>
  }))
});

type FormValues = z.infer<typeof formSchema>;

interface RiskMatrixFormProps {
  initialData?: FormValues;
  onSubmit: (data: FormValues & {
    analysis: ReturnType<typeof analyzeRiskMatrix>;
    completeMatrix: ReturnType<typeof generateCompleteRiskMatrix>;
  }, isDraft: boolean) => Promise<void>;
  userId: string;
}

export function RiskMatrixForm({ initialData, onSubmit, userId }: RiskMatrixFormProps) {
  const [currentSection, setCurrentSection] = useState<RiskSection>('MISSION_FACTORS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      site: '',
      description: '',
      assessmentDate: new Date().toISOString().split('T')[0],
      answers: []
    }
  });

  const calculateProgress = () => {
    const totalQuestions = RISK_MATRIX_QUESTIONS.length;
    const answeredQuestions = form.getValues('answers').length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const sections = Object.keys(RISK_SECTIONS) as RiskSection[];

  const handleSubmit = async (isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      const analysis = analyzeRiskMatrix(formData.answers);
      const completeMatrix = generateCompleteRiskMatrix({
        title: formData.title,
        site: formData.site,
        description: formData.description,
        assessmentDate: formData.assessmentDate,
        createdBy: userId,
        status: isDraft ? 'DRAFT' : 'PENDING'
      }, formData.answers);

      await onSubmit({
        ...formData,
        analysis,
        completeMatrix
      }, isDraft);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionChange = (section: RiskSection) => {
    setCurrentSection(section);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, section: RiskSection) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSectionChange(section);
    }
  };

  if (form.formState.isSubmitSuccessful) {
    const formData = form.getValues();
    const completeMatrix = generateCompleteRiskMatrix({
      title: formData.title,
      site: formData.site,
      description: formData.description,
      assessmentDate: formData.assessmentDate,
      createdBy: userId,
      status: 'DRAFT'
    }, formData.answers);

    return <RiskMatrixDisplay data={completeMatrix} />;
  }

  if (showSummary) {
    const formData = form.getValues();
    const completeMatrix = generateCompleteRiskMatrix({
      title: formData.title,
      site: formData.site,
      description: formData.description,
      assessmentDate: formData.assessmentDate,
      createdBy: userId,
      status: 'DRAFT'
    }, formData.answers);

    return (
      <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-full flex flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Risk Assessment Summary</h2>
          <div className="flex-grow overflow-auto">
            <RiskMatrixDisplay data={completeMatrix} />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              Back to Form
            </Button>
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => setShowSummary(true))} className="w-full h-full">
          <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex flex-col">
            <div className="p-3 bg-gray-50">
              <h2 className="text-xl font-bold mb-2">Risk Matrix Questionnaire</h2>
              <Progress value={calculateProgress()} className="w-full h-2" />
            </div>
            <div className="flex-grow flex overflow-hidden">
              <div className="w-1/4 bg-gray-100 p-2 overflow-y-auto">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section}
                      type="button"
                      className={`w-full text-left text-sm cursor-pointer p-2 rounded ${currentSection === section ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
                      onClick={() => handleSectionChange(section)}
                      onKeyDown={(e) => handleKeyDown(e, section)}
                      aria-pressed={currentSection === section}
                    >
                      {RISK_SECTIONS[section]}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="w-3/4 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {currentSection === 'MISSION_FACTORS' && (
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Risk Assessment Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="site"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site</FormLabel>
                            <FormControl>
                              <Input placeholder="Site Name/Location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide a detailed description of the assessment scope"
                                className="min-h-[60px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assessmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {RISK_MATRIX_QUESTIONS.filter(q => q.section === currentSection).map((question) => (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name="answers"
                      render={({ field }) => {
                        const answer = field.value?.find((a: RiskAnswer) => a.questionId === question.id);
                        return (
                          <FormItem>
                            <FormLabel>{question.question}</FormLabel>
                            <Select
                              value={answer?.selectedScore?.toString()}
                              onValueChange={(value: string) => {
                                const newAnswers = field.value.filter((a: RiskAnswer) => a.questionId !== question.id);
                                newAnswers.push({
                                  questionId: question.id,
                                  selectedScore: Number.parseInt(value) as RiskScore
                                });
                                field.onChange(newAnswers);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {question.options.map((option) => (
                                  <SelectItem 
                                    key={`${question.id}-${option.score}`} 
                                    value={option.score.toString()}
                                  >
                                    {option.label} ({option.score} points)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 flex justify-end">
              <Button type="submit">Review Submission</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
