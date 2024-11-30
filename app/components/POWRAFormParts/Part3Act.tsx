'use client';

import type { FC } from 'react';
import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import type { POWRAFormData, ControlMeasureInput, Risk } from './POWRAFormData';

type Part3ActProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

const riskLevels = ['L', 'M', 'H'] as const;

/**
 * Part3Act component handles the "ACT" section of the POWRA form.
 * It allows users to add and edit control measures for identified hazards.
 */
const Part3Act: FC<Part3ActProps> = ({ formData, setFormData }) => {
  const handleControlMeasureChange = useCallback((
    id: string,
    field: keyof ControlMeasureInput,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      controlMeasures: prev.controlMeasures.map((measure) =>
        measure.id === id 
          ? { ...measure, [field]: field === 'risk' ? value as Risk : value }
          : measure
      ),
    }));
  }, [setFormData]);

  const addControlMeasure = useCallback(() => {
    const newId = `new-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      controlMeasures: [
        ...prev.controlMeasures,
        { id: newId, hazardNo: '', measures: '', risk: 'L' as Risk },
      ],
    }));
  }, [setFormData]);

  const toggleControlMeasures = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      controlMeasuresNeeded: checked,
      controlMeasures: checked ? prev.controlMeasures : [],
    }));
  }, [setFormData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-green-500 text-white p-2 rounded">
          Part 3 - ACT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="controlMeasuresNeeded"
            checked={formData.controlMeasuresNeeded ?? false}
            onCheckedChange={toggleControlMeasures}
          />
          <Label htmlFor="controlMeasuresNeeded">Control measures needed?</Label>
        </div>

        {formData.controlMeasuresNeeded && (
          <>
            {formData.controlMeasures.map((measure) => (
              <Card key={measure.id} className="p-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Hazard No."
                    value={measure.hazardNo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleControlMeasureChange(
                        measure.id,
                        'hazardNo',
                        e.target.value
                      )
                    }
                  />
                  <Textarea
                    placeholder="Control Measures"
                    value={measure.measures}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleControlMeasureChange(
                        measure.id,
                        'measures',
                        e.target.value
                      )
                    }
                  />
                  <RadioGroup
                    value={measure.risk}
                    onValueChange={(value: Risk) =>
                      handleControlMeasureChange(measure.id, 'risk', value)
                    }
                    className="flex space-x-4"
                  >
                    {riskLevels.map((risk) => (
                      <div key={risk} className="flex items-center space-x-2">
                        <RadioGroupItem value={risk} id={`risk-${risk}-${measure.id}`} />
                        <Label htmlFor={`risk-${risk}-${measure.id}`}>{risk}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              onClick={addControlMeasure}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Control Measure
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Part3Act;
