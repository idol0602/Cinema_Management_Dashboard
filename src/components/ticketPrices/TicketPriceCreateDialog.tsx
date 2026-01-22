import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketPriceSchema } from "@/schemas/ticket_price.schema";
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
import { Plus, Loader2 } from "lucide-react";
import type { CreateTicketPriceType } from "@/types/ticketPrice.type";
import type { FormatType } from "@/types/format.type";
import type { SeatTypeDetailType } from "@/types/seatTypeDetail.type";

interface TicketPriceCreateDialogProps {
  formats: FormatType[];
  seatTypes: SeatTypeDetailType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateTicketPriceType) => void;
}

export function TicketPriceCreateDialog({
  formats,
  seatTypes,
  open,
  onOpenChange,
  onSubmit,
}: TicketPriceCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createTicketPriceSchema),
    defaultValues: {
      format_id: "",
      seat_type_id: "",
      day_type: "WEEKDAY",
      price: 0,
      is_active: true,
    },
  });

  const handleSubmit = async (data: CreateTicketPriceType) => {
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
            <Plus className="h-5 w-5" />
            Thêm Giá Vé Mới
          </DialogTitle>
          <DialogDescription>
            Tạo giá vé mới. Các trường có dấu * là bắt buộc.
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
                          {format.name}
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
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Giá Vé
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
