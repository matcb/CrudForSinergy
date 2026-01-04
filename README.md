# CrudForSinergy - Task Management App

A full-stack task management application with React frontend and Express backend, using IndexedDB for local storage and Supabase for cloud synchronization.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (for backend database)

## Setup Instructions

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

#### Backend Configuration

1. Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=4000
FRONTEND_URL=http://localhost:5173
```

**How to get Supabase credentials:**
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" (SUPABASE_URL)
- Copy the "anon public" key (SUPABASE_ANON_KEY)

### 3. Set Up Supabase Database

Make sure your Supabase database has a `tasks` table with the following structure:
- `id` (uuid, primary key)
- `user_email` (text)
- `title` (text)
- `description` (text, nullable)
- `status` (text)
- `priority` (text)
- `due_date` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Running the Application

### Option 1: Run Both Servers (Recommended)

You'll need **two terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:4000`

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Option 2: Run Frontend Only (Offline Mode)

If you only want to test the frontend with IndexedDB (no backend sync):
```bash
cd frontend
npm run dev
```

The app will work with local IndexedDB storage only. Backend sync features won't be available.

## Accessing the Application

Once both servers are running:
1. Open your browser
2. Navigate to `http://localhost:5173`
3. You'll see the login page
4. Create an account or sign in with existing credentials

## Available Scripts

### Backend Scripts
- `npm start` - Start the backend server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
CrudForSinergy/
├── backend/           # Express.js backend server
│   ├── config/       # Database configuration
│   ├── routes/       # API routes
│   └── index.js      # Server entry point
├── frontend/         # React frontend application
│   └── src/
│       ├── components/  # React components
│       ├── pages/      # Page components
│       └── main.jsx     # App entry point
└── db/              # IndexedDB utilities
    └── db.js        # Database functions
```

## Troubleshooting

### Backend won't start
- Check that `.env` file exists in `backend/` directory
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
- Ensure port 4000 is not already in use

### Frontend won't start
- Check that all dependencies are installed (`npm install`)
- Verify port 5173 is not already in use
- Check browser console for errors

### Database connection errors
- Verify Supabase credentials in `.env` file
- Check that Supabase project is active
- Ensure `tasks` table exists in your Supabase database

### CORS errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default is `http://localhost:5173`

## Features

- ✅ User authentication (local storage)
- ✅ Create, read, update, delete tasks
- ✅ Task filtering (all, pending, completed)
- ✅ Task priority levels (low, medium, high)
- ✅ Due date management
- ✅ Task statistics
- ✅ Offline support (IndexedDB)
- ✅ **Cloud sync to Supabase** - Click "Sync Supabase" button to push IndexedDB data to Supabase

## Notes

- The app uses IndexedDB for local storage, so data persists in your browser
- Backend sync is optional - the app works offline
- Passwords are currently stored in plain text (see IMPROVEMENTS.md for security recommendations)

