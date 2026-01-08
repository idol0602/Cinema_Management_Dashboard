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

  useEffect(() => {
    const ssid = localStorage.getItem("token");
    setSessionId(ssid as string);
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">SQL Agent</h1>
            <p className="text-sm text-gray-500">
              Hỏi về cơ sở dữ liệu và xem thống kê trực quan
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 flex-shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">
                Doanh thu & Vé bán
              </h3>
            </div>
            <DynamicBarChart
              data={movieRevenueData}
              schema={movieRevenueSchema}
            />
          </div>

          {/* User Growth Chart */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">
                Tăng trưởng người dùng
              </h3>
            </div>
            <DynamicLineChart data={userGrowthData} schema={userGrowthSchema} />
          </div>

          {/* Genre Distribution Chart */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">
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
      <div className="overflow-y-auto px-6 py-4 space-y-4 h-[80vh]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Chào mừng đến với SQL Agent
            </h2>
            <p className="text-gray-500 max-w-md">
              Hỏi tôi bất cứ điều gì về cơ sở dữ liệu rạp chiếu phim. Tôi có thể
              giúp bạn truy vấn phim, người dùng, đặt vé và nhiều hơn nữa!
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => setInput("Có bao nhiêu người dùng đã đăng ký?")}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <p className="font-medium text-gray-700">
                  📊 Thống kê người dùng
                </p>
                <p className="text-sm text-gray-500">
                  Có bao nhiêu người dùng đã đăng ký?
                </p>
              </button>
              <button
                onClick={() => setInput("Top 5 phim có doanh thu cao nhất?")}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <p className="font-medium text-gray-700">🎬 Phim phổ biến</p>
                <p className="text-sm text-gray-500">
                  Top 5 phim có doanh thu cao nhất?
                </p>
              </button>
              <button
                onClick={() => setInput("Tổng doanh thu trong tháng này?")}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <p className="font-medium text-gray-700">💰 Doanh thu</p>
                <p className="text-sm text-gray-500">
                  Tổng doanh thu trong tháng này?
                </p>
              </button>
              <button
                onClick={() => setInput("Suất chiếu nào còn ghế trống?")}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <p className="font-medium text-gray-700">🎫 Suất chiếu</p>
                <p className="text-sm text-gray-500">
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
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            )}

            {/* MESSAGE BUBBLE */}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-blue-600">
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
                  message.role === "user" ? "text-blue-100" : "text-gray-400"
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
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-gray-500">Đang phân tích...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md"
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Import File Excel
              </h3>
              <button
                onClick={handleCancelImport}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file Excel (.xlsx, .xls)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border border-gray-300 rounded-lg"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Đã chọn:{" "}
                  <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelImport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleImportFile}
                disabled={!selectedFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
