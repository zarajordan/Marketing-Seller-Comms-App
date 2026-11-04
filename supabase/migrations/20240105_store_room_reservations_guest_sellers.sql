-- Fix: sellers still get "new row violates row-level security policy for table
-- store_room_reservations" after 20240103.
--
-- The app lets any IBM email sign in as a "guest seller" even when they have no row in the
-- users table (see UserContext.checkEmail). 20240103 only allowed inserts from emails that
-- exist as active rows in users, so those guests were still rejected.
--
-- Now: any caller may insert, but only as a Pending request. Approving a booking
-- (status = 'Approved') still happens through updates, which the UI limits to admin roles.

DROP POLICY IF EXISTS "Allow active user insert on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow insert on store_room_reservations" ON store_room_reservations;

CREATE POLICY "Allow insert on store_room_reservations" ON store_room_reservations
  FOR INSERT TO anon, authenticated WITH CHECK (
    requester_email IS NOT NULL
    AND (
      status = 'Pending'
      OR EXISTS (
        SELECT 1 FROM users
        WHERE lower(users.email) = lower(store_room_reservations.requester_email)
          AND users.active = true
          AND users.role IN ('admin-manager','marketer','marketing')
      )
    )
  );
