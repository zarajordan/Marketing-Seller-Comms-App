-- ============================================================
-- Marketing Store Room — Supabase Migration (safe to re-run)
-- Catalogue of items sellers can reserve (merchandise, lightboxes,
-- banners, iPads, stand attractor games...) plus reservation requests.
-- No seed data: admins populate the catalogue from the app.
-- ============================================================

-- ── store_room_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_room_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  category            text NOT NULL DEFAULT 'Other' CHECK (category IN ('Merchandise','Lightbox','Banner','iPad','Other')),
  description         text,
  image_url           text,
  quantity            integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),   -- total units owned
  storage_area        text,   -- e.g. "Marketing Cupboard"
  storage_code        text,   -- e.g. "MC-CM"
  storage_detail      text,   -- e.g. "Box 3" / "Lightbox case 1"
  readiness_checklist text,   -- optional; when set, a "Readiness checklist" badge is shown
  display_order       integer DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ── store_room_reservations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS store_room_reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         uuid NOT NULL REFERENCES store_room_items(id) ON DELETE CASCADE,
  item_name       text NOT NULL,
  quantity        integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  requester_name  text,
  requester_email text NOT NULL,
  event_name      text,
  needed_from     date,
  needed_to       date,
  notes           text,
  event_type      text CHECK (event_type IN ('Marketing event','Business event')),
  event_date      date,
  shipping_address text,
  venue_contact   text,
  contact_telephone text,
  courier         text,
  loading_bay_required text DEFAULT 'Unsure' CHECK (loading_bay_required IN ('Unsure','Yes','No')),
  loading_bay_booked   text DEFAULT 'To be reviewed' CHECK (loading_bay_booked IN ('To be reviewed','Yes','No','Not needed')),
  internal_notes  text,
  status          text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','Returned')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- For databases created before the booking form was expanded (no-op on a fresh install).
-- needed_from = "date required for shipping", needed_to = "expected return date".
ALTER TABLE store_room_reservations
  ADD COLUMN IF NOT EXISTS event_type text CHECK (event_type IN ('Marketing event','Business event')),
  ADD COLUMN IF NOT EXISTS event_date date,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS venue_contact text,
  ADD COLUMN IF NOT EXISTS contact_telephone text,
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS loading_bay_required text DEFAULT 'Unsure' CHECK (loading_bay_required IN ('Unsure','Yes','No')),
  ADD COLUMN IF NOT EXISTS loading_bay_booked text DEFAULT 'To be reviewed' CHECK (loading_bay_booked IN ('To be reviewed','Yes','No','Not needed')),
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- Units currently out on approved reservations. A view (not exposed rows) so sellers can
-- see availability without being able to read other people's reservations/emails.
CREATE OR REPLACE VIEW store_room_availability AS
  SELECT item_id, COALESCE(SUM(quantity), 0)::integer AS reserved_qty
  FROM store_room_reservations
  WHERE status = 'Approved'
  GROUP BY item_id;

GRANT SELECT ON store_room_availability TO anon, authenticated;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE store_room_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_room_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on store_room_items" ON store_room_items;
DROP POLICY IF EXISTS "Allow admin write on store_room_items" ON store_room_items;
DROP POLICY IF EXISTS "Allow active user insert on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow owner select on store_room_reservations" ON store_room_reservations;
DROP POLICY IF EXISTS "Allow admin all on store_room_reservations" ON store_room_reservations;

-- Everyone can browse the catalogue
CREATE POLICY "Allow public select on store_room_items" ON store_room_items FOR SELECT USING (true);

-- Only active admin / marketing users manage the catalogue
CREATE POLICY "Allow admin write on store_room_items" ON store_room_items FOR ALL TO public USING (
  EXISTS (SELECT 1 FROM users WHERE users.email = auth.jwt() ->> 'email' AND users.role IN ('admin-manager','marketer','marketing') AND users.active = true)
);

-- Sellers can create reservations as themselves, and read their own
CREATE POLICY "Allow active user insert on store_room_reservations" ON store_room_reservations FOR INSERT TO public WITH CHECK (
  requester_email = auth.jwt() ->> 'email'
  AND EXISTS (SELECT 1 FROM users WHERE users.email = auth.jwt() ->> 'email' AND users.active = true)
);
CREATE POLICY "Allow owner select on store_room_reservations" ON store_room_reservations FOR SELECT TO public USING (
  requester_email = auth.jwt() ->> 'email'
);

-- Admin / marketing users see and action all reservations
CREATE POLICY "Allow admin all on store_room_reservations" ON store_room_reservations FOR ALL TO public USING (
  EXISTS (SELECT 1 FROM users WHERE users.email = auth.jwt() ->> 'email' AND users.role IN ('admin-manager','marketer','marketing') AND users.active = true)
);

-- ── Date-aware availability ───────────────────────────────────
-- Approved bookings with dates, but no names/emails, so every user can check a date range.
CREATE OR REPLACE VIEW store_room_bookings AS
  SELECT id, item_id, quantity, needed_from, needed_to, item_name
  FROM store_room_reservations
  WHERE status = 'Approved' AND needed_from IS NOT NULL AND needed_to IS NOT NULL;

GRANT SELECT ON store_room_bookings TO anon, authenticated;

-- Database-level guard: a booking can't be approved if, on any day of its dates,
-- more units would be out than the item has in stock.
CREATE OR REPLACE FUNCTION store_room_prevent_double_booking() RETURNS trigger AS $$
DECLARE
  stock integer;
  d date;
  booked integer;
BEGIN
  IF NEW.status <> 'Approved' OR NEW.needed_from IS NULL OR NEW.needed_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- Serialise concurrent approvals of the same item
  SELECT quantity INTO stock FROM store_room_items WHERE id = NEW.item_id FOR UPDATE;
  IF stock IS NULL THEN
    RETURN NEW;
  END IF;

  FOR d IN
    SELECT NEW.needed_from
    UNION
    SELECT needed_from FROM store_room_reservations
    WHERE item_id = NEW.item_id AND status = 'Approved' AND id <> NEW.id
      AND needed_from > NEW.needed_from AND needed_from <= NEW.needed_to
  LOOP
    SELECT COALESCE(SUM(quantity), 0) INTO booked FROM store_room_reservations
    WHERE item_id = NEW.item_id AND status = 'Approved' AND id <> NEW.id
      AND needed_from <= d AND needed_to >= d;
    IF booked + NEW.quantity > stock THEN
      RAISE EXCEPTION 'Double booking: only % of "%" free on %', GREATEST(stock - booked, 0), NEW.item_name, d;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS store_room_no_double_booking ON store_room_reservations;
CREATE TRIGGER store_room_no_double_booking
  BEFORE INSERT OR UPDATE OF status, quantity, needed_from, needed_to, item_id ON store_room_reservations
  FOR EACH ROW EXECUTE FUNCTION store_room_prevent_double_booking();
