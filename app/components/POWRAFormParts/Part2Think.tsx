'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { POWRAFormData } from './POWRAFormData';

type Part2ThinkProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

export default function Part2Think({ formData, setFormData }: Part2ThinkProps) {
  const checklistItems = [
    'Are you at the authorised Inspection / WTG Location?',
    'Do you have the correct documentation?(RAMS, Pt. 107, First Aid etc)',
    'Do you have the correct PPE / RPE and Safety Equipment? (Including Truck)',
    'Are you competent and authorised to complete the task?',
    'Is Inspection Equipment, tools, suitable and in date for Operation (MX Interval)',
    'Is access / egress safe and in date for inspection? (Ladders, WTG Stairs, scaffolds etc)',
    'Is environmental condition safe for operations? (weather, road cond.)',
  ];

  const handleChecklistChange = (item: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      beforeStartChecklist: checked
        ? [...prev.beforeStartChecklist, item]
        : prev.beforeStartChecklist.filter((i) => i !== item),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-orange-500 text-white p-2 rounded">
          Part 2 - THINK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklistItems.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={item}
              checked={formData.beforeStartChecklist.includes(item)}
              onCheckedChange={(checked) =>
                handleChecklistChange(item, checked === true)
              }
            />
            <Label htmlFor={item} className="text-sm">
              {item}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
