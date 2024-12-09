import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const riskMatrixSchema = z.object({
  hazards: z.string().min(1, 'Hazards are required'),
  consequences: z.string().min(1, 'Consequences are required'),
  mitigationMeasures: z.string().min(1, 'Mitigation measures are required'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type RiskMatrixFormValues = z.infer<typeof riskMatrixSchema>;

interface RiskMatrixFormProps {
  onSubmit: (data: RiskMatrixFormValues) => void;
  initialData?: Partial<RiskMatrixFormValues>;
}

export function RiskMatrixForm({ onSubmit, initialData }: RiskMatrixFormProps) {
  const form = useForm<RiskMatrixFormValues>({
    resolver: zodResolver(riskMatrixSchema),
    defaultValues: initialData || {
      hazards: '',
      consequences: '',
      mitigationMeasures: '',
      riskLevel: 'LOW',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="hazards"
          render={({ field }: { field: ControllerRenderProps<RiskMatrixFormValues, 'hazards'> }) => (
            <FormItem>
              <FormLabel>Hazards</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="List potential hazards" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consequences"
          render={({ field }: { field: ControllerRenderProps<RiskMatrixFormValues, 'consequences'> }) => (
            <FormItem>
              <FormLabel>Consequences</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe potential consequences" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mitigationMeasures"
          render={({ field }: { field: ControllerRenderProps<RiskMatrixFormValues, 'mitigationMeasures'> }) => (
            <FormItem>
              <FormLabel>Mitigation Measures</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe mitigation measures" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="riskLevel"
          render={({ field }: { field: ControllerRenderProps<RiskMatrixFormValues, 'riskLevel'> }) => (
            <FormItem>
              <FormLabel>Risk Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Risk Matrix</Button>
      </form>
    </Form>
  );
}
