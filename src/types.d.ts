// see https://github.com/jparkerweb/semantic-chunking
declare module "semantic-chunking" {
  type EmbeddingPrecision = "fp32" | "fp16" | "q8" | "q4";

  interface ChunkitOptions {
    logging?: boolean;
    /** defaults to 500 */
    maxTokenSize?: number;
    /** defaults to true */
    combineChunks?: boolean;
    dtype?: EmbeddingPrecision;
  }

  interface ChunkItem {
    chunk_number: number;
    document_id: number;
    document_name: string;
    dtype: EmbeddingPrecision;
    model_name: string;
    number_of_chunks: number;
    text: string;
    token_length: number;
  }

  /**
   * chunkit accepts an array of document objects and an optional configuration object. Here are the details for each parameter:
   */
  export const chunkit: (
    documents: { document_name: string; document_text: string }[],
    options: ChunkitOptions
  ) => Promise<ChunkItem[]>;
}
