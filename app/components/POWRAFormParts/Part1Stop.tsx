"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { POWRAFormData } from "./POWRAFormData";

type Part1StopProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

export default function Part1Stop({ formData, setFormData }: Part1StopProps) {
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      headerFields: { ...prev.headerFields, [field]: value },
    }));
  };

  const fields = ['Site', 'Date', 'Time', 'Pilot Name', 'Location', 'Chief Pilot', 'HSE'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-red-500 text-white p-2 rounded">Part 1 - STOP</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{field}</Label>
            <Input
              id={field}
              value={formData.headerFields[field] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field, e.target.value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
