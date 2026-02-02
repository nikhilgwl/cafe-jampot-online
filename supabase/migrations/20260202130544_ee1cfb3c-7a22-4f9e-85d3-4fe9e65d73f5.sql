-- Create storage bucket for advertisements
INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisements', 'advertisements', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read from advertisements bucket
CREATE POLICY "Anyone can view ads" ON storage.objects
FOR SELECT
USING (bucket_id = 'advertisements');

-- Allow admin to manage ads
CREATE POLICY "Admin can manage ads" ON storage.objects
FOR ALL
USING (bucket_id = 'advertisements' AND has_role(auth.uid(), 'admin'::app_role));