"use client";

import { useNotifications } from "@/features/notifications/NotificationsProvider";
import { PoMAIAResult, usePoMAIA } from "@/features/pomaia/usePoMAIA";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { BsStars } from "react-icons/bs";
import { FiClipboard } from "react-icons/fi";

export default function Home() {
  const pomaia = usePoMAIA();

  const { handleSubmit, register } = useForm({
    defaultValues: {
      text: pomaia.sourceText,
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          handleSubmit(async (data) => {
            pomaia.processText(data.text);
          })(e);
        }}
      >
        <label className="form-control mx-auto max-w-7xl">
          <div className="label">
            <span className="label-text">
              Paste your content here, and let{" "}
              <span className="text-primary font-bold">PoMAIA</span> do
              it&apos;s magic
            </span>
          </div>

          <textarea
            className="textarea textarea-bordered text-lg"
            rows={12}
            {...register("text")}
          />
        </label>

        <div className="flex flex-row justify-center mt-8">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={pomaia.isProcessing}
          >
            {pomaia.isProcessing ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <BsStars size="1.2em" />
            )}
            {pomaia.isProcessing ? "Thinking..." : "PoMAIA magic"}
          </button>
        </div>
      </form>

      <div className="divider" />

      <SummarySection
        summary={pomaia.results.summary}
        className="mx-auto max-w-3xl"
        isProcessing={pomaia.isProcessing}
        onClickGenerateSummary={() => {
          pomaia.regenerateSummary();
        }}
      />

      <div className="divider" />

      <HighlightsSection
        quotes={pomaia.results.quotes}
        className="mx-auto max-w-3xl"
        isProcessing={pomaia.isProcessing}
        onClickGenerateHighlights={() => {
          pomaia.regenerateHighlights();
        }}
      />
    </>
  );
}

const SummarySection = ({
  summary,
  className,
  isProcessing,
  onClickGenerateSummary,
}: {
  summary: PoMAIAResult["summary"];
  className?: string;
  isProcessing?: boolean;
  onClickGenerateSummary?: () => void;
}) => {
  const hasResults = summary.tokensUsed !== 0;
  const isProcessingSummary = isProcessing && !hasResults;

  const { showNotification } = useNotifications();

  return (
    <div className={clsx("p-4", className)}>
      <h2 className="text-sm uppercase mb-4">Content Summary</h2>

      {hasResults ? (
        <div>
          <h3 className="text-xs uppercase mt-4">Topics</h3>

          <div className="flex flex-row gap-1 mt-1">
            {summary.topics.map((topic) => (
              <span className="badge badge-primary badge-sm" key={topic}>
                {topic}
              </span>
            ))}
          </div>

          <h3 className="text-xs uppercase mt-4 mb-1">Alternative titles</h3>
          <ul className="flex flex-col gap-1">
            {summary.titles.map((title) => (
              <li
                key={title}
                className="bg-slate-100 p-2 rounded-md flex flex-row"
              >
                <span className="flex-1">{title}</span>

                <button
                  className="btn btn-ghost btn-circle btn-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(title);
                    showNotification("Title copied to clipboard");
                  }}
                >
                  <FiClipboard size="1.2em" />
                </button>
              </li>
            ))}
          </ul>

          <h3 className="text-xs uppercase mt-4 mb-1">Description</h3>
          <p>{summary.summary}</p>
          <div className="flex flex-row justify-end">
            <button
              className="btn btn-outline btn-primary btn-xs"
              onClick={() => {
                navigator.clipboard.writeText(summary.summary);
                showNotification("Description copied to clipboard");
              }}
            >
              Copy to clipboard
            </button>
          </div>

          <div className="bg-slate-200 rounded-md p-2 text-sm mt-4">
            {summary.tokensUsed} token(s) used
          </div>

          <div className="flex flex-row justify-end mt-4">
            <button
              className="btn btn-xs btn-warning"
              onClick={() => {
                onClickGenerateSummary?.();
              }}
            >
              Regenerate summary
            </button>
          </div>
        </div>
      ) : isProcessingSummary ? (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-4 w-52" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      ) : (
        <div>
          <p className="italic opacity-80">
            No summary detected, generate a new one?
          </p>

          <div
            className="flex flex-row justify-center mt-4"
            onClick={() => {
              onClickGenerateSummary?.();
            }}
          >
            <button className="btn btn-primary btn-sm">Generate summary</button>
          </div>
        </div>
      )}
    </div>
  );
};

const HighlightsSection = ({
  quotes,
  className,
  isProcessing,
  onClickGenerateHighlights,
}: {
  quotes: PoMAIAResult["quotes"];
  className?: string;
  isProcessing?: boolean;
  onClickGenerateHighlights?: () => void;
}) => {
  const hasResults = quotes.tokensUsed !== 0;
  const isProcessingHighlights = !hasResults && isProcessing;

  const { showNotification } = useNotifications();

  return (
    <div className={clsx("p-4", className)}>
      <h2 className="text-sm uppercase mb-4">Highlights</h2>

      {hasResults ? (
        <div>
          <ul className="flex flex-col gap-4">
            {quotes.data.map(({ suggestion }) => (
              <li key={suggestion} className="flex flex-row gap-2">
                <span className="flex-1">{suggestion}</span>

                <button
                  className="btn btn-ghost btn-circle btn-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(suggestion);
                    showNotification("Highlight text copied to clipboard");
                  }}
                >
                  <FiClipboard size="1.2em" />
                </button>
              </li>
            ))}
          </ul>

          <div className="bg-slate-200 rounded-md p-2 text-sm mt-4">
            {quotes.tokensUsed} token(s) used
          </div>

          <div className="flex flex-row justify-end mt-4">
            <button
              className="btn btn-xs btn-warning"
              onClick={() => {
                onClickGenerateHighlights?.();
              }}
            >
              Regenerate highlights
            </button>
          </div>
        </div>
      ) : isProcessingHighlights ? (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      ) : (
        <div>
          <p className="italic opacity-80">
            No highlights detected, generate a new one?
          </p>

          <div
            className="flex flex-row justify-center mt-4"
            onClick={() => {
              onClickGenerateHighlights?.();
            }}
          >
            <button className="btn btn-primary btn-sm">
              Generate highlights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
