'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, User, Loader2, MessageSquare } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface EmployerStudentChatProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  onClose?: () => void;
}

export default function EmployerStudentChat({
  currentUserId,
  otherUserId,
  otherUserName,
  onClose,
}: EmployerStudentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch (error) {
      console.error('Supabase client error:', error);
      setIsLoading(false);
      return;
    }

    async function initializeChat() {
      setIsLoading(true);

      try {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('*')
          .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`)
          .single();

        let convId: string;

        if (existingConv) {
          convId = existingConv.id;
        } else {
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              participant1_id: currentUserId,
              participant2_id: otherUserId,
            })
            .select()
            .single();

          if (convError) throw convError;
          convId = newConv.id;
        }

        setConversationId(convId);

        const { data: msgs, error: msgsError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (msgsError) throw msgsError;
        setMessages(msgs || []);

        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', convId)
          .eq('receiver_id', currentUserId)
          .eq('is_read', false);
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeChat();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    if (!conversationId) return;

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch {
      return;
    }

    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, newMsg]);
            
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const createNotification = useCallback(async (supabaseArg: SupabaseClient, receiverId: string, senderName: string, message: string) => {
    try {
      const { error } = await supabaseArg
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          title: `New message from ${senderName}`,
          content: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          is_read: false,
        });

      if (error) {
        console.error('Error creating notification:', error);
      } else {
        console.log('✅ Notification created for student!');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch {
      console.error('Failed to get Supabase client');
      return;
    }
    
    if (!newMessage.trim() || !conversationId) return;

    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content: newMessage.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setNewMessage('');

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      await createNotification(supabase, otherUserId, 'Employer', newMessage.trim());
      
      console.log('✅ Message sent and notification triggered!');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-cyan)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{otherUserName}</h3>
            <p className="text-white/70 text-xs">Online</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-[var(--bg-primary)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-10 h-10 text-[var(--text-muted)] mb-2" />
            <p className="text-[var(--text-secondary)] text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    isOwnMessage
                      ? 'bg-[var(--accent-blue)] text-white rounded-br-none'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-white/70' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-[var(--accent-blue)] hover:opacity-90 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ChatButtonProps {
  candidateId: string;
  candidateName: string;
  currentUserId: string;
}

export function ChatButton({ candidateId, candidateName, currentUserId }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 py-2 bg-[var(--accent-blue)] hover:opacity-90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
      >
        <MessageSquare size={16} />
        Contact
      </button>
      {isOpen && (
        <EmployerStudentChat
          currentUserId={currentUserId}
          otherUserId={candidateId}
          otherUserName={candidateName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
