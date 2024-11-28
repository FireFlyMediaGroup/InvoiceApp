"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus } from "lucide-react";
import type { POWRAFormData, ControlMeasure } from "./POWRAFormData";

type Part3ActProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
  addControlMeasure: () => void;
};

export default function Part3Act({ formData, setFormData, addControlMeasure }: Part3ActProps) {
  const handleControlMeasureChange = (id: number, field: keyof ControlMeasure, value: string) => {
    setFormData(prev => ({
      ...prev,
      controlMeasures: prev.controlMeasures.map(measure =>
        measure.id === id ? { ...measure, [field]: value } : measure
      ),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-green-500 text-white p-2 rounded">Part 3 - ACT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.controlMeasures.map((measure) => (
          <Card key={measure.id} className="p-4">
            <div className="space-y-4">
              <Input
                placeholder="Hazard No."
                value={measure.hazardNo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleControlMeasureChange(measure.id, 'hazardNo', e.target.value)}
              />
              <Textarea
                placeholder="Control Measures"
                value={measure.measures}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleControlMeasureChange(measure.id, 'measures', e.target.value)}
              />
              <RadioGroup
                value={measure.risk}
                onValueChange={(value: string) => handleControlMeasureChange(measure.id, 'risk', value as 'L' | 'M' | 'H')}
                className="flex space-x-4"
              >
                {['L', 'M', 'H'].map((risk) => (
                  <div key={risk} className="flex items-center space-x-2">
                    <RadioGroupItem value={risk} id={`risk-${risk}-${measure.id}`} />
                    <Label htmlFor={`risk-${risk}-${measure.id}`}>{risk}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        ))}
        <Button type="button" onClick={addControlMeasure} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Control Measure
        </Button>
      </CardContent>
    </Card>
  );
}
