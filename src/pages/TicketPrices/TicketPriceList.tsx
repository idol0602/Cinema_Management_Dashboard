import { useState, useEffect } from "react";
import { ticketPriceService } from "@/services/ticketPrice.service";
import { TicketPriceUpdateDialog } from "@/components/ticketPrices/TicketPriceUpdateDialog";
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
import { Edit, Search, DollarSign } from "lucide-react";
import type { TicketPriceType } from "@/types/ticketPrice.type";

const TicketPriceList = () => {
  const [ticketPrices, setTicketPrices] = useState<TicketPriceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketPrice, setSelectedTicketPrice] =
    useState<TicketPriceType | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const fetchTicketPrices = async () => {
    setLoading(true);
    try {
      const response = await ticketPriceService.getAll();
      if (response.success) {
        setTicketPrices(response.data as TicketPriceType[]);
      } else {
        toast.error("Không thể tải danh sách giá vé");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketPrices();
  }, []);

  const filteredTicketPrices = ticketPrices.filter((tp) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tp.format?.toLowerCase().includes(searchLower) ||
      tp.seat_type?.toLowerCase().includes(searchLower) ||
      tp.day_type?.toLowerCase().includes(searchLower) ||
      tp.price?.toString().includes(searchLower)
    );
  });

  const handleUpdateSubmit = async (data: any) => {
    try {
      const response = await ticketPriceService.update(data.id, data);
      if (response.success) {
        toast.success("Cập nhật giá vé thành công!");
        fetchTicketPrices();
      } else {
        toast.error("Không thể cập nhật giá vé");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Quản Lý Giá Vé
              </CardTitle>
              <CardDescription>Quản lý giá vé theo loại phim</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo định dạng, loại ghế, ngày hoặc giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : filteredTicketPrices.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy giá vé nào</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Định Dạng</TableHead>
                    <TableHead>Loại Ghế</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Giá Vé</TableHead>
                    <TableHead className="text-center">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTicketPrices.map((tp, index) => (
                    <TableRow key={tp.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {tp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">
                          {tp.seat_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {tp.day_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(tp.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Cập nhật giá"
                            onClick={() => {
                              setSelectedTicketPrice(tp);
                              setUpdateDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TicketPriceUpdateDialog
        ticketPrice={selectedTicketPrice || undefined}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onSubmit={handleUpdateSubmit}
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
            <TableHead>Định Dạng</TableHead>
            <TableHead>Loại Ghế</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead className="text-right">Giá Vé</TableHead>
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
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
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

export default TicketPriceList;
