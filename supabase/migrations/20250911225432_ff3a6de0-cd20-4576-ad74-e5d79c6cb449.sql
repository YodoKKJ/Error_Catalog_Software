-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Errors are viewable by everyone" ON public.errors;

-- Create more secure policies that require authentication
-- Only authenticated users can view errors (you can further restrict to admin roles if needed)
CREATE POLICY "Authenticated users can view errors" 
ON public.errors 
FOR SELECT 
TO authenticated 
USING (true);

-- Update other policies to be more explicit about authentication requirements
DROP POLICY IF EXISTS "Anyone can create errors" ON public.errors;
DROP POLICY IF EXISTS "Anyone can update errors" ON public.errors;
DROP POLICY IF EXISTS "Anyone can delete errors" ON public.errors;

-- Create authenticated-only policies
CREATE POLICY "Authenticated users can create errors" 
ON public.errors 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update errors" 
ON public.errors 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete errors" 
ON public.errors 
FOR DELETE 
TO authenticated 
USING (true);