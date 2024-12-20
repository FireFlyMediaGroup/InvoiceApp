'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TailboardDocumentForm } from '../../../../components/FPLMissions/Forms/TailboardDocumentForm';
import type { TailboardFormValues } from '../../../../components/FPLMissions/Forms/TailboardDocumentForm';

export default function NewTailboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: TailboardFormValues) => {
    console.log('NewTailboardPage: handleSubmit called');
    console.log('Form data:', JSON.stringify(formData, null, 2));
    setLoading(true);
    try {
      const response = await fetch('/api/tailboard-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        console.log('Tailboard document created successfully');
        router.push(`/dashboard/fpl-missions/${params.id}/view`);
      } else {
        console.error('Server responded with an error:', responseData);
        throw new Error(`Failed to create tailboard document: ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      console.error('Error creating tailboard document:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Handle error (e.g., show error message to user)
      alert('Failed to create tailboard document. Please check the console for more details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Tailboard Document</h1>
      <TailboardDocumentForm 
        onSubmit={handleSubmit}
        fplMissionId={params.id}
      />
    </div>
  );
}
