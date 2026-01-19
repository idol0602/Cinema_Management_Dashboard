import { useState } from "react";
import { comboService } from "@/services/combo.service";
import { comboItemService } from "@/services/comboItem.service";
import { comboMovieService } from "@/services/comboMovie.service";
import { comboEventService } from "@/services/comboEvent.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import type { CreateComboType } from "@/types/combo.type";
import type { movieType } from "@/types/movie.type";
import type { EventType } from "@/types/event.type";
import type { MenuItemType } from "@/types/menuItem.type";

interface ComboCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateComboType) => void;
  menuItems: MenuItemType[];
  movies: movieType[];
  events: EventType[];
}

interface MenuItem {
  menu_item_id: string;
  quantity: number;
}

export const ComboCreateDialog = ({
  open,
  onOpenChange,
  onSubmit,
  menuItems,
  movies,
  events,
}: ComboCreateDialogProps) => {
  const [formData, setFormData] = useState<CreateComboType>({
    name: "",
    description: "",
    total_price: 0,
    is_active: true,
  });

  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<movieType | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(false);

  console.log(selectedMenuItems, selectedMovie, selectedEvent);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddMenuItem = (menuItemId: string) => {
    const exists = selectedMenuItems.find(
      (item) => item.menu_item_id === menuItemId,
    );
    if (!exists) {
      setSelectedMenuItems((prev) => [
        ...prev,
        { menu_item_id: menuItemId, quantity: 1 },
      ]);
    }
  };

  const handleRemoveMenuItem = (menuItemId: string) => {
    setSelectedMenuItems((prev) =>
      prev.filter((item) => item.menu_item_id !== menuItemId),
    );
  };

  const handleMenuItemQuantityChange = (
    menuItemId: string,
    quantity: number,
  ) => {
    setSelectedMenuItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleMovieToggle = (movieId: string) => {
    const movie = movies.find((m) => m.id === movieId);
    setSelectedMovie(selectedMovie?.id === movieId ? null : movie || null);
  };

  const handleEventToggle = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    setSelectedEvent(selectedEvent?.id === eventId ? null : event || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      total_price: 0,
      is_active: true,
    });
    setSelectedMenuItems([]);
    setSelectedMovie(null);
    setSelectedEvent(null);
  };

  const getMenuItemName = (menuItemId: string) => {
    return menuItems.find((item) => item.id === menuItemId)?.name || "N/A";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col dark:text-foreground">
        <DialogHeader>
          <DialogTitle>Thêm Combo Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin combo và chọn các mục thực đơn, phim, sự kiện
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto max-h-[calc(95vh-150px)]"
        >
          {/* Combo Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông Tin Combo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Combo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nhập tên combo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả combo"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_price">Tổng Giá (₫) *</Label>
                <Input
                  id="total_price"
                  name="total_price"
                  type="number"
                  placeholder="0"
                  value={formData.total_price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chọn Mục Thực Đơn *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Menu Items */}
              {selectedMenuItems.length > 0 && (
                <div className="space-y-2 border-b pb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <h4 className="font-medium text-foreground">
                    Các mục đã chọn:
                  </h4>
                  {selectedMenuItems.map((item) => (
                    <div
                      key={item.menu_item_id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded"
                    >
                      <span className="text-sm text-foreground">
                        {getMenuItemName(item.menu_item_id)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="relative w-16">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || val === "0") {
                                handleMenuItemQuantityChange(
                                  item.menu_item_id,
                                  1,
                                );
                              } else {
                                const num = parseInt(val, 10);
                                if (!isNaN(num) && num > 0) {
                                  handleMenuItemQuantityChange(
                                    item.menu_item_id,
                                    num,
                                  );
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (val === "" || parseInt(val, 10) < 1) {
                                handleMenuItemQuantityChange(
                                  item.menu_item_id,
                                  1,
                                );
                              }
                            }}
                            className="w-16 dark:bg-slate-600 dark:text-white dark:border-slate-500"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveMenuItem(item.menu_item_id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Menu Items */}
              <div>
                <h4 className="font-medium mb-3">Danh sách mục thực đơn:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {menuItems.map((item) => {
                    const itemId = String(item.id);
                    const isSelected = selectedMenuItems.some(
                      (si) => si.menu_item_id === itemId,
                    );
                    return (
                      <div
                        key={itemId}
                        className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            if (isSelected) {
                              handleRemoveMenuItem(itemId);
                            } else {
                              handleAddMenuItem(itemId);
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {item?.name}
                          </div>
                        </div>
                        {!isSelected && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMenuItem(itemId);
                            }}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {isSelected && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMenuItem(itemId);
                            }}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movie Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chọn Phim (Tùy Chọn)</CardTitle>
            </CardHeader>
            <CardContent>
              {movies && movies.length > 0 ? (
                <RadioGroup
                  value={selectedMovie?.id ? String(selectedMovie.id) : ""}
                  onValueChange={handleMovieToggle}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {movies.map((movie) => {
                      const movieId = movie.id ? String(movie.id) : "";
                      return (
                        <div
                          key={movieId}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                        >
                          <RadioGroupItem
                            value={movieId}
                            id={`movie-${movieId}`}
                          />
                          <label
                            htmlFor={`movie-${movieId}`}
                            className="text-sm flex-1 cursor-pointer text-foreground"
                          >
                            {movie.title || "Unnamed"}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Không có phim nào
                </p>
              )}
            </CardContent>
          </Card>

          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chọn Sự Kiện (Tùy Chọn)</CardTitle>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <RadioGroup
                  value={selectedEvent?.id ? String(selectedEvent.id) : ""}
                  onValueChange={handleEventToggle}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {events.map((event) => {
                      const eventId = event.id ? String(event.id) : "";
                      return (
                        <div
                          key={eventId}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                        >
                          <RadioGroupItem
                            value={eventId}
                            id={`event-${eventId}`}
                          />
                          <label
                            htmlFor={`event-${eventId}`}
                            className="text-sm flex-1 cursor-pointer text-foreground"
                          >
                            {event.name || "Unnamed"}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Không có sự kiện nào
                </p>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo Combo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
