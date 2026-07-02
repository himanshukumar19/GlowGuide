export interface SkinAnalysis {
  id: string;
  customerId: string;
  quizAnswers: QuizAnswer[];
  photoUrls: string[];
  result: AnalysisResult;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: number;
  answer: string | number;
}

export interface AnalysisResult {
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  concerns: DetectedConcern[];
  healthScore: number;
  confidence: number;
  routine: RoutineRecommendation;
}

export interface DetectedConcern {
  name: string;
  confidence: number;
  description: string;
}

export interface RoutineRecommendation {
  morning: RoutineStep[];
  night: RoutineStep[];
}

export interface RoutineStep {
  productType: string;
  description: string;
  suggestedProducts?: string[];
}

export type DiagnosisStep = 'intro' | 'quiz' | 'camera' | 'processing' | 'results';

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
