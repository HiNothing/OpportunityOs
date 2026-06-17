import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Search,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  compensation: string;
  matchScore: number;
  category: string;
}

export const Dashboard: React.FC = () => {
  const { theme, profile, applications, setActiveTab, applyToOpportunity } = useApp();
  const [recommendations, setRecommendations] = useState<RecOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recommendations from FastAPI
  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/recommend");
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations || []);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (err) {
        console.warn("Backend recommendations offline, using offline RAG fallback.");
        // High fidelity fallback matching student's default skills (React, Python)
        setRecommendations([
          {
            id: "sal_4",
            title: "2025 Summer Intern: eCommerce Data Science",
            company: "PepsiCo",
            location: "United States",
            compensation: "$21.50 - $40.19 Per Hour",
            matchScore: 92,
            category: "Data Science & AI"
          },
          {
            id: "int_56",
            title: "Web Development (Frontend)",
            company: "Across The Globe (ATG)",
            location: "Work From Home",
            compensation: "₹ 2,500-7,500 /month",
            matchScore: 89,
            category: "Web Development"
          },
          {
            id: "sal_11",
            title: "Data Scientist Intern",
            company: "Copart",
            location: "Dallas, TX",
            compensation: "$57K - $86K",
            matchScore: 86,
            category: "Data Science & AI"
          },
          {
            id: "int_123",
            title: "Graphic Design Intern",
            company: "CIIE Initiatives (IIM Ahmedabad)",
            location: "Ahmedabad",
            compensation: "₹ 10,000 /month",
            matchScore: 78,
            category: "UI/UX Design"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  const deadlines = [
    { title: "AI Engineering Intern", company: "Sapna NYC Inc.", date: "June 25, 2026", daysLeft: 8 },
    { title: "2025 Tech Summer Internship", company: "Macquarie Group", date: "June 30, 2026", daysLeft: 13 },
    { title: "Paid Research Assistant", company: "Dr. Thorne (HCI)", date: "July 05, 2026", daysLeft: 18 }
  ];

  const handleApplyClick = (opp: RecOpportunity) => {
    applyToOpportunity(opp.id, opp.title, opp.company, "Internship", opp.compensation, opp.location);
    alert(`Applied! added "${opp.title}" to your Applications Tracker.`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile.name} 👋
          </h1>
          <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
            Your AI Career GPS is tracking 4 active applications and finding new matching roles.
          </p>
        </div>
        
        <button
          onClick={() => setActiveTab("mentors")}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
        >
          <Sparkles size={14} />
          Consult AI Mentor
        </button>
      </div>

      {/* Top Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Match Score Gauge Widget */}
        <div className={cn(
          "p-6 rounded-2xl border flex flex-col items-center justify-center text-center",
          theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <span className={cn("text-sm font-semibold mb-4", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
            Overall Opportunity Fit
          </span>
          <div className="relative size-32 flex items-center justify-center mb-2">
            <svg className="size-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className={theme === "dark" ? "stroke-zinc-800" : "stroke-zinc-100"}
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-amber-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - 0.94)} // 94% score
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight">94%</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Match Score</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 max-w-xs mt-2">
            High overlap in **React**, **Javascript**, and **Python** projects is pushing your ranking up.
          </p>
        </div>

        {/* Analytics Line Chart Widget */}
        <div className={cn(
          "p-6 rounded-2xl border md:col-span-2 flex flex-col justify-between",
          theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-500" />
              <span className="text-sm font-semibold">Weekly Match Inquiries</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Last 6 Weeks</span>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="h-32 w-full mt-2 relative">
            <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke={theme === "dark" ? "#27272a" : "#f4f4f5"} strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="400" y2="70" stroke={theme === "dark" ? "#27272a" : "#f4f4f5"} strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="400" y2="110" stroke={theme === "dark" ? "#27272a" : "#f4f4f5"} strokeDasharray="3 3" />
              {/* Area */}
              <path
                d="M 0 110 Q 50 100, 80 85 T 160 55 T 240 75 T 320 35 T 400 20 L 400 120 L 0 120 Z"
                fill="url(#chartArea)"
              />
              {/* Line */}
              <path
                d="M 0 110 Q 50 100, 80 85 T 160 55 T 240 75 T 320 35 T 400 20"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Dots */}
              <circle cx="80" cy="85" r="4" fill="#d97706" />
              <circle cx="160" cy="55" r="4" fill="#d97706" />
              <circle cx="240" cy="75" r="4" fill="#d97706" />
              <circle cx="320" cy="35" r="4" fill="#d97706" />
              <circle cx="400" cy="20" r="4" fill="#d97706" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold uppercase mt-4">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6 (Active)</span>
          </div>
        </div>
      </div>

      {/* Bottom Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recommended Opportunities List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold tracking-tight">AI Recommended Opportunities</h2>
            <button
              onClick={() => setActiveTab("opportunities")}
              className="text-xs text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-1"
            >
              See all
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-800/10">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-zinc-800 rounded" />
                    <div className="h-3 w-32 bg-zinc-800 rounded" />
                  </div>
                  <div className="h-8 w-16 bg-zinc-800 rounded" />
                </div>
              ))
            ) : recommendations.length === 0 ? (
              <div className="text-center p-8 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                No matching opportunities found. Try updating your skills in the profile.
              </div>
            ) : (
              recommendations.map((opp) => (
                <div
                  key={opp.id}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.005]",
                    theme === "dark"
                      ? "bg-[#1e1e1d] border-zinc-800 hover:border-zinc-700"
                      : "bg-white border-zinc-200 hover:shadow-sm"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider",
                        theme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {opp.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-500">
                        {opp.matchScore}% Match
                      </span>
                    </div>
                    <h3 className="font-bold text-sm truncate">{opp.title}</h3>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {opp.company} • {opp.location}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap">{opp.compensation}</span>
                    <button
                      onClick={() => handleApplyClick(opp)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Columns: Tracker + Deadlines */}
        <div className="space-y-6">
          {/* Applications Tracker */}
          <div className={cn(
            "p-6 rounded-2xl border",
            theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold tracking-tight uppercase text-zinc-500">Applications Tracker</h2>
              <FileCheck size={16} className="text-amber-500" />
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No active applications. Select "Apply" on matching opportunities.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app, idx) => (
                  <div key={app.id} className="relative pl-6 pb-2 border-l border-zinc-800 last:border-0 last:pb-0">
                    {/* Bullet marker */}
                    <div className={cn(
                      "absolute left-[-5px] top-1.5 size-2.5 rounded-full border",
                      app.status === "interviewing"
                        ? "bg-amber-500 border-amber-600 animate-pulse"
                        : app.status === "offered"
                          ? "bg-emerald-500 border-emerald-600"
                          : "bg-blue-500 border-blue-600"
                    )} />
                    <p className="text-xs font-bold truncate leading-tight">{app.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{app.company}</p>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-zinc-500 font-semibold">{app.appliedDate}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-semibold capitalize",
                        app.status === "interviewing"
                          ? "bg-amber-500/15 text-amber-500"
                          : app.status === "offered"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-blue-500/15 text-blue-500"
                      )}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className={cn(
            "p-6 rounded-2xl border",
            theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold tracking-tight uppercase text-zinc-500">Upcoming Deadlines</h2>
              <Calendar size={16} className="text-amber-500" />
            </div>

            <div className="space-y-3.5">
              {deadlines.map((dl, i) => (
                <div key={i} className="flex justify-between items-start gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold truncate leading-tight">{dl.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{dl.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-amber-500 whitespace-nowrap">{dl.daysLeft} days left</span>
                    <p className="text-[9px] text-zinc-500 whitespace-nowrap mt-0.5">{dl.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
