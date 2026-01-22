import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDiscountSchema } from "@/schemas/discount.schema";
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
import { parse } from "date-fns";

interface DiscountEditDialogProps {
  discount: DiscountType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DiscountType) => void;
}

export default function DiscountEditDialog({
  discount,
  open,
  onOpenChange,
  onSubmit,
}: DiscountEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);

  const form = useForm({
    resolver: zodResolver(updateDiscountSchema),
    defaultValues: {
      name: "",
      description: "",
      discount_percent: 0,
      valid_from: "",
      valid_to: "",
      event_id: "",
      is_active: true,
    },
  });

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      if (response.success && response.data) {
        setEvents(response.data as EventType[]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  useEffect(() => {
    if (discount && open) {
      form.reset({
        name: discount.name || "",
        description: discount.description || "",
        discount_percent: discount.discount_percent || 0,
        valid_from: discount.valid_from || "",
        valid_to: discount.valid_to || "",
        event_id: discount.event_id || "",
        is_active: discount.is_active ?? true,
      });
    }
  }, [discount, open, form]);

  const handleSubmit = async (values: Partial<DiscountType>) => {
    setLoading(true);
    try {
      onSubmit(values as DiscountType);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Giảm Giá</DialogTitle>
          <DialogDescription>Cập nhật thông tin giảm giá</DialogDescription>
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
                {loading ? "Đang cập nhật..." : "Cập Nhật"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
