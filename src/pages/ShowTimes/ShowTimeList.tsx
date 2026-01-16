import { useState, useEffect } from "react";
import { movieService } from "@/services/movie.service";
import { roomService } from "@/services/room.service";
import { showTimeService } from "@/services/showTime.service";
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
  Plus,
  Search,
  Trash2,
  Film,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import type { ShowTimeType } from "@/types/showTime.type";
import type { RoomType } from "@/types/room.type";
import type { movieType } from "@/types/movie.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { showTimePaginateConfig } from "@/config/paginate/show_time.config";
import { ShowTimeCreateDialog } from "@/components/showTimes/ShowTimeCreateDialog";
import { ShowTimeDetailDialog } from "@/components/showTimes/ShowTimeDetailDialog";

const ShowTimeList = () => {
  const [showTimes, setShowTimes] = useState<ShowTimeType[]>([]);
  const [movieCreate, setMovieCreate] = useState<movieType[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [roomColumn, setRoomColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("movies.title");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: showTimePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedShowTime, setSelectedShowTime] = useState<ShowTimeType | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const rooms = await roomService.getAll();
      setRooms(rooms.data as RoomType[]);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchMovieCreate = async () => {
    try {
      const movies = await movieService.getAll();
      setMovieCreate(movies.data as movieType[]);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchMovieCreate();
  }, []);

  const findAndPaginate = async (
    page = 1,
    limit = showTimePaginateConfig.defaultLimit,
    sortBy = `${showTimePaginateConfig.defaultSortBy[0][0]}:${showTimePaginateConfig.defaultSortBy[0][1]}`,
    search = undefined,
    searchBy = undefined,
    filter = {
      is_active: true,
    }
  ) => {
    setLoading(true);
    try {
      const response = await showTimeService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        const data = response.data as ShowTimeType[];
        setShowTimes(data);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách suất chiếu");
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
      showTimePaginateConfig.defaultSortBy[0][0] +
      ":" +
      showTimePaginateConfig.defaultSortBy[0][1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    filter.is_active = true;
    if (roomColumn) {
      filter.room_id = roomColumn;
    }

    // Add date range filters
    if (startDate) {
      filter.start_time = filter.start_time || {};
      filter.start_time.$gte = `${startDate}T00:00:00Z`;
    }
    if (endDate) {
      filter.end_time = filter.end_time || {};
      filter.end_time.$lte = `${endDate}T23:59:00Z`;
    }

    findAndPaginate(
      currentPage,
      showTimePaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined
    );
  };

  const handleReresh = () => {
    handleSearch();
  };
  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  const handleDelete = async (showTime: ShowTimeType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lịch chiếu này không?`)) {
      return;
    }

    try {
      const response = await showTimeService.delete(showTime.id as string);
      if (response.success) {
        toast.success("Xóa lịch chiếu thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa lịch chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa lịch chiếu");
      console.error(error);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Parse ISO datetime to date and time
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

  // Get badge color based on day type
  const getDayTypeBadge = (dayType?: string) => {
    if (!dayType) return <Badge variant="outline">N/A</Badge>;

    if (dayType.toLowerCase() === "weekend") {
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          {dayType}
        </Badge>
      );
    } else if (dayType.toLowerCase() === "weekday") {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          {dayType}
        </Badge>
      );
    }
    return <Badge variant="outline">{dayType}</Badge>;
  };

  // Format duration (minutes to hours:minutes)
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Film className="h-6 w-6" />
                Quản Lý Suất Chiếu
              </CardTitle>
              <CardDescription>
                Quản lý danh sách suất chiếu và thông tin chi tiết
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm suất chiếu Mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative flex-1 mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên phim"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <Combobox
              datas={rooms.map((item) => ({
                value: item.id + "",
                label: item.name,
              }))}
              placeholder="Phòng"
              onChange={setRoomColumn}
              value={roomColumn}
            ></Combobox>
            <Combobox
              datas={showTimePaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={showTimePaginateConfig.sortableColumns}
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
            <div className="relative">
              <Input
                type="date"
                placeholder="Ngày bắt đầu"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Ngày bắt đầu"
                className="cursor-pointer bg-white text-black dark:bg-white dark:text-black"
              />
            </div>
            <div className="relative">
              <Input
                type="date"
                placeholder="Ngày kết thúc"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Ngày kết thúc"
                className="cursor-pointer bg-white text-black dark:bg-white dark:text-black"
              />
            </div>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : showTimes.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm lịch chiếu nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="w-[80px]">Poster</TableHead>
                      <TableHead className="min-w-[250px]">Tên Phim</TableHead>
                      <TableHead className="min-w-[200px]">Tên Phòng</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Giờ Bắt Đầu</TableHead>
                      <TableHead>Loại Ngày</TableHead>
                      <TableHead>Phát Hành</TableHead>
                      <TableHead>Thời Lượng</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {showTimes.map((showTime, index) => (
                      <TableRow key={showTime.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <img
                            src={showTime.movies.thumbnail || ""}
                            alt={showTime.movies.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-semibold text-base mb-1">
                              {showTime.movies.title || "N/A"}
                            </div>
                            {showTime.movies.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {showTime.movies.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {showTime.rooms.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {parseDateTime(showTime.start_time).date}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {parseDateTime(showTime.start_time).time}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getDayTypeBadge(showTime.day_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(showTime.movies.release_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatDuration(showTime.movies.duration)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {showTime.is_active !== false ? (
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
                              onClick={() => {
                                setSelectedShowTime(showTime);
                                setDetailDialogOpen(true);
                              }}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {showTime.is_active === false ? (
                              <></>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleDelete(showTime);
                                }}
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
                    meta.totalItems
                  )}{" "}
                  của {meta.totalItems} suất chiếu
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

      {/* Show Time Detail Dialog */}
      <ShowTimeDetailDialog
        showTime={selectedShowTime}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Create Show Time Dialog */}
      <ShowTimeCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        movies={movieCreate}
        rooms={rooms}
        onSubmit={() => {
          handleSearch();
        }}
        onRefresh={() => {
          handleReresh();
        }}
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
            <TableHead className="w-[80px]">Poster</TableHead>
            <TableHead className="min-w-[250px]">Tên Phim</TableHead>
            <TableHead className="min-w-[200px]">Tên Phòng</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Giờ Bắt Đầu</TableHead>
            <TableHead>Loại Ngày</TableHead>
            <TableHead>Phát Hành</TableHead>
            <TableHead>Thời Lượng</TableHead>
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
                <Skeleton className="h-16 w-12 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
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

export default ShowTimeList;
