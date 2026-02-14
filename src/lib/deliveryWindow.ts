/**
 * Cafe Timing Rule
 * Sunday: Closed
 * Mon–Sat: 6:45 PM → 2:00 AM
 */
export function isWithinDeliveryWindow(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const START = 18 * 60 + 45; // 6:45 PM
  const END = 2 * 60;        // 2:00 AM

  // ❌ Sunday closed
  if (day === 0) return false;

  // ✅ Evening window
  if (minutesNow >= START) return true;

  // ✅ Early morning window (not Monday morning)
  if (minutesNow < END && day !== 1) return true;

  return false;
}
