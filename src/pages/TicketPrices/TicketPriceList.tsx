import { useState, useEffect } from "react";
import { ticketPriceService } from "@/services/ticketPrice.service";
import { formatService } from "@/services/format.service";
import { seatTypeService } from "@/services/seatType.service";
import { TicketPriceCreateDialog } from "@/components/ticketPrices/TicketPriceCreateDialog";
import { TicketPriceEditDialog } from "@/components/ticketPrices/TicketPriceEditDialog";
import { TicketPriceDetailDialog } from "@/components/ticketPrices/TicketPriceDetailDialog";
import { toast } from "sonner";
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
  Edit,
  Search,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
} from "lucide-react";
import { AlertDialogDestructive } from "@/components/ui/delete-dialog";
import type { TicketPriceType } from "@/types/ticketPrice.type";
import type { PaginationMeta } from "@/types/pagination.type";
import type { FormatType } from "@/types/format.type";
import type { SeatTypeDetailType } from "@/types/seatTypeDetail.type";
import { ticketPricePaginateConfig } from "@/config/paginate/ticket_price.config";

const TicketPriceList = () => {
  const [ticketPrices, setTicketPrices] = useState<TicketPriceType[]>([]);
  const [formats, setFormats] = useState<FormatType[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatTypeDetailType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [dayTypeColumn, setDayTypeColumn] = useState("");
  const [seatTypeIdColumn, setSeatTypeIdColumn] = useState("");
  const [formatIdColumn, setFormatIdColumn] = useState("");
  const [selectedTicketPrice, setSelectedTicketPrice] =
    useState<TicketPriceType | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: ticketPricePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const fetchFormats = async () => {
    try {
      const response = await formatService.findAll();
      if (response.success) {
        setFormats(response.data as FormatType[]);
      }
    } catch (error) {
      console.error("Error fetching formats:", error);
    }
  };

  const fetchSeatTypes = async () => {
    try {
      const response = await seatTypeService.findAll();
      if (response.success) {
        setSeatTypes(response.data as SeatTypeDetailType[]);
      }
    } catch (error) {
      console.error("Error fetching seat types:", error);
    }
  };

  useEffect(() => {
    fetchFormats();
    fetchSeatTypes();
  }, []);

  const findAndPaginate = async (
    page = 1,
    limit = ticketPricePaginateConfig.defaultLimit,
    sortBy = ticketPricePaginateConfig.defaultSortBy[0] +
      ":" +
      ticketPricePaginateConfig.defaultSortBy[1],
    search = undefined,
    searchBy = undefined,
    filter = {},
  ) => {
    setLoading(true);
    try {
      const response = await ticketPriceService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setTicketPrices(response.data as TicketPriceType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách giá vé");
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
      ticketPricePaginateConfig.defaultSortBy[0] +
      ":" +
      ticketPricePaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (dayTypeColumn) {
      filter.day_type = dayTypeColumn;
    }
    if (seatTypeIdColumn) {
      filter.seat_type_id = seatTypeIdColumn;
    }
    if (formatIdColumn) {
      filter.format_id = formatIdColumn;
    }

    findAndPaginate(
      currentPage,
      ticketPricePaginateConfig.defaultLimit,
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

  const handleDelete = async (ticketPrice: TicketPriceType) => {
    try {
      const response = await ticketPriceService.delete(
        ticketPrice.id as string,
      );
      if (response.success) {
        toast.success("Xóa giá vé thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa giá vé");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa giá vé");
      console.error(error);
    }
  };

  const handleCreateSubmit = async (data: TicketPriceType) => {
    try {
      const response = await ticketPriceService.create(data);
      if (response.success) {
        toast.success("Tạo giá vé mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể tạo giá vé mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo giá vé");
      console.error(error);
    }
  };

  const handleEdit = (ticketPrice: TicketPriceType) => {
    setSelectedTicketPrice(ticketPrice);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: TicketPriceType) => {
    if (!selectedTicketPrice) return;

    try {
      const response = await ticketPriceService.update(
        selectedTicketPrice.id as string,
        data,
      );
      if (response.success) {
        toast.success("Cập nhật giá vé thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật giá vé");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật giá vé");
      console.error(error);
    }
  };

  const handleView = (ticketPrice: TicketPriceType) => {
    setSelectedTicketPrice(ticketPrice);
    setDetailDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getFormatName = (formatId: string) => {
    const format = formats.find((f) => f.id === formatId);
    return format ? format.name : formatId;
  };

  const getSeatTypeName = (seatTypeId: string) => {
    const seatType = seatTypes.find((s) => s.id === seatTypeId);
    return seatType ? seatType.name : seatTypeId;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Quản Lý Giá Vé
              </CardTitle>
              <CardDescription>Quản lý giá vé theo loại phim</CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Giá Vé Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo loại ngày..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={ticketPricePaginateConfig.filterableColumns.day_type}
              placeholder="Loại ngày"
              onChange={setDayTypeColumn}
              value={dayTypeColumn}
            />
            <Combobox
              datas={seatTypes.map((st) => ({
                value: st.id,
                label: st.name,
              }))}
              placeholder="Loại ghế"
              onChange={setSeatTypeIdColumn}
              value={seatTypeIdColumn}
            />
            <Combobox
              datas={formats.map((f) => ({
                value: f.id,
                label: f.name,
              }))}
              placeholder="Định dạng"
              onChange={setFormatIdColumn}
              value={formatIdColumn}
            />
            <Combobox
              datas={ticketPricePaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={ticketPricePaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={ticketPricePaginateConfig.sortableColumns}
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
          ) : ticketPrices.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy giá vé nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Định Dạng</TableHead>
                      <TableHead>Loại Ghế</TableHead>
                      <TableHead>Loại Ngày</TableHead>
                      <TableHead className="text-right">Giá Vé</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketPrices.map((tp, index) => (
                      <TableRow key={tp.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            {getFormatName(tp.format_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">
                            {getSeatTypeName(tp.seat_type_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {tp.day_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(tp.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tp.is_active !== false ? (
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
                              title="Xem chi tiết"
                              onClick={() => handleView(tp)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cập nhật giá"
                              onClick={() => handleEdit(tp)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {tp.is_active === false ? (
                              <></>
                            ) : (
                              <AlertDialogDestructive
                                callback={handleDelete}
                                payload={tp}
                              />
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
                  của {meta.totalItems} giá vé
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
      <TicketPriceCreateDialog
        formats={formats}
        seatTypes={seatTypes}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <TicketPriceEditDialog
        ticketPrice={selectedTicketPrice || undefined}
        formats={formats}
        seatTypes={seatTypes}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <TicketPriceDetailDialog
        ticketPrice={selectedTicketPrice || undefined}
        formats={formats}
        seatTypes={seatTypes}
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
            <TableHead>Định Dạng</TableHead>
            <TableHead>Loại Ghế</TableHead>
            <TableHead>Loại Ngày</TableHead>
            <TableHead className="text-right">Giá Vé</TableHead>
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
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
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

export default TicketPriceList;
