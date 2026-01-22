import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTicketPriceSchema } from "@/schemas/ticket_price.schema";
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
import { Edit, DollarSign, Loader2 } from "lucide-react";
import type {
  TicketPriceType,
  UpdateTicketPriceType,
} from "@/types/ticketPrice.type";
import type { FormatType } from "@/types/format.type";
import type { SeatTypeDetailType } from "@/types/seatTypeDetail.type";

interface TicketPriceEditDialogProps {
  ticketPrice?: TicketPriceType;
  formats: FormatType[];
  seatTypes: SeatTypeDetailType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateTicketPriceType & { id: string }) => void;
}

export function TicketPriceEditDialog({
  ticketPrice,
  formats,
  seatTypes,
  open,
  onOpenChange,
  onSubmit,
}: TicketPriceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateTicketPriceSchema),
    defaultValues: {
      format_id: "",
      seat_type_id: "",
      day_type: "WEEKDAY",
      price: 0,
      is_active: true,
    },
  });

  // Load ticket price data when dialog opens
  useEffect(() => {
    if (ticketPrice && open) {
      form.reset({
        format_id: ticketPrice.format_id,
        seat_type_id: ticketPrice.seat_type_id,
        day_type: ticketPrice.day_type,
        price: ticketPrice.price,
        is_active: ticketPrice.is_active !== false,
      });
    }
  }, [ticketPrice, open, form]);

  const handleSubmit = async (data: UpdateTicketPriceType) => {
    setIsSubmitting(true);
    try {
      // Include id in the data
      const updateData = {
        ...data,
        id: ticketPrice?.id,
      };
      onSubmit?.(updateData as UpdateTicketPriceType & { id: string });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticketPrice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Chỉnh Sửa Giá Vé
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin giá vé. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Format */}
            <FormField
              control={form.control}
              name="format_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Định Dạng *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn định dạng phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.id} value={format.id!}>
                          {format.name || format.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seat Type */}
            <FormField
              control={form.control}
              name="seat_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Ghế *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ghế" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {seatTypes.map((seatType) => (
                        <SelectItem key={seatType.id} value={seatType.id!}>
                          {seatType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Day Type */}
            <FormField
              control={form.control}
              name="day_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Ngày *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ngày" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WEEKDAY">Ngày thường</SelectItem>
                      <SelectItem value="WEEKEND">Cuối tuần</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá Vé (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="mb-0">Hoạt động</FormLabel>
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
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Cập Nhật Giá Vé
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
