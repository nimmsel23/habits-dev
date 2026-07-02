import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import Habits from "./views/Habits/index.jsx";

const qc = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        <header className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">VOS · Habits</div>
            <h1 className="text-base font-semibold text-slate-100">Tägliche Gewohnheiten</h1>
          </div>
        </header>
        <Habits />
      </div>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
