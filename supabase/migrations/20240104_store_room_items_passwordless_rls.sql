-- Fix: "Save failed: new row violates row-level security policy" when a marketing user
-- adds / edits / deletes a store room item (e.g. a banner).
--
-- Same cause as 20240103: marketing users sign in by email only, so requests arrive as `anon`
-- with auth.jwt() = NULL, and the "Allow admin write on store_room_items" policy
-- (which compares auth.jwt() ->> 'email') never matches. Only password users passed it.
--
-- The UI only shows Add / Edit / Delete to admin-manager, marketer and marketing roles.
-- Passwordless users can't be told apart in RLS, so writes are open to the anon key,
-- matching the rest of the app's trust model.

DROP POLICY IF EXISTS "Allow admin write on store_room_items" ON store_room_items;
DROP POLICY IF EXISTS "Allow insert on store_room_items" ON store_room_items;
DROP POLICY IF EXISTS "Allow update on store_room_items" ON store_room_items;
DROP POLICY IF EXISTS "Allow delete on store_room_items" ON store_room_items;

CREATE POLICY "Allow insert on store_room_items" ON store_room_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update on store_room_items" ON store_room_items
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete on store_room_items" ON store_room_items
  FOR DELETE TO anon, authenticated USING (true);
