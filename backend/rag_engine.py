import os
import re
import json
import uuid
import time
import numpy as np
import pandas as pd
import requests
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv, find_dotenv

# Load .env from the project root (one level up from backend/)
_dotenv_path = find_dotenv(usecwd=False, raise_error_if_not_found=False)
if not _dotenv_path:
    # Fallback: try parent directory of this file
    import pathlib
    _dotenv_path = str(pathlib.Path(__file__).parent.parent / ".env")
load_dotenv(_dotenv_path, override=True)
print(f"[RAG] Loaded .env from: {_dotenv_path}")

API_KEY = os.getenv("ASI_ONE_API_KEY", "").strip()
ENDPOINT = "https://api.asi1.ai/v1/chat/completions"
MODEL = "asi1"
TIMEOUT = 90

# Pure Python Vector Store to replace ChromaDB
class SimpleVectorStore:
    def __init__(self, persist_dir="backend/vector_db"):
        self.persist_dir = persist_dir
        print("[VectorStore] Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[VectorStore] Model loaded successfully.")
        
        self.embeddings = [] # List of list of floats
        self.documents = []  # List of strings
        self.metadatas = []  # List of dicts
        self.ids = []        # List of strings
        
        if not os.path.exists(persist_dir):
            os.makedirs(persist_dir)
        else:
            self.load()

    def add(self, documents, metadatas, ids):
        """Encode documents and store them locally."""
        if not documents:
            return
            
        print(f"[VectorStore] Generating embeddings for {len(documents)} chunks...")
        # Generate embeddings in batch
        new_embeddings = self.model.encode(documents, show_progress_bar=True, convert_to_numpy=True)
        
        for doc, meta, uid, emb in zip(documents, metadatas, ids, new_embeddings):
            self.documents.append(doc)
            self.metadatas.append(meta)
            self.ids.append(uid)
            # Store as list of floats for easy JSON serialization
            self.embeddings.append(emb.tolist())
            
        self.save()
        print(f"[VectorStore] Saved {len(documents)} chunks. Total database size: {len(self.documents)}.")

    def save(self):
        """Persist vector store to a JSON file."""
        data = {
            "documents": self.documents,
            "metadatas": self.metadatas,
            "ids": self.ids,
            "embeddings": self.embeddings
        }
        db_path = os.path.join(self.persist_dir, "db.json")
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        print("[VectorStore] Database persisted to disk.")

    def load(self):
        """Load vector store from local disk."""
        db_path = os.path.join(self.persist_dir, "db.json")
        if os.path.exists(db_path):
            try:
                print("[VectorStore] Loading database from local disk...")
                with open(db_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data.get("documents", [])
                    self.metadatas = data.get("metadatas", [])
                    self.ids = data.get("ids", [])
                    self.embeddings = data.get("embeddings", [])
                print(f"[VectorStore] Database loaded. Found {len(self.documents)} chunks.")
            except Exception as e:
                print(f"[VectorStore] Error loading database: {e}. Starting with an empty index.")

    def count(self):
        return len(self.documents)

    def query(self, query_texts, n_results=5):
        """Query vector database using cosine similarity."""
        results = {
            "documents": [],
            "metadatas": [],
            "ids": [],
            "distances": []
        }
        
        if not self.embeddings or not query_texts:
            return results
            
        # Embed query text
        query_vectors = self.model.encode(query_texts, show_progress_bar=False, convert_to_numpy=True)
        
        # Convert stored embeddings to numpy array
        store_embs = np.array(self.embeddings) # shape (N, 384)
        
        # Calculate magnitudes for normalize
        store_norms = np.linalg.norm(store_embs, axis=1, keepdims=True)
        # Avoid division by zero
        store_norms[store_norms == 0] = 1e-10
        norm_store = store_embs / store_norms
        
        for q_vec in query_vectors:
            q_norm = np.linalg.norm(q_vec)
            if q_norm == 0:
                q_norm = 1e-10
            norm_q = q_vec / q_norm
            
            # Cosine similarity is dot product of normalized vectors
            similarities = np.dot(norm_store, norm_q) # shape (N,)
            
            # Cosine distance is 1.0 - similarity
            distances = 1.0 - similarities
            
            # Get top k indices sorted by distance ascending (closest first)
            top_k_idx = np.argsort(distances)[:n_results]
            
            results["documents"].append([self.documents[idx] for idx in top_k_idx])
            results["metadatas"].append([self.metadatas[idx] for idx in top_k_idx])
            results["ids"].append([self.ids[idx] for idx in top_k_idx])
            results["distances"].append([float(distances[idx]) for idx in top_k_idx])
            
        return results


class RAGEngine:
    def __init__(self, db_path=None):
        import pathlib
        # Default vector DB path is at project root / vector_db
        if db_path is None:
            db_path = str(pathlib.Path(__file__).parent.parent / "vector_db")
        self.db_path = db_path
        self.db = None
        self.opportunities_map = {}

    def load_data(self):
        """Load Data_Salaries.csv and internship.csv, clean them, and build the mapping."""
        print("[RAG] Loading datasets...")
        self.opportunities_map = {}
        
        # Resolve paths relative to the project root (parent of backend/)
        import pathlib
        project_root = pathlib.Path(__file__).parent.parent
        
        # Load Data_Salaries.csv
        salaries_file = project_root / "Data_Salaries.csv"
        df_salaries = pd.DataFrame()
        if salaries_file.exists():
            df_salaries = pd.read_csv(salaries_file)
            print(f"[RAG] Loaded {len(df_salaries)} rows from Data_Salaries.csv")
        else:
            print(f"[RAG] Warning: Data_Salaries.csv not found at {salaries_file}!")

        # Load internship.csv
        internship_file = project_root / "internship.csv"
        df_internships = pd.DataFrame()
        if internship_file.exists():
            df_internships = pd.read_csv(internship_file)
            print(f"[RAG] Loaded {len(df_internships)} rows from internship.csv")
        else:
            print(f"[RAG] Warning: internship.csv not found at {internship_file}!")

        combined_list = []
        
        # Process Salaries
        for idx, row in df_salaries.iterrows():
            opp_id = f"sal_{idx}"
            title = str(row.get("Job Title", "Data Opportunity"))
            company = str(row.get("Company", "Unknown Company"))
            location = str(row.get("Location", "United States"))
            salary = str(row.get("Salary", "Not specified"))
            score = str(row.get("Company Score", "N/A"))
            
            description = (
                f"Opportunity: {title} at {company} (Company Score: {score}) in {location}. "
                f"Salary/Compensation: {salary}. This is a professional data analyst, data scientist, or data engineering role."
            )
            
            opp_data = {
                "id": opp_id,
                "title": title,
                "company": company,
                "location": location,
                "compensation": salary,
                "type": "Internship" if "intern" in title.lower() else "Full-Time / Co-Op",
                "category": "Data Science & AI",
                "source": "Data_Salaries.csv",
                "rating": score,
                "description": description
            }
            combined_list.append(opp_data)
            self.opportunities_map[opp_id] = opp_data

        # Process Internships
        for idx, row in df_internships.iterrows():
            opp_id = f"int_{idx}"
            title = str(row.get("internship_title", "Technical Internship"))
            company = str(row.get("company_name", "Unknown Company"))
            location = str(row.get("location", "Remote"))
            stipend = str(row.get("stipend", "Not specified"))
            duration = str(row.get("duration", "3-6 Months"))
            start_date = str(row.get("start_date", "Immediately"))
            
            description = (
                f"Opportunity: {title} internship at {company} in {location}. "
                f"Duration: {duration}, starting {start_date}. Stipend/Compensation: {stipend}. "
                f"This is an internship opportunity for college students."
            )
            
            t_lower = title.lower()
            category = "Software Engineering"
            if "web" in t_lower or "frontend" in t_lower or "backend" in t_lower or "react" in t_lower or "node" in t_lower:
                category = "Web Development"
            elif "design" in t_lower or "ui" in t_lower or "ux" in t_lower or "graphic" in t_lower:
                category = "UI/UX Design"
            elif "marketing" in t_lower or "seo" in t_lower or "sales" in t_lower:
                category = "Marketing & Sales"
            elif "data" in t_lower or "python" in t_lower or "machine learning" in t_lower or "ai" in t_lower:
                category = "Data Science & AI"
            elif "hr" in t_lower or "human resource" in t_lower or "recruit" in t_lower:
                category = "Human Resources"
            
            opp_data = {
                "id": opp_id,
                "title": title,
                "company": company,
                "location": location,
                "compensation": stipend,
                "type": "Internship",
                "category": category,
                "source": "internship.csv",
                "rating": "N/A",
                "duration": duration,
                "startDate": start_date,
                "description": description
            }
            combined_list.append(opp_data)
            self.opportunities_map[opp_id] = opp_data

        print(f"[RAG] Processed {len(combined_list)} total opportunities.")
        
    def chunk_dataset(self, chunk_size=400, overlap=100):
        """Group opportunities into overlapping sliding-window character chunks."""
        print(f"[RAG] Chunking dataset (Size: {chunk_size}, Overlap: {overlap})...")
        chunks = []
        
        opp_list = list(self.opportunities_map.values())
        
        # Group by 4 items and split with sliding character window overlap
        for i in range(0, len(opp_list), 2):  # stride of 2 for overlap
            group = opp_list[i:i+4]
            if not group:
                continue
            
            group_text = " | ".join([item["description"] for item in group])
            
            idx = 0
            while idx < len(group_text):
                chunk_text = group_text[idx:idx + chunk_size]
                
                contained_ids = []
                for item in group:
                    if item["company"] in chunk_text or item["title"] in chunk_text:
                        contained_ids.append(item["id"])
                
                chunks.append({
                    "text": chunk_text,
                    "opportunity_ids": contained_ids
                })
                
                idx += (chunk_size - overlap)
                if idx >= len(group_text) - overlap:
                    break
                    
        print(f"[RAG] Created {len(chunks)} overlapping chunks.")
        return chunks

    def initialize_chroma(self, force_reindex=False):
        """Initialize local vector database and index files."""
        self.load_data()
        
        # Initialize our custom SimpleVectorStore
        self.db = SimpleVectorStore(persist_dir=self.db_path)
        
        # If database already has records, skip indexing (speed up startup)
        if not force_reindex and self.db.count() > 0:
            print(f"[RAG] SimpleVectorStore already has {self.db.count()} indexed chunks.")
            return

        print(f"[RAG] Indexing chunks. Generating sentence-transformers embeddings...")
        chunks = self.chunk_dataset(chunk_size=400, overlap=100)
        
        # Split chunks into documents, metadatas and ids
        documents = []
        metadatas = []
        ids = []
        
        for idx, chunk in enumerate(chunks):
            documents.append(chunk["text"])
            metadatas.append({"opp_ids": json.dumps(chunk["opportunity_ids"])})
            ids.append(f"chunk_{idx}")
            
        # Insert everything
        self.db.add(documents=documents, metadatas=metadatas, ids=ids)
        print(f"[RAG] Indexing completed. Indexed {self.db.count()} total chunks.")

    def search(self, query: str, limit=5) -> list[dict]:
        """Perform semantic search on our vector store and retrieve original opportunities."""
        if not self.db:
            print("[RAG] Error: Vector DB not initialized!")
            return []
            
        results = self.db.query(
            query_texts=[query],
            n_results=limit
        )
        
        matched_opps = []
        seen_ids = set()
        
        if results and "metadatas" in results and results["metadatas"]:
            metadatas_list = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0]*len(metadatas_list)
            
            for meta, dist in zip(metadatas_list, distances):
                opp_ids = json.loads(meta.get("opp_ids", "[]"))
                
                # Convert cosine distance (0.0 to 2.0) to match score percentage
                match_pct = max(60, min(99, int((1 - dist / 2) * 100 + 15)))
                
                for oid in opp_ids:
                    if oid in self.opportunities_map and oid not in seen_ids:
                        seen_ids.add(oid)
                        opp = self.opportunities_map[oid].copy()
                        opp["matchScore"] = match_pct
                        matched_opps.append(opp)
                        
        return matched_opps[:limit*2]

    def ask_ai(self, conv_id: str, messages: list[dict], user_profile: dict = None) -> dict:
        """Call ASI:One completion service with custom prompt context."""
        global API_KEY
        if not API_KEY:
            _dotenv_path = find_dotenv(usecwd=False, raise_error_if_not_found=False)
            if not _dotenv_path:
                import pathlib
                _dotenv_path = str(pathlib.Path(__file__).parent.parent / ".env")
            load_dotenv(_dotenv_path, override=True)
            API_KEY = os.getenv("ASI_ONE_API_KEY", "").strip()
            
        latest_query = ""
        for msg in reversed(messages):
            if msg["role"] == "user":
                latest_query = msg["content"]
                break
                
        search_query = latest_query
        if user_profile:
            skills = ", ".join(user_profile.get("skills", []))
            interests = ", ".join(user_profile.get("interests", []))
            search_query += f" skills: {skills} interests: {interests} location: {user_profile.get('location', '')}"
            
        print(f"[RAG] Querying Local Vector DB with: '{search_query[:80]}...'")
        context_opportunities = self.search(search_query, limit=5)
        
        context_str = ""
        for idx, opp in enumerate(context_opportunities):
            context_str += (
                f"{idx+1}. ID: {opp['id']} | Title: {opp['title']} | Company: {opp['company']} | "
                f"Location: {opp['location']} | Compensation: {opp['compensation']} | "
                f"Type: {opp['type']} | Category: {opp['category']}\n"
            )

        profile_str = json.dumps(user_profile or {}, indent=2)
        system_prompt = (
            "You are the AI Career GPS counselor for 'OpportunityOS' - an advanced college student success platform. "
            "Your job is to guide students from their freshman year to graduation in finding internships, teammates, clubs, and research.\n\n"
            f"Student Profile:\n{profile_str}\n\n"
            f"Top matching opportunities found in our database (RAG Context):\n{context_str}\n\n"
            "Instructions:\n"
            "1. Analyze the student's request, skills, and the matched opportunities.\n"
            "2. Respond in a supportive, professional, and actionable tone (similar to Notion or Stripe documentation).\n"
            "3. If the student profile is incomplete (e.g. missing skills or interests), politely ask questions to learn more about them so you can refine recommendations.\n"
            "4. Recommend 2-3 specific opportunities from the context, explaining WHY they fit. Reference them by title and company.\n"
            "5. Provide your output as a natural conversation. You may structure recommendations using bullet points, but keep the overall message concise and highly engaging.\n"
        )
        
        chat_messages = [{"role": "system", "content": system_prompt}] + messages
        
        session_id = conv_id
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "x-session-id": session_id,
            "Content-Type": "application/json",
        }
        payload = {
            "model": MODEL,
            "messages": chat_messages,
            "stream": False,
        }
        
        print(f"[ASI:One] Calling completions endpoint for session {session_id}...")
        try:
            # Only use fallback if API key is missing or clearly a placeholder
            is_placeholder = not API_KEY or API_KEY in ("sk-REPLACE_ME", "") or ("REPLACE" in API_KEY and "REPLACE_ME" in API_KEY)
            if is_placeholder:
                # Fallback mock response if API key is not configured
                time_sim = len(latest_query) % 2 + 1
                time.sleep(time_sim)
                
                opp_bullets = ""
                recs = context_opportunities[:3]
                if recs:
                    for opp in recs:
                        opp_bullets += f"- **{opp['title']}** at **{opp['company']}** ({opp['location']}) - Compensation: {opp['compensation']} [Match: {opp['matchScore']}%]\n"
                else:
                    opp_bullets = "- No direct matches found. Try refining your search query.\n"
                
                mock_text = (
                    f"Hi {user_profile.get('name', 'there')}! I've analyzed your background. Based on your profile and search for '{latest_query}', "
                    f"here are some matched positions from our database:\n\n{opp_bullets}\n"
                    f"Since the `ASI_ONE_API_KEY` is not set in `.env` yet, this is a simulated response. Once you update the key, I will provide full natural language guidance! What specific skills or companies would you like to explore next?"
                )
                return {
                    "text": mock_text,
                    "opportunities": context_opportunities[:4],
                    "status": "mock"
                }
                
            resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=TIMEOUT)
            resp.raise_for_status()
            ai_reply = resp.json()["choices"][0]["message"]["content"]
            
            return {
                "text": ai_reply,
                "opportunities": context_opportunities[:4],
                "status": "success"
            }
        except Exception as e:
            print(f"[RAG] Error calling ASI:One API: {e}")
            opp_bullets = ""
            for idx, opp in enumerate(context_opportunities[:3]):
                opp_bullets += f"- **{opp['title']}** at **{opp['company']}** ({opp['location']}) - Compensation: {opp['compensation']}\n"
                
            mock_text = (
                f"Hello! I had trouble reaching the AI completions server, but I retrieved these relevant opportunities from our local database search:\n\n"
                f"{opp_bullets}\n"
                f"How do these look to you? I can help refine your filters or details."
            )
            return {
                "text": mock_text,
                "opportunities": context_opportunities[:4],
                "status": "error"
            }

# Singleton instance
rag_engine = RAGEngine()
