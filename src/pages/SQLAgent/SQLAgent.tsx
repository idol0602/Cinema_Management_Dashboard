import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { chatWithAgent } from "@/services/agent.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ChatMessage } from "@/types/chat.type";
import { DynamicBarChart } from "../../components/charts/DynamicBarChart";
import { DynamicLineChart } from "../../components/charts/DynamicLineChart";
import { DynamicPieChart } from "../../components/charts/DynamicPieChart";
import { AlertDialogDestructive } from "../../components/ui/delete-dialog";
import { useAuth } from "@/hooks/useAuth";

// Sample data for movie revenue
const movieRevenueData = [
  { month: "Tháng 1", revenue: 450000000, tickets: 15420 },
  { month: "Tháng 2", revenue: 520000000, tickets: 17680 },
  { month: "Tháng 3", revenue: 480000000, tickets: 16200 },
  { month: "Tháng 4", revenue: 610000000, tickets: 20340 },
  { month: "Tháng 5", revenue: 580000000, tickets: 19450 },
  { month: "Tháng 6", revenue: 670000000, tickets: 22500 },
];

const movieRevenueSchema = {
  type: "bar" as const,
  xField: "month",
  yFields: ["revenue", "tickets"],
};

// Sample data for user growth
const userGrowthData = [
  { month: "Tháng 1", users: 2500 },
  { month: "Tháng 2", users: 3200 },
  { month: "Tháng 3", users: 4100 },
  { month: "Tháng 4", users: 5300 },
  { month: "Tháng 5", users: 6800 },
  { month: "Tháng 6", users: 8500 },
];

const userGrowthSchema = {
  type: "line" as const,
  xField: "month",
  yFields: ["users"],
};

// Sample data for movie genres distribution
const genreDistributionData = [
  { genre: "Hành động", count: 28 },
  { genre: "Hài kịch", count: 22 },
  { genre: "Kinh dị", count: 15 },
  { genre: "Lãng mạn", count: 18 },
  { genre: "Khoa học viễn tưởng", count: 12 },
  { genre: "Phiêu lưu", count: 20 },
];

const genreDistributionSchema = {
  type: "pie" as const,
  labelField: "genre",
  valueField: "count",
};

function SQLAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setSessionId(user.id);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportFile = () => {
    if (selectedFile) {
      // TODO: Implement file import logic
      console.log("Importing file:", selectedFile.name);
      setShowImportModal(false);
      setSelectedFile(null);
    }
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const MessageRequest: ChatMessage = {
      id: sessionId,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setInput("");
    setMessages((prev) => [...prev, MessageRequest]);
    try {
      const response = await chatWithAgent({
        question: input,
        session_id: sessionId,
      });

      const MessageResonse: ChatMessage = {
        id: sessionId,
        role: "assistant",
        content: response.data,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, MessageResonse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: sessionId,
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">SQL Agent</h1>
            <p className="text-sm text-muted-foreground">
              Hỏi về cơ sở dữ liệu và xem thống kê trực quan
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-card border-b border-border px-6 py-6 flex-shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-primary/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Doanh thu & Vé bán
              </h3>
            </div>
            <DynamicBarChart
              data={movieRevenueData}
              schema={movieRevenueSchema}
            />
          </div>

          {/* User Growth Chart */}
          <div className="bg-accent/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">
                Tăng trưởng người dùng
              </h3>
            </div>
            <DynamicLineChart data={userGrowthData} schema={userGrowthSchema} />
          </div>

          {/* Genre Distribution Chart */}
          <div className="bg-destructive/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-foreground">
                Phân bố thể loại phim
              </h3>
            </div>
            <DynamicPieChart
              data={genreDistributionData}
              schema={genreDistributionSchema}
            />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="overflow-y-auto px-6 py-4 space-y-4 h-[80vh] bg-background">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Chào mừng đến với SQL Agent
            </h2>
            <p className="text-muted-foreground max-w-md">
              Hỏi tôi bất cứ điều gì về cơ sở dữ liệu rạp chiếu phim. Tôi có thể
              giúp bạn truy vấn phim, người dùng, đặt vé và nhiều hơn nữa!
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => setInput("Có bao nhiêu người dùng đã đăng ký?")}
                className="px-4 py-3 bg-card border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <p className="font-medium text-foreground">
                  📊 Thống kê người dùng
                </p>
                <p className="text-sm text-muted-foreground">
                  Có bao nhiêu người dùng đã đăng ký?
                </p>
              </button>
              <button
                onClick={() => setInput("Top 5 phim có doanh thu cao nhất?")}
                className="px-4 py-3 bg-card border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <p className="font-medium text-foreground">🎬 Phim phổ biến</p>
                <p className="text-sm text-muted-foreground">
                  Top 5 phim có doanh thu cao nhất?
                </p>
              </button>
              <button
                onClick={() => setInput("Tổng doanh thu trong tháng này?")}
                className="px-4 py-3 bg-card border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <p className="font-medium text-foreground">💰 Doanh thu</p>
                <p className="text-sm text-muted-foreground">
                  Tổng doanh thu trong tháng này?
                </p>
              </button>
              <button
                onClick={() => setInput("Suất chiếu nào còn ghế trống?")}
                className="px-4 py-3 bg-card border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <p className="font-medium text-foreground">🎫 Suất chiếu</p>
                <p className="text-sm text-muted-foreground">
                  Suất chiếu nào còn ghế trống?
                </p>
              </button>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}

            {/* MESSAGE BUBBLE */}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-code:text-primary">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}

              <span
                className={`text-xs mt-2 block ${
                  message.role === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Đang phân tích...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-card border-t border-border px-6 py-4 shadow-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md"
            title="Import Excel"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Đặt câu hỏi về cơ sở dữ liệu của bạn..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="font-medium">Gửi</span>
          </button>
        </form>
      </div>

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-accent" />
                Import File Excel
              </h3>
              <button
                onClick={handleCancelImport}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Chọn file Excel (.xlsx, .xls)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer border border-border rounded-lg"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Đã chọn:{" "}
                  <span className="font-medium text-foreground">
                    {selectedFile.name}
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelImport}
                className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleImportFile}
                disabled={!selectedFile}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SQLAgent;
