export type RiskSection = 
  | 'MISSION_FACTORS'
  | 'FLIGHT_CREW_FACTORS'
  | 'AIRSPACE_FACTORS'
  | 'WEATHER_FACTORS'
  | 'FLIGHT_OPERATIONS_AREA'
  | 'HUMAN_FACTORS';

export type RiskScore = 1 | 3 | 5 | 30;

export interface RiskOption {
  label: string;
  score: RiskScore;
}

export interface RiskQuestion {
  id: string;
  section: RiskSection;
  question: string;
  options: RiskOption[];
}

export interface RiskAnswer {
  questionId: string;
  selectedScore: RiskScore;
}

export const RISK_SECTIONS: Record<RiskSection, string> = {
  MISSION_FACTORS: "Mission Factors",
  FLIGHT_CREW_FACTORS: "Flight Crew Factors",
  AIRSPACE_FACTORS: "Airspace Factors",
  WEATHER_FACTORS: "Weather Factors",
  FLIGHT_OPERATIONS_AREA: "Flight Operations Area",
  HUMAN_FACTORS: "Human Factors"
};

export interface RiskMatrixData {
  title: string;
  site: string;
  description: string;
  assessmentDate: string;
  analysis: {
    totalScore: number;
    riskLevel: string;
    recommendedActions: string;
  };
  sections: Array<{
    name: string;
    questions: Array<{
      question: string;
      answer: string;
      score: number;
    }>;
  }>;
}
