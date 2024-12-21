import { format, addDays, startOfWeek, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatTimeRange(hour: number): string {
  const start = `${hour.toString().padStart(2, '0')}:00`;
  const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
  return `${start} - ${end}`;
}

export function formatDate(date: Date): string {
  if (!isValid(date)) {
    console.error('Invalid date:', date);
    return 'Invalid Date';
  }
  return format(date, 'M月d日(E)', { locale: ja });
}

export function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export type Reservation = {
  date: string;
  hour: number;
  nickname: string;
  purpose: string;
};

export function isReserved(reservations: Reservation[], date: string, hour: number): boolean {
  return reservations.some(r => r.date === date && r.hour === hour);
}

