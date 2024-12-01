import { NextRequest } from "next/server";
import { chunkit } from "semantic-chunking";

export async function POST(req: NextRequest) {
  const textToChunk = await req.text();

  const chunks = await chunkit(
    [
      {
        document_name: "default",
        document_text: textToChunk,
      },
    ],
    {}
  );

  return Response.json(
    {
      data: chunks.map((chunk) => ({
        text: chunk.text,
        token_length: chunk.token_length,
      })),
    },
    {
      status: 200,
    }
  );
}
