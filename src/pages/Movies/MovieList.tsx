import { useState, useEffect } from "react";
import { movieService } from "@/services/movie.service";
import { movieTypeService } from "@/services/movieType.service";
import { toast } from "sonner";
import { MovieCreateDialog } from "@/components/movies/MovieCreateDialog";
import { MovieEditDialog } from "@/components/movies/MovieEditDialog";
import { MovieDetailDialog } from "@/components/movies/MovieDetailDialog";
import { MovieImportDialog } from "@/components/Dialog/MovieImportDialog";
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
  Film,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import type { MovieType } from "@/types/movie.type";
import type { MovieTypeType } from "@/types/movieType.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { moviePaginateConfig } from "@/config/paginate/movie.config";
import { AlertDialogDestructive } from "@/components/ui/delete-dialog";

const MovieList = () => {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [movieTypes, setMovieTypes] = useState<MovieTypeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [movieTypeColumn, setMovieTypeColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: moviePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieType | null>(null);

  const fetchMovieTypes = async () => {
    try {
      const response = await movieTypeService.findAll();
      setMovieTypes(response.data as MovieTypeType[]);
    } catch (error) {
      console.error("Error fetching movie types:", error);
    }
  };

  useEffect(() => {
    fetchMovieTypes();
  }, []);

  const findAndPaginate = async (
    page = 1,
    limit = moviePaginateConfig.defaultLimit,
    sortBy = moviePaginateConfig.defaultSortBy[0] +
      ":" +
      moviePaginateConfig.defaultSortBy[1],
    search = undefined,
    searchBy = undefined,
    filter = {},
  ) => {
    setLoading(true);
    try {
      const response = await movieService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setMovies(response.data as MovieType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách phim");
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
      moviePaginateConfig.defaultSortBy[0] +
      ":" +
      moviePaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (movieTypeColumn) {
      filter.movie_type_id = movieTypeColumn;
    }

    findAndPaginate(
      currentPage,
      moviePaginateConfig.defaultLimit,
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

  // Handle create movie
  const handleCreateSubmit = async (data: MovieType) => {
    try {
      const response = await movieService.create(data);
      if (response.success) {
        toast.success("Tạo phim mới thành công!");
        handleSearch(); // Refresh list
      } else {
        toast.error("Không thể tạo phim mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo phim");
      console.error(error);
    }
  };

  const handleEdit = (movie: MovieType) => {
    setSelectedMovie(movie);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: MovieType) => {
    if (!selectedMovie) return;

    try {
      const response = await movieService.update(
        selectedMovie.id as string,
        data,
      );
      if (response.success) {
        toast.success("Cập nhật phim thành công!");
        handleSearch(); // Refresh list
      } else {
        toast.error("Không thể cập nhật phim");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật phim");
      console.error(error);
    }
  };

  const handleDelete = async (movie: MovieType) => {
    try {
      const response = await movieService.delete(movie.id as string);
      if (response.success) {
        toast.success("Xóa phim thành công!");
        handleSearch(); // Refresh list
      } else {
        toast.error("Không thể xóa phim");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa phim");
      console.error(error);
    }
  };

  const handleView = (movie: MovieType) => {
    setSelectedMovie(movie);
    setDetailDialogOpen(true);
  };

  // Get movie type name by id
  const getMovieTypeName = (typeId: string) => {
    const type = movieTypes.find((t) => t.id === typeId);
    return type ? type.type : "Chưa xác định";
  };

  const handleImport = async (file: File) => {
    try {
      const response = await movieService.importFromExcel(file);
      if (response.success) {
        toast.success(
          `Import thành công! ${response.data.imported} phim đã được nhập, ${response.data.skipped} phim bị bỏ qua.`,
        );
        handleSearch(); // Refresh list
      } else {
        toast.error(response.message || "Không thể import file Excel");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi import file");
      console.error(error);
    }
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
                Quản Lý Phim
              </CardTitle>
              <CardDescription>
                Quản lý danh sách phim và thông tin chi tiết
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
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Phim Mới
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
                placeholder="Tìm kiếm theo tên phim, đạo diễn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={movieTypes.map((item) => ({
                value: item.id + "",
                label: item.type,
              }))}
              placeholder="Thể loại"
              onChange={setMovieTypeColumn}
              value={movieTypeColumn}
            ></Combobox>
            <Combobox
              datas={moviePaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            ></Combobox>
            <Combobox
              datas={moviePaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            ></Combobox>
            <Combobox
              datas={moviePaginateConfig.sortableColumns}
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
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy phim nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="w-[80px]">Poster</TableHead>
                      <TableHead className="min-w-[200px]">
                        Thông Tin Phim
                      </TableHead>
                      <TableHead>Đạo Diễn</TableHead>
                      <TableHead>Thể Loại</TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Phát Hành
                      </TableHead>
                      <TableHead>
                        <Clock className="h-4 w-4 inline mr-1" />
                        Thời Lượng
                      </TableHead>
                      <TableHead className="text-center">
                        <Star className="h-4 w-4 inline mr-1" />
                        Đánh Giá
                      </TableHead>
                      <TableHead className="text-center">Trailer</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.map((movie, index) => (
                      <TableRow key={movie.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          {movie.thumbnail || movie.image ? (
                            <img
                              src={movie.thumbnail || movie.image}
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                              <Film className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-semibold text-base mb-1">
                              {movie.title}
                            </div>
                            {movie.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {movie.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movie.director}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movie.country}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {getMovieTypeName(movie.movie_type_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatDate(movie.release_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatDuration(movie.duration)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {movie.rating && movie.rating > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">
                                {movie.rating.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground">/10</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Chưa có
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {movie.trailer ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(movie.trailer, "_blank")
                              }
                              className="h-8"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Không có
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {movie.is_active !== false ? (
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
                              onClick={() => handleView(movie)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(movie)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {movie.is_active === false ? (
                              <></>
                            ) : (
                              <AlertDialogDestructive
                                callback={handleDelete}
                                payload={movie}
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
                  của {meta.totalItems} phim
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
      <MovieCreateDialog
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
            <TableHead className="min-w-[200px]">Thông Tin Phim</TableHead>
            <TableHead>Đạo Diễn</TableHead>
            <TableHead>Quốc Gia</TableHead>
            <TableHead>Thể Loại</TableHead>
            <TableHead>Phát Hành</TableHead>
            <TableHead>Thời Lượng</TableHead>
            <TableHead className="text-center">Đánh Giá</TableHead>
            <TableHead className="text-center">Trailer</TableHead>
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
                <Skeleton className="h-8 w-20 mx-auto" />
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

export default MovieList;
