"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Part1Stop from './POWRAFormParts/Part1Stop';
import Part2Think from './POWRAFormParts/Part2Think';
import Part3Act from './POWRAFormParts/Part3Act';
import Part4Review from './POWRAFormParts/Part4Review';
import type { POWRAFormData, ControlMeasure } from './POWRAFormParts/POWRAFormData';

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

  const addControlMeasure = () => {
    setFormData((prev: POWRAFormData) => ({
      ...prev,
      controlMeasures: [...prev.controlMeasures, { id: nextControlMeasureId, hazardNo: '', measures: '', risk: 'L' }],
    }));
    setNextControlMeasureId(prev => prev + 1);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Point of Work Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          <Part1Stop formData={formData} setFormData={setFormData} />
          <Part2Think formData={formData} setFormData={setFormData} />
          <Part3Act 
            formData={formData} 
            setFormData={setFormData} 
            addControlMeasure={addControlMeasure}
          />
          <Part4Review formData={formData} setFormData={setFormData} />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : (powraId ? 'Update' : 'Submit')} POWRA
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
