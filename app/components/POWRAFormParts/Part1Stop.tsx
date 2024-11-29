'use client';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { POWRAFormData } from './POWRAFormData';

type Part1StopProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

type Part1Field = 'site' | 'date' | 'time' | 'pilotName' | 'location' | 'chiefPilot' | 'hse';

type FieldConfig = {
  key: Part1Field;
  label: string;
  type: string;
  valueFormatter?: (value: Date | string) => string;
  valueParser?: (value: string) => Date | string;
};

export default function Part1Stop({ formData, setFormData }: Part1StopProps) {
  const handleFieldChange = (field: Part1Field, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: fields.find(f => f.key === field)?.valueParser?.(value) ?? value,
    }));
  };

  const fields: FieldConfig[] = [
    { key: 'site', label: 'Site', type: 'text' },
    { 
      key: 'date', 
      label: 'Date', 
      type: 'date', 
      valueFormatter: (date: Date | string) => date instanceof Date ? date.toISOString().split('T')[0] : date,
      valueParser: (value: string) => new Date(value),
    },
    { key: 'time', label: 'Time', type: 'time' },
    { key: 'pilotName', label: 'Pilot Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'chiefPilot', label: 'Chief Pilot', type: 'text' },
    { key: 'hse', label: 'HSE', type: 'text' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-red-500 text-white p-2 rounded">
          Part 1 - STOP
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label, type, valueFormatter }) => {
          const fieldValue = formData[key];
          const displayValue = valueFormatter && (fieldValue instanceof Date || typeof fieldValue === 'string')
            ? valueFormatter(fieldValue)
            : (fieldValue as string) ?? '';

          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                value={displayValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange(key, e.target.value)
                }
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
