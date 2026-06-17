import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Compass, Users, UserPlus, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Club {
  id: string;
  name: string;
  description: string;
  positions: string[];
  logo: string;
  membersCount: number;
}

export const Clubs: React.FC = () => {
  const { theme } = useApp();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedClubIds, setAppliedClubIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/clubs");
        if (res.ok) {
          const data = await res.json();
          setClubs(data.clubs || []);
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Backend clubs API offline, loading offline fallback.");
        setClubs([
          {
            id: "club_1",
            name: "AI & Robotics Club",
            description: "Building autonomous bots and deep learning projects. Participate in RoboCon and regional AI hackathons.",
            positions: ["Deep Learning Lead", "Hardware Engineer", "Social Media Executive"],
            logo: "🤖",
            membersCount: 65
          },
          {
            id: "club_2",
            name: "Developer Syndicate",
            description: "A community of full-stack developers building open-source projects and helping college startups ship products.",
            positions: ["React Specialist", "Backend Dev (Go/Python)", "UX Architect"],
            logo: "💻",
            membersCount: 120
          },
          {
            id: "club_3",
            name: "Finance & Quantitative Club",
            description: "Algorithmic trading, financial modeling, and investment case studies. Host of the annual TradeQuest event.",
            positions: ["Quantitative Analyst", "Marketing Coordinator", "Treasury Assistant"],
            logo: "📈",
            membersCount: 42
          },
          {
            id: "club_4",
            name: "Women in Tech Association",
            description: "Empowering underrepresented groups in computer science through mentorship programs, industry speakers, and workshops.",
            positions: ["Mentorship Program Coordinator", "Event Manager", "Content Specialist"],
            logo: "👩‍💻",
            membersCount: 85
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handleApply = (clubId: string, name: string) => {
    if (appliedClubIds.includes(clubId)) return;
    setAppliedClubIds([...appliedClubIds, clubId]);
    alert(`Application successfully submitted for ${name}! The club board will review your profile shortly.`);
  };

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.positions.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Club Recruitment</h1>
        <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
          Join active college organizations, apply for leadership positions, and find student chapters that match your interests.
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
          placeholder="Filter by club name, role or topic..."
          className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-zinc-500 text-zinc-100"
        />
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 rounded-2xl border border-zinc-800 bg-zinc-800/10 space-y-4">
              <div className="h-6 w-32 bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-zinc-800 rounded" />
              <div className="h-10 w-24 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500">No clubs found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map((club) => {
            const hasApplied = appliedClubIds.includes(club.id);
            return (
              <div
                key={club.id}
                className={cn(
                  "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:border-zinc-750",
                  theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <div>
                  <div className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
                        {club.logo}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{club.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                          <Users size={12} />
                          <span>{club.membersCount} active members</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className={cn("text-xs leading-relaxed mb-6", theme === "dark" ? "text-zinc-400" : "text-zinc-600")}>
                    {club.description}
                  </p>

                  {/* Positions Recruiting */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Open Board Roles</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {club.positions.map((pos) => (
                        <span
                          key={pos}
                          className="text-[10px] px-2.5 py-1 rounded bg-amber-500/5 text-amber-500 border border-amber-500/10 font-medium"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/10 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-semibold">Active Recruitment</span>
                  <button
                    onClick={() => handleApply(club.id, club.name)}
                    className={cn(
                      "text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all",
                      hasApplied
                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 cursor-default"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    )}
                  >
                    {hasApplied ? <CheckCircle size={12} /> : <UserPlus size={12} />}
                    {hasApplied ? "Applied" : "Apply for Positions"}
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
