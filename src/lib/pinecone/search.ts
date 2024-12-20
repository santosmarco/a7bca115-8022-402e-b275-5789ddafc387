import { getIndex } from "./client";
import { embedText } from "./embeddings";

export async function searchSimilar(
  query: string,
  options?: {
    topK?: number;
    minScore?: number;
    filter?: Record<string, unknown>;
  },
) {
  const { topK = 5, minScore = 0.7, filter } = options ?? {};

  const queryEmbedding = await embedText(query);
  const index = await getIndex();

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    filter,
    includeMetadata: true,
  });

  return results.matches.filter((match) => (match.score ?? 0) >= minScore);
}
