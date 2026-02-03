# BlogApp

> A minimal, modern blog platform built with React, TypeScript, and Supabase.

BlogApp is a full-featured blogging application that demonstrates authentication, CRUD operations, and author-specific content management. It features a clean, medium-style writing interface and robust security via Row Level Security (RLS).

## 🚀 Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **State Management**: Redux Toolkit (Slices, Async Thunks)
-   **Styling**: Tailwind CSS
-   **Backend**: Supabase (PostgreSQL, Auth, Storage)
-   **Icons**: Lucide React
-   **Code Quality**: ESLint, Prettier, Husky, lint-staged
-   **CI/CD**: GitHub Actions
-   **Deploy**: Netlify (Automated)

## ✨ Key Features

*   **🔐 User Authentication**: Secure Login/Register flows using Supabase Auth with strict email format validation.
*   **📝 Content Management**: Create, Edit, and Delete blog posts with a polished editor UI.
*   **👤 Author Profiles**: Automatic profile generation for new users; display generic avatars or custom data.
*   **📄 Pagination**: Server-side pagination for optimized performance with large datasets.
*   **📂 My Posts**: Filtered dashboard for authors to manage their own content.
*   **💬 Interactive Feedback**: Professional confirmation modals and auto-dismissing success/error feedback.
*   **🔒 Security**: Row Level Security (RLS) ensures users can only modify their own posts.
*   **🚀 CI/CD**: Automated testing, linting, and deployment pipeline.
*   **✨ Code Quality**: Pre-commit hooks, ESLint, and Prettier for consistent code.

## 🛠️ Architecture Overview

The application follows a feature-based folder structure for scalability coverage:

*   **`src/features`**: Contains Redux slices (`authSlice`, `blogSlice`) and feature-specific components (`BlogCard`).
*   **`src/pages`**: Top-level route components (`BlogList`, `ViewBlog`, `CreateBlog`).
*   **`src/services`**: Centralized API logic interacting with the Supabase client.
*   **`src/types`**: Shared TypeScript interfaces (`Blog`, `Profile`) for type safety across the app.

## 💻 Local Development

### Prerequisites
*   Node.js v18+
*   A Supabase project (Free tier)

### Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Dekuu000/Withcenter-Simple-Blog.git
    cd blog-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory (see `.env.example` for template):
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Development Workflow

**Code Quality:**
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run type-check    # Validate TypeScript types
```

**Pre-commit Hooks:**
Git hooks automatically run linting and formatting on staged files before each commit.


### Database Setup (Supabase)
Run the provided SQL scripts in your Supabase SQL Editor to set up tables and security policies.
(See `supabase_schema.sql` for the full schema definition).

## 🚀 Deployment

The app features **automated CI/CD** with GitHub Actions.

### Automated Deployment
Pushing to `main` branch automatically:
1. Runs linting and type checks
2. Builds the application
3. Deploys to Netlify

### Manual Deployment

**Netlify Build Settings:**
*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`

**Required Environment Variables:**
*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_ANON_KEY`

### GitHub Secrets (for CI/CD)
Add these to your repository secrets:
*   `NETLIFY_AUTH_TOKEN`
*   `NETLIFY_SITE_ID`

## 🔍 For Interviewers

If you are reviewing this code, here are key areas of interest:

*   **State Management**: Check `src/features/blog/blogSlice.ts` to see how Async Thunks handle data fetching states (loading, success, error).
*   **API Layer**: See `src/services/api.ts` for clean separation of backend logic.
*   **Type Safety**: `src/types/index.ts` defines the core data models used throughout.
*   **Component Design**: `src/components/Pagination.tsx` and `src/components/UserProfileMenu.tsx` demonstrate reusable UI patterns.

---

Built by Rommel Jackson Alipao
