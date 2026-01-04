# Supabase Setup Guide

## Common Issues and Solutions

### Issue 1: "Missing required environment variables"

**Solution:**
1. Create a `.env` file in the `backend` directory
2. Add your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=4000
FRONTEND_URL=http://localhost:5173
```

**How to get credentials:**
- Go to https://supabase.com
- Open your project dashboard
- Go to **Settings** → **API**
- Copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public** key → `SUPABASE_ANON_KEY`

---

### Issue 2: "relation 'tasks' does not exist" or "table not found"

**Solution:** Create the `tasks` table in your Supabase database.

#### Option A: Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  priority TEXT NOT NULL DEFAULT 'media',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_email for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON tasks(user_email);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
```

#### Option B: Using Supabase Table Editor

1. Go to **Table Editor** in Supabase dashboard
2. Click **New Table**
3. Name it `tasks`
4. Add columns:
   - `id` (uuid, primary key, default: `gen_random_uuid()`)
   - `user_email` (text, not null)
   - `title` (text, not null)
   - `description` (text, nullable)
   - `status` (text, not null, default: `'pendente'`)
   - `priority` (text, not null, default: `'media'`)
   - `due_date` (date, nullable)
   - `created_at` (timestamp, default: `now()`)
   - `updated_at` (timestamp, default: `now()`)

---

### Issue 3: "Failed to connect to Supabase" or Connection Timeout

**Possible causes:**
1. **Wrong URL format**: Make sure your `SUPABASE_URL` starts with `https://` and doesn't have a trailing slash
   - ✅ Correct: `https://abcdefgh.supabase.co`
   - ❌ Wrong: `https://abcdefgh.supabase.co/` or `http://...`

2. **Wrong API key**: Make sure you're using the **anon public** key, not the service_role key

3. **Network/Firewall**: Check if your network allows connections to Supabase

4. **Project paused**: Check if your Supabase project is active (free tier projects pause after inactivity)

**Solution:**
- Verify your `.env` file has correct values
- Test connection in Supabase dashboard
- Check Supabase project status

---

### Issue 4: "Column does not exist" errors

**Solution:** The column names in your Supabase table must match exactly:
- `user_email` (not `userEmail`)
- `due_date` (not `dueDate`)
- `created_at` (not `createdAt`)
- `updated_at` (not `updatedAt`)

The backend routes automatically transform the data, but make sure your table has these exact column names.

---

### Issue 5: Row Level Security (RLS) blocking queries

**Solution:** If you have RLS enabled, you need to create policies:

```sql
-- Allow users to read their own tasks
CREATE POLICY "Users can read own tasks"
ON tasks FOR SELECT
USING (auth.uid()::text = user_email);

-- Allow users to insert their own tasks
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid()::text = user_email);

-- Allow users to update their own tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid()::text = user_email);

-- Allow users to delete their own tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid()::text = user_email);
```

**OR** disable RLS for the `tasks` table (not recommended for production):

```sql
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

---

## Testing Your Connection

### Test 1: Check Environment Variables

Run this in your backend directory:
```bash
node -e "require('dotenv').config(); console.log('URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Missing ✗'); console.log('Key:', process.env.SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗');"
```

### Test 2: Test Connection in Node

Create a test file `test-connection.js` in backend:

```javascript
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
```

Run: `node test-connection.js`

---

## Quick Checklist

- [ ] `.env` file exists in `backend/` directory
- [ ] `SUPABASE_URL` is set correctly (starts with `https://`)
- [ ] `SUPABASE_ANON_KEY` is set correctly
- [ ] `tasks` table exists in Supabase
- [ ] Table has correct column names (`user_email`, not `userEmail`)
- [ ] RLS is disabled OR policies are set correctly
- [ ] Supabase project is active (not paused)

---

## Need Help?

If you're still having issues:
1. Check the backend console for detailed error messages
2. Check Supabase dashboard → Logs for API errors
3. Verify your table structure matches the schema above
4. Test the connection using the test script above

