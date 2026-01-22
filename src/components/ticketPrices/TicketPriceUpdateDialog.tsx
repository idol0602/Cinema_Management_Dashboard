import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Save, DollarSign, Loader2 } from "lucide-react";
import type {
  TicketPriceType,
  UpdateTicketPriceType,
} from "@/types/ticketPrice.type";

const updateTicketPriceSchema = z.object({
  price: z.number().min(0, "Giá không được âm"),
});

interface TicketPriceUpdateDialogProps {
  ticketPrice?: TicketPriceType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateTicketPriceType & { id: string }) => void;
}

export function TicketPriceUpdateDialog({
  ticketPrice,
  open,
  onOpenChange,
  onSubmit,
}: TicketPriceUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateTicketPriceSchema),
    defaultValues: {
      price: 0,
    },
  });

  // Load ticket price data when dialog opens
  useEffect(() => {
    if (ticketPrice && open) {
      form.reset({
        price: ticketPrice.price,
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
            <DollarSign className="h-5 w-5" />
            Cập Nhật Giá Vé
          </DialogTitle>
          <DialogDescription>
            Cập nhật giá vé cho {ticketPrice.format_id} -{" "}
            {ticketPrice.seat_type_id} ({ticketPrice.day_type})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                    Lưu Giá
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
