export type InterviewInput = {
    punctuality: number;
    attitude: number;
    teamwork: number;
  };
  
  export type InterviewDecision = "HIRE" | "POOL" | "REJECT";
  
  export type InterviewScoreResult = {
    totalScore: number;
    suggestedDecision: InterviewDecision;
  };
  
  const isValidScore = (value: number) => Number.isInteger(value) && value >= 0 && value <= 5;
  
  export const evaluateInterview = (input: InterviewInput): InterviewScoreResult => {
    const { punctuality, attitude, teamwork } = input;
  
    if (![punctuality, attitude, teamwork].every(isValidScore)) {
      throw new Error("Las calificaciones deben estar entre 0 y 5.");
    }
  
    const totalScore = punctuality + attitude + teamwork;
  
    if (totalScore >= 12) {
      return { totalScore, suggestedDecision: "HIRE" };
    }
  
    if (totalScore >= 8) {
      return { totalScore, suggestedDecision: "POOL" };
    }
  
    return { totalScore, suggestedDecision: "REJECT" };
  };