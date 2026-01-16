"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TimePickerInputProps {
  value?: string; // Format: "HH:MM SA/CH" e.g. "10:30 SA" or "02:30 CH"
  onChange?: (timeString: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimePickerInput({
  value,
  onChange,
  placeholder = "HH:MM SA/CH",
  disabled = false,
}: TimePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [hour, setHour] = React.useState("10");
  const [minute, setMinute] = React.useState("00");
  const [period, setPeriod] = React.useState<"SA" | "CH">("SA");

  React.useEffect(() => {
    if (value) {
      setInputValue(value);
      const parts = value.trim().split(" ");
      if (parts.length === 2) {
        const [timePart, per] = parts;
        const [h, m] = timePart.split(":");
        setHour(h);
        setMinute(m);
        setPeriod(per as "SA" | "CH");
      }
    }
  }, [value]);

  const handleTimeSelect = () => {
    const timeString = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")} ${period}`;
    onChange?.(timeString);
    setInputValue(timeString);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Try to parse the input
    const parts = val.trim().split(" ");
    if (parts.length === 2) {
      const [timePart, per] = parts;
      if ((per === "SA" || per === "CH") && timePart.includes(":")) {
        const [h, m] = timePart.split(":");
        if (!isNaN(Number(h)) && !isNaN(Number(m))) {
          setHour(String(Number(h)).padStart(2, "0"));
          setMinute(String(Number(m)).padStart(2, "0"));
          setPeriod(per);
          onChange?.(val);
        }
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {inputValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nhập giờ phút (HH:MM SA/CH)
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="HH:MM SA/CH"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Hours */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Giờ</label>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newHour = (parseInt(hour) + 1) % 12 || 12;
                    setHour(String(newHour).padStart(2, "0"));
                  }}
                >
                  ▲
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={hour}
                  onChange={(e) => {
                    let val = Math.min(
                      12,
                      Math.max(1, parseInt(e.target.value) || 1)
                    );
                    setHour(String(val).padStart(2, "0"));
                  }}
                  className="text-center text-lg font-bold"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newHour = parseInt(hour) - 1 || 12;
                    setHour(String(newHour).padStart(2, "0"));
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>

            {/* Minutes */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Phút</label>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newMinute = (parseInt(minute) + 5) % 60;
                    setMinute(String(newMinute).padStart(2, "0"));
                  }}
                >
                  ▲
                </Button>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => {
                    let val = Math.min(
                      59,
                      Math.max(0, parseInt(e.target.value) || 0)
                    );
                    setMinute(String(val).padStart(2, "0"));
                  }}
                  className="text-center text-lg font-bold"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newMinute = (parseInt(minute) - 5 + 60) % 60;
                    setMinute(String(newMinute).padStart(2, "0"));
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Buổi</label>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant={period === "SA" ? "default" : "outline"}
                  onClick={() => setPeriod("SA")}
                  className="flex-1"
                >
                  SA
                </Button>
                <Button
                  size="sm"
                  variant={period === "CH" ? "default" : "outline"}
                  onClick={() => setPeriod("CH")}
                  className="flex-1"
                >
                  CH
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleTimeSelect} className="w-full">
            Xác nhận
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
