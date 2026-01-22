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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Zap } from "lucide-react";
import type { CreateActionType, ActionMethod } from "@/types/action.type";

interface ActionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateActionType) => void;
}

const methods: ActionMethod[] = ["GET", "POST", "PUT", "DELETE"];

export function ActionCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: ActionCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      path: "",
      method: "GET" as ActionMethod,
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        path: "",
        method: "GET",
        is_active: true,
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: CreateActionType) => {
    setIsSubmitting(true);
    try {
      onSubmit?.(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Thêm Hành Động Mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin hành động API mới. Bấm lưu khi hoàn tất.
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
              rules={{ required: "Tên hành động là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Hành Động *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Lấy danh sách phim, Tạo phim mới..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="path"
              rules={{ required: "Đường dẫn là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường Dẫn API *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: /api/movies, /api/users/:id..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              rules={{ required: "Phương thức là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương Thức HTTP *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
