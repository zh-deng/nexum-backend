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
