"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Trash2, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/* ================== PROPS ================== */
type MultiSelectProps<T> = {
  items: T[];
  selected: T[];
  onChange: (items: T[]) => void;

  getId: (item: T) => string;
  getLabel: (item: T) => string;

  placeholder?: string;
};

/* ================== COMPONENT ================== */
export function MultiSelectComboboxTable<T>({
  items,
  selected,
  onChange,
  getId,
  getLabel,
  placeholder = "Select",
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [checkedIds, setCheckedIds] = React.useState<string[]>([]);

  /* ---------- Combobox logic ---------- */
  const isSelected = React.useCallback(
    (item: T) => selected.some((s) => getId(s) === getId(item)),
    [selected, getId]
  );

  const isAllSelected = items.length > 0 && selected.length === items.length;

  const isPartiallySelected =
    selected.length > 0 && selected.length < items.length;

  const toggleItem = (item: T) => {
    const id = getId(item);

    if (isSelected(item)) {
      onChange(selected.filter((s) => getId(s) !== id));
      setCheckedIds((prev) => prev.filter((cid) => cid !== id));
    } else {
      onChange([...selected, item]);
    }
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
      setCheckedIds([]);
    } else {
      onChange(items);
    }
  };

  /* ---------- Table logic ---------- */
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteChecked = () => {
    onChange(selected.filter((item) => !checkedIds.includes(getId(item))));
    setCheckedIds([]);
  };

  const isCheckAllTable =
    selected.length > 0 && checkedIds.length === selected.length;

  return (
    <div className="space-y-4">
      {/* -------- Combobox -------- */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[280px] justify-between"
          >
            {selected.length > 0 ? `Đã chọn ${selected.length}` : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No data found</CommandEmpty>

              {/* Select all */}
              <CommandGroup>
                <CommandItem
                  onMouseDown={(e) => e.preventDefault()}
                  onSelect={toggleSelectAll}
                  className="font-semibold"
                >
                  Chọn tất cả
                  {isAllSelected && <Check className="ml-auto h-4 w-4" />}
                  {isPartiallySelected && !isAllSelected && (
                    <Minus className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={getId(item)}
                    value={getLabel(item)}
                    onMouseDown={(e) => e.preventDefault()}
                    onSelect={() => toggleItem(item)}
                  >
                    {getLabel(item)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        isSelected(item) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* -------- Actions -------- */}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={checkedIds.length === 0}
          onClick={handleDeleteChecked}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </Button>
      </div>

      {/* -------- Table -------- */}
      <div className="max-h-60 overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Đã chọn</TableHead>
              <TableHead className="text-right">
                <Checkbox
                  checked={isCheckAllTable}
                  onCheckedChange={(checked) =>
                    setCheckedIds(checked ? selected.map((i) => getId(i)) : [])
                  }
                />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {selected.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Chưa chọn mục nào
                </TableCell>
              </TableRow>
            )}

            {selected.map((item, index) => {
              const id = getId(item);

              return (
                <TableRow key={id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{getLabel(item)}</TableCell>
                  <TableCell className="text-right">
                    <Checkbox
                      checked={checkedIds.includes(id)}
                      onCheckedChange={() => toggleCheck(id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
