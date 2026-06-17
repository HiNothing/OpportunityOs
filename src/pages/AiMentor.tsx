import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ClaudeChatInput, FileWithPreview, PastedContent } from "@/components/ui/claude-style-ai-input";
import { Sparkles, Bot, User, ShieldAlert, Cpu, ArrowUpRight, Compass, DollarSign, MapPin } from "lucide-react";
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
}

export const AiMentor: React.FC = () => {
  const { theme, profile, applyToOpportunity } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matchingOpps, setMatchingOpps] = useState<MatchingOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [convId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: "msg_init",
        role: "assistant",
        content: `Hi **${profile.name}**! I'm your AI Career GPS for college. 🚀\n\nI have indexed both **internship.csv** and **Data_Salaries.csv** into my vector database using local SentenceTransformers.\n\nTell me about your career goals, or ask me for specific matching roles (e.g. *"find me remote web developer internships"* or *"are there any data analytics positions in California?"*).`,
        timestamp: new Date()
      }
    ]);
  }, [profile.name]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (
    messageText: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => {
    // 1. Append User Message
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

    // Formulate payload for FastAPI backend
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
        
        // 2. Append Assistant Reply
        const assistantMsg: ChatMessage = {
          id: `msg_asst_${Date.now()}`,
          role: "assistant",
          content: data.text || "I processed your request, but could not formulate a reply.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        setMatchingOpps(data.opportunities || []);
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.warn("Backend chat offline, generating offline matching reply.");
      
      // Local fallback mock response based on keyword matching
      setTimeout(() => {
        let matched: MatchingOpportunity[] = [];
        let replyText = "";
        const msgLower = messageText.toLowerCase();

        if (msgLower.includes("data") || msgLower.includes("analytics") || msgLower.includes("science")) {
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
          replyText = `I found some excellent data engineering and science internships in our vector indexes that match your request. \n\nI recommend applying to **PepsiCo's eCommerce Data Science** role because it aligns with your python and analytics credentials. Check out the match cards in the sidebar!`;
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
            },
            {
              id: "int_70",
              title: "UI Design Intern",
              company: "Pepperfry",
              location: "Mumbai",
              compensation: "₹ 20,000-25,000 /month",
              matchScore: 84,
              category: "UI/UX Design"
            }
          ];
          replyText = `Based on your query, I matched a few web development and design internships from our persistent storage. \n\nThe **Web Development (Frontend)** role at Across The Globe is a great match because it specifies React and Tailwind skills. Let me know if you want me to search other locations!`;
        }

        setMessages(prev => [...prev, {
          id: `msg_asst_mock_${Date.now()}`,
          role: "assistant",
          content: replyText + "\n\n*(Note: The FastAPI backend is currently running in fallback mode. Set your `ASI_ONE_API_KEY` in `.env` to enable the full agent reasoning!)*",
          timestamp: new Date()
        }]);
        setMatchingOpps(matched);
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOpportunity = (opp: MatchingOpportunity) => {
    applyToOpportunity(opp.id, opp.title, opp.company, "Internship", opp.compensation, opp.location);
    alert(`Applied! added "${opp.title}" to your Applications Tracker.`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* Left Column: Chat Container */}
      <div className={cn(
        "flex-1 flex flex-col justify-between p-4 md:p-6 rounded-2xl border h-full relative overflow-hidden",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      )}>
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/10">
          <div className="flex items-center gap-2">
            <Bot className="text-amber-500" size={20} />
            <div>
              <h2 className="font-bold text-sm leading-tight">AI Career GPS Counselor</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">Active Session: RAG Retrieval Index Enabled</p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
            <Cpu size={10} />
            asi1
          </span>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isAsst = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  isAsst ? "mr-auto" : "ml-auto flex-row-reverse"
                )}
              >
                {/* Avatar Icon */}
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                  isAsst
                    ? "bg-amber-600/10 text-amber-500 border border-amber-500/20"
                    : "bg-zinc-800 text-zinc-300"
                )}>
                  {isAsst ? "AI" : profile.name.charAt(0)}
                </div>

                {/* Message Box */}
                <div className={cn(
                  "p-3.5 rounded-2xl text-sm leading-relaxed",
                  isAsst
                    ? theme === "dark"
                      ? "bg-zinc-900/50 text-zinc-200 border border-zinc-850"
                      : "bg-zinc-50 text-zinc-700 border border-zinc-150"
                    : "bg-amber-600 text-white"
                )}>
                  {/* Simplistic markdown rendering for bold and bullet lists */}
                  <div className="whitespace-pre-wrap select-text selection:bg-amber-800">
                    {msg.content.split("\n").map((para, i) => {
                      // Bold format
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

                      // Bullet list item
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

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%] items-center">
              <div className="size-8 rounded-full bg-amber-600/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                AI
              </div>
              <div className={cn(
                "p-3 rounded-2xl flex items-center gap-1",
                theme === "dark" ? "bg-zinc-900/50" : "bg-zinc-50"
              )}>
                <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-zinc-800/10">
          <ClaudeChatInput
            onSendMessage={handleSendMessage}
            placeholder="Ask AI Career GPS about internships, match ratings, or resume criteria..."
            maxFiles={5}
            maxFileSize={5 * 1024 * 1024}
          />
        </div>
      </div>

      {/* Right Column: Live RAG Match Sidebar */}
      <div className={cn(
        "w-full lg:w-[280px] p-4 md:p-6 rounded-2xl border flex flex-col h-full overflow-hidden shrink-0",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      )}>
        <h3 className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-4 flex items-center gap-1.5 border-b border-zinc-850 pb-2">
          <Sparkles size={12} className="text-amber-500" />
          RAG Vector Detections
        </h3>

        {matchingOpps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Compass size={24} className="text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-500 leading-normal">
              Ask the AI Mentor about roles to fetch real-time semantic matches from the CSV datasets.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {matchingOpps.map((opp) => (
              <div
                key={opp.id}
                className={cn(
                  "p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all hover:scale-[1.01]",
                  theme === "dark" ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-150"
                )}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-500 shrink-0">
                      {opp.matchScore}% Match
                    </span>
                    <span className="text-[8px] text-zinc-500 truncate max-w-[120px]">{opp.category}</span>
                  </div>
                  <h4 className="font-bold text-xs leading-tight line-clamp-1">{opp.title}</h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{opp.company}</p>

                  <div className="flex items-center text-[10px] text-zinc-400 gap-1.5 mt-2.5">
                    <MapPin size={10} />
                    <span className="truncate">{opp.location}</span>
                  </div>
                  <div className="flex items-center text-[10px] text-zinc-400 gap-1.5 mt-1">
                    <DollarSign size={10} />
                    <span className="truncate">{opp.compensation}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyOpportunity(opp)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded py-1.5 text-[10px] font-bold mt-2 flex items-center justify-center gap-1 transition-colors"
                >
                  Apply Now
                  <ArrowUpRight size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};
