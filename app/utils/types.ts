import { User } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & {
      role: "USER" | "SUPERVISOR" | "ADMIN";
    };
  }
}

export type FPLMissionStatus = "DRAFT" | "PENDING" | "APPROVED";

export interface FPLMission {
  id: string;
  status: FPLMissionStatus;
  siteId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
