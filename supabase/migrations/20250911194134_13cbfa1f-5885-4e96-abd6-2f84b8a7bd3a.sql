-- Add resolution field and image_url field to errors table
ALTER TABLE public.errors 
ADD COLUMN resolution TEXT,
ADD COLUMN image_url TEXT;

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