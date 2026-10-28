import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  context?: any;
}

export function AIChat({ context }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your EaziBook AI Financial & Business Consultant. I can help you with accounting, tax compliance, inventory management, payroll, and business strategy. How can I assist you today?\n\n⚠️ Note: AI features require Supabase Edge Functions to be deployed with OpenAI API integration. Until then, I can provide limited assistance.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const [edgeFunctionsAvailable] = useState(false); // Set to true when Edge Functions are deployed
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const tryExample = () => {
    setInputMessage("What are the key financial metrics I should track for my business?");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      if (!edgeFunctionsAvailable) {
        // Provide a helpful response without throwing error
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I cannot process your request at the moment. The AI Chat feature requires Supabase Edge Functions to be deployed with OpenAI API integration.\n\nTo enable this feature, please:\n1. Deploy the Supabase Edge Functions\n2. Configure your OpenAI API key\n3. Refer to SUPABASE_SETUP_GUIDE.md for detailed instructions\n\nIn the meantime, you can use the other features of EaziBook for your accounting and business management needs.',
          timestamp: new Date()
        }]);
        return;
      }

      // TODO: Uncomment when Edge Functions are deployed
      // const { data, error } = await supabase.functions.invoke('ai-chatbot', {
      //   body: { 
      //     message: inputMessage,
      //     conversationId,
      //     context 
      //   }
      // });
      // 
      // if (error) throw error;
      // setMessages(prev => [...prev, {
      //   role: 'assistant',
      //   content: data.response,
      //   timestamp: new Date()
      // }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      setError('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Open AI Chat"
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-80 h-16' 
          : 'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div>
            <h3 className="font-medium">AI Consultant</h3>
            <p className="text-xs opacity-90">Powered by OpenAI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[calc(100%-140px)] overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white rounded-b-lg">
            {messages.length === 1 && (
              <div className="mb-2">
                <button
                  onClick={tryExample}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Try an example question
                </button>
              </div>
            )}
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your business..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}