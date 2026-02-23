import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Film,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Coffee,
  Loader2,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { DynamicBarChart } from "@/components/charts/DynamicBarChart";
import { DynamicLineChart } from "@/components/charts/DynamicLineChart";
import { toast } from "sonner";
import {
  statisticalService,
  type MonthlyRevenue,
  type StatsSummary,
  type TopMovie,
  type TopCombo,
  type TopMenuItem,
} from "@/services/statistical.service";

// ==================== SCHEMAS ====================
const revenueSchema = {
  type: "bar" as const,
  xField: "month",
  yFields: ["revenue"],
};

const ticketOrderSchema = {
  type: "line" as const,
  xField: "month",
  yFields: ["tickets", "orders"],
};

const comboSchema = {
  type: "bar" as const,
  xField: "name",
  yFields: ["sold"],
};

const menuItemSchema = {
  type: "bar" as const,
  xField: "name",
  yFields: ["sold"],
};

// ==================== COMPONENT ====================
const StatisticalPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    (currentDate.getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString(),
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Data states
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
  const [topCombos, setTopCombos] = useState<TopCombo[]>([]);
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItem[]>([]);

  // Generate months and years
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Tháng ${i + 1}`,
  }));

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentDate.getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Fetch data using service
  const fetchStatistics = async () => {
    setLoading(true);
    const monthNum = parseInt(selectedMonth);
    const yearNum = parseInt(selectedYear);

    try {
      const [
        monthlyRevenueRes,
        summaryRes,
        topMoviesRes,
        topCombosRes,
        topMenuItemsRes,
      ] = await Promise.all([
        statisticalService.getMonthlyRevenue(yearNum),
        statisticalService.getStatisticsSummary(monthNum, yearNum),
        statisticalService.getTopMovies(monthNum, yearNum),
        statisticalService.getTopCombos(monthNum, yearNum),
        statisticalService.getTopMenuItems(monthNum, yearNum),
      ]);

      if (monthlyRevenueRes.success) {
        setMonthlyRevenue(monthlyRevenueRes.data as MonthlyRevenue[]);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data as StatsSummary);
      }
      if (topMoviesRes.success) {
        setTopMovies(topMoviesRes.data as TopMovie[]);
      }
      if (topCombosRes.success) {
        setTopCombos(topCombosRes.data as TopCombo[]);
      }
      if (topMenuItemsRes.success) {
        setTopMenuItems(topMenuItemsRes.data as TopMenuItem[]);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedYear]);

  // Export Excel handler
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await statisticalService.exportExcel(
        parseInt(selectedMonth),
        parseInt(selectedYear),
      );
      toast.success("Xuất báo cáo Excel thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Không thể xuất báo cáo Excel");
    } finally {
      setExporting(false);
    }
  };

  // Format helpers
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return value.toLocaleString("vi-VN");
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("vi-VN");
  };

  // Transform data for charts
  const chartRevenueData = monthlyRevenue.map((item) => ({
    month: `T${item.month}`,
    revenue: item.revenue,
    tickets: item.tickets,
    orders: item.orders,
  }));

  const chartComboData = topCombos.map((item) => ({
    name:
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    sold: item.sold,
    revenue: item.revenue,
  }));

  const chartMenuItemData = topMenuItems.map((item) => ({
    name:
      item.name.length > 12 ? item.name.substring(0, 12) + "..." : item.name,
    sold: item.sold,
    revenue: item.revenue,
  }));

  // Calculate summary stats
  const totalRevenue = summary?.total_revenue || 0;
  const totalTickets = summary?.total_tickets || 0;
  const totalOrders = summary?.total_orders || 0;
  const totalUsers = summary?.total_users || 0;

  // Stats cards data
  const statsCards = [
    {
      title: "Doanh Thu Tháng",
      value: formatCurrency(totalRevenue),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Vé Đã Bán",
      value: formatNumber(totalTickets),
      change: "+8.2%",
      trend: "up" as const,
      icon: Ticket,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Đơn Hàng",
      value: formatNumber(totalOrders),
      change: "+15.3%",
      trend: "up" as const,
      icon: Film,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      title: "Người Dùng",
      value: formatNumber(totalUsers),
      change: "+23.1%",
      trend: "up" as const,
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>
            Thống Kê Doanh Thu
          </h1>
          <p className="text-muted-foreground mt-2">
            Phân tích dữ liệu và hiệu suất kinh doanh của rạp phim
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Month Selector */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Selector */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={fetchStatistics}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>

          <Button
            variant="default"
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-emerald-500 font-semibold text-sm">
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs tháng trước
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart - Full Width */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                Doanh Thu Theo Tháng - Năm {selectedYear}
              </CardTitle>
              <CardDescription className="mt-1">
                Biểu đồ doanh thu 12 tháng trong năm (chỉ phụ thuộc vào năm được
                chọn)
              </CardDescription>
            </div>
            <Badge variant="secondary">12 tháng</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DynamicBarChart
              data={chartRevenueData as []}
              schema={revenueSchema}
            />
          )}
        </CardContent>
      </Card>

      {/* Tickets & Orders Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <Ticket className="h-4 w-4 text-blue-500" />
                </div>
                Vé Bán & Đơn Hàng - Năm {selectedYear}
              </CardTitle>
              <CardDescription className="mt-1">
                So sánh số vé bán và đơn hàng theo từng tháng
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DynamicLineChart
              data={chartRevenueData as []}
              schema={ticketOrderSchema}
            />
          )}
        </CardContent>
      </Card>

      {/* Combo & MenuItem Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Combos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
                <Package className="h-4 w-4 text-orange-500" />
              </div>
              Combo Bán Chạy
            </CardTitle>
            <CardDescription>
              Top combo được mua nhiều nhất trong tháng {selectedMonth}/
              {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topCombos.length > 0 ? (
              <DynamicBarChart
                data={chartComboData as []}
                schema={comboSchema}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Menu Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                <Coffee className="h-4 w-4 text-purple-500" />
              </div>
              Sản Phẩm Bán Chạy
            </CardTitle>
            <CardDescription>
              Top menu item được mua nhiều nhất trong tháng {selectedMonth}/
              {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topMenuItems.length > 0 ? (
              <DynamicBarChart
                data={chartMenuItemData as []}
                schema={menuItemSchema}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Movies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            Top Phim Doanh Thu Cao Nhất
          </CardTitle>
          <CardDescription>
            Phim có hiệu suất tốt nhất trong tháng {selectedMonth}/
            {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : topMovies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      Tên Phim
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                      Doanh Thu
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                      Vé Bán
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">
                      Đánh Giá
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topMovies.map((movie, index) => (
                    <tr
                      key={movie.movie_id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Badge
                          variant={index < 3 ? "default" : "secondary"}
                          className={
                            index === 0
                              ? "bg-amber-500 hover:bg-amber-600"
                              : index === 1
                                ? "bg-slate-400 hover:bg-slate-500"
                                : index === 2
                                  ? "bg-amber-700 hover:bg-amber-800"
                                  : ""
                          }
                        >
                          {index + 1}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-medium">{movie.title}</td>
                      <td className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(movie.revenue)} VNĐ
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {formatNumber(movie.tickets)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant="outline" className="font-semibold">
                          ⭐ {movie.rating || "N/A"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticalPage;
