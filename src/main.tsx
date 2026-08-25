import { createRoot } from "react-dom/client";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import App from "./App.tsx";
import "./index.css";

const Fallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  // Extraction sécurisée du message et du stack trace
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <div className="min-h-screen w-full bg-black text-red-500 p-4 sm:p-8 font-mono flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full bg-red-950/20 border border-red-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 border-b border-red-500/20 pb-3">
          ⚠️ Quelque chose s'est mal passé
        </h1>
        
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <p className="text-red-400 font-semibold uppercase tracking-wider mb-1">Message :</p>
            <pre className="whitespace-pre-wrap break-words bg-black/50 p-3 rounded-lg border border-red-500/10">
              {errorMessage}
            </pre>
          </div>

          {errorStack && (
            <div>
              <p className="text-red-400 font-semibold uppercase tracking-wider mb-1">Stack Trace :</p>
              <pre className="whitespace-pre-wrap break-words max-h-60 overflow-y-auto bg-black/50 p-3 rounded-lg border border-red-500/10 text-[11px] leading-relaxed">
                {errorStack}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={resetErrorBoundary || (() => window.location.reload())}
          className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-sans font-semibold rounded-xl text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={Fallback}>
    <App />
  </ErrorBoundary>
);