import { useState, useEffect } from "react";
import { movieTypeService } from "@/services/movieType.service";
import type { movieTypeType } from "@/types/movieType.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { movieTypePaginateConfig } from "@/config/paginate/movie_type.config";
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
  Film,
} from "lucide-react";
import { AlertDialogDestructive } from "@/components/ui/delete-dialog";
import { Combobox } from "@/components/ui/combobox";
import { MovieTypeCreateDialog } from "@/components/movieTypes/MovieTypeCreateDialig";
import { MovieTypeEditDialog } from "@/components/movieTypes/MovieTypeEditDialog";
import { MovieTypeDetailDialog } from "@/components/movieTypes/MovieTypeDetailDialog";

const MovieTypeList = () => {
  const [movieTypes, setMovieTypes] = useState<movieTypeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: movieTypePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  //form dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMovieType, setSelectedMovieType] =
    useState<movieTypeType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = movieTypePaginateConfig.defaultLimit,
    sortBy = movieTypePaginateConfig.defaultSortBy[0][0] +
      ":" +
      movieTypePaginateConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter = {},
  ) => {
    setLoading(true);
    try {
      const response = await movieTypeService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setMovieTypes(response.data as []);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách thể loại phim");
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
      movieTypePaginateConfig.defaultSortBy[0][0] +
      ":" +
      movieTypePaginateConfig.defaultSortBy[0][1];
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
      movieTypePaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined,
    );
  };

  const handleDelete = async (movieType: movieTypeType) => {
    try {
      const response = await movieTypeService.remove(movieType.id as string);
      if (response.success) {
        toast.success("Xóa thể loại phim thành công");
        handleSearch();
      } else {
        toast.error("Không thể xóa thể loại phim");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thể loại phim");
      console.error(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleCreateSubmit = async (data: movieTypeType) => {
    try {
      const response = await movieTypeService.create(data);
      if (response.success) {
        toast.success("Thêm thể loại phim thành công");
        handleSearch();
      } else {
        toast.error("Có lỗi xảy ra khi tạo thể loại phim");
        return;
      }
      toast.success("Thêm thể loại phim thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo thể loại phim");
      console.error(error);
    }
  };

  const handleEditSubmit = async (data: movieTypeType) => {
    try {
      const response = await movieTypeService.update(
        selectedMovieType?.id as string,
        data,
      );
      if (response.success) {
        toast.success("Cập nhật thể loại phim thành công");
        setEditDialogOpen(false);
        handleSearch();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật thể loại phim");
        return;
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thể loại phim");
      console.error(error);
    }
  };

  const handleEdit = (movieType: movieTypeType) => {
    setSelectedMovieType(movieType);
    setEditDialogOpen(true);
  };

  const handleView = (movieType: movieTypeType) => {
    setSelectedMovieType(movieType);
    setDetailDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Film className="h-6 w-6" />
                Quản Lý Thể Loại Phim
              </CardTitle>
              <CardDescription>
                Quản lý danh sách thể loại phim và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Thể Loại Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thể loại phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={movieTypePaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            ></Combobox>
            <Combobox
              datas={movieTypePaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={movieTypePaginateConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            />
            <Combobox
              datas={[
                { value: "ASC", label: "tăng dần" },
                { value: "DESC", label: "giảm dần" },
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
          ) : movieTypes.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy thể loại phim nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Thể Loại</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movieTypes.map((movieType, index) => (
                      <TableRow key={movieType.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{movieType.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(movieType.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          {movieType.is_active !== false ? (
                            <Badge variant="default" className="bg-green-500">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Ngừng</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(movieType)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(movieType)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialogDestructive
                              callback={handleDelete}
                              payload={movieType}
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
                  của {meta.totalItems} thể loại
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
      <MovieTypeCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <MovieTypeEditDialog
        movieType={selectedMovieType}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />

      <MovieTypeDetailDialog
        movieType={selectedMovieType}
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
            <TableHead>Thể Loại</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead>Trạng Thái</TableHead>
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
                <Skeleton className="h-6 w-32 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
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

export default MovieTypeList;
