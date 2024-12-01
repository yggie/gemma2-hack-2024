"use client";

import { MLCEngine } from "@mlc-ai/web-llm";
import clsx from "clsx";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const FETCHING_MSG_REGEX =
  /Fetching param cache\[(\d+)\/(\d+)\]:\s+(\d+)MB[^\d]+(\d+)%/;
const LOADING_FROM_CACHE_MSG_REGEX =
  /Loading model from cache\[(\d+)\/(\d+)\]:/;
const GPU_MSG_REGEX = /Loading GPU shader modules\[(\d+)\/(\d+)\]:/;

export interface WebLLMChatProviderValue {
  engine: MLCEngine;
  isLoading: boolean;
  detailedProgress: WebLLMDetailedLoadingProgress;
}

const WebLLMChatContext = createContext<WebLLMChatProviderValue>(0 as never);

export interface WebLLMChatProviderProps {
  children: ReactNode;
}

export interface LoadingProgress {
  progress: number;
  total: number;
}

export interface WebLLMDetailedLoadingProgress {
  downloading: LoadingProgress;
  cache: LoadingProgress;
  gpu: LoadingProgress;
}

export const WebLLMProvider = ({ children }: WebLLMChatProviderProps) => {
  const [engine, setEngine] = useState<MLCEngine>();

  const engineRef = useRef<MLCEngine>();
  engineRef.current = engine;

  const [loadingProgress, setLoadingProgress] =
    useState<WebLLMDetailedLoadingProgress>({
      downloading: { total: 0, progress: 0 },
      cache: { total: 0, progress: 0 },
      gpu: { total: 0, progress: 0 },
    });

  useEffect(() => {
    if (engineRef.current) return;

    main();

    async function main() {
      const engine = new MLCEngine({
        initProgressCallback: (progress) => {
          const fetchProgressMatch = progress.text.match(FETCHING_MSG_REGEX);

          if (fetchProgressMatch) {
            setLoadingProgress((prev) => ({
              ...prev,
              downloading: {
                progress: Number(fetchProgressMatch[1]),
                total: Number(fetchProgressMatch[2]),
              },
            }));
            return;
          }

          const fromCacheProgressMatch = progress.text.match(
            LOADING_FROM_CACHE_MSG_REGEX
          );

          if (fromCacheProgressMatch) {
            setLoadingProgress((prev) => ({
              ...prev,
              cache: {
                progress: Number(fromCacheProgressMatch[1]),
                total: Number(fromCacheProgressMatch[2]),
              },
            }));
          }

          const shaderModulesMatch = progress.text.match(GPU_MSG_REGEX);

          if (shaderModulesMatch) {
            setLoadingProgress((prev) => ({
              ...prev,
              gpu: {
                progress: Number(shaderModulesMatch[1]),
                total: Number(shaderModulesMatch[2]),
              },
            }));
          }
        },
      });
      setEngine(engine);

      // see https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
      await engine.reload("gemma-2-9b-it-q4f32_1-MLC");
    }
  }, []);

  const isLoading =
    loadingProgress.gpu.total === 0 ||
    loadingProgress.gpu.progress !== loadingProgress.gpu.total;

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <WebLLMLoadingProgress
          detail={loadingProgress}
          className="w-full max-w-md"
        />
      </div>
    );

  return (
    <WebLLMChatContext.Provider
      value={{
        engine: engine!,
        isLoading,
        detailedProgress: loadingProgress,
      }}
    >
      {children}
    </WebLLMChatContext.Provider>
  );
};

const WebLLMLoadingProgress = ({
  detail,
  className,
}: {
  detail: WebLLMDetailedLoadingProgress;
  className?: string;
}) => {
  const currentPhase = detail.gpu.progress
    ? "gpu"
    : detail.cache.progress
    ? "cache"
    : "download";

  const progressFraction =
    currentPhase === "gpu"
      ? detail.gpu.progress / detail.gpu.total
      : currentPhase === "cache"
      ? detail.cache.progress / detail.cache.total
      : detail.downloading.progress / detail.downloading.total;

  const progressValue = Number.isFinite(progressFraction)
    ? progressFraction * 100
    : 0;

  const phaseMessage =
    currentPhase === "gpu"
      ? "[3/3] Loading shader modules"
      : currentPhase === "cache"
      ? "[2/3] Loading from cache"
      : detail.downloading.total === 0
      ? "Initializing..."
      : "[1/3] Downloading resources";

  const phaseProgressText =
    currentPhase === "gpu"
      ? `${detail.gpu.progress}/${detail.gpu.total}`
      : currentPhase === "cache"
      ? `${detail.cache.progress}/${detail.cache.total}`
      : detail.downloading.total === 0
      ? ""
      : `${detail.downloading.progress}/${detail.downloading.total}`;

  return (
    <div className={clsx("p-8 flex flex-col gap-2", className)}>
      <div className="flex flex-row justify-between text-sm">
        <span>{phaseMessage}</span>

        <span>{phaseProgressText}</span>
      </div>

      <progress
        className="progress progress-primary w-full"
        value={progressValue}
        max={100}
      />
    </div>
  );
};

export function useWebLLMEngine() {
  return useContext(WebLLMChatContext);
  // const { engine } = useContext(WebLLMChatContext);

  // const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
  //   { role: "system", content: systemMessage },
  // ]);

  // useEffect(() => {
  //   engine.chat.completions.create({ messages });
  // }, [engine, messages]);

  // return {
  //   sendMessage: (message: ChatCompletionMessageParam) => {
  //     setMessages((prev) => [...prev, message]);
  //   },
  // };
}
