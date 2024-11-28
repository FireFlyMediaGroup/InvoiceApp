export type ControlMeasure = {
  id: number;
  hazardNo: string;
  measures: string;
  risk: 'L' | 'M' | 'H';
};

export type POWRAFormData = {
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  headerFields: {
    [key: string]: string;
  };
  beforeStartChecklist: string[];
  controlMeasures: ControlMeasure[];
  reviewComments: string;
};
