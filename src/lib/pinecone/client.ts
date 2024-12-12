import { Pinecone } from "@pinecone-database/pinecone";

import { env } from "~/env";

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  }
  return pineconeClient;
}

export async function getIndex() {
  const pinecone = await getPineconeClient();
  return pinecone.index(env.PINECONE_INDEX);
}
