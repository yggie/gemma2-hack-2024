"use client";

import { useEffect, useState } from "react";
import { useWebLLMEngine } from "../webllm/WebLLMProvider";
import { cleanLLMJson } from "../webllm/utils";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { get_encoding } from "tiktoken";

export interface LoadingPhaseProgress {
  name: string;
  progress: number;
  total: number;
}

export interface PoMAIAResult {
  quotes: {
    data: { original: string; suggestion: string }[];
    tokensUsed: number;
  };
  summary: {
    titles: string[];
    summary: string;
    topics: string[];
    tokensUsed: number;
  };
}

const SYSTEM_PROMPT_PULL_QUOTES = `
You are a social media assistant. Your job is to analyse any text provided to
you, which are transcripts of interviews, and pull out the top 5 key quotes and/or
insights from the text that range from a single sentence to a few sentences long
at most that contain useful insights. In your response, you must include the
original text and the original text slightly modified to fix any grammatical
errors. You must return your response in JSON format, for example:

{ "quotes": [{ "original": "Original quote 1", "suggestion": "Original quote 1 with grammatical fixes"}]

Your response must be only JSON
`;

const SYSTEM_PROMPT_SUMMARY = `
You are a social media assistant. Your job is to rewrite the content you are
provided, typically a collection of extracts from an interview transcript, into
a short summary of the discussion. The response must contain 3 components, a
summary of the discussion, at least 3 unique alternatives for a short title
for the summary, and a list of topics related to the discussion. Return your
response in strictly JSON format, for example:

{ "summary": "This is a summary of the discussion", "topics": ["Web3", "Technology", "Business"], "titles": ["This is a title", "A fantastic title", "This title could change your life"] }

Some examples of topics are:
Technology, Web3, Artificial Intelligence, Augmented Reality, Advertising,
Social Impact, Content Creation, Community Building
`;

const LS_KEY_SOURCE_TEXT = "@PoMAIA/source-text";
const LS_KEY_RESULTS = "@PoMAIA/results";

export function usePoMAIA() {
  const { engine } = useWebLLMEngine();

  const [sourceText, setSourceText] = useState(
    localStorage.getItem(LS_KEY_SOURCE_TEXT) || ""
  );

  useEffect(() => {
    if (sourceText) {
      localStorage.setItem(LS_KEY_SOURCE_TEXT, sourceText);
    } else {
      localStorage.removeItem(LS_KEY_SOURCE_TEXT);
    }
  }, [sourceText]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const [result, setResult] = useState<PoMAIAResult>(() => {
    const saved = localStorage.getItem(LS_KEY_RESULTS);

    return saved
      ? JSON.parse(saved)
      : {
          quotes: { data: [], tokensUsed: 0 },
          summary: { titles: [], summary: "", topics: [], tokensUsed: 0 },
        };
  });

  useEffect(() => {
    if (result.quotes.tokensUsed === 0 && result.summary.tokensUsed === 0) {
      localStorage.removeItem(LS_KEY_RESULTS);
    } else {
      localStorage.setItem(LS_KEY_RESULTS, JSON.stringify(result));
    }
  }, [result]);

  const processChunkWithSystem = async <T = unknown,>(
    system: string,
    text: string
  ) => {
    const reply = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const cleanedJson = cleanLLMJson(reply.choices[0].message.content || "");

    return {
      result: JSON.parse(cleanedJson || "{}") as T,
      tokensUsed: reply.usage?.total_tokens || 0,
    };
  };

  const generateHighlights = async (text: string) => {
    // Unfortunately hits the serverless limit, so cannot use this on free hosting
    // const res = await fetch("/api/text-chunking", {
    //   method: "POST",
    //   body: text,
    // });
    // const { data: chunks } = (await res.json()) as {
    //   data: {
    //     text: string;
    //     token_length: number;
    //   }[];
    // };

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10,
      chunkOverlap: 1,
    });

    const output = await splitter.splitDocuments([
      new Document({ pageContent: text }),
    ]);

    const enc = get_encoding("gpt2");

    const chunks = output.map((doc) => ({
      text: doc.pageContent,
      // estimate token length
      token_length: enc.encode(doc.pageContent).length,
    }));

    const giantChunks = chunks.slice(1).reduce((acc, chunk) => {
      const lastChunk = acc.at(-1)!;

      // around half of gemma2 context window
      const WORKING_TOKEN_LENGTH = 2000;
      if (lastChunk.token_length + chunk.token_length < WORKING_TOKEN_LENGTH) {
        const newChunk = {
          text: `${lastChunk.text}\n${chunk.text}`,
          token_length: lastChunk.token_length + chunk.token_length,
        };

        acc[acc.length - 1] = newChunk;

        return acc;
      } else {
        return [...acc, chunk];
      }
    }, chunks.slice(0, 1));

    const allQuotes = await Promise.all(
      giantChunks.map(async ({ text }) => {
        const { result, tokensUsed } = await processChunkWithSystem<{
          quotes: {
            original: string;
            suggestion: string;
          }[];
        }>(SYSTEM_PROMPT_PULL_QUOTES, text);

        setResult((prev) => ({
          ...prev,
          quotes: {
            data: [...prev.quotes.data, ...result.quotes],
            tokensUsed: prev.quotes.tokensUsed + tokensUsed,
          },
        }));

        return result;
      })
    );

    return {
      highlights: allQuotes.flatMap(({ quotes }) => quotes),
    };
  };

  const generateSummary = async (quotes: string[]) => {
    const { result, tokensUsed } = await processChunkWithSystem<{
      titles: string[];
      topics: string[];
      summary: string;
    }>(SYSTEM_PROMPT_SUMMARY, quotes.join("\n\n"));

    setResult((prev) => ({
      ...prev,
      summary: { ...result, tokensUsed },
    }));

    return result;
  };

  const processText = async (text: string) => {
    setSourceText(text);

    const { highlights } = await generateHighlights(text);

    const selectedQuotes = highlights.map((h) => h.suggestion);

    await generateSummary(selectedQuotes);
  };

  const trackProgress = async <T,>(func: () => Promise<T>) => {
    setIsProcessing(true);

    try {
      const res = await func();
      setIsProcessing(false);
      return res;
    } catch (e) {
      setIsProcessing(false);
      setError(String(e));
      throw e;
    }
  };

  return {
    error,
    sourceText: sourceText,
    isError: !!error,
    results: result,
    regenerateHighlights: isProcessing
      ? async () => {}
      : async () => {
          setResult((prev) => ({
            ...prev,
            quotes: { data: [], tokensUsed: 0 },
          }));

          await trackProgress(async () => {
            await generateHighlights(sourceText);
          });
        },
    regenerateSummary: isProcessing
      ? async () => {}
      : async () => {
          setResult((prev) => ({
            ...prev,
            summary: { titles: [], summary: "", topics: [], tokensUsed: 0 },
          }));

          await trackProgress(async () => {
            const quotes = result.quotes.data;

            const selectedQuotes = quotes.map(({ suggestion }) => suggestion);

            await generateSummary(selectedQuotes);
          });
        },
    processText: isProcessing
      ? ((async () => {}) as never)
      : ((async (text) => {
          setResult({
            quotes: { data: [], tokensUsed: 0 },
            summary: { titles: [], summary: "", topics: [], tokensUsed: 0 },
          });

          trackProgress(async () => {
            await processText(text);
          });
        }) as typeof processText),
    isProcessing,
  };
}
