-- Fix: "new row violates row-level security policy for table store_room_reservations"
--
-- Marketing and seller users sign in by email only (no password), so they have no Supabase
-- Auth session and every request arrives as the `anon` role with auth.jwt() = NULL.
-- The policies in 20240102_marketing_store_room.sql all compare against auth.jwt() ->> 'email',
-- which is NULL for those users, so every insert / select / update was rejected.
-- Only admin-manager / marketer (who sign in with a password) ever matched.
--
-- These policies follow the app's existing trust model (identity is the email the user typed,
-- checked against the users table), the same as the rest of the passwordless app.

DROP POLICY IF EXISTS "Allow active user insert on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow owner select on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow admin all on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow active user manage store_room_reservations" ON store_room_reservations;

-- Insert: requester must be an active user in the users table (case-insensitive email match)
CREATE POLICY "Allow active user insert on store_room_reservations" ON store_room_reservations
  FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE lower(users.email) = lower(store_room_reservations.requester_email)
        AND users.active = true
    )
  );

-- Read / update / delete: the UI filters sellers to their own rows and shows the admin views
-- to admin-manager / marketer / marketing roles only. Passwordless users cannot be told apart
-- in RLS, so these are open to any caller with the anon key.
CREATE POLICY "Allow select on store_room_reservations" ON store_room_reservations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update on store_room_reservations" ON store_room_reservations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete on store_room_reservations" ON store_room_reservations
  FOR DELETE TO anon, authenticated USING (true);

-- The double-booking trigger reads every approved reservation and locks the item row.
-- Run it as the table owner so RLS on those tables doesn't hide rows or block FOR UPDATE.
ALTER FUNCTION store_room_prevent_double_booking() SECURITY DEFINER SET search_path = public;
