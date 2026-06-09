'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Modal from '@/components/modal/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatToAmPm } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Clock } from 'lucide-react';

type ExpertTiming = {
  day: string;
  time: string;
};

type AvailabilitySlot = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type TimingSlot = {
  id: string;
  shortDay: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

interface ChangeExpertTimingsModalProps {
  isOpen: boolean;
  expertName?: string;
  timings: ExpertTiming[];
  onClose: () => void;
  onSave: (availability: AvailabilitySlot[]) => Promise<void>;
  operatingHours?: any[];
}

const dayOptions = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const dayNameMap = new Map(dayOptions.flatMap((day) => [[day.short, day.full], [day.full, day.full]]));

function normalizeTime(value?: string, fallback: string = '09:00') {
  if (!value) return fallback;

  const trimmed = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) {
    return fallback;
  }

  const [, rawHours, rawMinutes = '00', meridiem] = match;
  let hours = Number(rawHours);

  if (Number.isNaN(hours) || hours < 1 || hours > 12) {
    return fallback;
  }

  if (meridiem.toUpperCase() === 'AM') {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return `${hours.toString().padStart(2, '0')}:${rawMinutes}`;
}

function buildTimingSlots(timings: ExpertTiming[]): TimingSlot[] {
  return dayOptions.map((day) => {
    const existingTiming = timings.find(
      (timing) => dayNameMap.get(timing.day) === day.full
    );

    if (!existingTiming) {
      return {
        id: day.full,
        shortDay: day.short,
        dayOfWeek: day.full,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false,
      };
    }

    const [rawStart, rawEnd] = existingTiming.time.split(' - ');

    return {
      id: day.full,
      shortDay: day.short,
      dayOfWeek: day.full,
      startTime: normalizeTime(rawStart, '09:00'),
      endTime: normalizeTime(rawEnd, '17:00'),
      isAvailable: true,
    };
  });
}

const TimePicker = ({
  value,
  onChange,
  disabled,
  minTime,
  maxTime,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
}) => {
  const [open, setOpen] = useState(false);

  const { hour, min, ampm } = useMemo(() => {
    if (!value) return { hour: '09', min: '00', ampm: 'AM' };
    const [h24Str, mStr] = value.split(':');
    const h24 = parseInt(h24Str, 10);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      hour: h12.toString().padStart(2, '0'),
      min: mStr || '00',
      ampm: h24 >= 12 ? 'PM' : 'AM',
    };
  }, [value]);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const to24hMins = (h12: string, m: string, a: string) => {
    let h24 = parseInt(h12, 10);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    return h24 * 60 + parseInt(m, 10);
  };

  const minMins = minTime ? toMins(minTime) : 0;
  const maxMins = maxTime ? toMins(maxTime) : 23 * 60 + 59;

  const isHourValid = (h12: string, a: string) => {
    let h24 = parseInt(h12, 10);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    return h24 * 60 + 59 >= minMins && h24 * 60 <= maxMins;
  };

  const isMinuteValidForAmpm = (m: string, a: string) => {
    const total = to24hMins(hour, m, a);
    return total >= minMins && total <= maxMins;
  };

  const isAmpmValid = (a: string) =>
    Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).some(h =>
      isHourValid(h, a)
    );

  const handleUpdate = useCallback(
    (h: string, m: string, a: string) => {
      let h24 = parseInt(h, 10);
      if (a === 'PM' && h24 !== 12) h24 += 12;
      if (a === 'AM' && h24 === 12) h24 = 0;
      onChange(`${h24.toString().padStart(2, '0')}:${m}`);
    },
    [onChange]
  );

  const ITEM_H = 36;
  const REPEATS = 7;

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const repeatedHours = Array.from({ length: REPEATS }, () => hours).flat();
  const repeatedMinutes = Array.from({ length: REPEATS }, () => minutes).flat();

  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hIdx = hours.indexOf(hour);
        const mIdx = minutes.indexOf(min);
        const midH = Math.floor(REPEATS / 2) * hours.length + hIdx;
        const midM = Math.floor(REPEATS / 2) * minutes.length + mIdx;
        if (hourRef.current) hourRef.current.scrollTop = midH * ITEM_H;
        if (minRef.current) minRef.current.scrollTop = midM * ITEM_H;
      }, 60);
    }
  }, [open]);

  const handleHourScroll = () => {
    const el = hourRef.current;
    if (!el) return;
    const oneLoop = hours.length * ITEM_H;
    if (el.scrollTop < oneLoop) el.scrollTop += oneLoop * 2;
    else if (el.scrollTop > oneLoop * (REPEATS - 2)) el.scrollTop -= oneLoop * 2;
  };

  const handleMinScroll = () => {
    const el = minRef.current;
    if (!el) return;
    const oneLoop = minutes.length * ITEM_H;
    if (el.scrollTop < oneLoop) el.scrollTop += oneLoop * 2;
    else if (el.scrollTop > oneLoop * (REPEATS - 2)) el.scrollTop -= oneLoop * 2;
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>{hour}:{min} {ampm}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto shadow-xl border border-gray-100 rounded-xl overflow-hidden"
        align="start"
        sideOffset={6}
      >
        <div className="flex">
          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">HR</div>
            <div
              ref={hourRef}
              onScroll={handleHourScroll}
              className="overflow-y-auto"
              style={{ height: 180, scrollbarWidth: 'none' }}
            >
              {repeatedHours.map((h, i) => {
                const otherAmpm = ampm === 'AM' ? 'PM' : 'AM';
                const validCurrent = isHourValid(h, ampm);
                const validOther = isHourValid(h, otherAmpm);
                const valid = validCurrent || validOther;
                const isSelected = h === hour && validCurrent;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!valid}
                    onClick={() => {
                      if (validCurrent) {
                        handleUpdate(h, min, ampm);
                      } else if (validOther) {
                        handleUpdate(h, min, otherAmpm);
                      }
                    }}
                    style={{ height: ITEM_H }}
                    className={`w-full text-sm font-medium text-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-700 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">MIN</div>
            <div
              ref={minRef}
              onScroll={handleMinScroll}
              className="overflow-y-auto"
              style={{ height: 180, scrollbarWidth: 'none' }}
            >
              {repeatedMinutes.map((m, i) => {
                const otherAmpm = ampm === 'AM' ? 'PM' : 'AM';
                const validCurrent = isMinuteValidForAmpm(m, ampm);
                const validOther = isMinuteValidForAmpm(m, otherAmpm);
                const valid = validCurrent || validOther;
                const isSelected = m === min && validCurrent;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!valid}
                    onClick={() => {
                      if (validCurrent) {
                        handleUpdate(hour, m, ampm);
                      } else if (validOther) {
                        handleUpdate(hour, m, otherAmpm);
                      }
                    }}
                    style={{ height: ITEM_H }}
                    className={`w-full text-sm font-medium text-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-700 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          {/* AM/PM column */}
          <div className="flex flex-col w-16">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center py-1.5 border-b border-gray-100">AM/PM</div>
            <div className="flex flex-col justify-center gap-1.5 p-1.5" style={{ height: 180 }}>
              {(['AM', 'PM'] as const).map((a) => {
                const valid = isAmpmValid(a);
                return (
                  <button
                    key={a}
                    type="button"
                    disabled={!valid}
                    onClick={() => valid && handleUpdate(hour, min, a)}
                    className={`w-full py-3 text-xs font-semibold tracking-wide rounded-md transition-colors ${
                      a === ampm
                        ? 'bg-orange-500 text-white'
                        : valid
                        ? 'text-gray-600 hover:bg-orange-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function ChangeExpertTimingsModal({
  isOpen,
  expertName,
  timings,
  onClose,
  onSave,
  operatingHours,
}: ChangeExpertTimingsModalProps) {
  const [timingSlots, setTimingSlots] = useState<TimingSlot[]>(() => buildTimingSlots(timings));
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimingSlots(buildTimingSlots(timings));
      setSubmitError('');
    }
  }, [isOpen, timings]);

  const handleTimingToggle = (slotId: string) => {
    setTimingSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
  };

  const handleTimingTimeChange = (
    slotId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setTimingSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        let updatedSlot = { ...slot, [field]: value };
        if (field === 'startTime' && updatedSlot.endTime <= value) {
          updatedSlot.endTime = '';
        }
        return updatedSlot;
      })
    );
  };

  const handleConfirm = async () => {
    setSubmitError('');

    const availability = timingSlots
      .filter((slot) => slot.isAvailable)
      .map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

    if (availability.length === 0) {
      setSubmitError('Select at least one available day.');
      return;
    }

    const hasInvalidRange = availability.some(
      (slot) => slot.startTime >= slot.endTime
    );

    if (hasInvalidRange) {
      setSubmitError('End time must be later than start time for every selected day.');
      return;
    }

    if (operatingHours && Array.isArray(operatingHours)) {
      for (const slot of availability) {
        const dayHours = operatingHours.find(
          (h) => h && h.day && h.day.toLowerCase() === slot.dayOfWeek.toLowerCase()
        );
        if (!dayHours) {
          setSubmitError(`Organization operating hours are not configured for ${slot.dayOfWeek}.`);
          return;
        }
        if (dayHours.is_closed) {
          setSubmitError(`Organization is closed on ${slot.dayOfWeek}. Availability cannot be set.`);
          return;
        }
        if (slot.startTime < dayHours.open) {
          setSubmitError(`Start time on ${slot.dayOfWeek} cannot be earlier than organization open time (${formatToAmPm(dayHours.open)}).`);
          return;
        }
        if (slot.endTime > dayHours.close) {
          setSubmitError(`End time on ${slot.dayOfWeek} cannot be later than organization close time (${formatToAmPm(dayHours.close)}).`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await onSave(availability);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update expert timings';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expertName ? `Manage Timings for ${expertName}` : 'Manage Expert Timings'}
      size="lg"
      showCloseButton={true}
      confirmButtonText="Save Timings"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      onCancel={onClose}
      isConfirmLoading={isSubmitting}
    >
      <div className="space-y-4">
        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}
        {timingSlots.map((slot) => {
          const dayHours = operatingHours?.find(
            (h) => h && h.day && h.day.toLowerCase() === slot.dayOfWeek.toLowerCase()
          );
          const isClosed = !dayHours || dayHours.is_closed;

          return (
            <div
              key={slot.id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--primary-start)] p-4 md:flex-row md:items-center justify-between"
            >
              <div className="flex items-center space-x-2 md:w-28">
                <input
                  type="checkbox"
                  checked={slot.isAvailable && !isClosed}
                  disabled={isClosed}
                  onChange={() => handleTimingToggle(slot.id)}
                  className="h-4 w-4"
                />
                <Label className={`font-medium ${isClosed ? 'text-gray-400' : ''}`}>
                  {slot.shortDay}
                </Label>
              </div>

              <div>
                {slot.isAvailable && !isClosed ? (
                  <div className="flex flex-1 items-center gap-3">
                    <TimePicker
                      value={slot.startTime}
                      minTime={dayHours?.open}
                      maxTime={dayHours?.close}
                      onChange={(value) =>
                        handleTimingTimeChange(slot.id, 'startTime', value)
                      }
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <TimePicker
                      value={slot.endTime}
                      minTime={slot.startTime || dayHours?.open}
                      maxTime={dayHours?.close}
                      onChange={(value) =>
                        handleTimingTimeChange(slot.id, 'endTime', value)
                      }
                    />
                  </div>
                ) : isClosed ? (
                  <span className="text-sm italic text-red-500">Org is Closed</span>
                ) : (
                  <span className="text-sm italic text-gray-500">Not Available</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
