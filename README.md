# NoteHub — Homework 09: Authentication

A full-stack notes application built with Next.js App Router, TypeScript, Axios, TanStack Query, and Zustand.

This project extends the previous NoteHub application with user authentication, protected routes, user profile management, and secure API requests using cookies.

## Technologies

- Next.js 16 (App Router)
- React and TypeScript
- Axios
- TanStack Query (React Query)
- Zustand
- CSS Modules
- Next.js Proxy
- Vercel

## Features

### Authentication

- User registration and login
- Authentication using HTTP cookies
- Session verification
- Logout functionality
- Protected routes for notes and user profiles
- Dynamic navigation based on authentication status

### User Profile

- View user information (username, email, avatar)
- Edit username
- Save profile changes through API
- Update global authentication state using Zustand

### Notes Management

- Display personal notes
- Filter notes by category
- Search notes
- Pagination
- View note details
- Create new notes
- Delete notes
- Draft persistence using Zustand and localStorage

## Project Structure

```text
app/
  (auth routes)/
    sign-in/
    sign-up/
  (private routes)/
    @modal/
    notes/
    profile/
      edit/
  api/

components/
  AuthNavigation/
  AuthProvider/
  Header/
  Footer/
  NoteForm/
  NoteList/
  SearchBox/
  Pagination/

lib/
  api/
    api.ts
    clientApi.ts
    serverApi.ts
  store/
    authStore.ts

types/
  note.ts
  user.ts

proxy.ts
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shafaroy/09-auth.git
cd 09-auth
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The application communicates with the authenticated NoteHub API through Next.js API routes.

Backend API: https://notehub-api.goit.study

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Authentication Flow

1. Users register or log in using their email and password.
2. The backend manages authentication tokens using cookies.
3. AuthProvider verifies the current session.
4. Zustand stores the authenticated user's information.
5. Proxy redirects unauthenticated users away from private routes.
6. Authenticated users can access their notes and profile.
7. Users can log out securely.

## Main Routes

| Route                  | Description   | Access        |
| ---------------------- | ------------- | ------------- |
| `/`                    | Home page     | Public        |
| `/sign-up`             | Registration  | Guest         |
| `/sign-in`             | Login         | Guest         |
| `/profile`             | User profile  | Authenticated |
| `/profile/edit`        | Edit username | Authenticated |
| `/notes/filter/all`    | Notes list    | Authenticated |
| `/notes/[id]`          | Note details  | Authenticated |
| `/notes/action/create` | Create note   | Authenticated |

## Quality Checks

Run the following commands before deployment:

```bash
npx tsc --noEmit
npm run lint
npx prettier --check .
npm run build
```

## Deployment

The project is designed for deployment on Vercel.

Configure the following environment variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://YOUR-PROJECT.vercel.app
```

Use the actual production domain of your application, without `/api` at the end.

Redeploy after modifying environment variables.

Before submitting the homework, verify registration, login, logout, session persistence, protected routes, profile editing, and note management in the deployed application.

## Author

**Oksana Shafar**

GitHub: https://github.com/shafaroy

Developed as part of the GoIT Fullstack Development course.
