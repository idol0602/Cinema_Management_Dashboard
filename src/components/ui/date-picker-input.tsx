"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerInputProps {
  value?: Date;
  onChange?: (dateString: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

function formatDateDisplay(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateToString(date: Date | undefined): string {
  if (!date) {
    return "";
  }

  // Format as YYYY-MM-DD sử dụng local date, không UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date | undefined {
  if (!dateString) {
    return undefined;
  }

  // Parse từ YYYY-MM-DD string
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    return undefined;
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(formatDateDisplay(value));
  const [month, setMonth] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setInputValue(formatDateDisplay(value));
    if (value) {
      setMonth(value);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = formatDateToString(date);
      onChange?.(dateString);
      setInputValue(formatDateDisplay(date));
      setMonth(date);
    } else {
      onChange?.(undefined);
      setInputValue("");
    }
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const date = parseDate(text);
    if (date) {
      const dateString = formatDateToString(date);
      onChange?.(dateString);
      setMonth(date);
    }
  };

  return (
    <div className="relative flex gap-2">
      <Input
        value={inputValue}
        placeholder={placeholder}
        className="bg-background pr-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        disabled={disabled}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            disabled={disabled}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={value}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
