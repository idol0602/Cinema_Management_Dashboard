import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { seatService } from "@/services/seat.service";
import { roomService } from "@/services/room.service";
import { seatTypeService } from "@/services/seatType.service";
import { SeatCreateDialog } from "@/components/seats/SeatCreateDialog";
import { SeatEditDialog } from "@/components/seats/SeatEditDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Armchair,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SeatType } from "@/types/seat.type";
import type { SeatTypeType } from "@/types/seatType.type";
import type { RoomType } from "@/types/room.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { seatPaginateConfig } from "@/config/paginate/seat.config";
import { MovieImportDialog } from "@/components/Dialog/MovieImportDialog";

// Color palette for seat types
const SEAT_TYPE_COLORS = [
  {
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-800",
    hover: "hover:bg-blue-200",
  },
  {
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    text: "text-yellow-800",
    hover: "hover:bg-yellow-200",
  },
  {
    bg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-800",
    hover: "hover:bg-red-200",
  },
  {
    bg: "bg-green-100",
    border: "border-green-400",
    text: "text-green-800",
    hover: "hover:bg-green-200",
  },
  {
    bg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-800",
    hover: "hover:bg-purple-200",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-800",
    hover: "hover:bg-pink-200",
  },
  {
    bg: "bg-indigo-100",
    border: "border-indigo-400",
    text: "text-indigo-800",
    hover: "hover:bg-indigo-200",
  },
  {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-800",
    hover: "hover:bg-amber-200",
  },
  {
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-800",
    hover: "hover:bg-cyan-200",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-800",
    hover: "hover:bg-orange-200",
  },
];

// Get color for seat type based on index
const getSeatTypeColorByIndex = (index: number) => {
  return SEAT_TYPE_COLORS[index % SEAT_TYPE_COLORS.length];
};

const TableSkeleton = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Số Ghế</TableHead>
            <TableHead>Loại Ghế</TableHead>
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
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
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

const SeatList = () => {
  const navigate = useNavigate();
  const { id: roomId } = useParams<{ id: string }>();
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [fullSeats, setFullSeats] = useState<SeatType[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatTypeType[]>([]);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [typeColumn, setTypeColumn] = useState("");
  const [statusColumn, setStatusColumn] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: seatPaginateConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Load seat types on component mount
  useEffect(() => {
    const loadSeatTypes = async () => {
      try {
        const response = await seatTypeService.findAll();
        if (response.success && Array.isArray(response.data)) {
          setSeatTypes(response.data as SeatTypeType[]);
        }
      } catch (error) {
        console.error("Error loading seat types:", error);
      }
    };
    loadSeatTypes();
  }, []);

  const fetchRoom = async () => {
    if (!roomId) return;
    try {
      const response = await roomService.getById(roomId);
      const seats = await seatService.getSeatByRoomId(roomId);
      if (seats.success) {
        setFullSeats(seats.data as SeatType[]);
      }
      if (response.success) {
        setRoom(response.data as RoomType);
      }
    } catch (error) {
      console.error("Error fetching room:", error);
    }
  };

  useEffect(() => {
    fetchRoom();
    if (roomId) {
      fetchDiagramSeats();
      handleSearch();
    }
  }, [roomId]);

  const fetchDiagramSeats = async () => {
    if (!roomId) return;
    try {
      const response = await seatService.getSeatByRoomId(roomId);
      if (response.success) {
        setSeats(response.data as SeatType[]);
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  };

  const findAndPaginate = async (
    page = 1,
    limit = seatPaginateConfig.defaultLimit,
    sortBy = seatPaginateConfig.defaultSortBy[0][0] +
      ":" +
      seatPaginateConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter = { room_id: roomId },
  ) => {
    setLoading(true);
    try {
      const response = await seatService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setSeats(response.data as SeatType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách ghế");
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
      seatPaginateConfig.defaultSortBy[0][0] +
      ":" +
      seatPaginateConfig.defaultSortBy[0][1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (statusColumn) {
      filter.is_active = statusColumn === "true";
    }
    if (typeColumn) {
      filter.type = typeColumn;
    }
    if (roomId) {
      filter.room_id = roomId;
    }

    findAndPaginate(
      currentPage,
      seatPaginateConfig.defaultLimit,
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

  const handleImport = async (file: File, roomId: string) => {
    try {
      const response = await seatService.importFromExcel(file, roomId);
      if (response.success) {
        toast.success(
          `Import thành công! ${response.data.imported} ghế đã được nhập, ${response.data.skipped} ghế bị bỏ qua.`,
        );
        handleSearch();
      } else {
        toast.error(response.message || "Không thể import file Excel");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi import file");
      console.error(error);
    }
  };

  const handleCreateSubmit = async (data: any) => {
    try {
      const response = await seatService.create({
        ...data,
        room_id: roomId,
      });
      if (response.success) {
        toast.success("Thêm ghế thành công!");
        handleSearch();
      } else {
        toast.error("Không thể thêm ghế");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    }
  };

  const handleEditSubmit = async (data: any) => {
    try {
      const response = await seatService.update(data.id, data);
      if (response.success) {
        toast.success("Cập nhật ghế thành công!");
        handleSearch();
      } else {
        toast.error("Không thể cập nhật ghế");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    }
  };

  const handleDelete = async (seatId: string, seatNumber: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ghế ${seatNumber} không?`)) {
      try {
        const response = await seatService.delete(seatId);
        if (response.success) {
          toast.success("Xóa ghế thành công!");
          handleSearch();
        } else {
          toast.error("Không thể xóa ghế");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra");
        console.error(error);
      }
    }
  };

  const getSeatTypeColor = (typeId: string) => {
    const index = seatTypes.findIndex((st) => st.id === typeId);
    if (index === -1) return "bg-blue-100 text-blue-800";
    const color = getSeatTypeColorByIndex(index);
    return `${color.bg} ${color.text}`;
  };

  const getSeatTypeLabel = (typeId: string) => {
    const seatType = seatTypes.find((st) => st.id === typeId);
    return seatType?.name || "N/A";
  };

  const getSeatTypeBgClass = (index: number) => {
    const color = getSeatTypeColorByIndex(index);
    return `${color.bg} ${color.border}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="list" className="w-full space-x-2">
        <Button onClick={() => navigate("/rooms")}>Về danh sách phòng</Button>
        <TabsList>
          <TabsTrigger value="list">Danh sách ghế</TabsTrigger>
          <TabsTrigger value="diagram">Sơ đồ ghế</TabsTrigger>
        </TabsList>

        {/* Tab 1: Danh sách ghế */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Armchair className="h-6 w-6" />
                    Quản Lý Ghế
                  </CardTitle>
                  <CardDescription>
                    Quản lý danh sách ghế và thông tin chi tiết
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <MovieImportDialog
                    onSubmit={(file) => handleImport(file, roomId as string)}
                    trigger={
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Excel
                      </Button>
                    }
                  />
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Ghế Mới
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
                    placeholder="Tìm kiếm theo số ghế..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
                <Combobox
                  datas={seatTypes.map((st) => ({
                    value: st.id || "",
                    label: st.name,
                  }))}
                  placeholder="Loại ghế"
                  onChange={setTypeColumn}
                  value={typeColumn}
                />
                <Combobox
                  datas={seatPaginateConfig.filterableColumns.is_active}
                  placeholder="Trạng thái"
                  onChange={setStatusColumn}
                  value={statusColumn}
                />
                <Combobox
                  datas={seatPaginateConfig.searchableColumns}
                  placeholder="Tìm theo"
                  onChange={setSearchColumn}
                  value={searchColumn}
                />
                <Combobox
                  datas={seatPaginateConfig.sortableColumns}
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
              ) : seats.length === 0 ? (
                <div className="text-center py-12">
                  <Armchair className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Không tìm thấy ghế nào
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Số Ghế</TableHead>
                          <TableHead>Loại Ghế</TableHead>
                          <TableHead className="text-center">
                            Trạng Thái
                          </TableHead>
                          <TableHead className="text-center">
                            Thao Tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seats.map((seat, index) => (
                          <TableRow key={seat.id}>
                            <TableCell className="font-medium">
                              {(meta.currentPage - 1) * meta.itemsPerPage +
                                index +
                                1}
                            </TableCell>
                            <TableCell>{seat.seat_number}</TableCell>
                            <TableCell>
                              <Badge className={getSeatTypeColor(seat.type)}>
                                {getSeatTypeLabel(seat.type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {seat.is_active ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500"
                                >
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
                                  title="Chỉnh sửa"
                                  onClick={() => {
                                    setSelectedSeat(seat);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Xóa"
                                  onClick={() =>
                                    handleDelete(
                                      seat.id as string,
                                      seat.seat_number,
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
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
                      Hiển thị {(meta.currentPage - 1) * meta.itemsPerPage + 1}{" "}
                      -{" "}
                      {Math.min(
                        meta.currentPage * meta.itemsPerPage,
                        meta.totalItems,
                      )}{" "}
                      của {meta.totalItems} ghế
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
                        {Array.from(
                          { length: meta.totalPages },
                          (_, i) => i + 1,
                        )
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
        </TabsContent>

        {/* Tab 2: Sơ đồ ghế */}
        <TabsContent value="diagram">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Armchair className="h-6 w-6" />
                Sơ Đồ Ghế
              </CardTitle>
              <CardDescription>
                Xem sơ đồ vị trí các ghế trong phòng chiếu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex gap-6 p-4 bg-muted rounded-lg flex-wrap">
                  {seatTypes.map((type, index) => (
                    <div key={type.id} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 border-2 rounded ${getSeatTypeBgClass(
                          index,
                        )}`}
                      ></div>
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 border-2 border-gray-400 rounded"></div>
                    <span className="text-sm">Không khả dụng</span>
                  </div>
                </div>

                {/* Seat Diagram */}
                {room ? (
                  <SeatDiagram seats={fullSeats} seatTypes={seatTypes} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Đang tải sơ đồ ghế...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SeatCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        seatTypes={seatTypes}
        onSubmit={handleCreateSubmit}
        roomId={roomId}
      />

      <SeatEditDialog
        seat={selectedSeat || undefined}
        open={editDialogOpen}
        seatTypes={seatTypes}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};

const SeatDiagram = ({
  seats,
  seatTypes,
}: {
  seats: SeatType[];
  seatTypes: SeatTypeType[];
}) => {
  const roomSeats = seats;

  if (roomSeats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Phòng này chưa có ghế</p>
      </div>
    );
  }

  // Parse seat_number to extract row (letter) and column (number)
  // Example: "A1" -> row: A, col: 1
  const parseSeatNumber = (seatNum: string) => {
    const match = seatNum.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      return { row: match[1], col: parseInt(match[2]) };
    }
    // Fallback for other formats
    return { row: "A", col: 1 };
  };

  // Build seat grid
  const seatGrid = {};
  const rows = new Set<string>();
  const cols = new Set<number>();

  roomSeats.forEach((seat) => {
    const { row, col } = parseSeatNumber(seat.seat_number);
    rows.add(row);
    cols.add(col);

    if (!seatGrid[row]) {
      seatGrid[row] = {};
    }
    seatGrid[row][col] = seat;
  });

  // Sort rows and columns
  const sortedRows = Array.from(rows).sort();
  const sortedCols = Array.from(cols).sort((a, b) => a - b);

  const getSeatTypeLabel = (typeId: string) => {
    const seatType = seatTypes.find((st) => st.id === typeId);
    return seatType?.name || "N/A";
  };

  const getSeatBgClass = (typeId: string) => {
    const index = seatTypes.findIndex((st) => st.id === typeId);
    if (index === -1)
      return "bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200";
    const color = getSeatTypeColorByIndex(index);
    return `${color.bg} ${color.border} ${color.text} ${color.hover}`;
  };

  const getSeatClass = (seat: SeatType | undefined) => {
    if (!seat) {
      return "bg-transparent border-transparent";
    }
    if (!seat.is_active) {
      return "bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed";
    }
    return `${getSeatBgClass(seat.type)} cursor-pointer`;
  };

  return (
    <div className="space-y-6 justify-center flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="inline-block bg-gray-800 text-white px-8 py-2 text-lg font-bold w-[70vw] ">
          🎬 MÀN HÌNH 🎬
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto pb-4">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex gap-2">
            <div className="w-12" />
            {sortedCols.map((col) => (
              <div
                key={`col-${col}`}
                className="w-10 h-10 flex items-center justify-center font-bold text-muted-foreground"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Seat Grid */}
          {sortedRows.map((row) => (
            <div key={`row-${row}`} className="flex gap-2 items-center m-2">
              {/* Row Header */}
              <div className="w-12 h-10 flex items-center justify-center font-bold text-muted-foreground">
                {row}
              </div>

              {/* Seats in row */}
              {sortedCols.map((col) => {
                const seat = seatGrid[row]?.[col];
                return (
                  <div
                    key={`seat-${row}-${col}`}
                    className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium border-2 transition-all ${getSeatClass(
                      seat,
                    )}`}
                    title={
                      seat
                        ? `Ghế ${seat.seat_number} - ${getSeatTypeLabel(
                            seat.type,
                          )}`
                        : ""
                    }
                  >
                    {seat && seat.seat_number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatList;
