/**
 * AuthEdge — Date Utilities
 *
 * Helpers for formatting, parsing, and calculating dates and times.
 */

/**
 * Converts a Date object to SQL-compatible date string (YYYY-MM-DD).
 */
export function toDBDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object to SQL-compatible time string (HH:MM:SS).
 */
export function toDBTime(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a SQL YYYY-MM-DD string to a readable format (e.g. Wednesday, 3 June).
 */
export function formatDisplayDate(dbDate: string): string {
  if (!dbDate) return '';
  const date = new Date(dbDate);
  if (isNaN(date.getTime())) return dbDate;
  
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats a SQL HH:MM:SS string to a readable format (e.g. 09:05 AM).
 */
export function formatDisplayTime(dbTime: string): string {
  if (!dbTime) return '';
  const parts = dbTime.split(':');
  if (parts.length < 2) return dbTime;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

/**
 * Returns a time-based greeting (e.g., "Good Morning").
 */
export function getGreeting(): string {
  const hrs = new Date().getHours();
  if (hrs < 12) return 'Good Morning';
  if (hrs < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Returns month name from zero-indexed number or YYYY-MM string.
 */
export function getMonthName(yearMonth: string | number): string {
  let monthIdx = 0;
  if (typeof yearMonth === 'string') {
    const parts = yearMonth.split('-');
    if (parts.length >= 2) {
      monthIdx = parseInt(parts[1], 10) - 1;
    }
  } else {
    monthIdx = yearMonth;
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIdx] || '';
}

/**
 * Returns how many days are in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Checks if a SQL YYYY-MM-DD date is a weekend.
 */
export function isWeekend(dbDate: string): boolean {
  const date = new Date(dbDate);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}
