
-- Create users table to store registered usernames
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create session_cookies table to store uploaded cookie files
CREATE TABLE public.session_cookies (
  id SERIAL PRIMARY KEY,
  cookie_data JSONB NOT NULL,
  file_name VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (uploaded_by) REFERENCES users(username) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_cookies ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (allow anyone to read and insert)
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);

-- Create policies for session_cookies table (allow anyone to read, insert, update, delete)
CREATE POLICY "Anyone can view session cookies" ON public.session_cookies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert session cookies" ON public.session_cookies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update session cookies" ON public.session_cookies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete session cookies" ON public.session_cookies FOR DELETE USING (true);

-- Create function to automatically cleanup old cookies when new one is uploaded
CREATE OR REPLACE FUNCTION public.cleanup_old_cookies()
RETURNS TRIGGER AS $$
BEGIN
  -- Deactivate all existing cookies before inserting new one
  UPDATE public.session_cookies 
  SET is_active = FALSE 
  WHERE is_active = TRUE AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup function after insert
CREATE TRIGGER cleanup_old_cookies_trigger
  AFTER INSERT ON public.session_cookies
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_cookies();

-- Create function to auto-delete sessions older than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.session_cookies 
  WHERE uploaded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
