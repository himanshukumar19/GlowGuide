export type SourceType =
  | "pubmed"
  | "semantic_scholar"
  | "huggingface"
  | "kaggle"
  | "web"
  | "manual"
  | "peer_reviewed"
  | "clinical_education"
  | "brand_educational"
  | "dataset";

export type RawDoc = {
  sourceType: SourceType;
  sourceUrl: string;
  title: string;
  text: string;
  metadata: Record<string, any>;
  retrievedAt: string;
};
