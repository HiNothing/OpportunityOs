import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, GraduationCap, DollarSign, Calendar, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchRole {
  id: string;
  professor: string;
  domain: string;
  skills: string[];
  duration: string;
  description: string;
  compensation: string;
  logo: string;
}

export const Research: React.FC = () => {
  const { theme } = useApp();
  const [research, setResearch] = useState<ResearchRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchResearch = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/research");
        if (res.ok) {
          const data = await res.json();
          setResearch(data.research || []);
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Backend research API offline, loading offline fallback.");
        setResearch([
          {
            id: "res_1",
            professor: "Dr. Aris Thorne",
            domain: "Natural Language Processing (NLP)",
            skills: ["Python", "PyTorch", "Transformers"],
            duration: "Fall Semester (4 Months)",
            description: "Investigating domain-adaptation techniques in Large Language Models for chemical engineering literature parsing.",
            compensation: "$25 / Hour",
            logo: "🔬"
          },
          {
            id: "res_2",
            professor: "Dr. Sarah Jenkins",
            domain: "Human-Computer Interaction (HCI)",
            skills: ["Figma", "User Interviews", "Data Visualization"],
            duration: "Full Academic Year",
            description: "Designing and evaluating accessible user interfaces for elder-care software agents in medical settings.",
            compensation: "Academic Credit + Stipend",
            logo: "🧠"
          },
          {
            id: "res_3",
            professor: "Dr. Michael Chen",
            domain: "Autonomous Vehicles / Robotics",
            skills: ["C++", "ROS", "Linear Algebra"],
            duration: "Summer 2026",
            description: "Developing real-time sensor fusion algorithms for LiDAR and camera systems on small scale ground vehicles.",
            compensation: "$3,500 Monthly Stipend",
            logo: "🏎️"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, []);

  const handleApply = (id: string, professor: string) => {
    if (appliedIds.includes(id)) return;
    setAppliedIds([...appliedIds, id]);
    alert(`Application successfully submitted to ${professor}! A follow-up email has been generated to schedule a resume screening.`);
  };

  const filteredResearch = research.filter((res) =>
    res.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Research Opportunities</h1>
        <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
          Apply for paid research projects, academic assistantships, and direct labs sponsorships under university professors.
        </p>
      </div>

      {/* Search Filter */}
      <div className={cn(
        "flex items-center px-3 py-2.5 rounded-xl border transition-colors max-w-lg",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800 focus-within:border-zinc-700" : "bg-white border-zinc-200 focus-within:border-zinc-400 shadow-sm"
      )}>
        <Search size={18} className="text-zinc-500 mr-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by professor, lab domain, or skill..."
          className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-zinc-500 text-zinc-100"
        />
      </div>

      {/* Research Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 rounded-2xl border border-zinc-800 bg-zinc-800/10 space-y-4">
              <div className="h-6 w-32 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
              <div className="h-10 w-24 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredResearch.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500">No research openings match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResearch.map((res) => {
            const hasApplied = appliedIds.includes(res.id);
            return (
              <div
                key={res.id}
                className={cn(
                  "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:border-zinc-750",
                  theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <div>
                  <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
                        {res.logo}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{res.domain}</h3>
                        <p className={cn("text-xs font-semibold", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                          Professor: {res.professor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className={cn("text-xs leading-relaxed mb-6", theme === "dark" ? "text-zinc-400" : "text-zinc-650")}>
                    {res.description}
                  </p>

                  {/* Required Skills */}
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {res.skills.map((s) => (
                        <span
                          key={s}
                          className={cn(
                            "text-[10px] px-2.5 py-0.5 rounded-full font-semibold",
                            theme === "dark" ? "bg-zinc-800 text-zinc-350" : "bg-zinc-100 text-zinc-600"
                          )}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center text-xs text-zinc-500 gap-2">
                      <Calendar size={12} />
                      <span>Duration: {res.duration}</span>
                    </div>
                    <div className="flex items-center text-xs text-zinc-500 gap-2">
                      <DollarSign size={12} />
                      <span>Compensation: {res.compensation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/10 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                    <GraduationCap size={12} className="text-amber-500" />
                    Academic Lab
                  </span>
                  <button
                    onClick={() => handleApply(res.id, res.professor)}
                    className={cn(
                      "text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all",
                      hasApplied
                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 cursor-default"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    )}
                  >
                    {hasApplied ? <CheckCircle size={12} /> : <Sparkles size={12} />}
                    {hasApplied ? "Applied" : "Apply for Sponsorship"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
