import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, Calendar, CheckCircle2, UserPlus, Send } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom inline SVG icons to prevent lucide-react brand dependency issues
const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface Teammate {
  id: string;
  name: string;
  year: string;
  branch: string;
  skills: string[];
  interests: string[];
  availability: string;
  github: string;
  linkedin: string;
  avatar: string;
  matchPercentage: number;
}

export const TeamFinder: React.FC = () => {
  const { theme } = useApp();
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTeammates = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/team-finder");
        if (res.ok) {
          const data = await res.json();
          setTeammates(data.teammates || []);
        } else {
          throw new Error("Failed");
        }
      } catch (err) {
        console.warn("Backend offline, loading fallback teammate matching database.");
        setTeammates([
          {
            id: "std_1",
            name: "Alex Rivera",
            year: "3rd Year",
            branch: "Computer Science & Engineering",
            skills: ["Python", "TensorFlow", "React", "Docker"],
            interests: ["AI/ML", "Web Development", "Hackathons"],
            availability: "10-15 hrs/week",
            github: "https://github.com/alexr",
            linkedin: "https://linkedin.com/in/alexr",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
            matchPercentage: 94
          },
          {
            id: "std_2",
            name: "Priya Sharma",
            year: "2nd Year",
            branch: "Information Technology",
            skills: ["Figma", "UI/UX", "Tailwind CSS", "JavaScript"],
            interests: ["Design Systems", "Web Development", "Startup Club"],
            availability: "5-10 hrs/week",
            github: "https://github.com/priyas",
            linkedin: "https://linkedin.com/in/priyas",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
            matchPercentage: 88
          },
          {
            id: "std_3",
            name: "Marcus Vance",
            year: "4th Year",
            branch: "Software Engineering",
            skills: ["Java", "Spring Boot", "PostgreSQL", "AWS"],
            interests: ["Backend Systems", "Distributed Databases", "Clubs"],
            availability: "15-20 hrs/week",
            github: "https://github.com/marcusv",
            linkedin: "https://linkedin.com/in/marcusv",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
            matchPercentage: 76
          },
          {
            id: "std_4",
            name: "Emily Chen",
            year: "3rd Year",
            branch: "Data Science",
            skills: ["R", "Python", "SQL", "Pandas", "Scikit-Learn"],
            interests: ["Data Analytics", "Quantitative Finance", "Research"],
            availability: "10 hrs/week",
            github: "https://github.com/emilyc",
            linkedin: "https://linkedin.com/in/emilyc",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120",
            matchPercentage: 82
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeammates();
  }, []);

  const handleConnect = (id: string, name: string) => {
    if (connectedIds.includes(id)) return;
    setConnectedIds([...connectedIds, id]);
    alert(`Connection request sent to ${name}!`);
  };

  const handleInvite = (id: string, name: string) => {
    if (invitedIds.includes(id)) return;
    setInvitedIds([...invitedIds, id]);
    alert(`Invited ${name} to join your hackathon team!`);
  };

  const filteredTeammates = teammates.filter((mate) => {
    const query = searchQuery.toLowerCase();
    return (
      mate.name.toLowerCase().includes(query) ||
      mate.skills.some((s) => s.toLowerCase().includes(query)) ||
      mate.interests.some((i) => i.toLowerCase().includes(query)) ||
      mate.branch.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Team Finder</h1>
        <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
          Find classmates with complementary skills to build hackathon projects, study groups, or campus startups.
        </p>
      </div>

      <div className={cn(
        "flex items-center px-3 py-2.5 rounded-xl border transition-colors max-w-lg",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800 focus-within:border-zinc-700" : "bg-white border-zinc-200 focus-within:border-zinc-400 shadow-sm"
      )}>
        <Search size={18} className="text-zinc-500 mr-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by skills, interests, branch, or name..."
          className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-zinc-500 text-zinc-100 focus:ring-0 focus:border-0"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 rounded-2xl border border-zinc-800 bg-zinc-800/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-zinc-800" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-zinc-800 rounded" />
                  <div className="h-3 w-36 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-zinc-800 rounded" />
              <div className="h-6 w-32 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredTeammates.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500">No teammates match your filters. Try search keywords like 'React' or 'Figma'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeammates.map((mate) => {
            const isConnected = connectedIds.includes(mate.id);
            const isInvited = invitedIds.includes(mate.id);
            return (
              <div
                key={mate.id}
                className={cn(
                  "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:border-zinc-700",
                  theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mate.avatar || "/placeholder.svg"}
                        alt={mate.name}
                        className="size-12 rounded-full object-cover border border-zinc-700/20"
                      />
                      <div>
                        <h3 className="font-bold text-base">{mate.name}</h3>
                        <p className={cn("text-xs", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
                          {mate.year} • {mate.branch}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 font-bold shrink-0">
                      {mate.matchPercentage}% Compat
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Skills</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {mate.skills.map((s) => (
                          <span
                            key={s}
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 rounded-full font-semibold",
                              theme === "dark" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-650"
                            )}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Interests</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {mate.interests.map((i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/5 text-amber-500 border border-amber-500/10"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs text-zinc-500 gap-2">
                    <Calendar size={12} />
                    <span>Availability: {mate.availability}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/10 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <a
                      href={mate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-800 flex items-center justify-center"
                    >
                      <GithubIcon />
                    </a>
                    <a
                      href={mate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-800 flex items-center justify-center"
                    >
                      <LinkedinIcon />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnect(mate.id, mate.name)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all",
                        isConnected
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30 cursor-default"
                          : theme === "dark"
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-350 border-zinc-700"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      )}
                    >
                      {isConnected ? <CheckCircle2 size={12} className="text-emerald-400" /> : <UserPlus size={12} />}
                      {isConnected ? "Connected" : "Connect"}
                    </button>

                    <button
                      onClick={() => handleInvite(mate.id, mate.name)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors",
                        isInvited
                          ? "bg-zinc-800 text-zinc-500 cursor-default"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      )}
                      disabled={isInvited}
                    >
                      {isInvited ? <CheckCircle2 size={12} className="text-zinc-500" /> : <Send size={12} />}
                      {isInvited ? "Invited" : "Invite to Team"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
