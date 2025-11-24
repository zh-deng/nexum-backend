// Schedules a task to run at a specific date, returning the delay in milliseconds
export function scheduleAt(date: Date): number {
  return Math.max(date.getTime() - Date.now(), 0);
}
