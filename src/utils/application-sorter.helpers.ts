import { Application, ApplicationStatus, LogItem } from '@prisma/client';

// Type for Application with included relations
type ApplicationWithRelations = Application & {
  logItems: LogItem[];
  company?: any;
  reminders?: any[];
  interviews?: any[];
};

// Define status groups for sorting
const DRAFT_STATUSES: ReadonlySet<ApplicationStatus> = new Set([ApplicationStatus.DRAFT]);

const END_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  ApplicationStatus.OFFER,
  ApplicationStatus.HIRED,
  ApplicationStatus.DECLINED_OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
]);

// Determines which status group an application belongs to
function getStatusGroup(status: ApplicationStatus): 'draft' | 'middle' | 'end' {
  if (DRAFT_STATUSES.has(status)) return 'draft';
  if (END_STATUSES.has(status)) return 'end';
  return 'middle';
}

// Finds the most relevant log item date for sorting based on application status
function getRelevantSortDate(application: ApplicationWithRelations): number {
  const { status, logItems } = application;
  const statusGroup = getStatusGroup(status);

  // Determine which status to look for in logItems
  let targetStatus: ApplicationStatus;

  if (statusGroup === 'draft') {
    targetStatus = ApplicationStatus.DRAFT;
  } else if (statusGroup === 'end') {
    // For end statuses, look for the current status itself
    targetStatus = status;
  } else {
    // For middle statuses, look for APPLIED
    targetStatus = ApplicationStatus.APPLIED;
  }

  // Find the log item with the target status
  const relevantLog = logItems.find((log) => log.status === targetStatus);

  if (relevantLog?.date) {
    return new Date(relevantLog.date).getTime();
  }

  // Fallback: if no matching log item, return 0 (treated as oldest date)
  return 0;
}

// Sorts applications by complex date logic with status grouping
export function sortApplicationsByDateComplex(
  applications: ApplicationWithRelations[],
  direction: 'newest' | 'oldest' = 'newest'
): ApplicationWithRelations[] {
  // Create enhanced items with sorting metadata
  const enhancedApps = applications.map((app) => ({
    application: app,
    statusGroup: getStatusGroup(app.status),
    sortDate: getRelevantSortDate(app),
  }));

  // Define group order priority (draft -> middle -> end)
  const groupPriority = { draft: 0, middle: 1, end: 2 };

  // Sort by group first, then by date within each group
  enhancedApps.sort((a, b) => {
    // Primary sort: by status group
    const groupDiff = groupPriority[a.statusGroup] - groupPriority[b.statusGroup];
    if (groupDiff !== 0) return groupDiff;

    // Secondary sort: by date within the same group
    const dateDiff = a.sortDate - b.sortDate;

    if (direction === 'newest') {
      // Newest first: higher timestamp = earlier in list
      // Special case: treat 0 (missing date) as oldest
      if (a.sortDate === 0 && b.sortDate === 0) return 0;
      if (a.sortDate === 0) return 1; // a goes later
      if (b.sortDate === 0) return -1; // b goes later
      return -dateDiff; // reverse for descending
    } else {
      // Oldest first: lower timestamp = earlier in list
      // Special case: treat 0 (missing date) as oldest
      if (a.sortDate === 0 && b.sortDate === 0) return 0;
      if (a.sortDate === 0) return -1; // a goes first
      if (b.sortDate === 0) return 1; // b goes first
      return dateDiff; // ascending
    }
  });

  // Return just the applications, without metadata
  return enhancedApps.map((item) => item.application);
}

// Helper to check if a sort type requires complex date sorting
export function requiresComplexDateSort(sortType: string): boolean {
  return sortType === 'DATE_NEW' || sortType === 'DATE_OLD';
}

// Maps sort type to direction for complex date sorting
export function getComplexSortDirection(sortType: string): 'newest' | 'oldest' {
  return sortType === 'DATE_OLD' ? 'oldest' : 'newest';
}
