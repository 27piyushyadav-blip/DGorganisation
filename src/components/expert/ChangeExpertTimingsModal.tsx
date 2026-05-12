'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/modal/Modal';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const timeOptions = Array.from({ length: 24 }, (_, index) => {
  const value = `${index.toString().padStart(2, '0')}:00`;
  return value;
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

export default function ChangeExpertTimingsModal({
  isOpen,
  expertName,
  timings,
  onClose,
  onSave,
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
      prev.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot))
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
        {timingSlots.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-col gap-3 rounded-lg border border-[var(--primary-start)] p-4 md:flex-row md:items-center justify-between"
          >
            <div className="flex items-center space-x-2 md:w-28">
              <input
                type="checkbox"
                checked={slot.isAvailable}
                onChange={() => handleTimingToggle(slot.id)}
                className="h-4 w-4"
              />
              <Label className="font-medium">{slot.shortDay}</Label>
            </div>

            <div>

            {slot.isAvailable ? (
              <div className="flex flex-1 items-center gap-3">
                <Select
                  value={slot.startTime}
                  onValueChange={(value) =>
                    handleTimingTimeChange(slot.id, 'startTime', value)
                  }
                >
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">to</span>
                <Select
                  value={slot.endTime}
                  onValueChange={(value) =>
                    handleTimingTimeChange(slot.id, 'endTime', value)
                  }
                >
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm italic text-gray-500">Not Available</span>
            )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
