import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, DollarSign, Calendar, Sparkles, Filter, Briefcase, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  compensation: string;
  type: string;
  category: string;
  source: string;
  matchScore: number;
}

export const Opportunities: React.FC = () => {
  const { theme, applyToOpportunity } = useApp();
  const [opps, setOpps] = useState<JobOpportunity[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Software Engineering", "Web Development", "Data Science & AI", "UI/UX Design", "Marketing & Sales", "Human Resources"];
  const locations = ["All", "Remote", "Bangalore", "Mumbai", "Delhi", "United States", "Gurgaon"];

  const fetchOpps = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/opportunities?page=${page}&limit=12`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (selectedCategory && selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedLocation && selectedLocation !== "All") url += `&location=${encodeURIComponent(selectedLocation)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOpps(data.opportunities || []);
        setTotal(data.total || 0);
      } else {
        throw new Error("Failed to load");
      }
    } catch (err) {
      console.warn("Backend opportunities offline, loading offline search mock dataset.");
      
      // Fallback Mock Data containing standard listings matched locally
      const mockDatabase: JobOpportunity[] = [
        {
          id: "sal_2",
          title: "Data Engineer Intern",
          company: "ghSMART",
          location: "Remote",
          compensation: "$20.00 - $30.00 / Hour",
          type: "Internship",
          category: "Data Science & AI",
          source: "Data_Salaries.csv",
          matchScore: 95
        },
        {
          id: "sal_4",
          title: "2025 Summer Intern: eCommerce Data Science",
          company: "PepsiCo",
          location: "United States",
          compensation: "$21.50 - $40.19 Per Hour",
          type: "Internship",
          category: "Data Science & AI",
          source: "Data_Salaries.csv",
          matchScore: 92
        },
        {
          id: "int_54",
          title: "Node.js Development Intern",
          company: "Across The Globe (ATG)",
          location: "Work From Home",
          compensation: "₹ 2,500 /month + Incentives",
          type: "Internship",
          category: "Web Development",
          source: "internship.csv",
          matchScore: 88
        },
        {
          id: "int_56",
          title: "Web Development (Frontend) Intern",
          company: "Across The Globe (ATG)",
          location: "Work From Home",
          compensation: "₹ 2,500-7,500 /month",
          type: "Internship",
          category: "Web Development",
          source: "internship.csv",
          matchScore: 89
        },
        {
          id: "int_70",
          title: "UI Design Intern",
          company: "Pepperfry",
          location: "Mumbai",
          compensation: "₹ 20,000-25,000 /month",
          type: "Internship",
          category: "UI/UX Design",
          source: "internship.csv",
          matchScore: 82
        },
        {
          id: "int_78",
          title: "Content Writing Intern",
          company: "LeadSquared",
          location: "Bangalore",
          compensation: "₹ 20,000 /month",
          type: "Internship",
          category: "Marketing & Sales",
          source: "internship.csv",
          matchScore: 78
        },
        {
          id: "sal_11",
          title: "Data & AI Intern",
          company: "Copart",
          location: "Dallas, TX",
          compensation: "$57K - $86K",
          type: "Internship",
          category: "Data Science & AI",
          source: "Data_Salaries.csv",
          matchScore: 86
        },
        {
          id: "int_109",
          title: "Graphic Design Intern",
          company: "Educate Girls",
          location: "Mumbai",
          compensation: "₹ 12,000-15,000 /month",
          type: "Internship",
          category: "UI/UX Design",
          source: "internship.csv",
          matchScore: 75
        }
      ];

      // Client side filtering for fallback
      let filtered = [...mockDatabase];
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(q) || 
          item.company.toLowerCase().includes(q) || 
          item.location.toLowerCase().includes(q)
        );
      }
      if (selectedCategory && selectedCategory !== "All") {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
      if (selectedLocation && selectedLocation !== "All") {
        if (selectedLocation.toLowerCase() === "remote") {
          filtered = filtered.filter(item => 
            item.location.toLowerCase().includes("remote") || 
            item.location.toLowerCase().includes("work from home")
          );
        } else {
          filtered = filtered.filter(item => item.location.toLowerCase().includes(selectedLocation.toLowerCase()));
        }
      }

      setOpps(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, [page, selectedCategory, selectedLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOpps();
  };

  const handleApply = (opp: JobOpportunity) => {
    applyToOpportunity(opp.id, opp.title, opp.company, opp.type, opp.compensation, opp.location);
    alert(`Applied!\nSubmitted application for "${opp.title}" at ${opp.company}. You can track this in your Dashboard.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Explore Opportunities</h1>
        <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
          Find college internships, research programs, scholarships, and freelance contracts indexed semantically.
        </p>
      </div>

      {/* Search and Filter Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        <div className={cn(
          "flex-1 flex items-center px-3 py-2.5 rounded-xl border transition-colors",
          theme === "dark" ? "bg-[#1e1e1d] border-zinc-800 focus-within:border-zinc-700" : "bg-white border-zinc-200 focus-within:border-zinc-400 shadow-sm"
        )}>
          <Search size={18} className="text-zinc-500 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles, skills, or companies (e.g. React, PepsiCo, Remote)..."
            className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-zinc-500 text-zinc-100 focus:ring-0 focus:border-0"
          />
        </div>

        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="space-y-4">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scroll-bar">
          <Filter size={14} className="text-zinc-500 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-amber-600 text-white"
                  : theme === "dark"
                    ? "bg-zinc-850 text-zinc-400 hover:bg-zinc-800"
                    : "bg-white text-zinc-650 border border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scroll-bar">
          <MapPin size={14} className="text-zinc-500 shrink-0" />
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setSelectedLocation(loc);
                setPage(1);
              }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap",
                selectedLocation === loc
                  ? "bg-zinc-800 text-amber-500 border border-amber-500/20"
                  : theme === "dark"
                    ? "bg-zinc-850 text-zinc-400 hover:bg-zinc-800"
                    : "bg-white text-zinc-650 border border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 rounded-2xl border border-zinc-800 bg-zinc-800/10 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded" />
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-zinc-800 rounded" />
                <div className="h-8 w-20 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : opps.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <Briefcase size={40} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-md font-bold">No opportunities matched</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, location filters, or category tabs to find more listings.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("All");
              setSelectedLocation("All");
            }}
            className="mt-4 bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-zinc-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opps.map((opp) => (
              <div
                key={opp.id}
                className={cn(
                  "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px]",
                  theme === "dark"
                    ? "bg-[#1e1e1d] border-zinc-800 hover:border-zinc-750"
                    : "bg-white border-zinc-150 shadow-sm hover:shadow-md"
                )}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={cn(
                      "text-[10px] px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider",
                      theme === "dark" ? "bg-zinc-850 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                    )}>
                      {opp.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-500 flex items-center gap-1">
                      <Sparkles size={10} className="animate-pulse" />
                      {opp.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-2 leading-snug">{opp.title}</h3>
                  <p className={cn("text-xs mt-1 font-medium", theme === "dark" ? "text-zinc-400" : "text-zinc-650")}>
                    {opp.company}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs text-zinc-500 gap-2">
                      <MapPin size={12} />
                      <span className="truncate">{opp.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-zinc-500 gap-2">
                      <DollarSign size={12} />
                      <span>{opp.compensation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/10 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-zinc-500 font-medium">Source: {opp.source}</span>
                  <button
                    onClick={() => handleApply(opp)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Pagination */}
          {total > 12 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 disabled:opacity-50 text-xs font-semibold hover:bg-zinc-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-500">Page {page} of {Math.ceil(total / 12)}</span>
              <button
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 disabled:opacity-50 text-xs font-semibold hover:bg-zinc-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
