import { useState, useEffect } from "react";
import { movieService } from "@/services/movie.service";
import { movieTypeService } from "@/services/movieType.service";
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
  ExternalLink,
  Calendar,
  Clock,
  Star,
} from "lucide-react";
import type { movieType } from "@/types/movie.type";
import type { movieTypeType } from "@/types/movieType.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { moviePaginateConfig } from "@/config/paginate/movie.config";

const MovieList = () => {
  const [movies, setMovies] = useState<movieType[]>([]);
  const [movieTypes, setMovieTypes] = useState<movieTypeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: 10,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });
  // Fetch movie types
  const fetchMovieTypes = async () => {
    try {
      const response = await movieTypeService.getAll();
      setMovieTypes(response.data as movieTypeType[]);
    } catch (error) {
      console.error("Error fetching movie types:", error);
    }
  };

  const findAndPaginate = async (
    page = 1,
    limit = 10,
    sortBy = "release_date:DESC",
    search = undefined,
    searchBy = undefined,
    filter = { is_active: true }
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
        setMovies(response.data as movieType[]);
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
    fetchMovieTypes();
    findAndPaginate(currentPage);
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    findAndPaginate(1, 10, null, searchQuery, null, null);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Placeholder functions cho CRUD (sẽ implement sau)
  const handleCreate = () => {
    toast.info("Chức năng tạo mới phim đang được phát triển");
  };

  const handleEdit = (movie: movieType) => {
    toast.info(`Chỉnh sửa phim: ${movie.title}`);
  };

  const handleDelete = (movie: movieType) => {
    toast.info(`Xóa phim: ${movie.title}`);
  };

  const handleView = (movie: movieType) => {
    toast.info(`Xem chi tiết phim: ${movie.title}`);
  };

  // Get movie type name by id
  const getMovieTypeName = (typeId: string) => {
    const type = movieTypes.find((t) => t.id === typeId);
    return type ? type.type : "Chưa xác định";
  };

  const handleImport = () => {
    toast.info("Chức năng import Excel đang được phát triển");
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
              <Button onClick={handleImport} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button onClick={handleCreate}>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(movie)}
                              title="Xóa"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

// Skeleton Loading Component
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
