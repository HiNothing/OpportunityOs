import React, { useState } from "react";
import { useApp, StudentProfile } from "@/context/AppContext";
import { Sparkles, GraduationCap, MapPin, Upload, FileText, ArrowRight, User, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { theme, updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<StudentProfile>({
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

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Please enter your name to continue.");
      return;
    }
    if (step === 1 && !formData.branch.trim()) {
      alert("Please enter your field of study.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill)
    });
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload and auto-fill parsing
    setTimeout(() => {
      // Auto-extract skills if we upload a PDF
      const mockExtractedSkills = ["React", "JavaScript", "Python", "Tailwind CSS"];
      const newSkills = [...formData.skills];
      mockExtractedSkills.forEach(s => {
        if (!newSkills.includes(s)) newSkills.push(s);
      });

      setFormData({
        ...formData,
        resumeName: file.name,
        skills: newSkills
      });
      setUploading(false);
      alert(`Resume "${file.name}" uploaded successfully! Our AI model extracted the following skills: ${mockExtractedSkills.join(", ")}.`);
    }, 1500);
  };

  const handleSubmit = async () => {
    setUploading(true);
    const success = await updateProfile(formData);
    setUploading(false);
    
    // Set onboarding complete local storage flag
    localStorage.setItem("onboarded", "true");
    onComplete();
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex items-center justify-center p-4 transition-colors font-sans",
      theme === "dark" ? "bg-[#161615] text-[#C2C0B6] mesh-bg-dark" : "bg-[#F9F9F6] text-[#191919] mesh-bg-light"
    )}>
      <div className={cn(
        "w-full max-w-xl p-8 rounded-3xl border shadow-xl transition-all relative overflow-hidden",
        theme === "dark" ? "bg-[#1e1e1d] border-zinc-800" : "bg-white border-zinc-200"
      )}>
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-600 text-white p-1 rounded font-bold text-xs">O⚡</div>
            <span className="font-serif font-bold text-sm">Onboarding GPS</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Step {step} of 3
          </span>
        </div>

        {/* Step 1: Basic Bio */}
        {step === 1 && (
          <div className="space-y-5 fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                <User size={18} className="text-amber-500" />
                Let's set up your profile
              </h2>
              <p className="text-xs text-zinc-500">Enter your details to generate personalized vector matches.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 focus:outline-none focus:border-zinc-700 text-sm text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Branch / Degree</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 focus:outline-none focus:border-zinc-700 text-sm text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-850 border border-zinc-800 focus:outline-none focus:border-zinc-700 text-sm text-zinc-300"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Graduate">Graduate Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote, Bangalore"
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 focus:outline-none focus:border-zinc-700 text-sm text-zinc-200"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Interests */}
        {step === 2 && (
          <div className="space-y-5 fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Add your Skills & Interests
              </h2>
              <p className="text-xs text-zinc-500">We will use these tags to match you with teammate searches and jobs.</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Skills input */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Python, Figma"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800 focus:outline-none text-xs text-zinc-200"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button
                    onClick={addSkill}
                    className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 p-2.5 rounded-lg text-zinc-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.skills.map((s) => (
                    <span key={s} className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-zinc-800 text-zinc-350 flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="text-zinc-500 hover:text-zinc-300">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Interests input */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Interests & Domains</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="e.g. Web Development, AI/ML, Design"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800 focus:outline-none text-xs text-zinc-200"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <button
                    onClick={addInterest}
                    className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 p-2.5 rounded-lg text-zinc-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.interests.map((i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-amber-500/5 text-amber-500 border border-amber-500/10 flex items-center gap-1">
                      {i}
                      <button onClick={() => removeInterest(i)} className="text-amber-500/60 hover:text-amber-400">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {formData.interests.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">No interests added yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="bg-transparent text-zinc-400 font-semibold text-xs px-4 py-2 hover:text-zinc-200"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-1.5"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resume Upload & Complete */}
        {step === 3 && (
          <div className="space-y-5 fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-zinc-100 flex items-center gap-2">
                <FileText size={18} className="text-amber-500" />
                Upload your Resume
              </h2>
              <p className="text-xs text-zinc-500">Optional: Let the AI Counselor parse your experience for advanced matching.</p>
            </div>

            <div className="space-y-4 pt-2">
              {formData.resumeName ? (
                <div className="p-4 rounded-xl bg-amber-600/5 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-600/10 p-2 rounded-lg">
                      <FileText className="text-amber-500" size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold truncate max-w-xs">{formData.resumeName}</p>
                      <p className="text-[9px] text-zinc-500">Parsed Successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, resumeName: "" })}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center bg-zinc-800/5">
                  <Upload className="text-zinc-600 mb-2" size={24} />
                  <h4 className="text-xs font-semibold">Drag & Drop file here</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">PDF, DOCX or TXT (Max 10MB)</p>
                  
                  <label className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors border border-zinc-750">
                    Browse File
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="bg-transparent text-zinc-400 font-semibold text-xs px-4 py-2 hover:text-zinc-200"
                disabled={uploading}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className={cn(
                  "px-8 py-3 rounded-xl font-semibold text-xs text-white transition-colors",
                  uploading
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                )}
              >
                {uploading ? "Creating..." : "Launch OpportunityOS"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
