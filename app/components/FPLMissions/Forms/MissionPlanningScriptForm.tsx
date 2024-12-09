import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const missionPlanningScriptSchema = z.object({
  objective: z.string().min(1, 'Objective is required'),
  equipmentNeeded: z.string().min(1, 'Equipment needed is required'),
  safetyProcedures: z.string().min(1, 'Safety procedures are required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
});

type MissionPlanningScriptFormValues = z.infer<typeof missionPlanningScriptSchema>;

interface MissionPlanningScriptFormProps {
  onSubmit: (data: MissionPlanningScriptFormValues) => void;
  initialData?: Partial<MissionPlanningScriptFormValues>;
}

export function MissionPlanningScriptForm({ onSubmit, initialData }: MissionPlanningScriptFormProps) {
  const form = useForm<MissionPlanningScriptFormValues>({
    resolver: zodResolver(missionPlanningScriptSchema),
    defaultValues: initialData || {
      objective: '',
      equipmentNeeded: '',
      safetyProcedures: '',
      estimatedDuration: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="objective"
          render={({ field }: { field: ControllerRenderProps<MissionPlanningScriptFormValues, 'objective'> }) => (
            <FormItem>
              <FormLabel>Mission Objective</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the mission objective" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipmentNeeded"
          render={({ field }: { field: ControllerRenderProps<MissionPlanningScriptFormValues, 'equipmentNeeded'> }) => (
            <FormItem>
              <FormLabel>Equipment Needed</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="List required equipment" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="safetyProcedures"
          render={({ field }: { field: ControllerRenderProps<MissionPlanningScriptFormValues, 'safetyProcedures'> }) => (
            <FormItem>
              <FormLabel>Safety Procedures</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Outline safety procedures" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }: { field: ControllerRenderProps<MissionPlanningScriptFormValues, 'estimatedDuration'> }) => (
            <FormItem>
              <FormLabel>Estimated Duration</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 2 days, 1 week" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Mission Planning Script</Button>
      </form>
    </Form>
  );
}
