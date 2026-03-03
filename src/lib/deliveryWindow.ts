/**
 * Cafe Timing Rule
 * Sunday: Closed
 * Mon–Sat: 6:45 PM → 2:00 AM
 */

export const isWithinDeliveryWindow = (): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  const OPEN_TIME = 18 * 60 + 45; // 6:45 PM
  const CLOSE_TIME = 2 * 60;      // 2:00 AM (Next Day)

  // Edge Case: Handling Sunday morning (12AM - 2AM) as part of Saturday night
  if (currentDay === 0) { // It is Sunday
    return currentTimeInMinutes < CLOSE_TIME; // Open ONLY if before 2:00 AM
  }

  // Handle Monday: Should only open after 6:45 PM
  if (currentDay === 1) { // It is Monday
    return currentTimeInMinutes >= OPEN_TIME; // Closed from 12AM-2AM (Sunday night)
  }

  // Standard Tue-Sat logic
  // Open if it's after 6:45 PM OR before 2:00 AM
  return currentTimeInMinutes >= OPEN_TIME || currentTimeInMinutes < CLOSE_TIME;
};
