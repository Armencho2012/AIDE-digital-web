-- Add INSERT policy for user_content table
DROP POLICY IF EXISTS "Users can insert their own content" ON public.user_content;
CREATE POLICY "Users can insert their own content" 
ON public.user_content 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for user_content table
DROP POLICY IF EXISTS "Users can delete their own content" ON public.user_content;
CREATE POLICY "Users can delete their own content" 
ON public.user_content 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add UPDATE policy for user_content table
DROP POLICY IF EXISTS "Users can update their own content" ON public.user_content;
CREATE POLICY "Users can update their own content" 
ON public.user_content 
FOR UPDATE 
USING (auth.uid() = user_id);