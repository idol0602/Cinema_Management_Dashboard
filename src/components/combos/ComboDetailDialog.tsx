import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Calendar,
  Info,
  ShoppingCart,
  Film,
  Ticket,
  Image as ImageIcon,
} from "lucide-react";
import type { CreateComboType } from "@/types/combo.type";
import type { ComboMovieType } from "@/types/comboMovie.type";
import type { ComboEventType } from "@/types/comboEvent.type";
import type { MovieType } from "@/types/movie.type";
import type { EventType } from "@/types/event.type";
import type { DiscountType } from "@/types/discount.type";
import type { ComboItemType } from "@/types/comboItem.type"
import type { MenuItemType } from "@/types/menuItem.type"

interface EventWithDiscount extends EventType {
  discount?: DiscountType | null;
}

interface DetailComboType extends CreateComboType {
  id: string;
  combo_items?: (ComboItemType & { menu_item?: MenuItemType })[];
  combo_movies?: (ComboMovieType & { movie?: MovieType })[];
  combos_events?: (ComboEventType & { event?: EventWithDiscount | null })[];
}

interface ComboDetailDialogProps {
  combo: DetailComboType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComboDetailDialog = ({
  combo,
  open,
  onOpenChange,
}: ComboDetailDialogProps) => {
  if (!combo) return null;

  // Format currency
  const formatCurrency = (price?: number) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format date
  const parseDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return { date: "N/A", time: "N/A" };

    try {
      let datePart = "";
      let timePart = "";

      if (dateTimeString.includes("T")) {
        const dateTimeParts = dateTimeString.split("T");
        datePart = dateTimeParts[0];
        timePart = dateTimeParts[1]?.split("+")[0] || "";
      } else if (dateTimeString.includes(" ")) {
        // Space format: "2026-01-10 16:35:00+00"
        const dateTimeParts = dateTimeString.split(" ");
        datePart = dateTimeParts[0];
        timePart = dateTimeParts[1]?.split("+")[0] || "";
      }

      if (datePart && timePart) {
        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");

        if (year && month && day && hour && minute) {
          return {
            date: `${day}/${month}/${year.slice(-2)}`,
            time: `${hour}:${minute}`,
          };
        }
      }
    } catch (error) {
      console.error("Error parsing datetime:", dateTimeString, error);
    }

    return { date: "N/A", time: "N/A" };
  };

  const comboItems = combo.combo_items || [];
  const comboMovies = combo.combo_movies || [];
  const comboEvents = combo.combos_events || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl">Chi Tiết Combo</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 pb-6">
            {/* Thông tin cơ bản */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Thông Tin Cơ Bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hình ảnh */}
                  <div className="sm:col-span-2 lg:col-span-1 row-span-2">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Hình ảnh
                    </label>
                     {combo.image ? (
                        <div className="w-full h-full min-h-[200px] overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800">
                          <img
                            src={combo.image}
                            alt={combo.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full min-h-[200px] bg-slate-100 dark:bg-slate-800 rounded-lg border flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-slate-400" />
                        </div>
                      )}
                  </div>

                  {/* Tên combo */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tên Combo
                    </label>
                    <p className="text-lg font-semibold mt-2">{combo.name}</p>
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Trạng Thái
                    </label>
                    <div className="mt-2">
                      {combo.is_active !== false ? (
                        <Badge variant="default" className="bg-green-500">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Ngừng hoạt động</Badge>
                      )}
                    </div>
                  </div>

                  {/* Tổng giá */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Tổng Giá
                    </label>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {formatCurrency(combo.total_price)}
                    </p>
                  </div>

                  {/* Giảm giá */}
                  {Array.isArray(combo.combos_events) &&
                    combo.combos_events.length > 0 &&
                    combo.combos_events[0].event &&
                    combo.combos_events[0].event.discount &&
                    combo.combos_events[0].event.discount.discount_percent && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Giảm Giá
                        </label>
                        <p className="text-xl font-semibold mt-2 text-blue-600">
                          {
                            combo.combos_events[0].event.discount
                              .discount_percent
                          }
                          %
                        </p>
                      </div>
                    )}

                  {/* Ngày tạo */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Ngày Tạo
                    </label>
                    <p className="text-sm mt-2">
                      {parseDateTime(combo.created_at).time}{" "}
                      {parseDateTime(combo.created_at).date}
                    </p>
                  </div>
                </div>

                {/* Mô tả */}
                {combo.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Mô Tả
                      </label>
                      <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
                        {combo.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tabs cho các chi tiết khác */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {comboItems.length > 0 && (
                  <TabsTrigger
                    value="items"
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Mặt Hàng ({comboItems.length})
                  </TabsTrigger>
                )}
                {comboMovies.length > 0 && (
                  <TabsTrigger
                    value="movies"
                    className="flex items-center gap-2"
                  >
                    <Film className="h-4 w-4" />
                    Phim ({comboMovies.length})
                  </TabsTrigger>
                )}
                {comboEvents.length > 0 && (
                  <TabsTrigger
                    value="events"
                    className="flex items-center gap-2"
                  >
                    <Ticket className="h-4 w-4" />
                    Sự Kiện ({comboEvents.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab: Mặt hàng */}
              <TabsContent value="items" className="space-y-4">
                {comboItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có mặt hàng nào trong combo này
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comboItems.map((item, index) => (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                STT
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {index + 1}
                              </p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex justify-center">
                              <img
                                className="h-20 w-20 object-cover rounded border"
                                src={item.menu_item?.image || ""}
                                alt={item.menu_item?.name || "N/A"}
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Tên Mặt Hàng
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {item.menu_item?.name || "N/A"}
                              </p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Số Lượng
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {item.quantity || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Phim */}
              <TabsContent value="movies" className="space-y-4">
                {comboMovies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có phim nào trong combo này
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comboMovies.map((comboMovie, index) => (
                      <Card
                        key={comboMovie.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                STT
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {index + 1}
                              </p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex justify-center">
                              <img
                                className="h-20 w-20 object-cover rounded border"
                                src={comboMovie.movie?.image || ""}
                                alt={comboMovie.movie?.title || "N/A"}
                              />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Tên Phim
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {comboMovie.movie?.title || "N/A"}
                              </p>
                              {comboMovie.movie?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {comboMovie.movie.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Sự kiện */}
              <TabsContent value="events" className="space-y-4">
                {comboEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có sự kiện nào trong combo này
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comboEvents.map((comboEvent, index) => (
                      <Card
                        key={comboEvent.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                STT
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {index + 1}
                              </p>
                            </div>
                            <div className="flex justify-center">
                              <img
                                className="h-20 w-20 object-cover rounded border"
                                src={comboEvent.event?.image || ""}
                                alt={comboEvent.event?.name || "N/A"}
                              />
                            </div>
                            <div className="lg:col-span-2">
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Tên Sự Kiện
                              </label>
                              <p className="text-sm font-semibold mt-1">
                                {comboEvent.event?.name || "N/A"}
                              </p>
                              {comboEvent.event?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {comboEvent.event.description}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Thời Gian
                              </label>
                              <p className="text-xs mt-1">
                                {comboEvent.event?.start_date
                                  ? new Date(comboEvent.event.start_date).toLocaleDateString("vi-VN")
                                  : "N/A"}
                                {" - "}
                                {comboEvent.event?.end_date
                                  ? new Date(comboEvent.event.end_date).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </p>
                              <Badge
                                variant={comboEvent.event?.is_active ? "default" : "secondary"}
                                className="mt-1"
                              >
                                {comboEvent.event?.is_active ? "Hoạt động" : "Ngừng"}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase">
                                Giảm Giá
                              </label>
                              {comboEvent.event?.discount ? (
                                <div className="mt-1">
                                  <p className="text-lg font-bold text-green-600">
                                    {comboEvent.event.discount.discount_percent}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {comboEvent.event.discount.name}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Không có
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
