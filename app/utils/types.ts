import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
}

export type FPLMissionStatus = 'DRAFT' | 'PENDING' | 'APPROVED';

export interface FPLMission {
  id: string;
  siteId: string;
  status: FPLMissionStatus;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SUPERVISOR' | 'ADMIN';
}

export interface RiskMatrix {
  id: string;
  missionId: string;
  // Add other risk matrix fields here
}

export interface MissionPlanningScript {
  id: string;
  missionId: string;
  // Add other mission planning script fields here
}

export interface TailboardDocument {
  id: string;
  missionId: string;
  technicianId: string;
  date: string | Date;
  // Add other tailboard document fields here
}

export type Currency = string;

export interface CurrencyAmount {
  amount: number;
  currency: Currency;
}

// Add any other types you need here
