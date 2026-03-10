# Project Folder Structure

```
edubridge-ai/
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM package configuration
├── package-lock.json             # NPM lock file
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── middleware.ts                 # Next.js middleware
│
├── app/                         # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   │
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── analyze-candidate/
│   │   │   └── route.ts
│   │   ├── execute/
│   │   │   └── route.ts
│   │   ├── generate-roadmap/
│   │   │   └── route.ts
│   │   ├── progress/
│   │   │   └── update/
│   │   │       └── route.ts
│   │   └── user/
│   │       ├── store.ts
│   │       └── profile/
│   │           └── route.ts
│   │
│   ├── auth/
│   │   └── page.tsx
│   │
│   ├── community/
│   │   └── page.tsx
│   │
│   ├── dashboard/              # Dashboard pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── ai-interview/
│   │   ├── ai-path/
│   │   ├── ai-portfolio/
│   │   ├── ai-roadmap/
│   │   ├── assignments/
│   │   ├── career/
│   │   ├── courses/
│   │   │   └── [courseId]/
│   │   ├── employer/
│   │   ├── messages/
│   │   ├── practice/
│   │   ├── settings/
│   │   └── visual-roadmap/
│   │
│   ├── signin/
│   │   └── page.tsx
│   │
│   ├── components/             # App-specific components
│   │   ├── Providers.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── AIInterviewPrep.tsx
│   │   ├── BusinessSimulation.tsx
│   │   ├── RecommendedJobs.tsx
│   │   ├── ResumePreview.tsx
│   │   └── dashboard/          # Dashboard components
│   │       ├── AICareerPortfolio.tsx
│   │       ├── AIInterview.tsx
│   │       ├── AIPortfolioPro.tsx
│   │       ├── AISupportChat.tsx
│   │       ├── CourseProgressDashboard.tsx
│   │       ├── DynamicRoadmap.tsx
│   │       ├── EditProfile.tsx
│   │       ├── EmployeeDashboard.tsx
│   │       ├── EmployerStudentChat.tsx
│   │       ├── Header.tsx
│   │       ├── RealTimeDashboard.tsx
│   │       ├── RealTimeHeader.tsx
│   │       ├── Sidebar.tsx
│   │       ├── SocialLinks.tsx
│   │       └── VisualAIRoadmap.tsx
│   │
│   └── lib/                    # Utility libraries
│       ├── auth.tsx
│       ├── supabase.ts
│       ├── cv-generator.ts
│       ├── telegram-discord.ts
│       ├── useUser.ts
│       ├── useCourseProgress.ts
│       ├── useAssignmentNotifications.ts
│       ├── useEmployeeNotifications.ts
│       └── useCareerIntelligence.ts
│
├── components/                  # Shared components (root level)
│   ├── Providers.tsx
│   ├── ThemeContext.tsx
│   ├── AIInterviewPrep.tsx
│   ├── BusinessSimulation.tsx
│   ├── RecommendedJobs.tsx
│   ├── ResumePreview.tsx
│   └── dashboard/               # Dashboard components
│
├── lib/                        # Root-level lib folder
│   ├── auth.tsx
│   ├── supabase.ts
│   ├── cv-generator.ts
│   ├── telegram-discord.ts
│   ├── useUser.ts
│   ├── useCourseProgress.ts
│   ├── useAssignmentNotifications.ts
│   ├── useEmployeeNotifications.ts
│   └── useCareerIntelligence.ts
│
├── backend/                    # Python backend
│   ├── requirements.txt
│   ├── main.py
│   ├── init_db.py
│   ├── alembic.ini
│   │
│   ├── app/
│   │   ├── app.py
│   │   ├── schemas.py
│   │   ├── storage.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── db_utility.py
│   │   │   └── supabase_initialize.py
│   │   │
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── storage.py
│   │   │
│   │   ├── middleware/
│   │   │   ├── timer.py
│   │   │   └── AuthenticationMiddleware.py
│   │   │
│   │   ├── models/
│   │   │   └── psql_model.py
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── issues.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── agent_route.py
│   │   │       ├── authentication_route.py
│   │   │       └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   │
│   │   └── services/
│   │       ├── authentication_service.py
│   │       ├── jwt_service.py
│   │       └── password_hashing.py
│   │
│   ├── migration/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   └── vercel.json
│
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── *.sql                       # Database schema files
    ├── database-schema.sql
    ├── supabase-schema.sql
    ├── supabase-progress-schema.sql
    ├── supabase-assignments-schema.sql
    ├── supabase-rls-policies.sql
    ├── supabase-employer-interests.sql
    ├── supabase-student-analyses.sql
    ├── create_users_table.sql
    ├── add-rich-text-column.sql
    ├── add-submission-columns.sql
    ├── fix-rls-policy.sql
    └── assignments-rls-policy.sql
```

## Summary

- **Frontend**: Next.js 16 with App Router (TypeScript)
- **Backend**: Python/FastAPI
- **Database**: PostgreSQL with Supabase
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI, Google Gemini

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router (pages, API routes, layouts) |
| `app/components/` | React components specific to the app |
| `app/lib/` | Utility functions and hooks |
| `components/` | Shared/reusable components |
| `lib/` | Root-level utilities |
| `backend/` | Python FastAPI backend |
| `public/` | Static assets |
| `*.sql` | Database schemas and migrations |

