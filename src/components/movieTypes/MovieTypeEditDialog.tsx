import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateMovieTypeSchema,
  type UpdateMovieTypeFormData,
} from "@/schemas/movieType.schema";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Tag, Loader2 } from "lucide-react";
import type { movieTypeType } from "@/types/movieType.type";

interface MovieTypeEditDialogProps {
  movieType: movieTypeType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateMovieTypeFormData) => void;
}

export function MovieTypeEditDialog({
  movieType,
  open,
  onOpenChange,
  onSubmit,
}: MovieTypeEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateMovieTypeFormData>({
    resolver: zodResolver(updateMovieTypeSchema),
    defaultValues: {
      type: "",
      is_active: true,
    },
  });

  // Load movieType data when dialog opens
  useEffect(() => {
    if (movieType && open) {
      form.reset({
        type: movieType.type,
        is_active: movieType.is_active !== false,
      });
    }
  }, [movieType, open, form]);

  const handleSubmit = async (data: UpdateMovieTypeFormData) => {
    setIsSubmitting(true);
    try {
      // Include id in the data
      const updateData = {
        ...data,
        id: movieType?.id,
      };
      onSubmit?.(updateData as any);

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!movieType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Chỉnh Sửa Thể Loại Phim
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin thể loại phim "{movieType.type}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Thể Loại</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Hành Động, Kinh Dị, Hài..."
                      {...field}
                    />
                  </FormControl>
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
                    <FormLabel className="text-base">Trạng Thái</FormLabel>
                    <FormDescription>
                      Kích hoạt thể loại để hiển thị trong danh sách
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
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu Thay Đổi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
