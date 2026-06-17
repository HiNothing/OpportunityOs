import React, { useState, useEffect } from "react";
import { AppProvider, useApp, TabType } from "@/context/AppContext";
import { Dashboard } from "@/pages/Dashboard";
import { Opportunities } from "@/pages/Opportunities";
import { TeamFinder } from "@/pages/TeamFinder";
import { Clubs } from "@/pages/Clubs";
import { Research } from "@/pages/Research";
import { Profile } from "@/pages/Profile";
import { Settings } from "@/pages/Settings";
import { ClaudeChatInput, FileWithPreview, PastedContent } from "@/components/ui/claude-style-ai-input";
import {
  Menu,
  Sparkles,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Compass,
  Cpu,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MatchingOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  compensation: string;
  matchScore: number;
  category: string;
  type?: string;
}

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    profile,
    applyToOpportunity,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matchingOpps, setMatchingOpps] = useState<MatchingOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(() => `session_${Date.now()}`);
  
  // Artifact Workspace state
  const [artifactOpen, setArtifactOpen] = useState(true);
  const [artifactExpanded, setArtifactExpanded] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Restart chat
  const handleNewChat = () => {
    setMessages([]);
    setMatchingOpps([]);
    setConvId(`session_${Date.now()}`);
    setArtifactOpen(true);
    setArtifactExpanded(false);
    setActiveTab("dashboard");
  };

  const handleSuggestionClick = (text: string, tab: TabType) => {
    setActiveTab(tab);
    setArtifactOpen(true);
    handleSendMessage(text, [], []);
  };

  const handleSendMessage = async (
    messageText: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => {
    if (!messageText.trim() && files.length === 0 && pastedContent.length === 0) return;

    const userMessageContent = messageText.trim()
      ? messageText
      : `Sent ${files.length} attached files.`;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: userMessageContent,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const msgLower = userMessageContent.toLowerCase();

    // Smart keyword routing - ordered from most specific to least
    // IMPORTANT: internship/job/opportunity must come BEFORE generic words like "find"
    if (
      msgLower.includes("internship") ||
      msgLower.includes("job") ||
      msgLower.includes("opportunity") ||
      msgLower.includes("opportunities") ||
      msgLower.includes("salaries") ||
      msgLower.includes("salary") ||
      msgLower.includes("remote") ||
      msgLower.includes("hiring") ||
      msgLower.includes("apply") ||
      msgLower.includes("role") ||
      msgLower.includes("position")
    ) {
      setActiveTab("opportunities");
    } else if (
      msgLower.includes("teammate") ||
      msgLower.includes("team member") ||
      msgLower.includes("classmate") ||
      msgLower.includes("hackathon team") ||
      msgLower.includes("find a team") ||
      msgLower.includes("team finder")
    ) {
      setActiveTab("team-finder");
    } else if (
      (msgLower.includes("team") && (msgLower.includes("build") || msgLower.includes("form") || msgLower.includes("assemble") || msgLower.includes("need")))
    ) {
      setActiveTab("team-finder");
    } else if (msgLower.includes("club") || msgLower.includes("recruitment") || msgLower.includes("society")) {
      setActiveTab("clubs");
    } else if (msgLower.includes("research") || msgLower.includes("professor") || msgLower.includes("lab")) {
      setActiveTab("research");
    } else if (msgLower.includes("profile") || msgLower.includes("resume") || msgLower.includes("skills") || msgLower.includes("cv")) {
      setActiveTab("profile");
    }

    setArtifactOpen(true);

    // Call FastAPI backend
    const apiMessages = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conv_id: convId,
          messages: apiMessages,
          profile: profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        setMessages(prev => [...prev, {
          id: `msg_asst_${Date.now()}`,
          role: "assistant",
          content: data.text || "I found matches for your search. Check out the panel on the right!",
          timestamp: new Date()
        }]);
        setMatchingOpps(data.opportunities || []);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn("Backend chat offline, loading fallback matched dataset.");
      
      // Fallback matching
      setTimeout(() => {
        let matched: MatchingOpportunity[] = [];
        let replyText = "";

        if (msgLower.includes("data") || msgLower.includes("analyst") || msgLower.includes("science")) {
          matched = [
            {
              id: "sal_4",
              title: "2025 Summer Intern: eCommerce Data Science",
              company: "PepsiCo",
              location: "United States",
              compensation: "$21.50 - $40.19 Per Hour",
              matchScore: 94,
              category: "Data Science & AI"
            },
            {
              id: "sal_11",
              title: "Data & AI Intern",
              company: "Copart",
              location: "Dallas, TX",
              compensation: "$57K - $86K",
              matchScore: 89,
              category: "Data Science & AI"
            }
          ];
          replyText = `I searched the database and matched 2 data science internships. Check out the **Opportunities** workspace panel on the right for full descriptions and links. I recommend starting with the **PepsiCo** internship!`;
        } else if (
          msgLower.includes("teammate") ||
          msgLower.includes("hackathon team") ||
          msgLower.includes("find a team") ||
          (msgLower.includes("team") && !msgLower.includes("internship") && !msgLower.includes("job"))
        ) {
          setActiveTab("team-finder");
          replyText = `I opened the **Team Finder** panel on the right. I've fetched compatible classmates. **Alex Rivera** is a 94% match and is skilled in React and Python!`;
        } else if (
          msgLower.includes("react") ||
          msgLower.includes("frontend") ||
          msgLower.includes("javascript") ||
          msgLower.includes("web")
        ) {
          matched = [
            {
              id: "int_56",
              title: "Web Development (Frontend) Intern",
              company: "Across The Globe (ATG)",
              location: "Work From Home",
              compensation: "₹ 2,500-7,500 /month",
              matchScore: 91,
              category: "Web Development"
            },
            {
              id: "int_120",
              title: "React Developer Intern",
              company: "TechNova Solutions",
              location: "Remote",
              compensation: "₹ 5,000-10,000 /month",
              matchScore: 87,
              category: "Web Development"
            }
          ];
          setActiveTab("opportunities");
          replyText = `I matched you with **${matched.length} React & frontend internships** from our database. Check out the **Opportunities** panel on the right!`;
        } else {
          matched = [
            {
              id: "int_56",
              title: "Web Development (Frontend) Intern",
              company: "Across The Globe (ATG)",
              location: "Work From Home",
              compensation: "₹ 2,500-7,500 /month",
              matchScore: 91,
              category: "Web Development"
            }
          ];
          setActiveTab("opportunities");
          replyText = `I matched you with internships from our dataset. Take a look at the **Opportunities** workspace panel on the right!`;
        }

        setMessages(prev => [...prev, {
          id: `msg_asst_mock_${Date.now()}`,
          role: "assistant",
          content: replyText + "\n\n*(Backend offline — start the FastAPI server to enable live AI reasoning.)*",
          timestamp: new Date()
        }]);
        if (matched.length > 0) setMatchingOpps(matched);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOpportunity = (opp: MatchingOpportunity) => {
    applyToOpportunity(opp.id, opp.title, opp.company, opp.type || "Internship", opp.compensation, opp.location);
    alert(`Applied! Added "${opp.title}" to your Applications Tracker.`);
  };



  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "opportunities":
        return <Opportunities />;
      case "team-finder":
        return <TeamFinder />;
      case "clubs":
        return <Clubs />;
      case "research":
        return <Research />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex transition-colors font-sans overflow-hidden h-screen",
      theme === "dark" ? "bg-[#161615] text-[#C2C0B6]" : "bg-[#F9F9F6] text-[#191919]"
    )}>
      {/* Collapsible left sidebar for navigation and history */}
      <div className={cn(
        "hidden md:flex flex-col justify-between w-[220px] shrink-0 border-r transition-colors",
        theme === "dark" ? "bg-[#191918] border-zinc-800" : "bg-[#F1F1E8] border-zinc-200"
      )}>
        <div className="flex flex-col gap-2 p-3">
          {/* Platform logo */}
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="bg-amber-600 text-white p-1 rounded font-bold text-xs">O⚡</div>
            <span className={cn("font-bold text-sm tracking-tight", theme === "dark" ? "text-zinc-100" : "text-zinc-900")}>
              OpportunityOS
            </span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed text-xs font-semibold hover:bg-zinc-800/10 transition-colors border-zinc-700 text-amber-500 hover:text-amber-600"
          >
            <Plus size={14} />
            Start New Chat
          </button>

          {/* Nav links to open directly in the right workspace pane */}
          <div className="mt-4 space-y-1">
            <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest px-2 mb-2">Workspace views</p>
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "opportunities", label: "Opportunities" },
              { id: "team-finder", label: "Team Finder" },
              { id: "clubs", label: "Clubs Recruitment" },
              { id: "research", label: "Research Labs" },
              { id: "profile", label: "My Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setArtifactOpen(true);
                }}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                  activeTab === tab.id && artifactOpen
                    ? "bg-amber-600/10 text-amber-500 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Sidebar info */}
        <div className="p-3 border-t border-zinc-800/10 space-y-3">
          {/* Quick profile completion widget */}
          <div className="flex items-center gap-2 px-1">
            <div className="size-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-xs">
              {profile.name.charAt(0) || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold truncate">{profile.name || "Student"}</p>
              <p className="text-[9px] text-zinc-500 truncate">{profile.branch || "Not Set"}</p>
            </div>
          </div>

          <div className="flex w-full">
            <button
              onClick={toggleTheme}
              className="w-full py-2 rounded bg-zinc-800/10 hover:bg-zinc-800/20 border border-zinc-700/20 flex items-center justify-center text-zinc-400 text-xs font-semibold"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} className="mr-1.5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={14} className="mr-1.5" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Claude Chat Feed */}
        <div className={cn(
          "flex-1 flex flex-col justify-between h-full relative border-r",
          theme === "dark" ? "bg-[#262624] border-zinc-850" : "bg-[#F9F9F6] border-zinc-200",
          artifactExpanded && "hidden md:flex md:w-[0px] md:opacity-0 md:pointer-events-none transition-all duration-300"
        )}>
          {/* Chat Header */}
          <header className="flex items-center justify-between p-4 border-b border-zinc-800/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-1 rounded hover:bg-zinc-800/10 text-zinc-500"
              >
                <Menu size={16} />
              </button>
              <Bot className="text-amber-500" size={16} />
              <span className="font-serif font-semibold text-sm">AI Career GPS Counselor</span>
            </div>
            
            {/* Toggle right artifact workspace */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setArtifactOpen(!artifactOpen)}
                className="p-1 rounded hover:bg-zinc-800/10 text-zinc-500"
                title={artifactOpen ? "Close Workspace Pane" : "Open Workspace Pane"}
              >
                {artifactOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            </div>
          </header>

          {/* Chat Contents */}
          {messages.length === 0 ? (
            /* Centered Start screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none max-w-2xl mx-auto w-full">
              <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#C2C0B6] mb-8 leading-tight">
                {profile.name ? `What's new, ${profile.name}?` : "What's new?"}
              </h1>
              
              {/* Sugestion Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
                {[
                  { text: "Find remote React internships", tab: "opportunities" as TabType },
                  { text: "Help me find hackathon teammates", tab: "team-finder" as TabType },
                  { text: "Campus clubs active recruitments", tab: "clubs" as TabType },
                  { text: "Update my portfolio skills and resume", tab: "profile" as TabType },
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug.text, sug.tab)}
                    className={cn(
                      "p-3 rounded-xl border text-left text-xs transition-all hover:translate-y-[-1px] leading-relaxed",
                      theme === "dark"
                        ? "bg-[#30302E] border-zinc-800 hover:border-zinc-700 text-zinc-300"
                        : "bg-white border-zinc-200 hover:shadow-sm text-zinc-700"
                    )}
                  >
                    {sug.text}
                  </button>
                ))}
              </div>

              {/* Centered Chatbox */}
              <div className="w-full">
                <ClaudeChatInput
                  onSendMessage={handleSendMessage}
                  placeholder="Ask OpportunityOS to search internships, teammates, or labs..."
                  maxFiles={5}
                  maxFileSize={5 * 1024 * 1024}
                />
              </div>
            </div>
          ) : (
            /* Message Feed view */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin">
                <div className="max-w-2xl mx-auto w-full space-y-5">
                  {messages.map((msg) => {
                    const isAsst = msg.role === "assistant";
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3 max-w-[90%]",
                          isAsst ? "mr-auto" : "ml-auto flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "size-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0",
                          isAsst
                            ? "bg-amber-600/10 text-amber-500 border border-amber-500/20"
                            : "bg-zinc-800 text-zinc-300"
                        )}>
                          {isAsst ? "AI" : profile.name.charAt(0) || "S"}
                        </div>

                        <div className={cn(
                          "p-3.5 rounded-2xl text-sm leading-relaxed",
                          isAsst
                            ? theme === "dark"
                              ? "bg-[#30302E] text-zinc-200 border border-zinc-800"
                              : "bg-white text-zinc-750 border border-zinc-200 shadow-sm"
                            : "bg-amber-600 text-white"
                        )}>
                          <div className="whitespace-pre-wrap select-text selection:bg-amber-800">
                            {msg.content.split("\n").map((para, i) => {
                              let formatted = para;
                              const boldRegex = /\*\*(.*?)\*\*/g;
                              let match;
                              const elements = [];
                              let lastIdx = 0;
                              
                              while ((match = boldRegex.exec(para)) !== null) {
                                elements.push(para.substring(lastIdx, match.index));
                                elements.push(<strong key={match.index} className="font-bold text-amber-500">{match[1]}</strong>);
                                lastIdx = boldRegex.lastIndex;
                              }
                              elements.push(para.substring(lastIdx));
                              
                              const elementContent = elements.length > 1 ? elements : formatted;

                              if (para.trim().startsWith("- ")) {
                                return (
                                  <ul key={i} className="list-disc list-inside ml-2.5 my-1 font-medium">
                                    <li>{para.trim().substring(2)}</li>
                                  </ul>
                                );
                              }
                              return <p key={i} className="mb-2 last:mb-0 leading-relaxed font-sans">{elementContent}</p>;
                            })}
                          </div>
                          <span className={cn(
                            "text-[8px] mt-2 block text-right font-medium",
                            isAsst ? "text-zinc-500" : "text-amber-200"
                          )}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {loading && (
                    <div className="flex gap-3 mr-auto max-w-[80%] items-center">
                      <div className="size-7 rounded-full bg-amber-600/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 animate-pulse">
                        AI
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl flex items-center gap-1",
                        theme === "dark" ? "bg-[#30302E] border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
                      )}>
                        <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bottom input area */}
              <div className="p-4 border-t border-zinc-800/10">
                <div className="max-w-2xl mx-auto w-full">
                  <ClaudeChatInput
                    onSendMessage={handleSendMessage}
                    placeholder="Search roles or ask AI counselor..."
                    maxFiles={5}
                    maxFileSize={5 * 1024 * 1024}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Artifact Workspace (Holds Dashboard, Opps, Team Finder, Profile, etc.) */}
        <div className={cn(
          "h-full overflow-hidden transition-all duration-300 flex flex-col justify-between",
          theme === "dark" ? "bg-[#161615]" : "bg-[#F9F9F6]",
          artifactOpen 
            ? artifactExpanded 
              ? "w-full md:w-full" 
              : "w-full md:w-[50%]" 
            : "w-0 opacity-0 pointer-events-none"
        )}>
          {/* Workspace Header */}
          <header className={cn(
            "flex items-center justify-between p-3.5 border-b select-none",
            theme === "dark" ? "bg-[#191918] border-zinc-850" : "bg-[#F1F1E8] border-zinc-200"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider">
                Artifact Pane
              </span>
              <span className="text-xs font-bold capitalize">{activeTab} View</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Maximize / Minimize toggle */}
              <button
                onClick={() => setArtifactExpanded(!artifactExpanded)}
                className="p-1 rounded hover:bg-zinc-800/10 text-zinc-500"
                title={artifactExpanded ? "Restore Split Screen" : "Maximize Panel"}
              >
                {artifactExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
              
              {/* Close panel */}
              <button
                onClick={() => setArtifactOpen(false)}
                className="p-1 rounded hover:bg-zinc-800/10 text-zinc-500"
                title="Close panel"
              >
                <X size={13} />
              </button>
            </div>
          </header>

          {/* Active Workspace Viewport */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 relative">
            {renderActiveTab()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
