
-- Restrict storage SELECT (listing) to admins; individual files are still served via the public-bucket CDN.
DROP POLICY IF EXISTS "Media is publicly readable" ON storage.objects;
CREATE POLICY "Admins list media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Lock down the SECURITY DEFINER helper so it can only be invoked by RLS / postgres / service_role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Tighten public subscriber inserts with a basic email shape check.
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe" ON public.subscribers
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 254
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND confirmed = false
    AND unsubscribed_at IS NULL
  );
