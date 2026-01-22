import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
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
import { Save, DoorOpen, Loader2 } from "lucide-react";
import type { RoomType, UpdateRoomType } from "@/types/room.type";
import type { FormatType } from "@/types/format.type";
import { updateRoomSchema } from "../../schemas/room.schema.ts";

interface RoomEditDialogProps {
  room: RoomType | null;
  open: boolean;
  formats?: FormatType[];
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateRoomType) => void;
}

export function RoomEditDialog({
  room,
  open,
  formats = [],
  onOpenChange,
  onSubmit,
}: RoomEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      name: "",
      format_id: "2D",
      location: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (room && open) {
      form.reset({
        name: room.name,
        format_id: room.format_id,
        location: room.location || "",
        is_active: room.is_active,
      });
    }
  }, [room, open, form]);

  const handleSubmit = async (data: UpdateRoomType) => {
    setIsSubmitting(true);
    try {
      console.log("Update form data:", data);
      onSubmit?.(data);

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Chỉnh Sửa Phòng Chiếu
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin phòng chiếu. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Phòng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Phòng 1, Phòng VIP..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Format */}
              <FormField
                control={form.control}
                name="format_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Định Dạng <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.id} value={format.id || ""}>
                            {format.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị Trí</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Tầng 2, Tầng 3..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Vị trí của phòng chiếu trong rạp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng Thái Hoạt Động
                    </FormLabel>
                    <FormDescription>
                      Phòng có thể được sử dụng để đặt lịch chiếu phim
                    </FormDescription>
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
                <Save className="mr-2 h-4 w-4" />
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
