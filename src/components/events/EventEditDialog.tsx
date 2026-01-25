import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEventSchema } from "@/schemas/event.schema";
import type { EventType } from "@/types/event.type";
import type { EventTypeType } from "@/types/eventType.type";
import { eventTypeService } from "@/services/eventType.service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { parse } from "date-fns";

interface EventEditDialogProps {
  event: EventType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EventType) => void;
}

export default function EventEditDialog({
  event,
  open,
  onOpenChange,
  onSubmit,
}: EventEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventTypeType[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      image: "",
      event_type_id: "",
      only_at_counter: false,
      is_active: true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await eventTypeService.getAll();
        if (response.success && response.data) {
          setEventTypes(response.data as EventTypeType[]);
        }
      } catch (error) {
        console.error("Failed to fetch event types:", error);
      }
    };
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (event && open) {
      form.reset({
        name: event.name || "",
        description: event.description || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
        image: event.image || "",
        event_type_id: event.event_type_id || "",
        only_at_counter: event.only_at_counter ?? false,
        is_active: event.is_active ?? true,
      });
      setImagePreview(event.image || "");
    }
  }, [event, open, form]);

  const handleSubmit = async (values: Partial<EventType>) => {
    setLoading(true);
    try {
      onSubmit(values as EventType);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Sự Kiện</DialogTitle>
          <DialogDescription>Cập nhật thông tin sự kiện</DialogDescription>
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
                  <FormLabel>Tên Sự Kiện</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên sự kiện" {...field} />
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình Ảnh</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {imagePreview && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        {imagePreview ? "Thay Đổi Hình Ảnh" : "Chọn Hình Ảnh"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
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
              name="end_date"
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
              name="event_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Sự Kiện</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại sự kiện" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
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

            <FormField
              control={form.control}
              name="only_at_counter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Chỉ Bán Tại Quầy</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Online & Quầy</FormLabel>
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
