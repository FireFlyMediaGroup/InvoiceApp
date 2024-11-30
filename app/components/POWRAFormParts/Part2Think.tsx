'use client';

import React, { useCallback, useEffect } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { POWRAFormData } from './POWRAFormData';

type Part2ThinkProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

const checklistItems = [
  'Are you at the authorised Inspection / WTG Location?',
  'Do you have the correct documentation?(RAMS, Pt. 107, First Aid etc)',
  'Do you have the correct PPE / RPE and Safety Equipment? (Including Truck)',
  'Are you competent and authorised to complete the task?',
  'Is Inspection Equipment, tools, suitable and in date for Operation (MX Interval)',
  'Is access / egress safe and in date for inspection? (Ladders, WTG Stairs, scaffolds etc)',
  'Is environmental condition safe for operations? (weather, road cond.)',
] as const;

type ChecklistItem = typeof checklistItems[number];

const generateId = (text: string) => text.replace(/\s+/g, '-').toLowerCase();

const Part2Think: React.FC<Part2ThinkProps> = React.memo(({ formData, setFormData }) => {
  useEffect(() => {
    console.log('Part2Think formData changed:', formData);
    console.log('Current beforeStartChecklist:', formData.beforeStartChecklist);
  }, [formData]);

  const handleChecklistChange = useCallback((item: ChecklistItem, checked: boolean) => {
    console.log('Checkbox changed:', item, checked);
    setFormData((prev) => {
      const newChecklist = checked
        ? [...prev.beforeStartChecklist, item]
        : prev.beforeStartChecklist.filter((i) => i !== item);
      
      console.log('New checklist:', newChecklist);
      
      const newFormData = {
        ...prev,
        beforeStartChecklist: newChecklist,
      };
      console.log('New formData:', newFormData);
      return newFormData;
    });
  }, [setFormData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-orange-500 text-white p-2 rounded">
          Part 2 - THINK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklistItems.map((item) => {
          const id = generateId(item);
          const isChecked = formData.beforeStartChecklist.includes(item);
          console.log(`Rendering checkbox for ${item}, checked: ${isChecked}`);
          return (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={isChecked}
                onCheckedChange={(checked) => handleChecklistChange(item, checked === true)}
              />
              <Label htmlFor={id} className="text-sm cursor-pointer">
                {item}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

Part2Think.displayName = 'Part2Think';

export default Part2Think;
