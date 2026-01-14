import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDiscountSchema } from "@/schemas/discount.schema";
import type { DiscountType } from "@/types/discount.type";
import type { EventType } from "@/types/event.type";
import { eventService } from "@/services/event.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DiscountCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DiscountType) => void;
}

export default function DiscountCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: DiscountCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);

  const form = useForm({
    resolver: zodResolver(createDiscountSchema),
    defaultValues: {
      name: "",
      description: "",
      discount_percent: 0,
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data as EventType[]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmit = async (values: Partial<DiscountType>) => {
    setLoading(true);
    try {
      onSubmit(values as DiscountType);
      form.reset();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm Giảm Giá Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin giảm giá mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Giảm Giá</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên giảm giá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sự Kiện</FormLabel>
                  <FormControl>
                    <Combobox
                      datas={events
                        .filter((event) => event.id)
                        .map((event) => ({
                          value: event.id!,
                          label: event.name,
                        }))}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Chọn sự kiện"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phần Trăm Giảm Giá (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nhập phần trăm"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valid_from"
              render={({ field }) => {
                const date = field.value
                  ? typeof field.value === "string"
                    ? parse(field.value, "yyyy-MM-dd", new Date())
                    : field.value
                  : undefined;

                return (
                  <FormItem>
                    <FormLabel>Ngày Bắt Đầu</FormLabel>
                    <FormControl>
                      <DatePickerInput
                        value={date}
                        onChange={(dateString) => {
                          field.onChange(dateString);
                        }}
                        placeholder="Chọn ngày bắt đầu"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="valid_to"
              render={({ field }) => {
                const date = field.value
                  ? typeof field.value === "string"
                    ? parse(field.value, "yyyy-MM-dd", new Date())
                    : field.value
                  : undefined;

                return (
                  <FormItem>
                    <FormLabel>Ngày Kết Thúc</FormLabel>
                    <FormControl>
                      <DatePickerInput
                        value={date}
                        onChange={(dateString) => {
                          field.onChange(dateString);
                        }}
                        placeholder="Chọn ngày kết thúc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Kích Hoạt</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
