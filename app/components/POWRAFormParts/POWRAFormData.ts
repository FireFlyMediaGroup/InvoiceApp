import type { POWRAStatus, POWRA, ControlMeasure, Prisma } from '@prisma/client';

export type { POWRAStatus };

export type Risk = 'L' | 'M' | 'H';

export type ControlMeasureInput = Omit<ControlMeasure, 'powraId'>;

export type POWRAFormData = Omit<POWRA, 'createdAt' | 'updatedAt'> & {
  controlMeasures: ControlMeasureInput[];
  controlMeasuresNeeded?: boolean;
};

export type POWRACreateInput = Omit<Prisma.POWRACreateInput, 'controlMeasures'> & {
  controlMeasures: {
    create: Omit<Prisma.ControlMeasureCreateWithoutPowraInput, 'id'>[]
  }
};

export type POWRAUpdateInput = Omit<Prisma.POWRAUpdateInput, 'controlMeasures'> & {
  controlMeasures: {
    upsert: Array<{
      where: Prisma.ControlMeasureWhereUniqueInput;
      update: Prisma.ControlMeasureUpdateWithoutPowraInput;
      create: Prisma.ControlMeasureCreateWithoutPowraInput;
    }>;
    deleteMany: Prisma.ControlMeasureScalarWhereInput;
  }
};

export type POWRAApiInput = POWRACreateInput | POWRAUpdateInput;
