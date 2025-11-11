export function scheduleAt(date: Date): number {
  return Math.max(date.getTime() - Date.now(), 0);
}
