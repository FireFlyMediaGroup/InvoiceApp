'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Part1Stop from './POWRAFormParts/Part1Stop';
import Part2Think from './POWRAFormParts/Part2Think';
import Part3Act from './POWRAFormParts/Part3Act';
import Part4Review from './POWRAFormParts/Part4Review';
import type { POWRAFormData, POWRAApiInput, POWRACreateInput, POWRAUpdateInput, POWRAStatus } from './POWRAFormParts/POWRAFormData';

const initialFormData: POWRAFormData = {
  id: '',
  status: 'DRAFT',
  site: '',
  date: new Date(),
  time: '',
  pilotName: '',
  location: '',
  chiefPilot: '',
  hse: '',
  beforeStartChecklist: [],
  controlMeasures: [],
  reviewNames: ['', '', '', ''],
  reviewDates: [new Date(), new Date(), new Date(), new Date()],
  lessonsLearned: false,
  reviewComments: null,
  userId: '', // Add this line to match the imported POWRAFormData type
};

const validateFormData = (data: POWRAFormData): string | null => {
  if (!data.site) return 'Site is required';
  if (!data.pilotName) return 'Pilot Name is required';
  if (!data.location) return 'Location is required';
  if (!data.chiefPilot) return 'Chief Pilot is required';
  if (!data.hse) return 'HSE is required';
  if (data.beforeStartChecklist.length === 0)
    return 'Before Start Checklist is required';
  if (data.controlMeasures.length === 0)
    return 'At least one Control Measure is required';
  return null;
};

export default function POWRAForm({
  powraId,
  onClose,
}: {
  powraId: string | null;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<POWRAFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (powraId && status === 'authenticated') {
      setIsLoading(true);
      setError(null);

      const fetchPOWRA = async () => {
        try {
          const response = await fetch(`/api/powra?id=${powraId}`, {
            headers: {
              'Content-Type': 'application/json',
              'X-User-Info': JSON.stringify(session),
            },
          });
          if (!response.ok) throw new Error('Failed to fetch POWRA');
          const data = await response.json();
          setFormData({
            ...data,
            date: new Date(data.date),
            reviewDates: data.reviewDates.map((date: string) => new Date(date)),
          });
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPOWRA();
    }
  }, [powraId, session, status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== 'authenticated' || !session?.user?.id) {
      setError('You must be logged in to submit a POWRA');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const validationError = validateFormData(formData);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const url = powraId ? `/api/powra?id=${powraId}` : '/api/powra';
      const method = powraId ? 'PUT' : 'POST';

      let body: POWRAApiInput;

      const commonData = {
        status: formData.status as POWRAStatus,
        site: formData.site,
        date: formData.date,
        time: formData.time,
        pilotName: formData.pilotName,
        location: formData.location,
        chiefPilot: formData.chiefPilot,
        hse: formData.hse,
        beforeStartChecklist: formData.beforeStartChecklist,
        reviewNames: formData.reviewNames,
        reviewDates: formData.reviewDates,
        lessonsLearned: formData.lessonsLearned,
        reviewComments: formData.reviewComments,
      };

      if (powraId) {
        const updateBody: POWRAUpdateInput = {
          ...commonData,
          controlMeasures: {
            upsert: formData.controlMeasures.map((cm) => ({
              where: { id: cm.id },
              update: {
                hazardNo: cm.hazardNo,
                measures: cm.measures,
                risk: cm.risk,
              },
              create: {
                hazardNo: cm.hazardNo,
                measures: cm.measures,
                risk: cm.risk,
              },
            })),
            deleteMany: {
              id: { notIn: formData.controlMeasures.map((cm) => cm.id || '') },
            },
          },
        };
        body = updateBody;
      } else {
        const createBody: POWRACreateInput = {
          ...commonData,
          controlMeasures: {
            create: formData.controlMeasures.map(({ hazardNo, measures, risk }) => ({
              hazardNo,
              measures,
              risk,
            })),
          },
          user: {
            connect: { id: session.user.id },
          },
        };
        body = createBody;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify(session),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${powraId ? 'update' : 'create'} POWRA`
        );
      }

      setSuccessMessage(
        `POWRA successfully ${powraId ? 'updated' : 'created'}.`
      );
      setTimeout(onClose, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>You must be logged in to access this form.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Point of Work Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <Part1Stop formData={formData} setFormData={setFormData} />
          <Part2Think formData={formData} setFormData={setFormData} />
          <Part3Act formData={formData} setFormData={setFormData} />
          <Part4Review formData={formData} setFormData={setFormData} />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : powraId ? 'Update' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
