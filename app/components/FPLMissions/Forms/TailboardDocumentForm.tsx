import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const tailboardDocumentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  technician: z.string().min(1, 'Technician name is required'),
  workDescription: z.string().min(1, 'Work description is required'),
  safetyMeasures: z.string().min(1, 'Safety measures are required'),
  equipmentUsed: z.string().min(1, 'Equipment used is required'),
});

type TailboardDocumentFormValues = z.infer<typeof tailboardDocumentSchema>;

interface TailboardDocumentFormProps {
  onSubmit: (data: TailboardDocumentFormValues) => void;
  initialData?: Partial<TailboardDocumentFormValues>;
}

export function TailboardDocumentForm({ onSubmit, initialData }: TailboardDocumentFormProps) {
  const form = useForm<TailboardDocumentFormValues>({
    resolver: zodResolver(tailboardDocumentSchema),
    defaultValues: initialData || {
      date: '',
      technician: '',
      workDescription: '',
      safetyMeasures: '',
      equipmentUsed: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }: { field: ControllerRenderProps<TailboardDocumentFormValues, 'date'> }) => (
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
          name="technician"
          render={({ field }: { field: ControllerRenderProps<TailboardDocumentFormValues, 'technician'> }) => (
            <FormItem>
              <FormLabel>Technician Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter technician name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workDescription"
          render={({ field }: { field: ControllerRenderProps<TailboardDocumentFormValues, 'workDescription'> }) => (
            <FormItem>
              <FormLabel>Work Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the work performed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="safetyMeasures"
          render={({ field }: { field: ControllerRenderProps<TailboardDocumentFormValues, 'safetyMeasures'> }) => (
            <FormItem>
              <FormLabel>Safety Measures</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="List safety measures taken" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipmentUsed"
          render={({ field }: { field: ControllerRenderProps<TailboardDocumentFormValues, 'equipmentUsed'> }) => (
            <FormItem>
              <FormLabel>Equipment Used</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="List equipment used" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Tailboard Document</Button>
      </form>
    </Form>
  );
}
