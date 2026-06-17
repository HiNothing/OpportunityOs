import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  GraduationCap,
  MapPin,
  Upload,
  FileText,
  X,
  Plus,
  Save,
  CheckCircle,
} from "lucide-react";
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

export const Profile: React.FC = () => {
  const { theme, profile, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    const success = await updateProfile(formData);
    if (success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 2000);
      setIsEditing(false);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2000);
      setIsEditing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest)
    });
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setTimeout(() => {
      setFormData({
        ...formData,
        resumeName: file.name
      });
      if (!isEditing) {
        updateProfile({
          ...profile,
          resumeName: file.name
        });
      }
      setUploadingResume(false);
      alert(`Resume "${file.name}" uploaded and parsed successfully by AI GPS!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Student Profile</h1>
          <p className={cn("text-sm mt-1", theme === "dark" ? "text-zinc-400" : "text-zinc-500")}>
            Manage your credentials, upload your resume, and refine your skill matching keywords.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => {
              setFormData({ ...profile });
              setIsEditing(true);
            }}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="bg-transparent text-zinc-400 font-semibold text-xs px-4 py-2 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save size={12} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {saveStatus === "success" && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className={cn(
          "p-6 rounded-2xl border flex flex-col items-center text-center justify-between h-fit",
          theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="w-full flex flex-col items-center">
            <div className="size-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-white text-3xl mb-4 shadow-lg shadow-amber-900/10">
              {profile.name.charAt(0)}
            </div>

            {!isEditing ? (
              <div className="space-y-1">
                <h2 className="text-lg font-bold">{profile.name}</h2>
                <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                  <GraduationCap size={14} />
                  <span>{profile.branch} • {profile.year}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                  <MapPin size={12} />
                  <span>{profile.location}</span>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 mt-2">
                <div>
                  <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">Branch/Department</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">Year</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">Preferred Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full border-t border-zinc-800/10 pt-4 mt-6 space-y-3">
            {!isEditing ? (
              <div className="space-y-2.5">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-250">
                    <GithubIcon />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-250">
                    <LinkedinIcon />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">GitHub Link</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                    placeholder="https://github.com/your-username"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-left uppercase font-bold text-zinc-500 tracking-wider">LinkedIn Link</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                    placeholder="https://linkedin.com/in/your-name"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className={cn(
            "p-6 rounded-2xl border space-y-6",
            theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Skills Tags</label>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill..."
                      className="px-2.5 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-250 focus:outline-none w-24"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded text-zinc-350 border border-zinc-700"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.skills : profile.skills).map((skill) => (
                  <span
                    key={skill}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5",
                      theme === "dark" ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-655"
                    )}
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-zinc-500 hover:text-zinc-300 rounded-full"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Interests & Domains</label>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interest..."
                      className="px-2.5 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-250 focus:outline-none w-24"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded text-zinc-350 border border-zinc-700"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.interests : profile.interests).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold bg-amber-500/5 text-amber-500 border border-amber-500/10 flex items-center gap-1.5"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-amber-500/60 hover:text-amber-400 rounded-full"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            "p-6 rounded-2xl border space-y-4",
            theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <label className="block text-xs uppercase font-bold text-zinc-500 tracking-wider">Resume Upload</label>
            
            {profile.resumeName ? (
              <div className="p-4 rounded-xl bg-amber-600/5 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600/10 p-2.5 rounded-lg">
                    <FileText className="text-amber-500" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-xs">{profile.resumeName}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Parsed by AI Career GPS • Ready for RAG query context</p>
                  </div>
                </div>
                
                <label className="text-[10px] bg-zinc-850 hover:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded border border-zinc-750 font-semibold cursor-pointer">
                  Replace File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-zinc-800/5">
                <Upload className="text-zinc-600 mb-3" size={32} />
                <h4 className="text-sm font-semibold">Upload your Resume</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  Support PDF, DOCX or TXT files. Up to 10MB. The AI Mentor will parse your skills to refine matches.
                </p>
                
                <label className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload size={12} />
                  {uploadingResume ? "Uploading..." : "Select File"}
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
