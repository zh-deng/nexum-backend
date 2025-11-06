import { ApplicationStatus, TimeFrameType } from '../types/enums';

export function calculateTimeFrame(timeFrame: TimeFrameType) {
  const statuses = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.GHOSTED,
    ApplicationStatus.OFFER,
    ApplicationStatus.HIRED,
    ApplicationStatus.DECLINED_OFFER,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ];

  let startDate: Date = new Date();

  switch (timeFrame) {
    case TimeFrameType.PAST_MONTH: {
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    }
    case TimeFrameType.PAST_3_MONTHS: {
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    }
    case TimeFrameType.PAST_6_MONTHS: {
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    }
    case TimeFrameType.PAST_12_MONTHS: {
      startDate.setMonth(startDate.getMonth() - 12);
      break;
    }
    case TimeFrameType.THIS_YEAR: {
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    default: {
      startDate = new Date('1950-01-01');
    }
  }

  return {
    statuses,
    startDate,
  };
}

export function getTimeFrameMonths(timeFrame: TimeFrameType) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
  let count: number;

  switch (timeFrame) {
    case TimeFrameType.PAST_MONTH: {
      count = 1;
      break;
    }
    case TimeFrameType.PAST_3_MONTHS: {
      count = 3;
      break;
    }
    case TimeFrameType.PAST_6_MONTHS: {
      count = 6;
      break;
    }
    case TimeFrameType.PAST_12_MONTHS: {
      count = 12;
      break;
    }
    case TimeFrameType.THIS_YEAR: {
      count = now.getMonth() + 1;
      break;
    }
    default: {
      count = 0;
    }
  }

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return formatter.format(d);
  }).reverse();
}
