export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  DECLINED_OFFER = 'DECLINED_OFFER',
  REJECTED = 'REJECTED',
  GHOSTED = 'GHOSTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum WorkLocation {
  ON_SITE = 'ON_SITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  UNSURE = 'UNSURE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum InterviewStatus {
  UPCOMING = 'UPCOMING',
  DONE = 'DONE',
}

export enum ReminderStatus {
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  DONE = 'DONE',
}

export enum SortType {
  DATE_OLD = 'DATE_OLD',
  DATE_NEW = 'DATE_NEW',
  PRIORITY = 'PRIORITY',
  ALPHABETICAL_TITLE = 'ALPHABETICAL_TITLE',
  ALPHABETICAL_COMPANY = 'ALPHABETICAL_COMPANY',
}

export enum TimeFrameType {
  PAST_MONTH = 'PAST_MONTH',
  PAST_3_MONTHS = 'PAST_3_MONTHS',
  PAST_6_MONTHS = 'PAST_6_MONTHS',
  PAST_12_MONTHS = 'PAST_12_MONTHS',
  THIS_YEAR = 'THIS_YEAR',
  ALL_TIME = 'ALL_TIME',
}
