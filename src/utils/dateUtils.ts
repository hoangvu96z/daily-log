/**
 * dateUtils.ts — Local Timezone Utilities
 *
 * Replaces new Date().toISOString().slice(0, 10) which causes off-by-one errors
 * in timezones ahead of or behind UTC.
 */

export function getLocalDateString(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
