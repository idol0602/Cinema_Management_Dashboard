import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  ImagePlus,
  Loader2,
  Users,
  Clock,
  CheckCheck,
  X,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  socketService,
  type Conversation,
  type Message,
  ConversationStatus,
} from "@/lib/socket";

// ==================== HELPERS ====================

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ==================== COMPONENT ====================

export default function ChatWithStaff() {
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [firstMessages, setFirstMessages] = useState<Record<string, string>>(
    {},
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Scroll ----------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ---------- Load initial conversations on mount ----------
  useEffect(() => {
    if (!socketService.isConnected()) return;
    setIsLoadingConversations(true);

    const loadInitial = async () => {
      try {
        // Load waiting conversations (with messages)
        const waitingRes = await socketService.getWaitingConversations();
        // Load my active conversations
        const mineRes = await socketService.getMyConversations();

        const allConvs: Conversation[] = [];

        if (waitingRes.data) {
          // Extract first messages from waiting conversations
          const fmMap: Record<string, string> = {};
          for (const conv of waitingRes.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msgs = (conv as any).messages as
              | { content: string; created_at: string }[]
              | undefined;
            if (msgs && msgs.length > 0) {
              // Sort by created_at asc, take first
              const sorted = [...msgs].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              );
              fmMap[conv.id] = sorted[0].content;
            }
          }
          setFirstMessages((prev) => ({ ...prev, ...fmMap }));
          allConvs.push(...waitingRes.data);
        }

        if (mineRes.data) {
          // Only include active conversations where current user is the staff
          const myActive = mineRes.data.filter(
            (c) =>
              c.staff_id === user?.id && c.status === ConversationStatus.ACTIVE,
          );
          // Avoid duplicates
          for (const conv of myActive) {
            if (!allConvs.find((c) => c.id === conv.id)) {
              allConvs.push(conv);
            }
          }
        }

        setConversations(allConvs);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadInitial();
  }, [user?.id]);

  // ---------- Socket listeners ----------
  useEffect(() => {
    if (!socketService.isConnected()) return;

    // Listen for new waiting conversations (emitted to "staff" room)
    const offNew = socketService.onNewConversation((conv) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstMsg = (conv as any).firstMessage as Message | undefined;
      if (firstMsg) {
        setFirstMessages((prev) => ({ ...prev, [conv.id]: firstMsg.content }));
      }

      setConversations((prev) => {
        if (prev.find((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
    });

    // Listen for assigned conversations (emitted to "staff" room + conversation room)
    const offAssigned = socketService.onConversationAssigned((conv) => {
      if (conv.staff_id === user?.id) {
        // This staff accepted — move from waiting to active
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? conv : c)),
        );
        setActiveConversation((prev) => (prev?.id === conv.id ? conv : prev));
      } else {
        // Another staff accepted — remove from our list entirely
        setConversations((prev) => prev.filter((c) => c.id !== conv.id));
        setActiveConversation((prev) => {
          if (prev?.id === conv.id) {
            setMessages([]);
            return null;
          }
          return prev;
        });
      }
    });

    // Listen for closed conversations
    const offClosed = socketService.onConversationClosed(() => {
      // When conversation is closed while we're in it
      setActiveConversation((prev) => {
        if (prev) {
          setConversations((cs) => cs.filter((c) => c.id !== prev.id));
        }
        return null;
      });
      setMessages([]);
    });

    // Listen for new messages
    const offMessage = socketService.onNewMessage((msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Update unread if message is not from active conversation or from someone else
      if (msg.sender_id !== user?.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
        }));
      }
    });

    // Listen for read updates
    const offRead = socketService.onMessageReadUpdate(
      ({ conversationId, userId: readUserId }) => {
        if (readUserId !== user?.id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.conversation_id === conversationId && m.sender_id === user?.id
                ? { ...m, is_seen: true }
                : m,
            ),
          );
        }
      },
    );

    return () => {
      offNew();
      offAssigned();
      offClosed();
      offMessage();
      offRead();
    };
  }, [user?.id]);

  // ---------- Load messages when selecting a conversation ----------
  const selectConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    setIsLoadingMessages(true);
    setMessages([]);

    // Join the conversation room
    socketService.joinConversation(conv.id);

    try {
      const res = await socketService.getMessages(conv.id, 100, 0);
      if (res.data) {
        // Messages come in desc order from backend, reverse for display
        setMessages([...res.data].reverse());
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }

    // Mark as read
    try {
      await socketService.markAsRead(conv.id);
      setUnreadCounts((prev) => ({ ...prev, [conv.id]: 0 }));
    } catch {
      // ignore
    }

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ---------- Assign (pick up) a waiting conversation ----------
  const handleAssign = useCallback(
    async (conv: Conversation) => {
      try {
        const res = await socketService.assignConversation(conv.id);
        if (res.data) {
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? res.data! : c)),
          );
          selectConversation(res.data);
        }
      } catch (err) {
        console.error("Failed to assign:", err);
      }
    },
    [selectConversation],
  );

  // ---------- Close conversation ----------
  const handleClose = useCallback(
    async (convId: string) => {
      try {
        await socketService.closeConversation(convId);
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversation?.id === convId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to close:", err);
      }
    },
    [activeConversation],
  );

  // ---------- Send message ----------
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !activeConversation || isSending) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const res = await socketService.sendMessage(
        activeConversation.id,
        content,
      );
      if (res.error) {
        console.error("Send failed:", res.error);
        setInputValue(content); // restore
      }
    } catch (err) {
      console.error("Send failed:", err);
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, activeConversation, isSending]);

  // ---------- Send image ----------
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeConversation) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setIsSending(true);
        try {
          await socketService.sendImageMessage(activeConversation.id, base64);
        } catch (err) {
          console.error("Image send failed:", err);
        } finally {
          setIsSending(false);
        }
      };
      reader.readAsDataURL(file);

      // Reset file input
      e.target.value = "";
    },
    [activeConversation],
  );

  // ---------- Key press ----------
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------- Group messages by date ----------
  const groupedMessages = messages.reduce<
    { date: string; messages: Message[] }[]
  >((acc, msg) => {
    const dateStr = formatDate(msg.created_at);
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      acc.push({ date: dateStr, messages: [msg] });
    }
    return acc;
  }, []);

  // ---------- Separate waiting vs active conversations ----------
  const waitingConversations = conversations.filter(
    (c) => c.status === ConversationStatus.WAITING,
  );
  const activeConversations = conversations.filter(
    (c) => c.status === ConversationStatus.ACTIVE && c.staff_id === user?.id,
  );

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* ============ LEFT SIDEBAR ============ */}
      <div className="flex w-80 flex-col border-r">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <MessageCircle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Chat hỗ trợ</h2>
          {waitingConversations.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {waitingConversations.length}
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1">
          {/* Waiting Section */}
          {waitingConversations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                <Clock className="h-3 w-3" />
                Đang chờ ({waitingConversations.length})
              </div>
              {waitingConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="mx-2 mb-1 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs dark:bg-amber-900 dark:text-amber-300">
                      {getInitials(conv.customer?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conv.customer?.name || "Khách hàng"}
                    </p>
                    {firstMessages[conv.id] ? (
                      <p className="truncate text-xs text-muted-foreground italic">
                        &ldquo;{firstMessages[conv.id]}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(conv.created_at)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="h-7 bg-amber-500 text-xs hover:bg-amber-600"
                    onClick={() => handleAssign(conv)}
                  >
                    Nhận
                  </Button>
                </div>
              ))}
              <Separator className="my-1" />
            </div>
          )}

          {/* Active Section */}
          <div>
            {activeConversations.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                <Users className="h-3 w-3" />
                Đang trò chuyện ({activeConversations.length})
              </div>
            )}
            {activeConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              const unread = unreadCounts[conv.id] || 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    "mx-2 mb-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg p-3 text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-muted/50",
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(conv.customer?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conv.customer?.name || "Khách hàng"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.customer?.email}
                    </p>
                  </div>
                  {unread > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 justify-center text-[10px]"
                    >
                      {unread}
                    </Badge>
                  )}
                </button>
              );
            })}

            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                {isLoadingConversations ? (
                  <Loader2 className="h-10 w-10 animate-spin opacity-30" />
                ) : (
                  <>
                    <MessageCircle className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                    <p className="text-xs">
                      Cuộc hội thoại mới sẽ hiển thị ở đây
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ============ RIGHT CHAT AREA ============ */}
      <div className="flex flex-1 flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(activeConversation.customer?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {activeConversation.customer?.name || "Khách hàng"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.customer?.email}
                  </p>
                  {activeConversation.customer?.phone && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {activeConversation.customer.phone}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  activeConversation.status === ConversationStatus.ACTIVE
                    ? "default"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {activeConversation.status === ConversationStatus.ACTIVE
                  ? "Đang hỗ trợ"
                  : activeConversation.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleClose(activeConversation.id)}
                title="Đóng cuộc trò chuyện"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <MessageCircle className="mb-2 h-10 w-10 opacity-30" />
                  <p className="text-sm">Chưa có tin nhắn</p>
                  <p className="text-xs">Hãy bắt đầu cuộc trò chuyện</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="my-4 flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {group.date}
                        </span>
                        <Separator className="flex-1" />
                      </div>

                      <div className="space-y-2">
                        {group.messages.map((msg) => {
                          const isMe = msg.sender_id === user?.id;

                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex items-end gap-2",
                                isMe ? "flex-row-reverse" : "flex-row",
                              )}
                            >
                              {!isMe && (
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-amber-100 text-amber-700 text-[10px] dark:bg-amber-900 dark:text-amber-300">
                                    {getInitials(msg.sender?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={cn(
                                  "max-w-[65%] rounded-2xl px-3.5 py-2 text-sm",
                                  isMe
                                    ? "rounded-br-sm bg-primary text-primary-foreground"
                                    : "rounded-bl-sm bg-muted",
                                )}
                              >
                                {msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt="Shared image"
                                    className="mb-1 max-h-48 rounded-lg object-cover"
                                  />
                                )}
                                {msg.content && (
                                  <p className="whitespace-pre-wrap">
                                    {msg.content}
                                  </p>
                                )}
                                <div
                                  className={cn(
                                    "mt-1 flex items-center gap-1 text-[10px]",
                                    isMe
                                      ? "justify-end opacity-70"
                                      : "opacity-50",
                                  )}
                                >
                                  <span>{formatTime(msg.created_at)}</span>
                                  {isMe && msg.is_seen && (
                                    <CheckCheck className="h-3 w-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={isSending}
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-6">
              <MessageCircle className="h-12 w-12 opacity-40" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Chat hỗ trợ khách hàng</h3>
            <p className="mt-1 max-w-sm text-sm">
              Chọn một cuộc trò chuyện từ danh sách bên trái hoặc chờ khách hàng
              gửi yêu cầu mới
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
