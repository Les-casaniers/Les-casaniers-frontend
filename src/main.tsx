import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App.tsx";
import "./index.css";

const Fallback = ({ error }: { error: Error }) => (
  <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
    <h1>Quelque chose s'est mal passé.</h1>
    <pre>{error.message}</pre>
    <pre>{error.stack}</pre>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={Fallback}>
    <App />
  </ErrorBoundary>
);
