import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/AM|PM/i.test(trimmed)) {
    return trimmed;
  }
  const [hourStr, minStr] = trimmed.split(':');
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr || '00', 10);
  if (isNaN(hour) || isNaN(min)) return trimmed;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = (hour % 12 === 0 ? 12 : hour % 12).toString().padStart(2, '0');
  const displayMin = min.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

export function formatRangeToAmPm(rangeStr: string): string {
  if (!rangeStr) return '';
  const trimmed = rangeStr.trim();
  const parts = trimmed.split(/\s*-\s*/);
  if (parts.length === 2) {
    return `${formatToAmPm(parts[0])} - ${formatToAmPm(parts[1])}`;
  }
  return formatToAmPm(trimmed);
}

