import { useState } from "react";
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
import { Plus, Trash2, Eye, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CreateComboType } from "@/types/combo.type";
import type { MovieType } from "@/types/movie.type";
import type { EventType } from "@/types/event.type";
import type { MenuItemType } from "@/types/menuItem.type";
import type { DiscountType } from "@/types/discount.type";

interface EventWithDiscount extends EventType {
  discount?: DiscountType | null;
}

interface ComboCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateComboType) => void;
  menuItems: MenuItemType[];
  movies: MovieType[];
  events: EventWithDiscount[];
}

interface MenuItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
}

interface DetailModalState {
  type: "menuItem" | "movie" | "event" | null;
  item: MenuItemType | MovieType | EventWithDiscount | null;
}

export const ComboCreateDialog = ({
  open,
  onOpenChange,
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
  const [selectedMovie, setSelectedMovie] = useState<MovieType | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDiscount | null>(null);
  const [detailModal, setDetailModal] = useState<DetailModalState>({
    type: null,
    item: null,
  });
  const [searchMenuItems, setSearchMenuItems] = useState("");
  const [searchMovies, setSearchMovies] = useState("");
  const [searchEvents, setSearchEvents] = useState("");

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
    const menuItem = menuItems.find((item) => String(item.id) === menuItemId);
    const exists = selectedMenuItems.find(
      (item) => item.menu_item_id === menuItemId,
    );
    if (!exists && menuItem) {
      setSelectedMenuItems((prev) => [
        ...prev,
        {
          menu_item_id: menuItemId,
          quantity: 1,
          unit_price: menuItem.price,
        },
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
    if (quantity < 0) return;
    setSelectedMenuItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleMenuItemUnitPriceChange = (menuItemId: string, price: number) => {
    if (price < 0) return;
    setSelectedMenuItems((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId
          ? { ...item, unit_price: price }
          : item,
      ),
    );
  };

  const handleMovieToggle = (movieId: string) => {
    if (selectedMovie?.id === movieId) {
      setSelectedMovie(null);
    } else {
      const movie = movies.find((m) => String(m.id) === movieId);
      setSelectedMovie(movie || null);
    }
  };

  const handleEventToggle = (eventId: string) => {
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    } else {
      const event = events.find((e) => String(e.id) === eventId);
      setSelectedEvent(event || null);
    }
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
    setSearchMenuItems("");
    setSearchMovies("");
    setSearchEvents("");
  };

  const getMenuItemName = (menuItemId: string) => {
    return (
      menuItems.find((item) => String(item.id) === menuItemId)?.name || "N/A"
    );
  };

  const openDetailModal = (
    type: "menuItem" | "movie" | "event",
    item: MenuItemType | MovieType | EventType,
  ) => {
    setDetailModal({ type, item });
  };

  const closeDetailModal = () => {
    setDetailModal({ type: null, item: null });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderDetailModal = () => {
    if (!detailModal.item || !detailModal.type) return null;

    if (detailModal.type === "menuItem") {
      const item = detailModal.item as MenuItemType;
      return (
        <Dialog open={!!detailModal.item} onOpenChange={closeDetailModal}>
          <DialogContent className="dark:text-foreground">
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Loại:
                  </span>
                  <Badge>{item.item_type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Giá:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(item.price)}
                  </span>
                </div>
                {item.num_instock !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Tồn kho:
                    </span>
                    <span>{item.num_instock} cái</span>
                  </div>
                )}
                {item.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Mô tả:
                    </span>
                    <p className="text-sm mt-1 text-foreground">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (detailModal.type === "movie") {
      const item = detailModal.item as MovieType;
      return (
        <Dialog open={!!detailModal.item} onOpenChange={closeDetailModal}>
          <DialogContent className="dark:text-foreground">
            <DialogHeader>
              <DialogTitle>{item.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Đạo diễn:
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {item.director}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Quốc gia:
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {item.country}
                  </p>
                </div>
                {item.duration && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Thời lượng:
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {item.duration} phút
                    </p>
                  </div>
                )}
                {item.rating && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Đánh giá:
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {item.rating}/10
                    </p>
                  </div>
                )}
              </div>
              {item.description && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Mô tả:
                  </span>
                  <p className="text-sm mt-1 text-foreground">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (detailModal.type === "event") {
      const item = detailModal.item as EventWithDiscount;
      return (
        <Dialog open={!!detailModal.item} onOpenChange={closeDetailModal}>
          <DialogContent className="dark:text-foreground">
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!item.image && (
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="space-y-3">
                {item.start_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Ngày bắt đầu:
                    </span>
                    <span className="text-sm">
                      {new Date(item.start_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {item.end_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Ngày kết thúc:
                    </span>
                    <span className="text-sm">
                      {new Date(item.end_date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {item.discount && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Giảm giá:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {item.discount.discount_percent}%
                      </span>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {item.discount.name}
                    </div>
                    {item.discount.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.discount.description}
                      </p>
                    )}
                    {(item.discount.valid_from || item.discount.valid_to) && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Hiệu lực: {item.discount.valid_from && new Date(item.discount.valid_from).toLocaleDateString("vi-VN")}
                        {item.discount.valid_to && ` - ${new Date(item.discount.valid_to).toLocaleDateString("vi-VN")}`}
                      </div>
                    )}
                  </div>
                )}
                {!item.discount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Giảm giá:
                    </span>
                    <span className="text-sm text-muted-foreground">Không có</span>
                  </div>
                )}
                {item.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Mô tả:
                    </span>
                    <p className="text-sm mt-1 text-foreground">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
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
              {/* Search */}
              <Input
                placeholder="🔍 Tìm kiếm mục thực đơn..."
                value={searchMenuItems}
                onChange={(e) =>
                  setSearchMenuItems(e.target.value.toLowerCase())
                }
                className="dark:bg-slate-700 dark:border-slate-600"
              />
              {/* Selected Menu Items */}
              {selectedMenuItems.length > 0 && (
                <div className="space-y-3 border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-foreground">
                    ✓ Mục đã chọn ({selectedMenuItems.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedMenuItems.map((item) => {
                      const menuItem = menuItems.find(
                        (m) => String(m.id) === item.menu_item_id,
                      );
                      const itemTotal = item.unit_price * item.quantity;
                      return (
                        <div
                          key={item.menu_item_id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-sm transition"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-sm text-foreground truncate">
                                {getMenuItemName(item.menu_item_id)}
                              </div>
                              {menuItem?.item_type && (
                                <Badge variant="outline" className="text-xs">
                                  {menuItem.item_type}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatPrice(item.unit_price)} × {item.quantity} ={" "}
                              {formatPrice(itemTotal)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {/* Unit Price Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Giá
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "") {
                                    handleMenuItemUnitPriceChange(
                                      item.menu_item_id,
                                      0,
                                    );
                                  } else {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num) && num >= 0) {
                                      handleMenuItemUnitPriceChange(
                                        item.menu_item_id,
                                        num,
                                      );
                                    }
                                  }
                                }}
                                className="w-20 text-center text-xs dark:bg-slate-600 dark:text-white dark:border-slate-500 h-8"
                                title="Đơn giá"
                              />
                            </div>
                            {/* Quantity Input */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                SL
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max="999"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "") {
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
                                  if (
                                    e.target.value === "" ||
                                    parseInt(e.target.value) < 1
                                  ) {
                                    handleMenuItemQuantityChange(
                                      item.menu_item_id,
                                      1,
                                    );
                                  }
                                }}
                                className="w-14 text-center text-xs dark:bg-slate-600 dark:text-white dark:border-slate-500 h-8"
                                title="Số lượng"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openDetailModal("menuItem", menuItem!)
                              }
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveMenuItem(item.menu_item_id);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Menu Items */}
              <div>
                <h4 className="font-medium mb-3 text-foreground">
                  Danh sách mục thực đơn:
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto border rounded-lg p-2">
                  {menuItems && menuItems.length > 0 ? (
                    menuItems
                      .filter((item) =>
                        item.name.toLowerCase().includes(searchMenuItems),
                      )
                      .map((item) => {
                        const itemId = String(item.id);
                        const isSelected = selectedMenuItems.some(
                          (si) => si.menu_item_id === itemId,
                        );
                        return (
                          <div
                            key={itemId}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                            }`}
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-foreground">
                                  {item?.name}
                                </div>
                                {item?.item_type && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {item.item_type}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatPrice(item.price)}
                                {item.num_instock !== undefined && (
                                  <> • Tồn: {item.num_instock}</>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetailModal("menuItem", item);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!isSelected && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddMenuItem(itemId);
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                                title="Thêm"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                            {isSelected && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMenuItem(itemId);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        Không có mục thực đơn nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movie Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chọn Phim (Tùy Chọn)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <Input
                placeholder="🔍 Tìm kiếm phim..."
                value={searchMovies}
                onChange={(e) => setSearchMovies(e.target.value.toLowerCase())}
                className="dark:bg-slate-700 dark:border-slate-600"
              />
              {movies && movies.length > 0 ? (
                <RadioGroup
                  value={selectedMovie?.id ? String(selectedMovie.id) : ""}
                  onValueChange={handleMovieToggle}
                >
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {movies
                      .filter((movie) =>
                        movie.title.toLowerCase().includes(searchMovies),
                      )
                      .map((movie) => {
                        const movieId = movie.id ? String(movie.id) : "";
                        const isSelected = selectedMovie?.id === movie.id;
                        return (
                          <div
                            key={movieId}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                            }`}
                          >
                            <RadioGroupItem
                              value={movieId}
                              id={`movie-${movieId}`}
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`movie-${movieId}`}
                                className="text-sm font-medium text-foreground cursor-pointer block"
                              >
                                {movie.title || "Unnamed"}
                              </label>
                              <div className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-1">
                                {movie.director && (
                                  <span>👤 {movie.director}</span>
                                )}
                                {movie.duration && (
                                  <span>⏱️ {movie.duration} phút</span>
                                )}
                                {movie.rating && (
                                  <span>⭐ {movie.rating}/10</span>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailModal("movie", movie)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Không có phim nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chọn Sự Kiện (Tùy Chọn)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <Input
                placeholder="🔍 Tìm kiếm sự kiện..."
                value={searchEvents}
                onChange={(e) => setSearchEvents(e.target.value.toLowerCase())}
                className="dark:bg-slate-700 dark:border-slate-600"
              />
              {events && events.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {events
                    .filter((event) =>
                      event.name.toLowerCase().includes(searchEvents),
                    )
                    .map((event) => {
                      const eventId = event.id ? String(event.id) : "";
                      const isSelected = selectedEvent?.id === event.id;
                      return (
                        <div
                          key={eventId}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                          }`}
                          onClick={() => handleEventToggle(eventId)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`event-${eventId}`}
                              className="text-sm font-medium text-foreground cursor-pointer block"
                            >
                              {event.name || "Unnamed"}
                            </label>
                            {(event.start_date || event.end_date) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                📅{" "}
                                {event.start_date &&
                                  new Date(event.start_date).toLocaleDateString(
                                    "vi-VN",
                                  )}{" "}
                                {event.end_date &&
                                  `- ${new Date(event.end_date).toLocaleDateString("vi-VN")}`}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal("event", event);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Không có sự kiện nào
                  </p>
                </div>
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
            <Button type="submit" disabled={false}>
              Tạo Combo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Detail Modal */}
      {renderDetailModal()}
    </Dialog>
  );
};
