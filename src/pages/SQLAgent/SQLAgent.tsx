import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  BarChart3,
  CheckCircle2,
  XCircle,
  Maximize2,
} from "lucide-react";
import { chatWithAgent } from "@/services/agent.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ChatMessage, AgentResponseData } from "@/types/chat.type";
import type { ChartInput } from "@/types/chart.type";
import { ChartRenderer } from "../../components/charts/ChartRenderer";
import { useAuth } from "@/hooks/useAuth";
import { socketService } from "@/lib/socket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Build a ChartInput from the agent response data.
 * Auto-detects xField/yFields for bar/line charts and labelField/valueField for pie charts.
 */
function buildChartInput(data: AgentResponseData): ChartInput | null {
  if (!data.chart_type || !data.result?.length) return null;

  const keys = Object.keys(data.result[0]);
  if (keys.length < 2) return null;

  // Convert numeric string values to numbers
  const parsedData = data.result.map((row) => {
    const parsed: Record<string, unknown> = {};
    for (const key of keys) {
      const val = row[key];
      const num = Number(val);
      parsed[key] = isNaN(num) ? val : num;
    }
    return parsed;
  });

  if (data.chart_type === "pie") {
    // First key = label, second key = value
    return {
      type: "pie",
      data: parsedData,
      labelField: keys[0],
      valueField: keys[1],
    };
  }

  // bar or line: first key = xField, remaining keys = yFields
  return {
    type: data.chart_type,
    data: parsedData,
    xField: keys[0],
    yFields: keys.slice(1),
  };
}

function SQLAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [respondedUrls, setRespondedUrls] = useState<Set<string>>(new Set());
  const [zoomedChart, setZoomedChart] = useState<ChartInput | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Connect socket if not already connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Listen for callbacks from backend
    const offCallback = socketService.onAgentCallback((rawPayload: any) => {
      console.log("Agent callback received (raw):", rawPayload);
      
      let payload = rawPayload;
      if (typeof rawPayload === "string") {
        try {
          payload = JSON.parse(rawPayload);
        } catch (e) {
          console.error("Failed to parse callback payload string", e);
        }
      }

      // If it's an array, take the first element (just in case agent format changes)
      payload = Array.isArray(payload) ? payload[0] : payload;

      let content = "Đã nhận được phản hồi từ hệ thống.";
      
      // Determine status from either { status: true } or { data: { status: true } }
      const status = payload?.status !== undefined ? payload.status : payload?.data?.status;
      
      if (status === true) {
        content = "✅ Xác nhận thành công. Hệ thống đã ghi nhận thiết lập.";
      } else if (status === false) {
        content = "❌ Xác nhận thất bại hoặc đã bị từ chối.";
      } else if (payload?.message) {
        content = payload.message;
      }

      const callbackMsg: ChatMessage = {
        id: user?.id || Date.now().toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
        // Pass it raw in case there are charts in the payload
        chartData: typeof payload === "object" ? payload : null,
      };

      setMessages((prev) => [...prev, callbackMsg]);
    });

    return () => {
      offCallback();
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: user?.id || "",
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setInput("");
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatWithAgent({
        message: input,
        user_id: user?.id || "",
      });

      // Handle both array and single object responses, with null safety
      const rawData = response.data;
      const agentData: AgentResponseData = Array.isArray(rawData)
        ? rawData[0]
        : rawData ?? { message: null, confirm_url: null, chart_type: null, result: null };

      const assistantMessage: ChatMessage = {
        id: user?.id || "",
        role: "assistant",
        content: agentData?.message || "Không có phản hồi từ hệ thống.",
        timestamp: new Date(),
        chartData: agentData,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: user?.id || "",
        role: "assistant",
        content:
          "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (confirmUrl: string, answer: "yes" | "no") => {
    setRespondedUrls((prev) => new Set(prev).add(confirmUrl));
    try {
      const res = await fetch(confirmUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      // If the webhook returns a follow-up response, append it
      const followUp: AgentResponseData = Array.isArray(data) ? data[0] : data;
      if (followUp?.message) {
        const followUpMessage: ChatMessage = {
          id: user?.id || "",
          role: "assistant",
          content: followUp.message,
          timestamp: new Date(),
          chartData: followUp,
        };
        setMessages((prev) => [...prev, followUpMessage]);
      }
    } catch (error) {
      console.error("Confirm error:", error);
      const errMsg: ChatMessage = {
        id: user?.id || "",
        role: "assistant",
        content: answer === "yes"
          ? "Đã xác nhận, nhưng có lỗi khi nhận phản hồi."
          : "Đã từ chối, nhưng có lỗi khi nhận phản hồi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
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

      {/* Messages Container */}
      <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1 bg-background">
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

        {messages.map((message, index) => {
          const chartInput =
            message.role === "assistant" && message.chartData
              ? buildChartInput(message.chartData)
              : null;

          return (
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
                  <>
                    {message.content && (
                      <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-code:text-primary prose-strong:text-foreground prose-li:text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Confirm / Reject buttons when confirm_url is present */}
                    {message.chartData?.confirm_url && (
                      <div className="mt-3 flex gap-2">
                        {respondedUrls.has(message.chartData.confirm_url) ? (
                          <span className="text-sm text-muted-foreground italic">
                            Đã phản hồi
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleConfirm(
                                  message.chartData!.confirm_url!,
                                  "yes"
                                )
                              }
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Xác nhận
                            </button>
                            <button
                              onClick={() =>
                                handleConfirm(
                                  message.chartData!.confirm_url!,
                                  "no"
                                )
                              }
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Chart rendered inline when data is available */}
                    {chartInput && (
                      <div
                        className="mt-3 bg-primary/5 rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors group relative"
                        onClick={() => setZoomedChart(chartInput)}
                        title="Nhấn để xem biểu đồ lớn hơn"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              Biểu đồ
                            </span>
                          </div>
                          <Maximize2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-foreground [&_text]:!fill-current [&_.recharts-cartesian-axis-tick-value]:!fill-current [&_.recharts-legend-item-text]:!text-foreground">
                          <ChartRenderer input={chartInput} />
                        </div>
                      </div>
                    )}
                  </>
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
          );
        })}

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

      {/* Zoomed Chart Dialog */}
      <Dialog open={!!zoomedChart} onOpenChange={(open) => !open && setZoomedChart(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              Biểu đồ chi tiết
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-foreground [&_text]:!fill-current [&_.recharts-cartesian-axis-tick-value]:!fill-current [&_.recharts-legend-item-text]:!text-foreground">
            {zoomedChart && <ChartRenderer input={zoomedChart} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Input Form */}
      <div className="bg-card border-t border-border px-6 py-4 shadow-lg flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Đặt câu hỏi về cơ sở dữ liệu của bạn..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed transition-all"
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
    </div>
  );
}

export default SQLAgent;
