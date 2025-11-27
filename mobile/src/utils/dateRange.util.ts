import { DatePeriod, DateRange, CustomDateRange } from '../types';

const formatDateToISO = (date: Date): string => {
  return date.toISOString();
};

const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  newDate.setDate(diff);
  return getStartOfDay(newDate);
};

const getEndOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() + (6 - day);
  newDate.setDate(diff);
  return getEndOfDay(newDate);
};

const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(1);
  return getStartOfDay(newDate);
};

const getEndOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(0);
  return getEndOfDay(newDate);
};

const getStartOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(0);
  newDate.setDate(1);
  return getStartOfDay(newDate);
};

const getEndOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(11);
  newDate.setDate(31);
  return getEndOfDay(newDate);
};

export const getDateRangeForPeriod = (
  period: DatePeriod,
  customRange?: CustomDateRange
): DateRange | null => {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: formatDateToISO(getStartOfDay(now)),
        endDate: formatDateToISO(getEndOfDay(now)),
      };

    case 'week':
      return {
        startDate: formatDateToISO(getStartOfWeek(now)),
        endDate: formatDateToISO(getEndOfWeek(now)),
      };

    case 'month':
      return {
        startDate: formatDateToISO(getStartOfMonth(now)),
        endDate: formatDateToISO(getEndOfMonth(now)),
      };

    case 'year':
      return {
        startDate: formatDateToISO(getStartOfYear(now)),
        endDate: formatDateToISO(getEndOfYear(now)),
      };

    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        return {
          startDate: formatDateToISO(getStartOfDay(customRange.startDate)),
          endDate: formatDateToISO(getEndOfDay(customRange.endDate)),
        };
      }
      return null;

    default:
      return {
        startDate: formatDateToISO(getStartOfDay(now)),
        endDate: formatDateToISO(getEndOfDay(now)),
      };
  }
};

export const getPeriodLabel = (period: DatePeriod): string => {
  switch (period) {
    case 'today':
      return 'Hoje';
    case 'week':
      return 'Esta Semana';
    case 'month':
      return 'Este Mês';
    case 'year':
      return 'Este Ano';
    case 'custom':
      return 'Período Personalizado';
    default:
      return 'Hoje';
  }
};

export const formatCustomDateRangeLabel = (customRange: CustomDateRange): string => {
  if (!customRange.startDate || !customRange.endDate) {
    return 'Selecionar período';
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`;
};
