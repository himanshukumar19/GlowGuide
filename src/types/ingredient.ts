export interface Ingredient {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  sideEffects: string[];
  suitableSkinTypes: string[];
  category?: string;
  safetyRating?: 'safe' | 'moderate' | 'caution';
}
