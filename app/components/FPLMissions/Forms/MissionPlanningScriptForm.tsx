import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const missionPlanningScriptSchema = z.object({
  content: z.string().min(1, 'Mission planning script content is required'),
  site: z.string().min(1, 'Site is required'),
});

export type MissionPlanningScriptFormValues = z.infer<typeof missionPlanningScriptSchema>;

interface MissionPlanningScriptFormProps {
  fplMissionId: string;
  onSuccess: () => void;
  initialData?: Partial<MissionPlanningScriptFormValues>;
}

export function MissionPlanningScriptForm({ fplMissionId, onSuccess, initialData }: MissionPlanningScriptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MissionPlanningScriptFormValues>({
    resolver: zodResolver(missionPlanningScriptSchema),
    defaultValues: initialData || {
      content: '',
      site: '',
    },
  });

  const onSubmit = async (data: MissionPlanningScriptFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mission-planning-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fplMissionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create mission planning script');
      }

      toast.success('Mission planning script created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating mission planning script:', error);
      toast.error('Failed to create mission planning script. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <Label htmlFor="site">Site</Label>
        <Input
          id="site"
          {...register('site')}
          placeholder="Enter site name"
        />
        {errors.site && (
          <p className="text-red-500 text-sm mt-1">{errors.site.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="content">Mission Planning Script Content</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="Enter mission planning script content"
          rows={10}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Mission Planning Script'}
      </Button>
    </form>
  );
}
