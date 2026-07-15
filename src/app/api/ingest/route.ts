import { NextRequest, NextResponse } from "next/server";

export type IngestRequest = {
  urls?: string[];
  sourceType?: string;
  datasetId?: string;
};

export type IngestResponse = {
  status: string;
  documentsProcessed: number;
  chunksCreated: number;
};

/**
 * POST /api/ingest
 * Admin-protected endpoint to ingest new documents into the knowledge base.
 * Triggers: collect -> parse -> chunk -> embed -> upsert pipeline.
 */
export async function POST(request: NextRequest) {
  // TODO: Implement admin-protected ingestion endpoint
  // 1. Verify admin auth (check role: "ADMIN" in Firebase token)
  // 2. Parse request body (urls, sourceType, datasetId)
  // 3. Dispatch to appropriate collector based on sourceType
  // 4. Run parse -> chunk -> embed -> upsert pipeline
  // 5. Return IngestResponse with counts
  // 6. Consider making this async with a job queue for large batches

  try {
    // TODO: Uncomment admin auth check once implemented
    // const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    // if (!token || !await verifyAdmin(token)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body: IngestRequest = await request.json();

    // TODO: Remove this stub once ingestion pipeline is wired
    return NextResponse.json({
      status: "stub",
      documentsProcessed: 0,
      chunksCreated: 0,
    } satisfies IngestResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
