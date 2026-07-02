export interface ConcernMetric {
  name: string;
  severity: number; // 0 to 100
}

export interface SkinAnalysisHistoryItem {
  id: string;
  date: string;
  healthScore: number;
  skinType: "oily" | "dry" | "combination" | "sensitive" | "normal";
  confidence: number;
  concerns: ConcernMetric[];
  notes?: string;
}

export const MOCK_HISTORY: SkinAnalysisHistoryItem[] = [
  {
    id: "history-01",
    date: "2026-01-10T10:30:00Z",
    healthScore: 48,
    skinType: "oily",
    confidence: 0.88,
    concerns: [
      { name: "acne", severity: 80 },
      { name: "pore_size", severity: 75 },
      { name: "sebum_level", severity: 85 }
    ],
    notes: "Oily breakouts around chin and cheeks. Face gets shiny within 2 hours."
  },
  {
    id: "history-02",
    date: "2026-02-15T14:15:00Z",
    healthScore: 54,
    skinType: "oily",
    confidence: 0.85,
    concerns: [
      { name: "acne", severity: 68 },
      { name: "pore_size", severity: 70 },
      { name: "sebum_level", severity: 78 }
    ],
    notes: "Slight improvement after using Salicylic Acid cleanser. Less active cystic acne."
  },
  {
    id: "history-03",
    date: "2026-03-20T09:45:00Z",
    healthScore: 62,
    skinType: "combination",
    confidence: 0.90,
    concerns: [
      { name: "acne", severity: 45 },
      { name: "pore_size", severity: 55 },
      { name: "hydration_level", severity: 42 }
    ],
    notes: "Cheeks feel dry. T-zone remains oily but breakouts have subsided."
  },
  {
    id: "history-04",
    date: "2026-04-18T16:20:00Z",
    healthScore: 71,
    skinType: "combination",
    confidence: 0.92,
    concerns: [
      { name: "acne", severity: 30 },
      { name: "pore_size", severity: 48 },
      { name: "sensitivity_score", severity: 32 }
    ],
    notes: "Transitioning to a lighter routine. Pores are less noticeable."
  },
  {
    id: "history-05",
    date: "2026-05-22T11:00:00Z",
    healthScore: 78,
    skinType: "normal",
    confidence: 0.86,
    concerns: [
      { name: "pore_size", severity: 35 },
      { name: "hydration_level", severity: 64 }
    ],
    notes: "Barrier feels stronger. Skin is comfortable, no active breakouts."
  },
  {
    id: "history-06",
    date: "2026-06-24T10:00:00Z",
    healthScore: 86,
    skinType: "normal",
    confidence: 0.94,
    concerns: [
      { name: "pore_size", severity: 25 },
      { name: "hydration_level", severity: 75 }
    ],
    notes: "Skin is balanced, clear, and glowing. Continuing current routine."
  }
];
