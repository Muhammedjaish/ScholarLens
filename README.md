# ScholarLens: Academic Research Paper Summarizer & Synthesis Portal

A full-stack, industry-standard web application designed for academic researchers, graduate students, and undergraduate literature reviews. Developed for college Django course evaluation and project viva presentation.

---

## 1. Executive Summary & Core Objectives

### The Problem
Academic research preprints (on platforms such as arXiv) are dense, mathematically rigorous, and time-consuming to digest. Researchers and students frequently spend hours reading 20+ page PDFs just to extract:
1. What exact problem is being tackled?
2. What are the key empirical contributions and metrics?
3. What is the fundamental architecture or methodology?
4. How would you explain this paper to a non-specialist or undergraduate peer?
5. What are the critical research limitations and future scope?

### The Solution: ScholarLens
ScholarLens transforms complex scientific literature into structured, multi-dimensional syntheses. It directly queries the official Cornell University **arXiv.org API**, ingests paper metadata, authors, and classification, and produces publication-grade breakdowns:
- **Executive Overview**: High-level problem formulation and proposed solution.
- **Key Findings**: Structured bullet points of empirical benchmarks and outcomes.
- **Methodology**: Core algorithms, mathematical models, or neural architecture.
- **Plain-Language Summary**: Layperson breakdown accessible to non-specialists.
- **Limitations & Scope**: Identified constraints, assumptions, and future directions.
- **BibTeX Generator**: Instant, copyable academic citation entry ready for LaTeX / Overleaf.
- **Research Collections**: Personalized reading queues (To Read, In Progress, Completed) with research notes.
- **Voting & Feedback**: Community relevance scores and reading history tracking.

---

## 2. Technology Stack & Architectural Separation

ScholarLens implements a strict separation of concerns between backend services and client presentation:

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│      (Client SPA: Pages, Components, AuthContext)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTP REST APIs (JSON)
           (Token Auth + CORS + CSRF Headers)
                           │
┌──────────────────────────▼─────────────────────────────┐
│             Django 6 + Django REST Framework           │
│   ├── accounts: User Auth, Profiles, DRF Tokens        │
│   └── papers: arXiv Ingestion, NLP Synthesis Engine,   │
│               Collections, Reading History, BibTeX     │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌───────────────────┐
│  SQLite Database │               │ Official arXiv API│
│ (Portable & Fast)│               │  (XML Atom Feed)  │
└──────────────────┘               └───────────────────┘
```

- **Backend:** Python 3.14 / Django 6, Django REST Framework (DRF), `django-cors-headers`, `requests`.
- **Frontend:** React 18, Vite 6, Axios, React Router v6, Lucide Icons.
- **Database:** SQLite 3 (Default, self-contained for college viva) with full PostgreSQL portability via Django ORM.
- **Authentication:** Token-based authentication via `rest_framework.authtoken`.
- **API Communication:** RESTful JSON contracts with normalized error handling.

---

## 3. Project Directory Structure

```text
DjangoProject/
├── backend/
│   ├── manage.py                       # Django CLI utility
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment variable template
│   ├── .env                            # Active environment configuration
│   ├── db.sqlite3                      # Pre-seeded database with sample data
│   │
│   ├── core/                           # Root Django project package
│   │   ├── __init__.py
│   │   ├── settings.py                 # DRF, CORS, Auth, & App configuration
│   │   ├── urls.py                     # Top-level URL dispatcher (/api/, /admin/)
│   │   ├── wsgi.py                     # WSGI entry point
│   │   ├── asgi.py                     # ASGI entry point
│   │   └── exceptions.py               # Centralized exception handling & error normalization
│   │
│   ├── accounts/                       # Authentication & User Profiles App
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                   # UserProfile (institution, field of study, bio)
│   │   ├── signals.py                  # Auto-creates UserProfile on user registration
│   │   ├── serializers.py              # Register, Login, User, & Profile serializers
│   │   ├── views.py                    # RegisterView, LoginView, LogoutView, UserView
│   │   ├── urls.py                     # /api/auth/* endpoints
│   │   └── admin.py                    # Django admin integration
│   │
│   └── papers/                         # Academic Papers & Synthesis App
│       ├── __init__.py
│       ├── apps.py
│       ├── models.py                   # Paper, Author, Summary, Collection, Vote, ReadingHistory
│       ├── services.py                 # arXiv API client & Academic NLP Summarization Engine
│       ├── serializers.py              # Paper, Summary, Collection, & BibTeX serializers
│       ├── views.py                    # Search, Detail, Summarize, Vote, Collections views
│       ├── urls.py                     # /api/papers/*, /api/collections/* endpoints
│       ├── admin.py                    # Admin registration for papers, summaries, and collections
│       ├── tests.py                    # Unit tests for models, services, and REST APIs
│       └── management/
│           └── commands/
│               └── seed_data.py        # Seeds seminal papers (Transformers, ResNet, BERT)
│
└── frontend/                           # React.js SPA Application
    ├── package.json                    # Node dependencies
    ├── vite.config.js                  # Vite server & proxy configuration
    ├── index.html                      # HTML template with academic typography
    ├── dist/                           # Production-ready build artifacts
    └── src/
        ├── main.jsx                    # React entrypoint
        ├── App.jsx                     # Route definitions & layout wrappers
        ├── index.css                   # Custom academic design system & color tokens
        │
        ├── api/
        │   ├── client.js               # Axios instance with auth interceptor & error normalization
        │   ├── auth.js                 # Authentication API calls
        │   ├── papers.js               # Search, paper details, synthesis, votes, & BibTeX calls
        │   └── collections.js          # Research collections CRUD calls
        │
        ├── context/
        │   └── AuthContext.jsx         # Global user state & token persistence
        │
        ├── components/
        │   ├── Navbar.jsx              # Navigation header with user dropdown
        │   ├── Footer.jsx              # Academic footer & technology overview
        │   ├── PaperCard.jsx           # Paper list item card
        │   ├── SummaryViewer.jsx       # 6-tabbed structured synthesis viewer
        │   └── CollectionModal.jsx     # Quick-save modal with research notes & reading status
        │
        └── pages/
            ├── HomePage.jsx            # Hero search, feature pillars, & benchmark papers
            ├── PaperDetailPage.jsx     # Paper breakdown, synthesis tabs, & PDF access
            ├── SearchResultsPage.jsx   # Live search results with filters
            ├── CollectionsPage.jsx     # Research collections manager
            ├── CollectionDetailPage.jsx# Collection paper viewer with reading status toggles
            ├── LoginPage.jsx           # User sign-in with fast demo credentials buttons
            ├── RegisterPage.jsx        # Researcher registration form
            └── DashboardPage.jsx       # Profile editor & reading history log
```

---

## 4. Setup & Execution Instructions

### Prerequisites
- **Python**: Version 3.10+ (Tested on Python 3.14)
- **Node.js**: Version 18+ (Tested on Node.js v22)

---

### Step A: Backend Setup (Django)

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify `.env` configuration (a default `.env` is configured for NVIDIA Nemotron):
   ```env
   SECRET_KEY=django-insecure-academic-paper-research-portal-key-change-in-production
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

   # NVIDIA Nemotron 3 Ultra Configuration
   NVIDIA_API_KEY=nvapi-...your-nvidia-key...
   NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
   NVIDIA_MODEL=nvidia/nemotron-3-ultra
   ```
   *Note: If `NVIDIA_API_KEY` is omitted or left blank, the application automatically uses the high-precision built-in NLP extractive & structuring engine. Zero external paid API keys are required for your presentation, but whenever an NVIDIA key is added, it synthesizes papers with NVIDIA Nemotron 3 Ultra!*

5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

6. Seed sample data (creates demo users and seminal papers):
   ```bash
   python manage.py seed_data
   ```

7. Run backend unit tests:
   ```bash
   python manage.py test
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will be live at `http://127.0.0.1:8000/`.

---

### Step B: Frontend Setup (React + Vite)

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will be accessible at: **`http://localhost:5173`**

4. (Optional) Build production bundle:
   ```bash
   npm run build
   ```

---

## 5. Pre-Configured Demo Accounts for Project Viva

For your project demonstration, the database comes pre-seeded with two demo accounts:

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Researcher** | `researcher` | `ResearcherPass123!` | Standard academic user with collections and reading history |
| **Administrator** | `admin` | `AdminPass123!` | Superuser with full access to `/admin/` |

> *Tip: On the Sign In page, you can simply click the **"Researcher User"** or **"Admin User"** button to auto-fill credentials instantly without typing!*

---

## 6. REST API Reference

All endpoints return structured, predictable JSON responses.

### Authentication Endpoints
- `POST /api/auth/register/` - Register a new researcher account. Returns authentication token and user profile.
- `POST /api/auth/login/` - Authenticate username/password and receive an auth token.
- `POST /api/auth/logout/` - Invalidate active auth token.
- `GET /api/auth/user/` - Retrieve authenticated user's profile, institution, and field of study.
- `PATCH /api/auth/user/` - Update profile bio, institution, or field of study.

### Paper & Synthesis Endpoints
- `GET /api/papers/search/?q={query}` - Search across local indexed papers and query the live arXiv API.
- `GET /api/papers/{arxiv_id}/` - Retrieve full paper details, author affiliations, votes, and structured synthesis.
- `POST /api/papers/{arxiv_id}/summarize/` - Generate or re-generate structured synthesis.
- `POST /api/papers/{arxiv_id}/vote/` - Upvote (+1) or downvote (-1) paper.
- `GET /api/papers/{arxiv_id}/bibtex/` - Export formatted BibTeX reference.

### Collection Endpoints
- `GET /api/collections/` - List authenticated user's collections.
- `POST /api/collections/` - Create a new research collection.
- `GET /api/collections/{id}/` - Retrieve specific collection with its saved papers and research notes.
- `DELETE /api/collections/{id}/` - Delete a collection.
- `POST /api/collections/{id}/items/` - Add/update paper in collection with notes and reading status.
- `DELETE /api/collections/{id}/items/` - Remove paper from collection.
- `GET /api/history/` - Retrieve user's personal reading history.

---

## 7. Security & Best Practices

1. **Authentication:** Token-based authentication using Django REST Framework's Token model (`Token <key>` header).
2. **Password Hashing:** Passwords securely hashed using Django's PBKDF2 with SHA256.
3. **CORS Isolation:** `django-cors-headers` explicitly restricted to `http://localhost:5173`.
4. **Input Sanitization:** arXiv IDs sanitized via regular expressions (`ArxivService.clean_id`) to prevent path traversal or injection.
5. **No Hardcoded Secrets:** All secret keys and configuration loaded via `.env`.
6. **Centralized Error Handling:** Custom exception handler (`core.exceptions.custom_exception_handler`) prevents sensitive tracebacks from leaking in production mode.

---

## 8. College Viva Defense Guide: How to Explain Each Module

| Module | What to explain to your evaluator |
|---|---|
| `accounts/models.py` | "We extend the default User model using a OneToOne `UserProfile` model connected via Django `post_save` signals. This keeps user credentials separate from academic metadata like institution and field of study." |
| `papers/models.py` | "We designed a normalized relational schema with `Paper`, `Author` (Many-to-Many), `Summary` (One-to-One), `Collection` (Foreign Key to User), and `CollectionItem` (linking papers to collections with reading statuses)." |
| `papers/services.py` | "This is our core service layer. `ArxivService` connects to `export.arxiv.org/api/query` and parses Atom XML feeds into structured Python dicts. `AcademicSummarizationEngine` implements a pluggable architecture: it checks if an `NVIDIA_API_KEY` is configured to query NVIDIA Nemotron 3 Ultra via NVIDIA's NIM API endpoint (`https://integrate.api.nvidia.com/v1`); if not, it automatically runs our deterministic academic NLP structuring algorithm that segments the abstract into 5 publication sections." |
| `core/exceptions.py` | "We implemented a custom exception handler that normalizes all DRF error responses into a consistent JSON contract (`success: false`, `error: {status_code, message, details}`) so the frontend never crashes on unhandled errors." |
| `frontend/src/context/AuthContext.jsx` | "We manage global authentication state using React Context. Tokens are stored in `localStorage` and automatically attached to outgoing HTTP requests via Axios interceptors." |
| `frontend/src/components/SummaryViewer.jsx` | "Instead of a generic wall of text, this component provides a 6-tabbed academic synthesis: Executive Overview, Key Findings, Methodology, Lay Summary, Limitations, and BibTeX citation." |

---

## 9. Conclusion
ScholarLens transforms an overly complex legacy SaaS codebase into a clean, modern, fully integrated Django + React academic platform. It is secure, robust, fully functional from a fresh installation, and ready for college project submission and evaluation.

