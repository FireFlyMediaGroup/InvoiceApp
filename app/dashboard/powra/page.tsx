"use client";

import React, { useState } from 'react';
import POWRAForm from "@/app/components/POWRAForm";
import POWRAList from "@/app/components/POWRAList";
import { Button } from "@/components/ui/button";

export default function POWRAPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPowraId, setEditingPowraId] = useState<string | null>(null);

  const handleCreatePOWRA = () => {
    setEditingPowraId(null);
    setShowForm(true);
  };

  const handleEditPOWRA = (id: string) => {
    setEditingPowraId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPowraId(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Point of Work Risk Assessment (POWRA)</h1>
        <Button onClick={handleCreatePOWRA}>Create POWRA</Button>
      </div>
      
      {showForm ? (
        <POWRAForm powraId={editingPowraId} onClose={handleFormClose} />
      ) : (
        <POWRAList onEdit={handleEditPOWRA} />
      )}
    </div>
  );
}
