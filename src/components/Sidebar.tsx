import React, { useState } from "react";
import { useApp, TabType } from "@/context/AppContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Compass,
  GraduationCap,
  Sparkles,
  User,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    profile,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "opportunities" as TabType, label: "Opportunities", icon: Briefcase },
    { id: "team-finder" as TabType, label: "Team Finder", icon: Users },
    { id: "clubs" as TabType, label: "Clubs", icon: Compass },
    { id: "research" as TabType, label: "Research", icon: GraduationCap },
    { id: "mentors" as TabType, label: "AI Mentor", icon: Sparkles },
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };



  // Calculate profile strength percentage
  const calcProfileStrength = () => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.branch) score += 15;
    if (profile.year) score += 10;
    if (profile.location) score += 15;
    if (profile.skills.length > 0) score += 20;
    if (profile.interests.length > 0) score += 15;
    if (profile.github || profile.linkedin) score += 10;
    return score;
  };

  const strength = calcProfileStrength();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header */}
      <div>
        <div className={cn(
          "flex items-center justify-between p-4 border-b transition-colors",
          theme === "dark" ? "border-zinc-800" : "border-zinc-200"
        )}>
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-600 text-white p-1.5 rounded-lg font-bold text-sm tracking-wider flex items-center justify-center size-9">
              O⚡
            </div>
            {!collapsed && (
              <span className={cn(
                "font-sans font-bold text-lg tracking-tight",
                theme === "dark" ? "text-zinc-100" : "text-zinc-800"
              )}>
                Opportunity<span className="text-amber-500">OS</span>
              </span>
            )}
          </div>
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden md:flex p-1.5 rounded-md hover:bg-opacity-80 transition-colors",
              theme === "dark" ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 pl-2.5"
                    : theme === "dark"
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "text-amber-500" : "opacity-75"} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Details / Action Area */}
      <div className={cn(
        "p-4 border-t transition-colors space-y-4",
        theme === "dark" ? "border-zinc-800" : "border-zinc-200"
      )}>
        {/* Profile Strength Widget (only if not collapsed) */}
        {!collapsed && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className={theme === "dark" ? "text-zinc-400" : "text-zinc-500"}>Profile Strength</span>
              <span className="text-amber-500">{strength}%</span>
            </div>
            <div className={cn(
              "w-full h-1.5 rounded-full overflow-hidden",
              theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"
            )}>
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        )}

        {/* User Quick Info */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-sm">
            {profile.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold truncate",
                theme === "dark" ? "text-zinc-200" : "text-zinc-800"
              )}>
                {profile.name}
              </p>
              <p className={cn(
                "text-xs truncate",
                theme === "dark" ? "text-zinc-500" : "text-zinc-400"
              )}>
                {profile.branch}
              </p>
            </div>
          )}
        </div>

        {/* Utility Actions (Theme Only) */}
        <div className="flex items-center justify-between gap-1 pt-1.5">
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg hover:bg-opacity-80 transition-all flex items-center justify-center w-full",
              theme === "dark" ? "bg-zinc-800 hover:bg-zinc-700 text-amber-500" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            )}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span className="text-xs font-semibold ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (Overlay) */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 md:translate-x-0 md:static",
          theme === "dark" ? "bg-[#1e1e1d] text-zinc-200" : "bg-white text-zinc-700 shadow-lg",
          mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[68px]" : "md:w-[240px]"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};
