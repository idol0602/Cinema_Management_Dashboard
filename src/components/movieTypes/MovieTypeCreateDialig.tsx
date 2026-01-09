import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createMovieTypeSchema,
  type CreateMovieTypeFormData,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Loader2 } from "lucide-react";

interface MovieTypeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateMovieTypeFormData) => void;
}

export function MovieTypeCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: MovieTypeCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateMovieTypeFormData>({
    resolver: zodResolver(createMovieTypeSchema),
    defaultValues: {
      type: "",
      is_active: true,
    },
  });

  const handleSubmit = async (data: CreateMovieTypeFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit?.(data);

      // Close dialog and reset form
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Thêm Thể Loại Phim Mới
          </DialogTitle>
          <DialogDescription>
            Điền thông tin thể loại phim mới. Các trường có dấu * là bắt buộc.
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
                  <FormLabel>Tên Thể Loại *</FormLabel>
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
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Thể Loại
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
