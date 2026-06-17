# 🎯 OpportunityOS — AI Career GPS for College Students

> **Discover the right internships, teammates, clubs, and career pathways — at the perfect time.**

OpportunityOS is an AI-powered college career platform that uses **Retrieval-Augmented Generation (RAG)** with the **ASI:ONE LLM API** to deliver hyper-personalized opportunity recommendations for students — from freshman orientation to graduation.

---

## 🚀 Live Demo

🔗 [github.com/HiNothing/OpportunityOs](https://github.com/HiNothing/OpportunityOs)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Career Counselor** | Chat-based AI powered by ASI:ONE that recommends internships, roles, and paths based on your profile |
| 🔍 **Semantic Search (RAG)** | Vector-based search over 10,000+ real internship & salary records using `sentence-transformers` |
| 💼 **Opportunities Panel** | Browse matched internships & jobs from real datasets with match scores |
| 👥 **Team Finder** | Find compatible teammates for hackathons, clubs, and startup projects |
| 🔬 **Research Portal** | Connect with professors and research opportunities |
| 🏛️ **Clubs Explorer** | Discover active college clubs recruiting new members |
| 📋 **Profile Manager** | Build your student profile with skills, interests, resume, and year |
| 🌙 **Dark / Light Mode** | Fully themeable interface |

---

## 🧠 How It Works — RAG + ASI:ONE Architecture

```
User Message
     │
     ▼
┌─────────────────────────────┐
│   FastAPI Backend (Python)  │
│                             │
│  1. Embed query using       │
│     sentence-transformers   │
│     (all-MiniLM-L6-v2)      │
│                             │
│  2. Cosine similarity search│
│     over local vector DB    │
│     (internship.csv +       │
│      Data_Salaries.csv)     │
│                             │
│  3. Top-5 matches injected  │
│     into system prompt      │
│                             │
│  4. ASI:ONE API called      │
│     → natural language      │
│        career guidance      │
└─────────────────────────────┘
     │
     ▼
 AI Response + Matched Opportunities → React Frontend
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **Claude-style AI Chat UI** (custom component)

### Backend
- **FastAPI** (Python) — REST API server
- **Sentence Transformers** (`all-MiniLM-L6-v2`) — local embedding model
- **NumPy** — cosine similarity vector search
- **Pandas** — CSV dataset processing
- **ASI:ONE API** (`api.asi1.ai`) — LLM reasoning engine

### Data
- `internship.csv` — Real-world internship listings
- `Data_Salaries.csv` — Salary/compensation data across roles

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- An [ASI:ONE API Key](https://api.asi1.ai)

---

### 1. Clone the repository

```bash
git clone https://github.com/HiNothing/OpportunityOs.git
cd OpportunityOs
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

### 3. Backend Setup

```bash
# Create Python virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate

# Activate it (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables

```bash
# Copy the example env file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

Edit `.env` and add your ASI:ONE key:

```env
ASI_ONE_API_KEY="sk-your-actual-key-here"
```

### 5. Start the Backend Server

```bash
cd backend
uvicorn main:app --port 8000
```

> ⏳ **First run:** The backend will automatically embed all CSV records into the local vector database using `sentence-transformers`. This takes ~2-3 minutes once and is cached to disk for all future runs.

Backend runs at → `http://localhost:8000`

---

## 📁 Project Structure

```
OpportunityOs/
│
├── src/                          # React frontend
│   ├── App.tsx                   # Main app with chat + routing logic
│   ├── context/AppContext.tsx    # Global state (profile, tabs, messages)
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── ui/                   # Reusable UI components
│   └── pages/                    # Feature pages
│       ├── Dashboard.tsx
│       ├── Opportunities.tsx
│       ├── TeamFinder.tsx
│       ├── Clubs.tsx
│       ├── Research.tsx
│       ├── Profile.tsx
│       └── Settings.tsx
│
├── backend/
│   ├── main.py                   # FastAPI server & API routes
│   ├── rag_engine.py             # RAG pipeline + ASI:ONE integration
│   └── requirements.txt          # Python dependencies
│
├── internship.csv                # Internship dataset
├── Data_Salaries.csv             # Salary dataset
├── vector_db/                    # Auto-generated embedding cache (gitignored)
├── .env.example                  # Environment variable template
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Get student profile |
| `POST` | `/api/profile` | Update student profile |
| `POST` | `/api/chat` | Send message → AI response + matched opportunities |
| `GET` | `/api/opportunities` | Get all indexed opportunities |
| `GET` | `/api/team-finder` | Get compatible teammate suggestions |

---

## 🤖 ASI:ONE Integration

We use the **ASI:ONE Chat Completions API** (`api.asi1.ai/v1/chat/completions`) as the core LLM reasoning engine:

1. The student's query is embedded using `sentence-transformers/all-MiniLM-L6-v2`
2. Top-5 semantically matching opportunities are retrieved from the local vector store
3. Retrieved context + student profile are injected into the system prompt
4. ASI:ONE generates a personalized, grounded career counseling response
5. Session continuity is maintained via `x-session-id` headers

```python
payload = {
    "model": "asi1",
    "messages": [system_prompt, ...conversation_history],
    "stream": False
}
headers = {
    "Authorization": f"Bearer {ASI_ONE_API_KEY}",
    "x-session-id": session_id
}
```

---

## 🗃️ Dataset Sources

- **`internship.csv`** — Internship listings including title, company, location, stipend, duration, and start date
- **`Data_Salaries.csv`** — Professional role salary data with job title, company, location, and compensation

Both datasets are chunked with **overlapping sliding windows** (chunk size: 400 chars, overlap: 100 chars) and indexed into a local vector store for semantic search.

---

## 🔐 Security

- **API keys** are stored in `.env` and never committed (protected by `.gitignore`)
- The `.env.example` file provides a safe template for collaborators
- Vector DB cache is local-only and excluded from version control

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 👨‍💻 Built By

**Team HiNothing** — Built for the ASI:ONE Hackathon

> *OpportunityOS is literally a career GPS. The AI matches you with the right opportunities at exactly the right time in your college journey.*
