'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TailboardDocumentForm } from '../../../../../components/FPLMissions/Forms/TailboardDocumentForm';
import type { TailboardDocumentFormValues } from '../../../../../components/FPLMissions/Forms/TailboardDocumentForm';
import { toast } from 'react-hot-toast';

export default function EditTailboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [document, setDocument] = useState<TailboardDocumentFormValues | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/fpl-missions/tailboard-document/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tailboard document');
        }
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching tailboard document:', error);
        toast.error('Failed to fetch tailboard document');
      }
    }

    fetchDocument();
  }, [params.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !document) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (data: TailboardDocumentFormValues) => {
    try {
      const response = await fetch(`/api/fpl-missions/tailboard-document/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update tailboard document');
      }

      toast.success('Tailboard document updated successfully');
      router.push(`/dashboard/fpl-missions/tailboard/${params.id}`);
    } catch (error) {
      console.error('Error updating tailboard document:', error);
      toast.error('Failed to update tailboard document. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Tailboard Document</h1>
      <TailboardDocumentForm onSubmit={handleSubmit} initialValues={document} />
    </div>
  );
}
