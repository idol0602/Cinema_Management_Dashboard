import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calendar } from "lucide-react";
import type {
  EventTypeType,
  UpdateEventTypeType,
} from "@/types/eventType.type";

interface EventTypeEditDialogProps {
  eventType: EventTypeType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateEventTypeType) => void;
}

export function EventTypeEditDialog({
  eventType,
  open,
  onOpenChange,
  onSubmit,
}: EventTypeEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (eventType && open) {
      form.reset({
        name: eventType.name || "",
        is_active: eventType.is_active !== false,
      });
    }
  }, [eventType, open, form]);

  const handleSubmit = async (data: UpdateEventTypeType) => {
    setIsSubmitting(true);
    try {
      onSubmit?.(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chỉnh Sửa Loại Sự Kiện
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin loại sự kiện. Bấm lưu khi hoàn tất.
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
              rules={{ required: "Tên loại sự kiện là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Loại Sự Kiện *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Khuyến mãi, Ra mắt phim, Lễ hội..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái hoạt động</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập Nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
