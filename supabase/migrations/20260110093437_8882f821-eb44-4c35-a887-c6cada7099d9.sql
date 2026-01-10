-- Create storage bucket for challenge files
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-files', 'challenge-files', true);

-- Allow anyone to read challenge files (public bucket)
CREATE POLICY "Challenge files are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge-files');

-- Allow admins to upload challenge files
CREATE POLICY "Admins can upload challenge files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'challenge-files' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete challenge files
CREATE POLICY "Admins can delete challenge files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'challenge-files' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow anyone to read avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update/replace their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);