import { useState, useEffect } from "react";
import { slideService } from "@/services/slide.service";
import type { SlideType } from "@/types/slide.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { slidePaginateConfig } from "@/config/paginate/slide.config";
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
  ImageIcon,
  PlayCircle,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { SlideCreateDialog } from "@/components/slides/SlideCreateDialog";
import { SlideEditDialog } from "@/components/slides/SlideEditDialog";
import { SlideDetailDialog } from "@/components/slides/SlideDetailDialog";

const SlideList = () => {
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: slidePaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<SlideType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = slidePaginateConfig.defaultLimit,
    sortBy = slidePaginateConfig.defaultSortBy[0][0] +
      ":" +
      slidePaginateConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter: Record<string, any> | undefined = undefined
  ) => {
    setLoading(true);
    try {
      const response = await slideService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setSlides(response.data as SlideType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách slide banner");
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
      slidePaginateConfig.defaultSortBy[0][0] +
      ":" +
      slidePaginateConfig.defaultSortBy[0][1];
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
      slidePaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const response = await slideService.create(data);
      if (response.success) {
        toast.success("Thêm slide banner mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể thêm slide banner");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm slide banner");
      console.error(error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedSlide) return;
    try {
      const response = await slideService.update(
        selectedSlide.id as string,
        data
      );
      if (response.success) {
        toast.success("Cập nhật slide banner thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật slide banner");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật slide banner");
      console.error(error);
    }
  };

  const handleDelete = async (slide: SlideType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa slide "${slide.title}" không?`)) {
      return;
    }

    try {
      const response = await slideService.delete(slide.id as string);
      if (response.success) {
        toast.success("Xóa slide banner thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa slide banner");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa slide banner");
      console.error(error);
    }
  };

  const handleViewDetail = (slide: SlideType) => {
    setSelectedSlide(slide);
    setDetailDialogOpen(true);
  };

  const handleEdit = (slide: SlideType) => {
    setSelectedSlide(slide);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                Quản Lý Slide Banner
              </CardTitle>
              <CardDescription>
                Quản lý danh sách slide banner và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Slide Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm slide banner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={slidePaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={slidePaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={slidePaginateConfig.sortableColumns}
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
          ) : slides.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy slide banner nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Hình Ảnh</TableHead>
                      <TableHead>Tiêu Đề</TableHead>
                      <TableHead>Nội Dung</TableHead>
                      <TableHead>Trailer</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slides.map((slide, index) => (
                      <TableRow key={slide.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          {slide.image ? (
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold max-w-xs">
                          {truncateText(slide.title as string, 30)}
                        </TableCell>
                        <TableCell className="max-w-md text-muted-foreground">
                          {truncateText(slide.content as string, 50)}
                        </TableCell>
                        <TableCell>
                          {slide.trailer ? (
                            <a
                              href={slide.trailer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <PlayCircle className="h-4 w-4" />
                              <span className="text-sm">Xem</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(slide.created_at)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={slide.is_active ? "default" : "secondary"}
                          >
                            {slide.is_active ? "Hiển thị" : "Ẩn"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(slide)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(slide)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(slide)}
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
                  của {meta.totalItems} slide
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
      <SlideCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />
      <SlideEditDialog
        slide={selectedSlide}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
      />
      <SlideDetailDialog
        slide={selectedSlide}
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
            <TableHead>Hình Ảnh</TableHead>
            <TableHead>Tiêu Đề</TableHead>
            <TableHead>Nội Dung</TableHead>
            <TableHead>Trailer</TableHead>
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
                <Skeleton className="h-12 w-20 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
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

export default SlideList;
