export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartData?: AgentResponseData | null;
}

export interface ChatRequest {
  message: string;
  user_id?: string;
}

export interface AgentResponseData {
  message: string | null;
  confirm_url: string | null;
  chart_type: "bar" | "line" | "pie" | null;
  result: Record<string, string>[] | null;
}

export interface ChatResponse {
  success: boolean;
  data: AgentResponseData;
  message: string;
}
