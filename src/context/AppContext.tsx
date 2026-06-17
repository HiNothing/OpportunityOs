import React, { createContext, useContext, useState, useEffect } from "react";

export type TabType =
  | "dashboard"
  | "opportunities"
  | "team-finder"
  | "clubs"
  | "research"
  | "mentors"
  | "profile"
  | "settings";

export interface StudentProfile {
  name: string;
  branch: string;
  year: string;
  skills: string[];
  interests: string[];
  location: string;
  github?: string;
  linkedin?: string;
  resumeName?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  title: string;
  company: string;
  type: string;
  status: "applied" | "interviewing" | "offered" | "rejected" | "saved";
  appliedDate: string;
  compensation?: string;
  location?: string;
}

interface AppContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: StudentProfile;
  updateProfile: (profile: StudentProfile) => Promise<boolean>;
  bookmarks: string[]; // List of opportunity IDs
  toggleBookmark: (oppId: string) => void;
  isBookmarked: (oppId: string) => boolean;
  applications: Application[];
  applyToOpportunity: (oppId: string, title: string, company: string, type: string, compensation?: string, location?: string) => void;
  updateApplicationStatus: (appId: string, status: Application["status"]) => void;
  loading: boolean;
  onboarded: boolean;
  setOnboarded: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = "http://localhost:8000";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<TabType>("profile"); // Open Profile tab first so user enters data
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("onboarded") === "true";
  });
  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    branch: "",
    year: "1st Year",
    skills: [],
    interests: [],
    location: "Remote",
    github: "",
    linkedin: "",
    resumeName: ""
  });

  // Load theme and saved state from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
    } else {
      document.documentElement.classList.add("dark");
    }

    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    const savedApps = localStorage.getItem("applications");
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    } else {
      // Mock initial applications for high-fidelity empty states
      const mockApps: Application[] = [
        {
          id: "app_mock_1",
          opportunityId: "sal_2",
          title: "Data Engineer Intern",
          company: "ghSMART",
          type: "Internship",
          status: "interviewing",
          appliedDate: "2026-06-10",
          compensation: "$20.00 - $30.00 / Hour",
          location: "Remote"
        },
        {
          id: "app_mock_2",
          opportunityId: "int_56",
          title: "Web Development (Frontend)",
          company: "Across The Globe (ATG)",
          type: "Internship",
          status: "applied",
          appliedDate: "2026-06-15",
          compensation: "₹ 2,500-7,500 /month",
          location: "Work From Home"
        }
      ];
      setApplications(mockApps);
      localStorage.setItem("applications", JSON.stringify(mockApps));
    }

    // Fetch initial profile from FastAPI backend
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.name) {
          setOnboarded(true);
          localStorage.setItem("onboarded", "true");
        }
      }
    } catch (error) {
      console.warn("Backend not active yet, using default local profile state.", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  const updateProfile = async (newProfile: StudentProfile): Promise<boolean> => {
    setProfile(newProfile);
    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to sync profile update with backend", error);
      return false; // update locally worked, backend sync failed
    }
  };

  const toggleBookmark = (oppId: string) => {
    let newBookmarks = [...bookmarks];
    if (bookmarks.includes(oppId)) {
      newBookmarks = newBookmarks.filter((id) => id !== oppId);
    } else {
      newBookmarks.push(oppId);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  const isBookmarked = (oppId: string) => bookmarks.includes(oppId);

  const applyToOpportunity = (
    oppId: string,
    title: string,
    company: string,
    type: string,
    compensation?: string,
    location?: string
  ) => {
    // Check if already applied
    const exists = applications.some((app) => app.opportunityId === oppId);
    if (exists) return;

    const newApp: Application = {
      id: `app_${Date.now()}`,
      opportunityId: oppId,
      title,
      company,
      type,
      status: "applied",
      appliedDate: new Date().toISOString().split("T")[0],
      compensation,
      location
    };

    const newApps = [newApp, ...applications];
    setApplications(newApps);
    localStorage.setItem("applications", JSON.stringify(newApps));
  };

  const updateApplicationStatus = (appId: string, status: Application["status"]) => {
    const newApps = applications.map((app) =>
      app.id === appId ? { ...app, status } : app
    );
    setApplications(newApps);
    localStorage.setItem("applications", JSON.stringify(newApps));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        applications,
        applyToOpportunity,
        updateApplicationStatus,
        loading,
        onboarded,
        setOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
