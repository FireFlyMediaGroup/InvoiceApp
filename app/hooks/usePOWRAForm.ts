"use client";

import { useState } from 'react';

export type HeaderField = {
  label: string;
  name: string;
};

export type ControlMeasure = {
  id: number;
  hazardNo: string;
  measures: string;
  risk: string;
};

export const usePOWRAForm = () => {
  const [controlMeasures, setControlMeasures] = useState<ControlMeasure[]>([
    { id: 1, hazardNo: '', measures: '', risk: '' }
  ]);

  const headerFields: HeaderField[] = [
    { label: "Site", name: "site" },
    { label: "Date", name: "date" },
    { label: "Time", name: "time" },
    { label: "Pilot Name", name: "pilotName" },
    { label: "Location", name: "location" },
    { label: "Chief Pilot", name: "chiefPilot" },
    { label: "HSE", name: "hse" },
  ];

  const beforeStartChecklist = [
    "Are you at the authorised Inspection / WTG Location?",
    "Do you have the correct documentation?(RAMS, Pt. 107, First Aid etc)",
    "Do you have the correct PPE / RPE and Safety Equipment? (Including Truck)",
    "Are you competent and authorised to complete the task?",
    "Is Inspection Equipment, tools, suitable and in date for Operation (MX Interval)",
    "Is access / egress safe and in date for inspection? (Ladders, WTG Stairs, scaffolds etc)",
    "Is environmental condition safe for operations? (weather, road cond.)"
  ];

  const addControlMeasure = () => {
    const newId = controlMeasures.length + 1;
    setControlMeasures([...controlMeasures, { id: newId, hazardNo: '', measures: '', risk: '' }]);
  };

  const removeControlMeasure = (id: number) => {
    if (controlMeasures.length > 1) {
      setControlMeasures(controlMeasures.filter(measure => measure.id !== id));
    }
  };

  return {
    headerFields,
    beforeStartChecklist,
    controlMeasures,
    addControlMeasure,
    removeControlMeasure
  };
};
