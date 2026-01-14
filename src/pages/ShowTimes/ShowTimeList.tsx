import { useState, useEffect } from "react";
import { movieService } from "@/services/movie.service";
import { roomService } from "@/services/room.service";
import { showTimeService } from "@/services/showTime.service";
import { toast } from "sonner";
// import { MovieCreateDialog } from "@/components/movies/MovieCreateDialog";
// import { MovieEditDialog } from "@/components/movies/MovieEditDialog";
// import { MovieDetailDialog } from "@/components/movies/MovieDetailDialog";
// import { MovieImportDialog } from "@/components/Dialog/MovieImportDialog";
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
  Film,
  Upload,
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
import { MovieImportDialog } from "@/components/Dialog/MovieImportDialog";

const ShowTimeList = () => {
  // const debounceRef = useRef(null);
  const [showTimes, setShowTimes] = useState<ShowTimeType[]>([]);
  const [movies, setMovies] = useState<movieType[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [roomColumn, setRoomColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("movies.title");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: showTimePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  //   const [createDialogOpen, setCreateDialogOpen] = useState(false);
  //   const [editDialogOpen, setEditDialogOpen] = useState(false);
  //   const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  //   const [selectedMovie, setSelectedMovie] = useState<movieType | null>(null);

  const fetchRooms = async () => {
    try {
      const rooms = await roomService.getAll();
      setRooms(rooms.data as RoomType[]);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchMovies = async (times: ShowTimeType[]) => {
    try {
      if (times.length === 0) return;
      const movies = await Promise.all(
        times.map((showTime) =>
          movieService
            .getById(String(showTime.movie_id))
            .then((res) => {
              return res.data[0] as movieType;
            })
            .catch(() => null)
        )
      );
      setMovies(movies as movieType[]);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const findAndPaginate = async (
    page = 1,
    limit = showTimePaginateConfig.defaultLimit,
    sortBy = `${showTimePaginateConfig.defaultSortBy[0][0]}:${showTimePaginateConfig.defaultSortBy[0][1]}`,
    search = undefined,
    searchBy = undefined,
    filter = {}
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
        await fetchMovies(data);
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

  // useEffect(() => {
  //   const fetchMovieIds = async (): Promise<void> => {
  //     const movieIds = await getMovieId(searchQuery);

  //     if (movieIds && movieIds.length > 0) {
  //       const ids = movieIds.map((movie) => movie.id as string);
  //       setFilterName(ids);
  //     } else {
  //       setFilterName([]);
  //     }
  //   };

  //   fetchMovieIds();
  // }, [searchQuery]);

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
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (roomColumn) {
      filter.room_id = roomColumn;
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
  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  // Handle create movie
  //   const handleCreateSubmit = async (data: movieType) => {
  //     try {
  //       const response = await movieService.create(data);
  //       if (response.success) {
  //         toast.success("Tạo phim mới thành công!");
  //         handleSearch(); // Refresh list
  //       } else {
  //         toast.error("Không thể tạo phim mới");
  //       }
  //     } catch (error) {
  //       toast.error("Có lỗi xảy ra khi tạo phim");
  //       console.error(error);
  //     }
  //   };

  //   const handleEdit = (movie: movieType) => {
  //     setSelectedMovie(movie);
  //     setEditDialogOpen(true);
  //   };

  //   const handleEditSubmit = async (data: movieType) => {
  //     if (!selectedMovie) return;

  //     try {
  //       const response = await movieService.update(
  //         selectedMovie.id as string,
  //         data
  //       );
  //       if (response.success) {
  //         toast.success("Cập nhật phim thành công!");
  //         handleSearch(); // Refresh list
  //       } else {
  //         toast.error("Không thể cập nhật phim");
  //       }
  //     } catch (error) {
  //       toast.error("Có lỗi xảy ra khi cập nhật phim");
  //       console.error(error);
  //     }
  //   };

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

  //   const handleView = (movie: movieType) => {
  //     setSelectedMovie(movie);
  //     setDetailDialogOpen(true);
  //   };

  // const getMovieId = async (movieName: string) => {
  //   const movie = await movieService.getByName(movieName);
  //   if (
  //     movie &&
  //     movie.data &&
  //     Array.isArray(movie.data) &&
  //     movie.data.length > 0
  //   ) {
  //     return movie.data;
  //   }
  // };

  const handleImport = async (file: File) => {
    console.log("Importing file:", file);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
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
              <MovieImportDialog
                onSubmit={handleImport}
                trigger={
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                }
              />
              <Button
                onClick={() => {
                  // setCreateDialogOpen(true);
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
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên phim"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
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
              datas={showTimePaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
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
                      <TableHead>Giờ Bắt Đầu</TableHead>
                      <TableHead>Giờ Kết Thúc</TableHead>
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
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {showTime.start_time || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {showTime.end_time || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {showTime.day_type || "N/A"}
                          </Badge>
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
                                //handleView(showTime);
                              }}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                //handleEdit(showTime);
                              }}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
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

      {/* Dialogs */}
      {/* <MovieCreateDialog
        movieTypes={movieTypes}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <MovieEditDialog
        movie={selectedMovie}
        movieTypes={movieTypes}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <MovieDetailDialog
        movie={selectedMovie}
        movieTypes={movieTypes}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      /> */}
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
            <TableHead>Giờ Bắt Đầu</TableHead>
            <TableHead>Giờ Kết Thúc</TableHead>
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
