"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ControlMeasure = {
  id: number;
  hazardNo: string;
  measures: string;
  risk: 'L' | 'M' | 'H';
};

type POWRAFormData = {
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  headerFields: {
    [key: string]: string;
  };
  beforeStartChecklist: string[];
  controlMeasures: ControlMeasure[];
  reviewComments: string;
};

type POWRAFormProps = {
  powraId: string | null;
  onClose: () => void;
};

export default function POWRAForm({ powraId, onClose }: POWRAFormProps) {
  const [formData, setFormData] = useState<POWRAFormData>({
    status: 'DRAFT',
    headerFields: {},
    beforeStartChecklist: [],
    controlMeasures: [{ id: 1, hazardNo: '', measures: '', risk: 'L' }],
    reviewComments: '',
  });
  const [nextControlMeasureId, setNextControlMeasureId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (powraId) {
      setIsLoading(true);
      setError(null);
      const fetchPOWRA = async () => {
        try {
          const response = await fetch(`/api/powra?id=${powraId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch POWRA');
          }
          const data = await response.json();
          setFormData(data);
          const maxId = Math.max(...data.controlMeasures.map((cm: ControlMeasure) => cm.id), 0);
          setNextControlMeasureId(maxId + 1);
        } catch (error) {
          console.error('Error fetching POWRA:', error);
          setError('Failed to load POWRA data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPOWRA();
    }
  }, [powraId]);

  const handleHeaderFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      headerFields: { ...prev.headerFields, [field]: value },
    }));
  };

  const handleChecklistChange = (item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      beforeStartChecklist: checked
        ? [...prev.beforeStartChecklist, item]
        : prev.beforeStartChecklist.filter(i => i !== item),
    }));
  };

  const handleControlMeasureChange = (id: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      controlMeasures: prev.controlMeasures.map(measure =>
        measure.id === id ? { ...measure, [field]: value } : measure
      ),
    }));
  };

  const addControlMeasure = () => {
    setFormData(prev => ({
      ...prev,
      controlMeasures: [...prev.controlMeasures, { id: nextControlMeasureId, hazardNo: '', measures: '', risk: 'L' }],
    }));
    setNextControlMeasureId(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const url = powraId ? `/api/powra?id=${powraId}` : '/api/powra';
      const method = powraId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${powraId ? 'update' : 'create'} POWRA`);
      }
      setSuccessMessage(`POWRA successfully ${powraId ? 'updated' : 'created'}.`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(`Error ${powraId ? 'updating' : 'creating'} POWRA:`, error);
      setError(`Failed to ${powraId ? 'update' : 'create'} POWRA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Header Information</h2>
        {['Date', 'Location', 'Task Description'].map(field => (
          <div key={field}>
            <Label htmlFor={field}>{field}</Label>
            <Input
              id={field}
              value={formData.headerFields[field] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHeaderFieldChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Before You Start Checklist</h2>
        {['Item 1', 'Item 2', 'Item 3'].map(item => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={item}
              checked={formData.beforeStartChecklist.includes(item)}
              onCheckedChange={(checked: boolean) => handleChecklistChange(item, checked)}
            />
            <Label htmlFor={item}>{item}</Label>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Control Measures</h2>
        {formData.controlMeasures.map((measure) => (
          <div key={measure.id} className="space-y-2 p-4 border rounded">
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
            <div className="flex space-x-4">
              {['L', 'M', 'H'].map((risk) => (
                <div key={risk} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`risk-${risk}-${measure.id}`}
                    checked={measure.risk === risk}
                    onChange={() => handleControlMeasureChange(measure.id, 'risk', risk as 'L' | 'M' | 'H')}
                  />
                  <Label htmlFor={`risk-${risk}-${measure.id}`}>{risk}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button type="button" onClick={addControlMeasure}>Add Control Measure</Button>
      </div>

      <div>
        <Label htmlFor="reviewComments">Review Comments</Label>
        <Textarea
          id="reviewComments"
          value={formData.reviewComments}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, reviewComments: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : (powraId ? 'Update' : 'Submit')} POWRA
        </Button>
      </div>
    </form>
  );
}
