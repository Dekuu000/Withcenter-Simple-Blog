# System Architecture

## 1. Data Model

The application uses a relational model hosted on Supabase (PostgreSQL).

### Tables

*   **`auth.users`**: Managed by Supabase Auth. Stores email, encrypted passwords, and user metadata.
*   **`public.profiles`**: Publicly accessible user data.
    *   `id` (FK -> auth.users.id)
    *   `email`
    *   `full_name`
    *   `avatar_url`
*   **`public.blogs`**: Stores content.
    *   `id` (UUID)
    *   `title` (Text)
    *   `content` (Text)
    *   `author_id` (FK -> profiles.id)
    *   `created_at`, `updated_at` (Timestamps)

### Relationships
*   **One-to-One**: `auth.users` ↔ `public.profiles` (Handled via Postgres Triggers on signup).
*   **One-to-Many**: `profiles` → `blogs` (A user can write multiple blogs).

## 2. Data Flow

The application follows a unidirectional data flow pattern using Redux.

### Query Flow (Example: Fetching Blogs)
1.  **UI Action**: User visits home page (`BlogList.tsx`).
2.  **Dispatch**: Component dispatches `fetchBlogs({ page: 1 })`.
3.  **Thunk Middleware**: `fetchBlogs` async thunk calls `blogApi.getBlogs()`.
4.  **Service Layer**: `src/services/api.ts` constructs the Supabase query:
    ```typescript
    supabase.from('blogs').select('*, profiles(...)').range(...)
    ```
5.  **State Update**:
    *   `pending`: Sets `loading = true`.
    *   `fulfilled`: Updates `blogs` array and `totalCount`.
6.  **Re-render**: UI displays the list of `BlogCard` components.

### 'My Posts' Filtering
1.  **Context**: Helper function checks `currentUser.id`.
2.  **API**: Calls `blogApi.getBlogsByAuthor(currentUser.id)`.
3.  **Database**: Executes `SELECT * FROM blogs WHERE author_id = '...'`.
4.  **Security**: RLS Policy `Blogs are viewable by everyone` allows reading, but Edit/Delete buttons are only rendered if `user.id === blog.author_id`.

## 3. Security Model

Security is enforced at multiple layers:

1.  **Route Level (Frontend)**:
    *   `ProtectedRoute` wrapper redirects unauthenticated users away from `/create-blog` and `/my-posts`.
2.  **Logic Level (UI)**:
    *   Edit/Delete buttons are conditionally rendered only for the post author.
    *   **Feedback Layer**: Modals and Toasts provide immediate, accessible feedback for all CRUD actions.
3.  **Database Level (RLS)**:
    *   **Select**: Public (`true`).
    *   **Insert**: Authenticated users only.
    *   **Update/Delete**: `auth.uid() = author_id`.

This ensures that even if a user manipulates the client-side code, the database rejects unauthorized modifications.
