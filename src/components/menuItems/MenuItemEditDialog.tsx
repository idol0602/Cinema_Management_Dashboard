import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateMenuItemSchema } from "../../schemas/menu_items.schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, UtensilsCrossed, Loader2, Upload, X } from "lucide-react";
import type { MenuItemType, UpdateMenuItemType } from "@/types/menuItem.type";

interface MenuItemEditDialogProps {
  menuItem: MenuItemType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: UpdateMenuItemType) => void;
}

export function MenuItemEditDialog({
  menuItem,
  open,
  onOpenChange,
  onSubmit,
}: MenuItemEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  type UpdateMenuItemFormType = z.infer<typeof updateMenuItemSchema>;

  const form = useForm<UpdateMenuItemFormType>({
    resolver: zodResolver(updateMenuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      item_type: "FOOD",
      image: "",
      num_instock: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (menuItem && open) {
      form.reset({
        name: menuItem.name,
        description: menuItem.description || "",
        price: menuItem.price,
        item_type: menuItem.item_type as "FOOD" | "DRINK" | "GIFT",
        image: menuItem.image || "",
        num_instock: menuItem.num_instock || 0,
        is_active: menuItem.is_active,
      });
      setImagePreview(menuItem.image || "");
    }
  }, [menuItem, open, form]);

  const handleSubmit = async (data: UpdateMenuItemType) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!menuItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Chỉnh Sửa Món Ăn / Đồ Uống
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin món ăn hoặc đồ uống. Các trường có dấu * là bắt
            buộc.
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
                      Tên Món <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Bỏng ngô, Coca Cola..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Item Type */}
              <FormField
                control={form.control}
                name="item_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại Món <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại món" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FOOD">Đồ ăn</SelectItem>
                        <SelectItem value="DRINK">Đồ uống</SelectItem>
                        <SelectItem value="GIFT">Quà tặng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá (VNĐ) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock */}
              <FormField
                control={form.control}
                name="num_instock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số Lượng Tồn Kho</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về món ăn/đồ uống..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình Ảnh</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Chọn Ảnh
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImagePreview("");
                              form.setValue("image", "");
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Xóa
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      )}
                    </div>
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
                    <FormLabel className="text-base">
                      Trạng Thái Hoạt Động
                    </FormLabel>
                    <FormDescription>
                      Món có thể được đặt mua cùng vé xem phim
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
