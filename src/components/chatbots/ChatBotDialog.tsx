import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { chatWithBot } from '@/services/chatbot.service';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Format message with markdown-like syntax
const formatMessage = (text: string) => {
  // Split by newlines first
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Parse bold text **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    
    const formattedParts = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        return (
          <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <span key={lineIndex}>
        {formattedParts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

export default function ChatBotDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithBot({
        sessionId: user.id || '',
        message: userMessage.content,
      });

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: response.data || 'Xin lỗi, tôi không thể xử lý yêu cầu này.',
        sender: 'bot',  
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        content: 'Đã xảy ra lỗi khi kết nối với chatbot. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
          'hover:scale-110 active:scale-95',
          isOpen && 'rotate-90'
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Dialog */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]',
            'rounded-2xl border bg-background shadow-2xl',
            'animate-in slide-in-from-bottom-5 fade-in duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-t-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Meta Cinema Assistant</h3>
              <p className="text-xs text-white/80">Hỗ trợ trực tuyến 24/7</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="h-80 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-3 text-amber-500" />
                <p className="font-medium">Xin chào! 👋</p>
                <p className="text-sm">Tôi có thể giúp gì cho bạn hôm nay?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2',
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-amber-500 text-white'
                      )}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      )}
                    >
                      {message.sender === 'bot' 
                        ? formatMessage(message.content) 
                        : message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang nhập...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
