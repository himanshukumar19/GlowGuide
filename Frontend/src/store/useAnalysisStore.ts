import { create } from "zustand";
import type { DiagnosisStep, SkinType } from "@/types/analysis";

interface AnalysisState {
  step: DiagnosisStep;
  currentQuestion: number;
  answers: Record<string, number>;
  selectedOption: number | null;
  freeText: string;
  showFreeText: boolean;
  photos: string[];
  apiResult: {
    skinType: string;
    confidence: number;
    probabilities: Record<string, number>;
    concernsDetected: string[];
  } | null;
  setStep: (step: DiagnosisStep) => void;
  setCurrentQuestion: (q: number) => void;
  setAnswers: (answers: Record<string, number>) => void;
  setSelectedOption: (index: number | null) => void;
  setFreeText: (text: string) => void;
  setShowFreeText: (show: boolean) => void;
  setPhotos: (photos: string[]) => void;
  setApiResult: (result: AnalysisState["apiResult"]) => void;
  reset: () => void;
}

const initialState = {
  step: "intro" as DiagnosisStep,
  currentQuestion: 0,
  answers: {},
  selectedOption: null,
  freeText: "",
  showFreeText: false,
  photos: [],
  apiResult: null,
};

export const useAnalysisStore = create<AnalysisState>()((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setAnswers: (answers) => set({ answers }),
  setSelectedOption: (selectedOption) => set({ selectedOption }),
  setFreeText: (freeText) => set({ freeText }),
  setShowFreeText: (showFreeText) => set({ showFreeText }),
  setPhotos: (photos) => set({ photos }),
  setApiResult: (apiResult) => set({ apiResult }),
  reset: () => set(initialState),
}));
