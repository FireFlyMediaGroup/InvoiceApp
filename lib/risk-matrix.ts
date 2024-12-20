import type { RiskAnswer, RiskSection, RiskMatrixData } from "@/types/risk-matrix";
import { RISK_SECTIONS } from "@/types/risk-matrix";
import { RISK_MATRIX_QUESTIONS } from "./risk-matrix-config";

export function analyzeRiskMatrix(answers: RiskAnswer[]) {
  const totalScore = answers.reduce((sum, answer) => sum + answer.selectedScore, 0);
  const sectionScores = Object.keys(RISK_SECTIONS).map((section) => {
    const sectionAnswers = answers.filter((answer) => 
      RISK_MATRIX_QUESTIONS.find(q => q.id === answer.questionId)?.section === section
    );
    return {
      section: section as RiskSection,
      score: sectionAnswers.reduce((sum, answer) => sum + answer.selectedScore, 0),
      questionCount: sectionAnswers.length,
    };
  });

  const riskLevel = totalScore <= 20 ? "Low" :
                    totalScore <= 40 ? "Medium" :
                    totalScore <= 60 ? "High" : "Very High";

  return {
    totalScore,
    sectionScores,
    riskLevel,
    recommendedActions: `Based on the total score of ${totalScore}, the risk level is ${riskLevel}. ${getRiskRecommendation(riskLevel)}`,
  };
}

function getRiskRecommendation(riskLevel: string): string {
  switch (riskLevel) {
    case "Low":
      return "Standard precautions are sufficient.";
    case "Medium":
      return "Additional safety measures should be considered.";
    case "High":
      return "Implement stringent safety protocols and consider postponing if conditions don't improve.";
    case "Very High":
      return "It is strongly recommended to postpone or cancel the mission unless absolutely necessary. If proceeding, extreme caution and additional safety measures are required.";
    default:
      return "Unable to provide recommendation due to unexpected risk level.";
  }
}

export function generateCompleteRiskMatrix(
  documentInfo: {
    title: string;
    site: string;
    description: string;
    assessmentDate: string;
    createdBy: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED';
  },
  answers: RiskAnswer[]
): RiskMatrixData {
  const analysis = analyzeRiskMatrix(answers);
  
  return {
    ...documentInfo,
    analysis: {
      totalScore: analysis.totalScore,
      riskLevel: analysis.riskLevel,
      recommendedActions: analysis.recommendedActions,
    },
    sections: Object.entries(RISK_SECTIONS).map(([key, value]) => ({
      name: value,
      questions: RISK_MATRIX_QUESTIONS
        .filter(q => q.section === key)
        .map(question => {
          const answer = answers.find(a => a.questionId === question.id);
          const selectedOption = question.options.find(opt => opt.score === answer?.selectedScore);
          return {
            question: question.question,
            answer: selectedOption ? selectedOption.label : 'Not answered',
            score: answer?.selectedScore || 0,
          };
        })
    }))
  };
}
