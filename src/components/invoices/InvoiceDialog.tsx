import { useState } from "react";
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Ticket,
  MapPin,
  Clock,
  Film,
  CheckCircle2,
  QrCode,
  X,
} from "lucide-react";
import { formatVietnamTime } from "@/utils/datetime";
import type { TicketType } from "@/types/ticket.type";

// Cinema info constants
const CINEMA_NAME = "META CINEMA";
const CINEMA_ADDRESS = "12 Nguyen Van Bao, Phuong 1, Go Vap, TP. Ho Chi Minh 700000, Viet Nam";

// Helper to remove Vietnamese diacritics for PDF
const removeDiacritics = (str: string): string => {
  const diacriticsMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Đ': 'D',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
  };
  return str.split('').map(char => diacriticsMap[char] || char).join('');
};

// Extend TicketType with qr_code for invoice display
interface InvoiceTicket extends TicketType {
  qr_code: string;
}

interface InvoiceData {
  order: {
    id: string;
    total_price: number;
    service_vat: number;
    created_at?: string;
  };
  tickets: InvoiceTicket[];
}

interface SeatDetail {
  seat_number: string;
  seat_type: string;
  price: number;
}

interface ComboDetail {
  name: string;
  price: number;
  items: Array<{ name: string; quantity: number }>;
}

interface MenuItemDetail {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface InvoiceTotals {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  serviceVat: number;
  total: number;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: InvoiceData | null;
  movieInfo: {
    title: string;
    thumbnail?: string;
    duration?: number;
  };
  showTimeInfo: {
    start_time: string;
    room_name: string;
    room_format: string;
    day_type: string;
  };
  seatDetails: SeatDetail[];
  comboDetails: ComboDetail[];
  menuItemDetails: MenuItemDetail[];
  totals: InvoiceTotals;
  eventName?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

// Format price for PDF (no diacritics)
const formatPricePdf = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + " VND";

const InvoiceDialog = ({
  open,
  onOpenChange,
  invoiceData,
  movieInfo,
  showTimeInfo,
  seatDetails,
  comboDetails,
  menuItemDetails,
  totals,
  eventName,
}: InvoiceDialogProps) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!invoiceData) return null;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200],
      });

      const tickets = invoiceData.tickets;
      const pageHeight = 200;

      for (let i = 0; i < tickets.length; i++) {
        if (i > 0) {
          doc.addPage([80, pageHeight]);
        }

        const ticket = tickets[i];
        const seatDetail = seatDetails[i] || { seat_number: "N/A", seat_type: "Standard", price: 0 };
        
        let y = 8;
        const centerX = 40;
        const leftMargin = 5;
        const rightMargin = 75;

        // ===== HEADER =====
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(CINEMA_NAME, centerX, y, { align: "center" });
        y += 5;

        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text("12 Nguyen Van Bao, Phuong 1, Go Vap", centerX, y, { align: "center" });
        y += 3;
        doc.text("TP. Ho Chi Minh 700000, Viet Nam", centerX, y, { align: "center" });
        y += 5;

        // Dashed line
        doc.setLineDash([1, 1]);
        doc.line(leftMargin, y, rightMargin, y);
        doc.setLineDash([]);
        y += 5;

        // ===== MOVIE TITLE (no diacritics) =====
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const movieTitleClean = removeDiacritics(movieInfo.title);
        const movieTitle = movieTitleClean.length > 25 
          ? movieTitleClean.substring(0, 25) + "..." 
          : movieTitleClean;
        doc.text(movieTitle, centerX, y, { align: "center" });
        y += 6;

        // ===== SHOWTIME INFO (no diacritics) =====
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        // Date & Time (format without Vietnamese weekday names)
        const showtimeDate = new Date(showTimeInfo.start_time);
        const dateStr = showtimeDate.toLocaleDateString("en-GB", { 
          day: "2-digit",
          month: "2-digit", 
          year: "numeric"
        });
        const timeStr = showtimeDate.toLocaleTimeString("en-GB", { 
          hour: "2-digit", 
          minute: "2-digit" 
        });
        
        doc.text(`Ngay: ${dateStr}`, leftMargin, y);
        y += 4;
        doc.text(`Gio: ${timeStr}`, leftMargin, y);
        y += 4;
        const roomName = removeDiacritics(showTimeInfo.room_name);
        const roomFormat = removeDiacritics(showTimeInfo.room_format);
        doc.text(`Phong: ${roomName} - ${roomFormat}`, leftMargin, y);
        y += 6;

        // ===== SEAT INFO (HIGHLIGHTED) =====
        doc.setFillColor(240, 240, 240);
        doc.rect(leftMargin, y - 3, 70, 12, "F");
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`GHE: ${seatDetail.seat_number}`, centerX, y + 3, { align: "center" });
        y += 5;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const seatTypeClean = removeDiacritics(seatDetail.seat_type);
        doc.text(`Loai ghe: ${seatTypeClean}`, centerX, y + 2, { align: "center" });
        y += 10;

        // Dashed line
        doc.setLineDash([1, 1]);
        doc.line(leftMargin, y, rightMargin, y);
        doc.setLineDash([]);
        y += 5;

        // ===== QR CODE =====
        if (ticket.qr_code) {
          try {
            const qrSize = 35;
            const qrX = centerX - qrSize / 2;
            doc.addImage(ticket.qr_code, "PNG", qrX, y, qrSize, qrSize);
            y += qrSize + 3;
          } catch (err) {
            console.error("Failed to add QR code:", err);
            doc.setFontSize(8);
            doc.text("QR Code unavailable", centerX, y + 15, { align: "center" });
            y += 35;
          }
        }

        // ===== TICKET ID =====
        doc.setFontSize(6);
        doc.text(`Ma ve: ${ticket.id?.slice(-12) || "N/A"}`, centerX, y, { align: "center" });
        y += 4;

        // Dashed line
        doc.setLineDash([1, 1]);
        doc.line(leftMargin, y, rightMargin, y);
        doc.setLineDash([]);
        y += 5;

        // ===== PRICE =====
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Gia ve: ${formatPricePdf(seatDetail.price)}`, centerX, y, { align: "center" });
        y += 6;

        // ===== FOOTER =====
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text("Vui long xuat trinh ve khi vao rap", centerX, y, { align: "center" });
        y += 3;
        doc.text("Cam on quy khach!", centerX, y, { align: "center" });
        y += 4;

        // Order ID
        doc.setFontSize(5);
        doc.text(`Order: ${invoiceData.order.id.slice(-8)}`, centerX, y, { align: "center" });
        
        // Ticket number indicator
        y += 4;
        doc.text(`Ve ${i + 1}/${tickets.length}`, centerX, y, { align: "center" });
      }

      // Save the PDF
      const orderIdShort = invoiceData.order.id.slice(-8);
      doc.save(`META_CINEMA_Tickets_${orderIdShort}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Thông Tin Đơn Hàng
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content area with fixed height */}
        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <div className="space-y-4 py-2">
            {/* Cinema Header */}
            <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <h2 className="text-xl font-bold text-primary">{CINEMA_NAME}</h2>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {CINEMA_ADDRESS}
              </p>
            </div>

            {/* Order Info */}
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-muted-foreground">Mã đơn hàng:</span>
              <Badge variant="outline" className="font-mono">
                #{invoiceData.order.id.slice(-8)}
              </Badge>
            </div>

            <Separator />

            {/* Movie Info */}
            <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
              {movieInfo.thumbnail && (
                <img
                  src={movieInfo.thumbnail}
                  alt={movieInfo.title}
                  className="w-20 h-28 object-cover rounded-md shadow"
                />
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg">{movieInfo.title}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatVietnamTime(showTimeInfo.start_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {showTimeInfo.room_name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Badge>{showTimeInfo.room_format}</Badge>
                  <Badge variant="outline">
                    {showTimeInfo.day_type === "WEEKEND" ? "Cuối tuần" : "Ngày thường"}
                  </Badge>
                </div>
                {movieInfo.duration && (
                  <p className="text-xs text-muted-foreground">
                    <Film className="h-3 w-3 inline mr-1" />
                    {movieInfo.duration} phút
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Tickets List */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Ticket className="h-4 w-4" />
                Danh sách vé ({invoiceData.tickets.length} vé)
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {invoiceData.tickets.map((ticket, index) => {
                  const seatDetail = seatDetails[index];
                  return (
                    <Card key={ticket.id || index} className="overflow-hidden">
                      <CardContent className="p-3 flex items-center gap-3">
                        {/* QR Code Mini */}
                        <div className="w-16 h-16 bg-white flex items-center justify-center rounded border shrink-0">
                          {ticket.qr_code ? (
                            <img
                              src={ticket.qr_code}
                              alt="QR Code"
                              className="w-14 h-14 object-contain"
                            />
                          ) : (
                            <QrCode className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Ticket Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge className="text-lg px-3 py-1">
                              {seatDetail?.seat_number || `Vé ${index + 1}`}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {seatDetail?.seat_type || "Standard"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mã vé: {ticket.id?.slice(-12) || "N/A"}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary">
                            {formatPrice(seatDetail?.price || 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Combos */}
            {comboDetails.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">🍿 Combo</h4>
                  <div className="space-y-2">
                    {comboDetails.map((combo, index) => (
                      <div key={index} className="p-2 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{combo.name}</span>
                          <span className="font-bold">{formatPrice(combo.price)}</span>
                        </div>
                        {combo.items && combo.items.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Bao gồm: {combo.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Menu Items */}
            {menuItemDetails.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">🍕 Món lẻ</h4>
                  <div className="space-y-1">
                    {menuItemDetails.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium">{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Event */}
            {eventName && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Sự kiện áp dụng:</span>
                  <Badge variant="secondary">{eventName}</Badge>
                </div>
              </>
            )}

            <Separator />

            {/* Summary */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá ({totals.discountPercent}%):</span>
                  <span>-{formatPrice(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-orange-600">
                <span>Phí dịch vụ (10%):</span>
                <span>+{formatPrice(totals.serviceVat)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-lg">Tổng tiền:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPdf ? "Đang tạo PDF..." : "Tải vé (PDF)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
