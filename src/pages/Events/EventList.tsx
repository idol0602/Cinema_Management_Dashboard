import { useState, useEffect } from "react";
import { eventService } from "@/services/event.service";
import { eventTypeService } from "@/services/eventType.service";
import type { EventType } from "@/types/event.type";
import type { EventTypeType } from "@/types/eventType.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { eventPaginateConfig } from "@/config/paginate/event.config";
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
  Trash2,
  Eye,
  PartyPopper,
  Calendar,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import EventCreateDialog from "@/components/events/EventCreateDialog";
import EventEditDialog from "@/components/events/EventEditDialog";
import EventDetailDialog from "@/components/events/EventDetailDialog";

const EventList = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [onlyAtCounterFilter, setOnlyAtCounterFilter] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: eventPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const findAndPaginate = async (
    page: number = 1,
    limit: number = eventPaginateConfig.defaultLimit,
    sortBy: string = eventPaginateConfig.defaultSortBy[0] +
      ":" +
      eventPaginateConfig.defaultSortBy[1],
    search: string | undefined = undefined,
    searchBy: string | undefined = undefined,
    filter: Record<string, any> = {}
  ) => {
    setLoading(true);
    try {
      const response = await eventService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setEvents(response.data as EventType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách sự kiện");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch event types on mount
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
    handleSearch();
  }, [currentPage]);

  const handleSearch = () => {
    let sortBy =
      eventPaginateConfig.defaultSortBy[0] +
      ":" +
      eventPaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (eventTypeFilter) {
      filter.event_type_id = eventTypeFilter;
    }
    if (onlyAtCounterFilter) {
      filter.only_at_counter = onlyAtCounterFilter === "true";
    }

    findAndPaginate(
      currentPage,
      eventPaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined
    );
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  // Handle create event
  const handleCreateSubmit = async (data: EventType) => {
    try {
      const response = await eventService.create(data);
      if (response.success) {
        toast.success("Tạo sự kiện mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể tạo sự kiện mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo sự kiện");
      console.error(error);
    }
  };

  const handleEdit = (event: EventType) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: EventType) => {
    if (!selectedEvent) return;

    try {
      const response = await eventService.update(
        selectedEvent.id as string,
        data
      );
      if (response.success) {
        toast.success("Cập nhật sự kiện thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật sự kiện");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật sự kiện");
      console.error(error);
    }
  };

  const handleDelete = async (event: EventType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.name}" không?`)) {
      return;
    }

    try {
      const response = await eventService.delete(event.id as string);
      if (response.success) {
        toast.success("Xóa sự kiện thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa sự kiện");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sự kiện");
      console.error(error);
    }
  };

  const handleView = (event: EventType) => {
    setSelectedEvent(event);
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
                <PartyPopper className="h-6 w-6" />
                Quản Lý Sự Kiện
              </CardTitle>
              <CardDescription>
                Quản lý các sự kiện và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Sự Kiện
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
              datas={eventPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={eventTypes.map((et) => ({
                value: et.id || "",
                label: et.name,
              }))}
              placeholder="Loại sự kiện"
              onChange={setEventTypeFilter}
              value={eventTypeFilter}
            />
            <Combobox
              datas={eventPaginateConfig.filterableColumns.only_at_counter}
              placeholder="Kênh bán"
              onChange={setOnlyAtCounterFilter}
              value={onlyAtCounterFilter}
            />
            <Combobox
              datas={eventPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={eventPaginateConfig.sortableColumns}
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
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <PartyPopper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy sự kiện nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="w-[80px]">Hình Ảnh</TableHead>
                      <TableHead className="min-w-[180px]">Tên</TableHead>
                      <TableHead>Loại SK</TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Từ Ngày
                      </TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Đến Ngày
                      </TableHead>
                      <TableHead className="text-center">Kênh Bán</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Ngày Tạo
                      </TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <PartyPopper className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{event.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {eventTypes.find(
                              (et) => et.id === event.event_type_id
                            )?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(event.start_date)}</TableCell>
                        <TableCell>{formatDate(event.end_date)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              event.only_at_counter ? "secondary" : "outline"
                            }
                          >
                            {event.only_at_counter ? "Quầy" : "Online & Quầy"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={event.is_active ? "default" : "secondary"}
                          >
                            {event.is_active ? "Hoạt động" : "Vô hiệu"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(event.created_at)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(event)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
                    meta.totalItems
                  )}{" "}
                  của {meta.totalItems} sự kiện
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
                          Math.abs(page - currentPage) <= 1
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
                        Math.min(meta.totalPages, prev + 1)
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
      <EventCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <EventEditDialog
        event={selectedEvent}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <EventDetailDialog
        event={selectedEvent}
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
            <TableHead className="w-[80px]">Hình Ảnh</TableHead>
            <TableHead className="min-w-[180px]">Tên</TableHead>
            <TableHead>Loại SK</TableHead>
            <TableHead>Từ Ngày</TableHead>
            <TableHead>Đến Ngày</TableHead>
            <TableHead className="text-center">Kênh Bán</TableHead>
            <TableHead className="text-center">Trạng Thái</TableHead>
            <TableHead>Ngày Tạo</TableHead>
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
                <Skeleton className="h-12 w-12 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
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

export default EventList;
