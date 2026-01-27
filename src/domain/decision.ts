export type InterviewScores = {
    attitudeScore: number;
    responsibilityScore: number;
    technicalScore: number;
  };
  
  export type Decision = "CONTRATAR" | "BASE_DE_DATOS" | "NO_CONTINUAR";
  
  export type DecisionResult = {
    totalScore: number;
    suggestedDecision: Decision;
    hardRuleTriggered: boolean;
  };
  
  const isScoreValid = (score: number) => Number.isInteger(score) && score >= 1 && score <= 5;
  
  export const evaluateInterview = (scores: InterviewScores): DecisionResult => {
    const { attitudeScore, responsibilityScore, technicalScore } = scores;
  
    if (![attitudeScore, responsibilityScore, technicalScore].every(isScoreValid)) {
      throw new Error("Las calificaciones deben estar entre 1 y 5.");
    }
  
    const totalScore = attitudeScore + responsibilityScore + technicalScore;
    const hardRuleTriggered = attitudeScore < 3 || responsibilityScore < 3;
  
    if (hardRuleTriggered) {
      return {
        totalScore,
        suggestedDecision: "NO_CONTINUAR",
        hardRuleTriggered,
      };
    }
  
    if (totalScore >= 12) {
      return {
        totalScore,
        suggestedDecision: "CONTRATAR",
        hardRuleTriggered,
      };
    }
  
    if (totalScore >= 9) {
      return {
        totalScore,
        suggestedDecision: "BASE_DE_DATOS",
        hardRuleTriggered,
      };
    }
  
    return {
      totalScore,
      suggestedDecision: "NO_CONTINUAR",
      hardRuleTriggered,
    };
  };