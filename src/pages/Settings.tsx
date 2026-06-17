import React from "react";
import { useApp } from "@/context/AppContext";
import { Settings as SettingsIcon, Shield, Server, Database, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Settings: React.FC = () => {
  const { theme } = useApp();

  const handleResetDB = () => {
    alert("Triggered database re-indexing! ChromaDB/SimpleVectorStore is reloading the CSV datasets in the background.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
          Adjust AI models, configure backend servers, and manage system index definitions.
        </p>
      </div>

      <div className={cn(
        "p-6 rounded-2xl border space-y-6",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      )}>
        
        {/* API Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-amber-500" />
            <h2 className="text-base font-bold">Backend Configuration</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">FastAPI Server URL</label>
              <input
                type="text"
                value="http://localhost:8000"
                disabled
                className="w-full mt-1.5 px-3 py-2 rounded bg-zinc-800/50 border border-zinc-800 text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">ASI:One Agent Completion Endpoint</label>
              <input
                type="text"
                value="https://api.asi1.ai/v1/chat/completions"
                disabled
                className="w-full mt-1.5 px-3 py-2 rounded bg-zinc-800/50 border border-zinc-800 text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Database Index Settings */}
        <div className="border-t border-zinc-800/10 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-amber-500" />
            <h2 className="text-base font-bold">Vector Database Index</h2>
          </div>
          
          <p className="text-xs text-zinc-500 leading-relaxed">
            OpportunityOS caches indexed vector representations of `internship.csv` and `Data_Salaries.csv` using a local persistent SentenceTransformer store (`all-MiniLM-L6-v2`).
          </p>

          <button
            onClick={handleResetDB}
            className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            Re-index Datasets
          </button>
        </div>

        {/* Privacy Shield */}
        <div className="border-t border-zinc-800/10 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-500" />
            <h2 className="text-base font-bold">Privacy & Security</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Local Anonymized Vector Indexing</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Resume analysis and matching coordinates are performed locally inside the sandbox.</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">ENABLED</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};
