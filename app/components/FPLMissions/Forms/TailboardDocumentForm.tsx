'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { Textarea } from "app/components/ui/textarea";
import { Checkbox } from "app/components/ui/checkbox";
import { toast } from 'react-hot-toast';
import { Table, TableBody, TableCell, TableRow } from "app/components/ui/table";
import { Progress } from "app/components/ui/progress";
import { Save, Send } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "app/components/ui/form";

const tailboardSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  pilotName: z.string().min(1, 'RPIC Name is required'),
  site: z.string().min(1, 'Site is required'),
  tailboardComplete: z.boolean(),
  tailboardReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  preFlightBriefingComplete: z.boolean(),
  preFlightBriefingNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  rulesRegulationsReviewComplete: z.boolean(),
  rulesRegulationsReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  flightPlanReviewComplete: z.boolean(),
  flightPlanReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  signatureRPIC: z.string().min(1, 'RPIC signature is required'),
  dateRPIC: z.string().min(1, 'RPIC date is required'),
  signatureFlightCrew1: z.string().optional(),
  dateFlightCrew1: z.string().optional(),
  signatureFlightCrew2: z.string().optional(),
  dateFlightCrew2: z.string().optional(),
  signatureFlightCrew3: z.string().optional(),
  dateFlightCrew3: z.string().optional(),
  fplMissionId: z.string().min(1, 'FPL Mission ID is required'),
});

type TailboardFormValues = z.infer<typeof tailboardSchema>;

interface TailboardDocumentFormProps {
  onSubmit: (data: TailboardFormValues, isDraft: boolean) => Promise<void>;
  fplMissionId?: string;
  initialValues?: Partial<TailboardFormValues>;
  userId: string;
}

const TAILBOARD_SECTIONS = {
  MISSION_DETAILS: 'Mission Details',
  TAILBOARD_REVIEW: 'Tailboard Meeting Review',
  PRE_FLIGHT_BRIEFING: 'Pre-Flight Briefing',
  RULES_REGULATIONS: 'Rules and Regulations Review',
  FLIGHT_PLAN: 'Flight Plan Review',
  SIGNATURES: 'Sign and Date',
};

type TailboardSection = keyof typeof TAILBOARD_SECTIONS;

export function TailboardDocumentForm({ onSubmit, fplMissionId, initialValues, userId }: TailboardDocumentFormProps) {
  const [currentSection, setCurrentSection] = useState<TailboardSection>('MISSION_DETAILS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const form = useForm<TailboardFormValues>({
    resolver: zodResolver(tailboardSchema),
    defaultValues: {
      fplMissionId: fplMissionId || '',
      tailboardComplete: false,
      preFlightBriefingComplete: false,
      rulesRegulationsReviewComplete: false,
      flightPlanReviewComplete: false,
      ...initialValues,
    },
  });

  const calculateProgress = useCallback(() => {
    const formValues = form.getValues();
    const totalFields = Object.keys(formValues).length;
    const filledFields = Object.keys(formValues).filter(key => {
      const value = formValues[key as keyof TailboardFormValues];
      return value !== undefined && value !== '' && value !== false;
    }).length;
    return (filledFields / totalFields) * 100;
  }, [form]);

  const handleSubmit = async (isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      await onSubmit(formData, isDraft);
      toast.success(isDraft ? 'Tailboard document saved as draft' : 'Tailboard document submitted for approval');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit tailboard document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionChange = (section: TailboardSection) => {
    setCurrentSection(section);
  };

  const renderFormFields = () => {
    switch (currentSection) {
      case 'MISSION_DETAILS':
        return (
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="fplMissionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FPL Mission ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter FPL Mission ID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pilotName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RPIC - Pilot Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter pilot name" />
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
                    <Input {...field} placeholder="Enter the Job Code and Site Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 'TAILBOARD_REVIEW':
        return (
          <>
            <FormField
              control={form.control}
              name="tailboardComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Tailboard Complete?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tailboardReviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tailboard Meeting Review Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes here"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'PRE_FLIGHT_BRIEFING':
        return (
          <>
            <FormField
              control={form.control}
              name="preFlightBriefingComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Pre-Flight Briefing Complete?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preFlightBriefingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pre-Flight Briefing Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes here"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'RULES_REGULATIONS':
        return (
          <>
            <FormField
              control={form.control}
              name="rulesRegulationsReviewComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Rules and Regulations Review Complete?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rulesRegulationsReviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rules and Regulations Review Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes here"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'FLIGHT_PLAN':
        return (
          <>
            <FormField
              control={form.control}
              name="flightPlanReviewComplete"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Flight Plan Review Complete?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flightPlanReviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Plan Review Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes here"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'SIGNATURES':
        return (
          <Table>
            <TableBody>
              {['RPIC', 'FLIGHT CREW 1', 'FLIGHT CREW 2', 'FLIGHT CREW 3'].map((crew, index) => (
                <TableRow key={crew}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={index === 0 ? 'signatureRPIC' : `signatureFlightCrew${index}` as keyof TailboardFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIGNATURE {crew}</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value as string || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={index === 0 ? 'dateRPIC' : `dateFlightCrew${index}` as keyof TailboardFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DATE</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value as string || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      default:
        return null;
    }
  };

  if (form.formState.isSubmitSuccessful) {
    const formData = form.getValues();
    return (
      <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-full flex flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Tailboard Document Summary</h2>
          <div className="flex-grow overflow-auto">
            {/* Add a summary display component here */}
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const formData = form.getValues();
    return (
      <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-full flex flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Tailboard Document Summary</h2>
          <div className="flex-grow overflow-auto">
            {/* Add a summary display component here */}
            <pre>{JSON.stringify(formData, null, 2)}</pre>
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
              <h2 className="text-xl font-bold mb-2">Tailboard Document</h2>
              <Progress value={calculateProgress()} className="w-full h-2" />
            </div>
            <div className="flex-grow flex overflow-hidden">
              <div className="w-1/4 bg-gray-100 p-2 overflow-y-auto">
                <nav className="space-y-1">
                  {(Object.keys(TAILBOARD_SECTIONS) as TailboardSection[]).map((section) => (
                    <button
                      key={section}
                      type="button"
                      className={`w-full text-left text-sm cursor-pointer p-2 rounded ${currentSection === section ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
                      onClick={() => handleSectionChange(section)}
                      aria-pressed={currentSection === section}
                    >
                      {TAILBOARD_SECTIONS[section]}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="w-3/4 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {renderFormFields()}
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

export type { TailboardFormValues as TailboardDocumentFormValues };
