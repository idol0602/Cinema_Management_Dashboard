import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roomService } from "@/services/room.service";
import type { RoomType } from "@/types/room.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { roomPaginateConfig } from "@/config/paginate/room.config";
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
  DoorOpen,
  Armchair,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { RoomCreateDialog } from "@/components/rooms/RoomCreateDialog";
import { RoomEditDialog } from "@/components/rooms/RoomEditDialog";
import { RoomDetailDialog } from "@/components/rooms/RoomDetailDialog";

const RoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formatColumn, setFormatColumn] = useState("");
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: roomPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  const findAndPaginate = async (
    page = 1,
    limit = roomPaginateConfig.defaultLimit,
    sortBy = roomPaginateConfig.defaultSortBy[0][0] +
      ":" +
      roomPaginateConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter: Record<string, any> | undefined = undefined
  ) => {
    setLoading(true);
    try {
      const response = await roomService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setRooms(response.data as RoomType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách phòng chiếu");
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
      roomPaginateConfig.defaultSortBy[0][0] +
      ":" +
      roomPaginateConfig.defaultSortBy[0][1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (formatColumn) {
      filter.format = formatColumn;
    }

    findAndPaginate(
      currentPage,
      roomPaginateConfig.defaultLimit,
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
      const response = await roomService.create(data);
      if (response.success) {
        toast.success("Thêm phòng chiếu mới thành công!");
        handleSearch();
      } else {
        toast.error("Không thể thêm phòng chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm phòng chiếu");
      console.error(error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedRoom) return;
    try {
      const response = await roomService.update(
        selectedRoom.id as string,
        data
      );
      if (response.success) {
        toast.success("Cập nhật phòng chiếu thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật phòng chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật phòng chiếu");
      console.error(error);
    }
  };

  const handleDelete = async (room: RoomType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phòng "${room.name}" không?`)) {
      return;
    }

    try {
      const response = await roomService.delete(room.id as string);
      if (response.success) {
        toast.success("Xóa phòng chiếu thành công!");
        handleSearch();
      } else {
        toast.error("Không thể xóa phòng chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa phòng chiếu");
      console.error(error);
    }
  };

  const handleViewDetail = (room: RoomType) => {
    setSelectedRoom(room);
    setDetailDialogOpen(true);
  };

  const handleEdit = (room: RoomType) => {
    setSelectedRoom(room);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getFormatBadge = (format: string) => {
    const variants: Record<string, any> = {
      "2D": "default",
      "3D": "secondary",
      IMAX: "destructive",
    };
    return <Badge variant={variants[format] || "default"}>{format}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <DoorOpen className="h-6 w-6" />
                Quản Lý Phòng Chiếu
              </CardTitle>
              <CardDescription>
                Quản lý danh sách phòng chiếu và thông tin chi tiết
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Phòng Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phòng chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={roomPaginateConfig.filterableColumns.format}
              placeholder="Định dạng"
              onChange={setFormatColumn}
              value={formatColumn}
            />
            <Combobox
              datas={roomPaginateConfig.filterableColumns.is_active}
              placeholder="Trạng thái"
              onChange={setStatusColumn}
              value={statusColumn}
            />
            <Combobox
              datas={roomPaginateConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            />
            <Combobox
              datas={roomPaginateConfig.sortableColumns}
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
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy phòng chiếu nào
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Tên Phòng</TableHead>
                      <TableHead>Định Dạng</TableHead>
                      <TableHead>Vị Trí</TableHead>
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room, index) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {room.name}
                        </TableCell>
                        <TableCell>{getFormatBadge(room.format)}</TableCell>
                        <TableCell>{room.location || "N/A"}</TableCell>
                        <TableCell>{formatDate(room.created_at)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={room.is_active ? "default" : "secondary"}
                          >
                            {room.is_active ? "Hoạt động" : "Ngưng"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(room)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/rooms/${room.id}/seats`)
                              }
                              title="Sơ đồ chỗ ngồi"
                            >
                              <Armchair className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(room)}
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(room)}
                              title="Xóa"
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
                  của {meta.totalItems} phòng
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
      <RoomCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />
      <RoomEditDialog
        room={selectedRoom}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
      />
      <RoomDetailDialog
        room={selectedRoom}
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
            <TableHead>Tên Phòng</TableHead>
            <TableHead>Định Dạng</TableHead>
            <TableHead>Vị Trí</TableHead>
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
                <Skeleton className="h-6 w-16 rounded-full" />
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

export default RoomList;
