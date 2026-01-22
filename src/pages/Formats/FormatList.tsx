import { useState, useEffect } from "react";
import { formatService } from "@/services/format.service";
import { toast } from "sonner";
import { FormatCreateDialog } from "@/components/formats/FormatCreateDialog";
import { FormatEditDialog } from "@/components/formats/FormatEditDialog";
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
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { FormatType, UpdateFormatType } from "@/types/format.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { formatPaginateConfig } from "@/config/paginate/format.config";

const FormatList = () => {
  const [formats, setFormats] = useState<FormatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: formatPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = formatPaginateConfig.defaultLimit,
    sortBy = formatPaginateConfig.defaultSortBy[0] +
      ":" +
      formatPaginateConfig.defaultSortBy[1],
    search?: string,
    searchBy?: string,
    filter: Record<string, unknown> = {},
  ) => {
    setLoading(true);
    try {
      const response = await formatService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setFormats(response.data as FormatType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách định dạng");
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
      formatPaginateConfig.defaultSortBy[0] +
      ":" +
      formatPaginateConfig.defaultSortBy[1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, unknown> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }

    findAndPaginate(
      currentPage,
      formatPaginateConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined,
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  const handleCreateSubmit = async (data: FormatType) => {
    try {
      const response = await formatService.create(data);
      if (response.success) {
        toast.success("Tạo định dạng mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể tạo định dạng mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo định dạng");
      console.error(error);
    }
  };

  const handleEdit = (format: FormatType) => {
    setSelectedFormat(format);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: UpdateFormatType) => {
    if (!selectedFormat) return;

    try {
      const response = await formatService.update(
        selectedFormat.id as string,
        data,
      );
      if (response.success) {
        toast.success("Cập nhật định dạng thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật định dạng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật định dạng");
      console.error(error);
    }
  };

  const handleDelete = async (format: FormatType) => {
    if (
      !confirm(`Bạn có chắc chắn muốn xóa định dạng "${format.name}" không?`)
    ) {
      return;
    }

    try {
      const response = await formatService.remove(format.id as string);
      if (response.success) {
        toast.success("Xóa định dạng thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa định dạng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa định dạng");
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Monitor className="h-6 w-6" />
                Quản Lý Định Dạng Phòng Chiếu
              </CardTitle>
              <CardDescription>
                Quản lý danh sách định dạng phòng chiếu (2D, 3D, IMAX...)
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Định Dạng
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên định dạng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={formatPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={formatPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={formatPaginateConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            />
            <Combobox
              datas={[
                { value: "ASC", label: "Tăng dần" },
                { value: "DESC", label: "Giảm dần" },
              ]}
              placeholder="Thứ tự"
              onChange={setOrderColumn}
              value={orderColumn}
            />
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : formats.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy định dạng nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Tên Định Dạng</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formats.map((format, index) => (
                      <TableRow key={format.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {format.name}
                        </TableCell>
                        <TableCell>{formatDate(format.created_at)}</TableCell>
                        <TableCell className="text-center">
                          {format.is_active !== false ? (
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
                              onClick={() => handleEdit(format)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {format.is_active !== false && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(format)}
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

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(meta.currentPage - 1) * meta.itemsPerPage + 1} -{" "}
                  {Math.min(
                    meta.currentPage * meta.itemsPerPage,
                    meta.totalItems,
                  )}{" "}
                  của {meta.totalItems} định dạng
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

      <FormatCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <FormatEditDialog
        format={selectedFormat}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
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
            <TableHead>Tên Định Dạng</TableHead>
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
                <Skeleton className="h-4 w-32" />
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FormatList;
