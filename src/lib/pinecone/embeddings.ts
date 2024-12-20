import { OpenAIEmbeddings } from "@langchain/openai";

import { env } from "~/env";

let embeddingsClient: OpenAIEmbeddings | null = null;

export function getEmbeddingsClient() {
  if (!embeddingsClient) {
    embeddingsClient = new OpenAIEmbeddings({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
      batchSize: 512,
      stripNewLines: true,
    });
  }
  return embeddingsClient;
}

export async function embedText(text: string) {
  const embeddings = getEmbeddingsClient();
  return embeddings.embedQuery(text);
}

export async function embedTexts(texts: string[]) {
  const embeddings = getEmbeddingsClient();
  return embeddings.embedDocuments(texts);
}
