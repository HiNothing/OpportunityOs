import os
import json
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from rag_engine import rag_engine

app = FastAPI(title="OpportunityOS API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session stores (persisted during backend runtime)
# Default profile is empty — populated when the user fills in the Profile tab
STUDENT_PROFILES = {
    "default": {
        "name": "",
        "branch": "",
        "year": "1st Year",
        "skills": [],
        "interests": [],
        "location": "Remote",
        "github": "",
        "linkedin": "",
        "resumeName": ""
    }
}

class ProfileUpdate(BaseModel):
    name: str
    branch: str
    year: str
    skills: List[str]
    interests: List[str]
    location: str
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    resumeName: Optional[str] = ""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    conv_id: str
    messages: List[ChatMessage]
    profile: Optional[dict] = None

@app.on_event("startup")
def startup_event():
    print("[Server] Initializing ChromaDB vector database on startup...")
    # Initialize index (don't force reindex if it already exists, to save time)
    rag_engine.initialize_chroma(force_reindex=False)
    print("[Server] ChromaDB startup initialization complete.")

@app.get("/")
def read_root():
    return {"status": "running", "message": "OpportunityOS RAG Backend API is active."}

@app.get("/api/profile")
def get_profile(user_id: str = "default"):
    return STUDENT_PROFILES.get(user_id, STUDENT_PROFILES["default"])

@app.post("/api/profile")
def update_profile(profile: ProfileUpdate, user_id: str = "default"):
    STUDENT_PROFILES[user_id] = profile.dict()
    return {"status": "success", "profile": STUDENT_PROFILES[user_id]}

@app.get("/api/opportunities")
def get_opportunities(
    query: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """Retrieve opportunities from the CSV datasets, supporting search query, categories, and locations."""
    opps = list(rag_engine.opportunities_map.values())
    
    # Filter by category
    if category and category != "All":
        opps = [o for o in opps if o["category"].lower() == category.lower() or category.lower() in o["type"].lower()]
        
    # Filter by location
    if location and location != "All":
        if location.lower() == "remote":
            opps = [o for o in opps if "remote" in o["location"].lower() or "work from home" in o["location"].lower()]
        else:
            opps = [o for o in opps if location.lower() in o["location"].lower()]

    # Search query filter (simple fuzzy search)
    if query:
        q_lower = query.lower()
        opps = [
            o for o in opps 
            if q_lower in o["title"].lower() 
            or q_lower in o["company"].lower() 
            or q_lower in o["location"].lower()
            or q_lower in o["category"].lower()
        ]

    # Paginate
    total = len(opps)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_opps = opps[start_idx:end_idx]

    # Add artificial match scores (simulating RAG recommendations if query exists)
    for opp in paginated_opps:
        # Default match score
        opp["matchScore"] = 75
        
        # Calculate dynamic match score based on user profile skills
        user_skills = STUDENT_PROFILES["default"]["skills"]
        skills_matched = sum(1 for skill in user_skills if skill.lower() in opp["title"].lower() or skill.lower() in opp["description"].lower())
        opp["matchScore"] = min(98, 75 + skills_matched * 7)

    return {
        "opportunities": paginated_opps,
        "total": total,
        "page": page,
        "limit": limit
    }

@app.get("/api/recommend")
def get_recommendations(user_id: str = "default", limit: int = 5):
    """Query ChromaDB based on student profile skills and interests to get top recommendations."""
    profile = STUDENT_PROFILES.get(user_id, STUDENT_PROFILES["default"])
    skills_query = f"{' '.join(profile.get('skills', []))} {' '.join(profile.get('interests', []))} {profile.get('location', '')}"
    
    print(f"[API] Fetching profile-based recommendations using query: '{skills_query}'")
    matched_opps = rag_engine.search(skills_query, limit=limit)
    
    return {"recommendations": matched_opps}

@app.post("/api/chat")
def chat_with_mentor(payload: ChatRequest):
    """AI Mentor chat endpoint. Utilizes RAG context matching and queries ASI:One."""
    user_id = "default"
    # Use saved profile or request payload profile
    profile = payload.profile or STUDENT_PROFILES.get(user_id, STUDENT_PROFILES["default"])
    
    # Format messages for the RAG engine
    formatted_messages = []
    for msg in payload.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })
        
    response = rag_engine.ask_ai(
        conv_id=payload.conv_id,
        messages=formatted_messages,
        user_profile=profile
    )
    
    return response

@app.get("/api/team-finder")
def get_teammates(user_id: str = "default"):
    """
    Return mock students seeking teammates, calculating dynamic match percentages 
    based on overlap in skills/interests.
    """
    my_profile = STUDENT_PROFILES.get(user_id, STUDENT_PROFILES["default"])
    my_skills = set(s.lower() for s in my_profile.get("skills", []))
    
    # High-fidelity mock students
    mock_students = [
        {
            "id": "std_1",
            "name": "Alex Rivera",
            "year": "3rd Year",
            "branch": "Computer Science & Engineering",
            "skills": ["Python", "TensorFlow", "React", "Docker"],
            "interests": ["AI/ML", "Web Development", "Hackathons"],
            "availability": "10-15 hrs/week",
            "github": "https://github.com/alexr",
            "linkedin": "https://linkedin.com/in/alexr",
            "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
        },
        {
            "id": "std_2",
            "name": "Priya Sharma",
            "year": "2nd Year",
            "branch": "Information Technology",
            "skills": ["Figma", "UI/UX", "Tailwind CSS", "JavaScript"],
            "interests": ["Design Systems", "Web Development", "Startup Club"],
            "availability": "5-10 hrs/week",
            "github": "https://github.com/priyas",
            "linkedin": "https://linkedin.com/in/priyas",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
        },
        {
            "id": "std_3",
            "name": "Marcus Vance",
            "year": "4th Year",
            "branch": "Software Engineering",
            "skills": ["Java", "Spring Boot", "PostgreSQL", "AWS"],
            "interests": ["Backend Systems", "Distributed Databases", "Clubs"],
            "availability": "15-20 hrs/week",
            "github": "https://github.com/marcusv",
            "linkedin": "https://linkedin.com/in/marcusv",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
        },
        {
            "id": "std_4",
            "name": "Emily Chen",
            "year": "3rd Year",
            "branch": "Data Science",
            "skills": ["R", "Python", "SQL", "Pandas", "Scikit-Learn"],
            "interests": ["Data Analytics", "Quantitative Finance", "Research"],
            "availability": "10 hrs/week",
            "github": "https://github.com/emilyc",
            "linkedin": "https://linkedin.com/in/emilyc",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120"
        },
        {
            "id": "std_5",
            "name": "Ryan Kaji",
            "year": "1st Year",
            "branch": "Computer Science & Engineering",
            "skills": ["HTML", "CSS", "JavaScript", "C++"],
            "interests": ["Competitive Coding", "Game Development", "Clubs"],
            "availability": "15 hrs/week",
            "github": "https://github.com/ryank",
            "linkedin": "https://linkedin.com/in/ryank",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
        }
    ]

    # Calculate match percentage based on overlapping skills or complimentary skills
    for student in mock_students:
        their_skills = set(s.lower() for s in student["skills"])
        overlap = len(my_skills.intersection(their_skills))
        
        # Heuristic: base match is 60%, each overlapping skill adds 10%, complementary adds value too
        match_pct = 65 + overlap * 8
        
        # Cap match percentage at 98%
        student["matchPercentage"] = min(98, match_pct)

    # Sort by highest match percentage
    mock_students.sort(key=lambda s: s["matchPercentage"], reverse=True)
    return {"teammates": mock_students}

@app.get("/api/clubs")
def get_clubs():
    """Return high-fidelity mock club listings."""
    return {
        "clubs": [
            {
                "id": "club_1",
                "name": "AI & Robotics Club",
                "description": "Building autonomous bots and deep learning projects. Participate in RoboCon and regional AI hackathons.",
                "positions": ["Deep Learning Lead", "Hardware Engineer", "Social Media Executive"],
                "logo": "🤖",
                "membersCount": 65
            },
            {
                "id": "club_2",
                "name": "Developer Syndicate",
                "description": "A community of full-stack developers building open-source projects and helping college startups ship products.",
                "positions": ["React Specialist", "Backend Dev (Go/Python)", "UX Architect"],
                "logo": "💻",
                "membersCount": 120
            },
            {
                "id": "club_3",
                "name": "Finance & Quantitative Club",
                "description": "Algorithmic trading, financial modeling, and investment case studies. Host of the annual TradeQuest event.",
                "positions": ["Quantitative Analyst", "Marketing Coordinator", "Treasury Assistant"],
                "logo": "📈",
                "membersCount": 42
            },
            {
                "id": "club_4",
                "name": "Women in Tech Association",
                "description": "Empowering underrepresented groups in computer science through mentorship programs, industry speakers, and workshops.",
                "positions": ["Mentorship Program Coordinator", "Event Manager", "Content Specialist"],
                "logo": "👩‍💻",
                "membersCount": 85
            }
        ]
    }

@app.get("/api/research")
def get_research():
    """Return mock university research opportunities."""
    return {
        "research": [
            {
                "id": "res_1",
                "professor": "Dr. Aris Thorne",
                "domain": "Natural Language Processing (NLP)",
                "skills": ["Python", "PyTorch", "Transformers"],
                "duration": "Fall Semester (4 Months)",
                "description": "Investigating domain-adaptation techniques in Large Language Models for chemical engineering literature parsing.",
                "compensation": "$25 / Hour",
                "logo": "🔬"
            },
            {
                "id": "res_2",
                "professor": "Dr. Sarah Jenkins",
                "domain": "Human-Computer Interaction (HCI)",
                "skills": ["Figma", "User Interviews", "Data Visualization"],
                "duration": "Full Academic Year",
                "description": "Designing and evaluating accessible user interfaces for elder-care software agents in medical settings.",
                "compensation": "Academic Credit + Stipend",
                "logo": "🧠"
            },
            {
                "id": "res_3",
                "professor": "Dr. Michael Chen",
                "domain": "Autonomous Vehicles / Robotics",
                "skills": ["C++", "ROS", "Linear Algebra"],
                "duration": "Summer 2026",
                "description": "Developing real-time sensor fusion algorithms for LiDAR and camera systems on small scale ground vehicles.",
                "compensation": "$3,500 Monthly Stipend",
                "logo": "🏎️"
            }
        ]
    }
