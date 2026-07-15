export type ChunkMetadata = {
  docId: string;
  sourceUrl: string;
  title: string;
  sectionHeading?: string;
  sourceType: string;
  retrievedAt: string;
};

export type Chunk = {
  chunkId: string;
  text: string;
  metadata: ChunkMetadata;
};
