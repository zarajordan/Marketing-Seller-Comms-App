// Date-aware availability for the Marketing Store Room.
// A booking occupies an item from needed_from (shipping date) to needed_to (return date), inclusive.
// Dates are handled as whole-day numbers (days since epoch, UTC) so there are no timezone surprises.

const DAY = 86400000;

export const dayNum = (s) => {
  if (typeof s === 'number') return s;
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
};

export const todayNum = () => {
  const t = new Date();
  return Math.round(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY);
};

export const dayToStr = (n) => new Date(n * DAY).toISOString().slice(0, 10);

export const fmtDay = (n, opts = { day: 'numeric', month: 'short' }) =>
  new Date(n * DAY).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

// Last day an approved booking occupies the item. If it is overdue (not yet marked returned)
// the item is still physically out, so it counts as occupied through today. (Pending requests aren't extended.)
export const endDay = (b) => (b.status === 'Pending' ? dayNum(b.needed_to) : Math.max(dayNum(b.needed_to), todayNum()));

// Bookings that overlap [from, to] for an item (approved bookings only should be passed in).
export function overlappingBookings(bookings, itemId, from, to, ignoreId) {
  const f = dayNum(from);
  const t = dayNum(to);
  if (f == null || t == null) return [];
  return bookings.filter((b) => {
    if (b.item_id !== itemId || b.id === ignoreId) return false;
    const bf = dayNum(b.needed_from);
    return bf != null && dayNum(b.needed_to) != null && bf <= t && endDay(b) >= f;
  });
}

// Highest number of units already booked on any single day inside [from, to].
export function peakBooked(bookings, itemId, from, to, ignoreId) {
  const f = dayNum(from);
  const t = dayNum(to);
  const rel = overlappingBookings(bookings, itemId, from, to, ignoreId);
  const points = [f, ...rel.map((b) => dayNum(b.needed_from)).filter((s) => s > f && s <= t)];
  return points.reduce((peak, p) => {
    const sum = rel
      .filter((b) => dayNum(b.needed_from) <= p && endDay(b) >= p)
      .reduce((s, b) => s + b.quantity, 0);
    return Math.max(peak, sum);
  }, 0);
}

// Units of `item` free for every day of [from, to].
export function windowAvailability(bookings, item, from, to, ignoreId) {
  const conflicts = overlappingBookings(bookings, item.id, from, to, ignoreId);
  const free = Math.max(0, item.quantity - peakBooked(bookings, item.id, from, to, ignoreId));
  return { free, conflicts };
}
