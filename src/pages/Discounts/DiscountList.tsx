import { useState, useEffect } from "react";
import { discountService } from "@/services/discount.service";
import { eventService } from "@/services/event.service";
import type { DiscountType } from "@/types/discount.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { discountPaginateConfig } from "@/config/paginate/discount.config";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  Percent,
  Calendar,
} from "lucide-react";
import { AlertDialogDestructive } from "@/components/ui/delete-dialog";
import { Combobox } from "@/components/ui/combobox";
import DiscountCreateDialog from "@/components/discounts/DiscountCreateDialog";
import DiscountEditDialog from "@/components/discounts/DiscountEditDialog";
import DiscountDetailDialog from "@/components/discounts/DiscountDetailDialog";
import type { EventType } from "@/types/event.type";

const DiscountList = () => {
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [eventColumn, setEventColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: discountPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountType | null>(
    null,
  );

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data as EventType[]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const findAndPaginate = async (
    page = 1,
    limit = discountPaginateConfig.defaultLimit,
    sortBy = discountPaginateConfig.defaultSortBy[0] +
      ":" +
      discountPaginateConfig.defaultSortBy[1],
    search = undefined,
    searchBy = undefined,
    filter = {},
  ) => {
    setLoading(true);
    try {
      const response = await discountService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setDiscounts(response.data as DiscountType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách giảm giá");
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
      discountPaginateConfig.defaultSortBy[0] +
      ":" +
      discountPaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (eventColumn) {
      filter.event_id = eventColumn;
    }

    findAndPaginate(
      currentPage,
      discountPaginateConfig.defaultLimit,
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

  // Handle create discount
  const handleCreateSubmit = async (data: DiscountType) => {
    try {
      const response = await discountService.create(data);
      if (response.success) {
        toast.success("Tạo giảm giá mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể tạo giảm giá mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo giảm giá");
      console.error(error);
    }
  };

  const handleEdit = (discount: DiscountType) => {
    setSelectedDiscount(discount);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: DiscountType) => {
    if (!selectedDiscount) return;

    try {
      const response = await discountService.update(
        selectedDiscount.id as string,
        data,
      );
      if (response.success) {
        toast.success("Cập nhật giảm giá thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật giảm giá");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật giảm giá");
      console.error(error);
    }
  };

  const handleDelete = async (discount: DiscountType) => {
    try {
      const response = await discountService.delete(discount.id as string);
      if (response.success) {
        toast.success("Xóa giảm giá thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa giảm giá");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa giảm giá");
      console.error(error);
    }
  };

  const handleView = (discount: DiscountType) => {
    setSelectedDiscount(discount);
    setDetailDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Percent className="h-6 w-6" />
                Quản Lý Giảm Giá
              </CardTitle>
              <CardDescription>
                Quản lý các chương trình giảm giá và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Giảm Giá
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={events.map((item) => ({
                value: item.id + "",
                label: item.name,
              }))}
              placeholder="Sự kiện"
              onChange={setEventColumn}
              value={eventColumn}
            />
            <Combobox
              datas={discountPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={discountPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={discountPaginateConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            />
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
            />
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : discounts.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy giảm giá nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[200px]">Tên</TableHead>
                      <TableHead>Mô Tả</TableHead>
                      <TableHead className="text-center">
                        <Percent className="h-4 w-4 inline mr-1" />
                        Phần Trăm
                      </TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Từ Ngày
                      </TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Đến Ngày
                      </TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount, index) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{discount.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {discount.description || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="text-base">
                            {discount.discount_percent}%
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(discount.valid_from)}</TableCell>
                        <TableCell>{formatDate(discount.valid_to)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              discount.is_active ? "default" : "secondary"
                            }
                          >
                            {discount.is_active ? "Hoạt động" : "Vô hiệu"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(discount)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(discount)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialogDestructive
                              callback={handleDelete}
                              payload={discount}
                            />
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
                  của {meta.totalItems} giảm giá
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
      <DiscountCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <DiscountEditDialog
        discount={selectedDiscount}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <DiscountDetailDialog
        discount={selectedDiscount}
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
            <TableHead className="min-w-[200px]">Tên</TableHead>
            <TableHead>Mô Tả</TableHead>
            <TableHead className="text-center">Phần Trăm</TableHead>
            <TableHead>Từ Ngày</TableHead>
            <TableHead>Đến Ngày</TableHead>
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
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
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

export default DiscountList;
