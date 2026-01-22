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
import { Save, Armchair, Loader2 } from "lucide-react";
import type { SeatType, SeatTypeUpdate } from "@/types/seat.type";
import type { SeatTypeType } from "@/types/seatType.type";
import { updateSeatSchema } from "../../schemas/seat.schema.ts";

interface SeatEditDialogProps {
  seat?: SeatType;
  open: boolean;
  seatTypes?: SeatTypeType[];
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: SeatTypeUpdate & { id: string }) => void;
}

export function SeatEditDialog({
  seat,
  open,
  seatTypes = [],
  onOpenChange,
  onSubmit,
}: SeatEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SeatTypeUpdate>({
    resolver: zodResolver(updateSeatSchema),
    defaultValues: {
      seat_number: "",
      type: "",
      is_active: true,
    },
  });

  // Load seat data when dialog opens
  useEffect(() => {
    if (seat && open) {
      form.reset({
        seat_number: seat.seat_number,
        type: seat.type,
        is_active: seat.is_active !== false,
      });
    }
  }, [seat, open, form]);

  const handleSubmit = async (data: SeatTypeUpdate) => {
    setIsSubmitting(true);
    try {
      // Include id in the data
      const updateData = {
        ...data,
        id: seat?.id,
      };
      onSubmit?.(updateData as SeatTypeUpdate & { id: string });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Chỉnh Sửa Ghế
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết về ghế "{seat.seat_number}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Seat Number */}
            <FormField
              control={form.control}
              name="seat_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Ghế *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: A1, B2, C3..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seat Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Ghế</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ghế" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seatTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id || ""}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel className="text-base font-normal cursor-pointer">
                    Ghế Hoạt Động
                  </FormLabel>
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
