-- Create enum types for error severity and status
CREATE TYPE error_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE error_status AS ENUM ('open', 'investigating', 'resolved', 'closed');

-- Create errors table with all requested fields
CREATE TABLE public.errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT, -- Campo para resolução do erro
  severity error_severity NOT NULL,
  status error_status NOT NULL DEFAULT 'open',
  system TEXT NOT NULL,
  error_code TEXT,
  stack_trace TEXT,
  image_url TEXT, -- Campo para imagem
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  occurrences INTEGER NOT NULL DEFAULT 1,
  last_occurrence TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Errors are viewable by everyone" 
ON public.errors 
FOR SELECT 
USING (true);

-- Create policy for inserting errors
CREATE POLICY "Anyone can create errors" 
ON public.errors 
FOR INSERT 
WITH CHECK (true);

-- Create policy for updating errors
CREATE POLICY "Anyone can update errors" 
ON public.errors 
FOR UPDATE 
USING (true);

-- Create policy for deleting errors
CREATE POLICY "Anyone can delete errors" 
ON public.errors 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_errors_updated_at
BEFORE UPDATE ON public.errors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for error images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('error-images', 'error-images', true);

-- Create storage policies for error images
CREATE POLICY "Error images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'error-images');

CREATE POLICY "Anyone can upload error images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'error-images');

CREATE POLICY "Anyone can update error images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'error-images');

CREATE POLICY "Anyone can delete error images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'error-images');

-- Insert sample data
INSERT INTO public.errors (title, description, severity, status, system, error_code, stack_trace, timestamp, assigned_to, tags, occurrences, last_occurrence) VALUES
('Database Connection Timeout', 'Connection to primary database exceeded timeout limit of 30 seconds', 'critical', 'open', 'Database', 'DB_TIMEOUT_001', 'at DatabaseConnection.connect(db.js:45)\nat UserService.getUser(user.js:12)', '2024-01-15T10:30:00Z', 'John Silva', ARRAY['database', 'timeout', 'connection'], 15, '2024-01-15T14:22:00Z'),
('Authentication Service Down', 'Auth microservice returning 503 Service Unavailable', 'critical', 'investigating', 'Authentication', 'AUTH_503', null, '2024-01-15T09:15:00Z', 'Maria Santos', ARRAY['auth', 'microservice', '503'], 8, '2024-01-15T13:45:00Z'),
('Memory Leak in Image Processing', 'Heap memory usage continuously increasing during image upload processing', 'high', 'open', 'Media Service', 'MEM_LEAK_IMG', null, '2024-01-14T16:20:00Z', 'Carlos Oliveira', ARRAY['memory', 'leak', 'images', 'upload'], 23, '2024-01-15T12:10:00Z'),
('API Rate Limit Exceeded', 'External payment API returning 429 Too Many Requests', 'high', 'resolved', 'Payment Gateway', 'PAY_429', null, '2024-01-14T11:30:00Z', 'Ana Costa', ARRAY['api', 'rate-limit', 'payment', '429'], 12, '2024-01-14T15:40:00Z'),
('CSS Loading Performance Issue', 'Stylesheets taking longer than expected to load on mobile devices', 'medium', 'open', 'Frontend', null, null, '2024-01-13T14:45:00Z', 'Pedro Lima', ARRAY['css', 'performance', 'mobile', 'loading'], 45, '2024-01-15T11:20:00Z'),
('Log File Rotation Warning', 'Application log files approaching disk space limit', 'low', 'open', 'Logging', 'LOG_SPACE_WARN', null, '2024-01-12T08:00:00Z', null, ARRAY['logs', 'disk-space', 'rotation'], 3, '2024-01-15T08:00:00Z');

-- Update resolved_at for resolved errors
UPDATE public.errors 
SET resolved_at = '2024-01-14T15:45:00Z' 
WHERE status = 'resolved';