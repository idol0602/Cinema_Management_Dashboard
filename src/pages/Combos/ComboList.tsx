import { useState, useEffect } from "react";
import { comboService } from "@/services/combo.service";
import { comboMovieService } from "@/services/comboMovie.service";
import { comboEventService } from "@/services/comboEvent.service";
import { eventService } from "@/services/event.service";
import { movieService } from "@/services/movie.service";
import { menuItemService } from "@/services/menuItem.service";
import { discountService } from "@/services/discount.service";
import { toast } from "sonner";
import { ComboCreateDialog } from "../../components/combos/ComboCreateDialog";
// import { ComboEditDialog } from "@/components/combos/ComboEditDialog";
import { ComboDetailDialog } from "../../components/combos/ComboDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { CreateComboType, UpdateComboType } from "@/types/combo.type";
import type { ComboMovieType } from "@/types/comboMovie.type";
import type { ComboEventType } from "@/types/comboEvent.type";
import type { movieType } from "@/types/movie.type";
import type { EventType } from "@/types/event.type";
import type { ComboItemType } from "@/types/comboItem.type";
import type { PaginationMeta } from "@/types/pagination.type";
import type { DiscountType } from "@/types/discount.type";
import { comboPaginateConfig } from "@/config/paginate/combo.config";
import { comboItemService } from "@/services/comboItem.service";

interface ComboType extends CreateComboType {
  id: string;
}

const ComboList = () => {
  const [combos, setCombos] = useState<ComboType[]>([]);
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [comboItems, setComboItems] = useState<ComboItemType[]>([]);
  const [menuItems, setMenuItems] = useState<movieType[]>([]);
  const [comboMovies, setComboMovies] = useState<ComboMovieType[]>([]);
  const [comboEvents, setComboEvents] = useState<ComboEventType[]>([]);
  const [movies, setMovies] = useState<movieType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: comboPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const fetchComboMovies = async () => {
    try {
      const response = await comboMovieService.getAll();
      if (response.success) {
        setComboMovies(response.data as ComboMovieType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComboEvents = async () => {
    try {
      const response = await comboEventService.getAll();
      if (response.success) {
        setComboEvents(response.data as ComboEventType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComboItems = async () => {
    try {
      const response = await comboItemService.getAll();
      if (response.success) {
        setComboItems(response.data as ComboItemType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await movieService.findAndPaginate({
        page: 1,
        limit: undefined,
        sortBy: undefined, // Format: "column:ASC" or "column:DESC"
        search: undefined,
        searchBy: undefined,
        filter: {
          is_active: true,
        },
      });
      if (response.success) {
        setMovies(response.data as movieType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.findAndPaginate({
        page: 1,
        limit: undefined,
        sortBy: undefined, // Format: "column:ASC" or "column:DESC"
        search: undefined,
        searchBy: undefined,
        filter: {
          is_active: true,
        },
      });
      if (response.success) {
        setEvents(response.data as EventType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await menuItemService.findAndPaginate({
        page: 1,
        limit: undefined,
        sortBy: undefined,
        search: undefined,
        searchBy: undefined,
        filter: { is_active: true },
      });
      if (response.success) {
        setMenuItems(response.data as movieType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await discountService.findAndPaginate({
        page: 1,
        limit: undefined,
        sortBy: undefined,
        search: undefined,
        searchBy: undefined,
        filter: { is_active: true },
      });
      if (response.success) {
        setDiscounts(response.data as DiscountType[]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComboMovies();
    fetchComboEvents();
    fetchComboItems();
    fetchMenuItems();
    fetchEvents();
    fetchMovies();
    fetchDiscounts();
  }, []);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  //   const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = comboPaginateConfig.defaultLimit,
    sortBy = comboPaginateConfig.defaultSortBy[0] +
      ":" +
      comboPaginateConfig.defaultSortBy[1],
    search = undefined,
    searchBy = undefined,
    filter = {},
  ) => {
    setLoading(true);
    try {
      const response = await comboService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setCombos(response.data as ComboType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách combo");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  const handleSearch = () => {
    let sortBy =
      comboPaginateConfig.defaultSortBy[0] +
      ":" +
      comboPaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }

    findAndPaginate(
      currentPage,
      comboPaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined,
    );
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  // Handle create combo
  const handleCreateSubmit = async (data: CreateComboType) => {
    handleSearch(); // Refresh list
  };

  const handleEdit = (combo: ComboType) => {
    setSelectedCombo(combo);
    // setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: UpdateComboType) => {
    if (!selectedCombo) return;

    try {
      const response = await comboService.update(selectedCombo.id, data);
      if (response.success) {
        toast.success("Cập nhật combo thành công!");
        handleSearch(); // Refresh list
      } else {
        toast.error("Không thể cập nhật combo");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật combo");
      console.error(error);
    }
  };

  const handleDelete = async (combo: ComboType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa combo "${combo.name}" không?`)) {
      return;
    }

    try {
      const response = await comboService.delete(combo.id);
      if (response.success) {
        toast.success("Xóa combo thành công!");
        handleSearch(); // Refresh list
      } else {
        toast.error("Không thể xóa combo");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa combo");
      console.error(error);
    }
  };

  const handleView = (combo: ComboType) => {
    const detailedCombo = collectDataForDetail(combo);
    setSelectedCombo(detailedCombo as any);
    setDetailDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Format currency
  const formatCurrency = (price?: number) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const collectDataForDetail = (combo: ComboType) => {
    const items = comboItems
      .filter((item) => item.combo_id === combo.id)
      .map((item) => {
        const menuItem = menuItems.find(
          (menu) => menu.id === item.menu_item_id,
        );
        return {
          ...item,
          menu_item: menuItem,
        };
      });

    const moviesInCombo = comboMovies
      .filter((cm) => cm.combo_id === combo.id)
      .map((cm) => {
        const movie = movies.find((m) => m.id === cm.movie_id);
        return {
          ...cm,
          movie: movie,
        };
      });

    const eventsInCombo = comboEvents
      .filter((ce) => ce.combo_id === combo.id)
      .map((ce) => {
        const event = events.find((e) => e.id === ce.event_id);
        const discount = event
          ? discounts.find((d) => d.event_id === event.id)
          : null;
        return {
          ...ce,
          event: event
            ? {
                ...event,
                discount: discount || null,
              }
            : null,
        };
      });

    return {
      ...combo,
      combo_items: items,
      combo_movies: moviesInCombo,
      combos_events: eventsInCombo,
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Quản Lý Combo
              </CardTitle>
              <CardDescription>
                Quản lý danh sách combo và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Combo Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên combo, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={comboPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            ></Combobox>
            <Combobox
              datas={comboPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            ></Combobox>
            <Combobox
              datas={comboPaginateConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            ></Combobox>
            <Combobox
              datas={[
                {
                  value: "ASC",
                  label: "tăng dần",
                },
                {
                  value: "DESC",
                  label: "giảm dần",
                },
              ]}
              placeholder="Thứ tự"
              onChange={setOrderColumn}
              value={orderColumn}
            ></Combobox>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : combos.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy combo nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[250px]">
                        Thông Tin Combo
                      </TableHead>
                      <TableHead className="text-center">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Tổng Giá
                      </TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Ngày Tạo
                      </TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combos.map((combo, index) => (
                      <TableRow key={combo.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-semibold text-base mb-1">
                              {combo.name}
                            </div>
                            {combo.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {combo.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(combo.total_price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatDate(combo.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {combo.is_active !== false ? (
                            <Badge variant="default" className="bg-green-500">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Ngừng</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(combo)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(combo)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {combo.is_active === false ? (
                              <></>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(combo)}
                                title="Xóa"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(meta.currentPage - 1) * meta.itemsPerPage + 1} -{" "}
                  {Math.min(
                    meta.currentPage * meta.itemsPerPage,
                    meta.totalItems,
                  )}{" "}
                  của {meta.totalItems} combo
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === meta.totalPages ||
                          Math.abs(page - currentPage) <= 1,
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(meta.totalPages, prev + 1),
                      )
                    }
                    disabled={currentPage === meta.totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Dialogs */}
      <ComboCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        menuItems={menuItems}
        movies={movies}
        events={events.map((event) => ({
          ...event,
          discount: discounts.find((d) => d.event_id === event.id) || null,
        }))}
      />
      {/* <ComboEditDialog
        combo={selectedCombo}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      /> */}{" "}
      */
      <ComboDetailDialog
        combo={selectedCombo}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="min-w-[250px]">Thông Tin Combo</TableHead>
            <TableHead className="text-center">Tổng Giá</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead className="text-center">Trạng Thái</TableHead>
            <TableHead className="text-center">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComboList;
