import { io, Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000/api";
const SOCKET_URL = API_BASE_URL.replace("/api", "");

// ==================== TYPES ====================

export const ConversationStatus = {
  WAITING: "WAITING",
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
} as const;

export type ConversationStatus =
  (typeof ConversationStatus)[keyof typeof ConversationStatus];

export interface Conversation {
  id: string;
  customer_id: string;
  staff_id: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  staff?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  type: "TEXT" | "IMAGE" | "RECALLED";
  image_url: string | null;
  is_seen: boolean;
  seen_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

// ==================== SOCKET SERVICE ====================

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      this.socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ==================== CONVERSATION ====================

  // Lấy danh sách cuộc hội thoại đang chờ (WAITING) – cho staff/admin
  getWaitingConversations(): Promise<{
    data?: Conversation[];
    error?: string;
  }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "conversation:list:waiting",
        (res: { data?: Conversation[]; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Lấy danh sách cuộc hội thoại của user hiện tại
  getMyConversations(): Promise<{ data?: Conversation[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "conversation:list:mine",
        (res: { data?: Conversation[]; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Staff nhận cuộc hội thoại
  assignConversation(
    conversationId: string
  ): Promise<{ data?: Conversation; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "conversation:assign",
        { conversationId },
        (res: { data?: Conversation; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Join conversation room
  joinConversation(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit("conversation:join", { conversationId });
  }

  // Đóng cuộc hội thoại (soft-delete → DELETED)
  closeConversation(
    conversationId: string
  ): Promise<{ success?: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "conversation:close",
        { conversationId },
        (res: { success?: boolean; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // ==================== MESSAGE ====================

  // Gửi tin nhắn text
  sendMessage(
    conversationId: string,
    content: string
  ): Promise<{ data?: Message; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "message:send",
        { conversationId, content },
        (res: { data?: Message; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Gửi tin nhắn ảnh (base64)
  sendImageMessage(
    conversationId: string,
    base64: string,
    content?: string
  ): Promise<{ data?: Message; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "message:image",
        { conversationId, base64Image: base64, content: content || "" },
        (res: { data?: Message; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Load lịch sử tin nhắn
  getMessages(
    conversationId: string,
    limit = 100,
    offset = 0
  ): Promise<{ data?: Message[]; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "message:list",
        { conversationId, limit, offset },
        (res: { data?: Message[]; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Đánh dấu đã đọc
  markAsRead(
    conversationId: string
  ): Promise<{ success?: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "message:read",
        { conversationId },
        (res: { success?: boolean; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // ==================== EVENT LISTENERS ====================

  // Cuộc hội thoại mới (WAITING) – emitted from STAFF_ROOM
  onNewConversation(callback: (conv: Conversation) => void) {
    if (!this.socket) return () => {};
    this.socket.on("conversation:new", callback);
    return () => {
      this.socket?.off("conversation:new", callback);
    };
  }

  // Cuộc hội thoại đã được assign
  onConversationAssigned(callback: (conv: Conversation) => void) {
    if (!this.socket) return () => {};
    this.socket.on("conversation:assigned", callback);
    return () => {
      this.socket?.off("conversation:assigned", callback);
    };
  }

  // Cuộc hội thoại đã đóng
  onConversationClosed(
    callback: (data: { conversationId: string }) => void
  ) {
    if (!this.socket) return () => {};
    this.socket.on("conversation:closed", callback);
    return () => {
      this.socket?.off("conversation:closed", callback);
    };
  }

  // Cuộc hội thoại cập nhật (preview tin nhắn mới trong waiting)
  onConversationUpdate(callback: (conv: Conversation) => void) {
    if (!this.socket) return () => {};
    this.socket.on("conversation:update", callback);
    return () => {
      this.socket?.off("conversation:update", callback);
    };
  }

  // Tin nhắn mới
  onNewMessage(callback: (msg: Message) => void) {
    if (!this.socket) return () => {};
    this.socket.on("message:new", callback);
    return () => {
      this.socket?.off("message:new", callback);
    };
  }

  // Đã đọc update
  onMessageReadUpdate(
    callback: (data: { userId: string; conversationId: string }) => void
  ) {
    if (!this.socket) return () => {};
    this.socket.on("message:read:update", callback);
    return () => {
      this.socket?.off("message:read:update", callback);
    };
  }

  // Thu hồi tin nhắn
  recallMessage(
    messageId: string
  ): Promise<{ data?: Message; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ error: "Socket not connected" });
      this.socket.emit(
        "message:recall",
        { messageId },
        (res: { data?: Message; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  // Tin nhắn bị thu hồi
  onMessageRecalled(callback: (msg: Message) => void) {
    if (!this.socket) return () => {};
    this.socket.on("message:recalled", callback);
    return () => {
      this.socket?.off("message:recalled", callback);
    };
  }

  // Agent callback flow
  onAgentCallback(callback: (data: any) => void) {
    if (!this.socket) return () => {};
    this.socket.on("agent:callback", callback);
    return () => {
      this.socket?.off("agent:callback", callback);
    };
  }
}

export const socketService = new SocketService();
