'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Download,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  User,
  Video,
  Eye,
  X,
  FileText,
  Square,
  Users,
  Building2,
  MessageSquare,
  Pause,
  Play,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { apiClient } from '@/client/api/api-client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'pdf' | 'offer';

interface Message {
  id: number;
  sender: 'customer' | 'expert' | 'organization';
  content: string;
  time: string;
  contentType: MessageType;
  fileName?: string;
  audioUrl?: string | null;
  expertName?: string | undefined;
  isOrganizationReply: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function MessagesPage() {
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string>('all');
  const [messageInput, setMessageInput] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isOrganizationReply, setIsOrganizationReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [organizationExperts, setOrganizationExperts] = useState<any[]>([]);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Offer Modal States
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [menuServices, setMenuServices] = useState<any[]>([]);
  const [offerItems, setOfferItems] = useState<
    Array<{
      serviceId?: string;
      name?: string;
      basePrice?: number;
      discountType?: 'percent' | 'fixed' | null;
      discountValue?: number | null;
      quantity: number;
      durationMinutes?: number;
    }>
  >([]);
  const [offerCurrency, setOfferCurrency] = useState('USD');

  const { user: currentUser } = useAuth();

  // Media Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // File Upload Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedChatRef = useRef<string | null>(null);

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'AUD': return '$';
      case 'USD': return '$';
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Initial Data Fetching & Socket Setup
  useEffect(() => {
    const initPage = async () => {
      try {
        setIsLoading(true);
        const expertsRes = await apiClient<any>(`${API_BASE}/organizations/experts`);
        setOrganizationExperts(expertsRes.experts || []);

        const conversationsRes = await apiClient<any>(`${API_BASE}/organizations/conversations`);
        setAllConversations(conversationsRes.conversations || []);

        const token = localStorage.getItem('access_token');
        if (token && !socketRef.current) {
          const socket = io(`${API_BASE}/chat`, {
            auth: { token },
            transports: ['websocket']
          });

          socket.on('connect', () => {
            console.log('Socket connected');
            if (selectedChatRef.current) {
              socket.emit('join-conversation', { conversationId: selectedChatRef.current });
            }
          });

          socket.on('new-message', (message: any) => {
            console.log("🔥 New message received via socket:", message);
            const currentSelectedChat = selectedChatRef.current;

            if (message.conversationId === currentSelectedChat) {
              setMessages(prev => {
                if (prev.some(m => m._id === message._id)) return prev;

                const optimisticIdx = prev.findIndex(m =>
                  m.status === 'sending' &&
                  m.content === message.content &&
                  m.senderType === message.senderType
                );

                if (optimisticIdx !== -1) {
                  const updated = [...prev];
                  updated[optimisticIdx] = message;
                  return updated;
                }

                return [...prev, message];
              });

              if (message.senderType === 'client') {
                socket.emit('mark-read', { conversationId: currentSelectedChat });
              }
            }

            setAllConversations(prev => prev.map(c => {
              if (c._id === message.conversationId) {
                const isNotSelected = message.conversationId !== currentSelectedChat;
                return {
                  ...c,
                  lastMessage: message.content,
                  lastMessageAt: message.createdAt,
                  unreadCount: isNotSelected ? (c.unreadCount || 0) + 1 : 0
                };
              }
              return c;
            }));
          });

          socket.on('messages-read', (data: any) => {
            if (data.conversationId === selectedChatRef.current) {
              setMessages(prev => prev.map(msg => {
                if (!msg.readBy?.includes(data.readByUserId)) {
                  return { ...msg, readBy: [...(msg.readBy || []), data.readByUserId] };
                }
                return msg;
              }));
            }
          });

          socket.on('offer-updated', (data: any) => {
            if (data.conversationId === selectedChatRef.current) {
              setMessages(prev => prev.map(msg =>
                msg.contentType === 'offer' && msg.payload?.id === data.offerId
                  ? { ...msg, payload: { ...msg.payload, status: data.status } }
                  : msg
              ));
            }
          });

          socketRef.current = socket;
        }
      } catch (error) {
        console.error("Failed to load page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initPage();

    return () => { };
  }, []);

  // Fetch Messages when Chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    socketRef.current?.emit('join-conversation', { conversationId: selectedChat });

    const fetchMessages = async () => {
      try {
        const response = await apiClient<any>(`${API_BASE}/organizations/conversations/${selectedChat}/messages`);
        setMessages(response.messages || []);

        const hasUnread = response.messages?.some((m: any) => m.senderType === 'client' && !m.readBy?.includes(currentUser?.id));
        if (hasUnread) {
          await apiClient(`${API_BASE}/chat/${selectedChat}/read`, {
            method: 'POST',
            body: JSON.stringify({ userType: 'expert' })
          });
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    setAllConversations(prev => prev.map(c =>
      c._id === selectedChat ? { ...c, unreadCount: 0 } : c
    ));

    const interval = setInterval(fetchMessages, 10000);

    return () => {
      clearInterval(interval);
      socketRef.current?.emit('leave-conversation', { conversationId: selectedChat });
    };
  }, [selectedChat, currentUser]);

  const filteredConversations = selectedExpert === 'all'
    ? allConversations
    : allConversations.filter(chat => chat.expertId === selectedExpert);

  const currentChat = selectedChat ? allConversations.find(chat => chat._id === selectedChat) : null;

  // Send Message
  const sendMessage = async (customContent?: string, customType: MessageType = 'text') => {
    const content = customContent || messageInput;
    if (!content.trim() || !selectedChat) return;

    try {
      const payload = {
        content: content,
        contentType: customType,
        senderType: isOrganizationReply ? 'organization' : 'expert',
        recipientId: currentChat?.otherUser?._id,
        recipientType: 'client'
      };

      const tempId = 'temp-' + Date.now();
      const optimisticMsg = {
        _id: tempId,
        conversationId: selectedChat,
        senderType: payload.senderType,
        content: payload.content,
        contentType: payload.contentType,
        createdAt: new Date().toISOString(),
        status: 'sending'
      };

      setMessages(prev => [...prev, optimisticMsg]);
      if (!customContent) setMessageInput('');

      await apiClient<any>(`${API_BASE}/chat/${selectedChat}/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Offer Logic
  const openOfferModal = async () => {
    if (!selectedChat) return;
    setIsOfferOpen(true);
    try {
      const res = await apiClient<any>(`${API_BASE}/organizations/services`);
      setMenuServices(res.services || []);
    } catch (error) {
      console.error('Failed to load services menu:', error);
      setMenuServices([]);
    }
  };

  const addServiceToOffer = (serviceId: string) => {
    setOfferItems((prev) => {
      const idx = prev.findIndex((x) => x.serviceId === serviceId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      const svc = menuServices.find((s: any) => s.id === serviceId);
      return [...prev, { serviceId, quantity: 1, durationMinutes: svc?.durationMinutes || 0 }];
    });
  };

  const removeServiceFromOffer = (serviceId: string) => {
    setOfferItems((prev) => {
      const idx = prev.findIndex((x) => x.serviceId === serviceId);
      if (idx === -1) return prev;
      const item = prev[idx];
      if (item.quantity > 1) {
        const next = [...prev];
        next[idx] = { ...item, quantity: item.quantity - 1 };
        return next;
      }
      return prev.filter((x) => x.serviceId !== serviceId);
    });
  };

  const addCustomItem = () => {
    setOfferItems((prev) => [...prev, { name: '', basePrice: 0, discountType: null, discountValue: null, quantity: 1, durationMinutes: 30 }]);
  };

  const updateCustomItem = (
    index: number,
    patch: Partial<{
      serviceId?: string;
      name?: string;
      basePrice?: number;
      discountType?: 'percent' | 'fixed' | null;
      discountValue?: number | null;
      quantity: number;
      durationMinutes?: number;
    }>,
  ) => {
    setOfferItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const sendOffer = async () => {
    if (!selectedChat) return;
    const items = offerItems
      .map((it) => {
        if (it.serviceId) return { serviceId: it.serviceId, quantity: it.quantity, durationMinutes: it.durationMinutes };
        if (!it.name) return null;
        return {
          name: it.name,
          basePrice: Number(it.basePrice || 0),
          discountType: it.discountType || null,
          discountValue: it.discountValue === null || it.discountValue === undefined ? null : Number(it.discountValue),
          quantity: it.quantity,
          durationMinutes: it.durationMinutes || 0,
        };
      })
      .filter(Boolean);

    if (items.length === 0) return;

    try {
      await apiClient<any>(`${API_BASE}/chat/${selectedChat}/send-offer`, {
        method: 'POST',
        body: JSON.stringify({ currency: offerCurrency, items }),
      });
      setIsOfferOpen(false);
      setOfferItems([]);
    } catch (error) {
      console.error('Failed to send offer:', error);
    }
  };

  // Media Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.fileUrl) {
        await sendMessage(res.fileUrl, type);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
            method: 'POST',
            body: formData
          });
          if (res.fileUrl) {
            await sendMessage(res.fileUrl, 'audio');
          }
        } catch (error) {
          console.error("Failed to upload audio:", error);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExpertSelect = (expertId: string) => {
    setSelectedExpert(expertId);
    setSelectedChat(null);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[var(--card-bg-light)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-4rem)] bg-[var(--card-bg-light)]">
      <div className="flex h-full gap-3 p-3">
        {/* Left Panel - Expert List */}
        <div className="w-80 border rounded-2xl p-2 shadow-[2px_2px_4px_var(--primary-start)] bg-[var(--card-bg-light)] flex flex-col">
          <div className="p-4 border-b border-zinc-200">
            <h2 className="text-2xl font-bold mb-4">Experts</h2>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                className="pl-8 bg-white border-zinc-200"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-hide py-2">
            <div
              className={`p-4 mx-2 rounded-xl cursor-pointer hover:bg-[var(--card-bg)] transition-colors mb-2 ${selectedExpert === 'all' ? 'bg-[var(--card-bg)] shadow-sm' : ''
                }`}
              onClick={() => handleExpertSelect('all')}
            >
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-[var(--primary-start)]/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-[var(--primary-end)]" />
                </div>
                <div>
                  <p className="font-medium">All Conversations</p>
                  <p className="text-sm text-muted-foreground">{allConversations.length} total chats</p>
                </div>
              </div>
            </div>

            {organizationExperts.map((expert) => (
              <div
                key={expert.id}
                className={`p-4 mx-2 rounded-xl cursor-pointer hover:bg-[var(--card-bg)] transition-colors mb-2 ${selectedExpert === expert.id ? 'bg-[var(--card-bg)] shadow-sm' : ''
                  }`}
                onClick={() => handleExpertSelect(expert.id)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert.profileImage} />
                    <AvatarFallback>
                      {expert.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expert.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{expert.specialty || expert.specialization}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {allConversations.filter(c => c.expertId === expert.id).length} chats
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section - Chat Conversation */}
        <div className="flex-1 flex flex-col border rounded-2xl border-[var(--primary-start)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-[var(--card-bg-light)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChat.otherUser?.profilePicture} />
                      <AvatarFallback>
                        {currentChat.otherUser?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentChat.otherUser?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Conversation ID: {currentChat._id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className='flex gap-2 mr-2'>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openOfferModal}
                        disabled={!selectedChat}
                        className="bg-white hover:bg-zinc-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Give Offer
                      </Button>
                      {offerItems.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOfferItems([])}
                          className="bg-white hover:bg-zinc-50"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Clear Offer
                        </Button>
                      )}
                    </div>

                    <Button size="sm" variant="outline" className="bg-white">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      <Video className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => setOpenDropdownId(openDropdownId === currentChat._id ? null : currentChat._id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {openDropdownId === currentChat._id && (
                        <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                          <div className="px-1 py-1 text-sm text-gray-700">
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <Eye className="mr-2 h-4 w-4" />
                              View Expert Profile
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <Paperclip className="mr-2 h-4 w-4" />
                              Send PDF File
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded" onClick={startRecording}>
                              <Mic className="mr-2 h-4 w-4" />
                              Send Audio Message
                            </div>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded text-orange-600">
                              <X className="mr-2 h-4 w-4" />
                              Decline Request
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Block User
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--card-bg-light)]">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSystem = message.senderType === 'system';
                    const isFromMe = message.senderType === 'organization' || message.senderType === 'expert';
                    const isRead = message.readBy?.length > 1;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isFromMe ? 'items-end' : 'items-start'} flex flex-col space-y-1`}>

                          {message.senderType === 'organization' && (
                            <div className={`flex items-center space-x-1 mb-1 text-xs text-muted-foreground`}>
                              <Building2 className="h-3 w-3" />
                              <span>Sent by Organization</span>
                            </div>
                          )}

                          <div
                            className={`px-4 py-2 relative rounded-2xl text-sm ${isFromMe
                                ? 'bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] text-white rounded-tr-none'
                                : 'bg-white border border-zinc-200 rounded-tl-none shadow-sm text-zinc-800'
                              }`}
                          >
                            <div className="space-y-1">
                              {message.contentType === 'image' ? (
                                <img
                                  src={message.content}
                                  alt="Shared image"
                                  className="rounded-lg max-w-[280px] max-h-[350px] object-cover cursor-pointer hover:opacity-90 shadow-sm border border-white/10"
                                  onClick={() => window.open(message.content, '_blank')}
                                />
                              ) : message.contentType === 'video' ? (
                                <video
                                  src={message.content}
                                  controls
                                  className="rounded-lg max-w-[400px] h-auto shadow-sm border border-white/10"
                                />
                              ) : message.contentType === 'audio' ? (
                                <div className="flex items-center space-x-2 min-w-[200px]">
                                  <audio src={message.content} controls className="h-10 w-full" />
                                </div>
                              ) : message.contentType === 'pdf' ? (
                                <div className={`flex items-center space-x-2 p-2 rounded-lg ${isFromMe ? 'bg-white/20' : 'bg-zinc-100'}`}>
                                  <FileText className="h-8 w-8" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">Document.pdf</p>
                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => window.open(message.content, '_blank')}>
                                      <Download className="h-3 w-3 mr-1" /> Download
                                    </Button>
                                  </div>
                                </div>
                              ) : message.contentType === 'offer' ? (
                                <div className={`rounded-lg p-3 min-w-[260px] ${isFromMe ? 'bg-white/10' : 'bg-zinc-100'}`}>
                                  <p className="text-xs font-semibold mb-2 opacity-90">Offer Details</p>
                                  <div className="space-y-2">
                                    {(message.payload?.items || []).map((it: any) => (
                                      <div key={it.id || it.nameSnapshot} className="flex items-start justify-between gap-2 text-xs">
                                        <div className="min-w-0">
                                          <p className="font-medium truncate">{it.nameSnapshot}</p>
                                          <p className="text-[10px] opacity-80">
                                            Qty {it.quantity} · ${Number(it.finalPriceSnapshot).toFixed(2)}
                                          </p>
                                        </div>
                                        <p className="font-semibold">
                                          ${(Number(it.finalPriceSnapshot) * Number(it.quantity || 1)).toFixed(2)}
                                        </p>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs">
                                      <span className="opacity-80">Total</span>
                                      <span className="font-bold text-sm">
                                        {message.payload?.currency || 'USD'} ${Number(message.payload?.total || 0).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] opacity-80 mt-1">
                                      <span>Status</span>
                                      <span className="uppercase font-bold tracking-wider">{message.payload?.status || 'sent'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <p className={`text-[10px] ${isFromMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {isFromMe && (
                                <div className="flex items-center">
                                  {isRead ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-sky-200">
                                      <path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white/50">
                                      <path d="M18 6 7 17l-5-5" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-[var(--card-bg)] space-y-3">
                <div className='flex justify-between items-center'>
                  <div className="flex items-center space-x-3 p-2 px-3 bg-[var(--card-bg-light)] rounded-lg border border-zinc-200">
                    <input
                      type="checkbox"
                      id="org-reply"
                      checked={isOrganizationReply}
                      onChange={(e) => setIsOrganizationReply(e.target.checked)}
                      className="rounded border-zinc-300 accent-[var(--primary-end)] w-4 h-4"
                    />
                    <label htmlFor="org-reply" className="text-sm font-medium flex items-center space-x-2 cursor-pointer text-zinc-700">
                      <Building2 className="h-4 w-4" />
                      <span>Reply as Organization</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="file"
                      ref={imageInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-[var(--primary-end)] hover:bg-[var(--primary-start)]/10"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-[var(--primary-end)] hover:bg-[var(--primary-start)]/10"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1 border border-zinc-200 shadow-sm">
                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-sm font-medium text-red-500">Recording... {formatTime(recordingTime)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={stopRecording}
                        >
                          <Square className="h-4 w-4 mr-1 fill-red-500" /> Stop & Send
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder="Type your message here..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none px-2"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0 text-muted-foreground hover:text-[var(--primary-end)]"
                          onClick={startRecording}
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {!isRecording && (
                    <Button
                      onClick={() => sendMessage()}
                      className="px-5 shadow-sm bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] hover:opacity-90 text-white border-none"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm p-6">
                <div className="bg-[var(--primary-start)]/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-[var(--primary-start)]/20">
                  <MessageSquare className="h-10 w-10 text-[var(--primary-end)]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-zinc-800">Customer Communications</h3>
                <p className="text-muted-foreground">
                  Select an expert on the left and then pick a conversation on the right to view customer messages and provide support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Expert Chats */}
        <div className="w-80 border rounded-2xl p-2 shadow-[2px_2px_4px_var(--primary-start)] bg-[var(--card-bg-light)] flex flex-col">
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-lg font-bold mb-4 truncate text-zinc-800">
              {selectedExpert === 'all' ? 'All Recent' : organizationExperts.find(e => e.id === selectedExpert)?.name?.split(' ')[1] || 'Expert'} Chats
            </h3>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-8 bg-white border-zinc-200"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-hide py-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 mx-2 rounded-xl cursor-pointer hover:bg-[var(--card-bg)] transition-colors relative mb-2 border border-transparent ${selectedChat === conversation._id ? 'bg-[var(--card-bg)] border-[var(--primary-start)]/50 shadow-sm' : ''
                    }`}
                  onClick={() => handleChatSelect(conversation._id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.otherUser?.profilePicture} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600">
                        {conversation.otherUser?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate text-sm text-zinc-800">{conversation.otherUser?.name}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(conversation.lastMessageAt).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate italic mt-0.5">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 opacity-80 bg-white">
                          {selectedExpert === 'all' && (
                            <span className="mr-1">
                              to {organizationExperts.find(e => e.id === conversation.expertId)?.name?.split(' ')[1] || 'Expert'}
                            </span>
                          )}
                        </Badge>
                        {conversation.unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] rounded-full bg-[var(--primary-end)] border-none">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No conversations found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
        <DialogContent className="max-w-2xl bg-[var(--card-bg-light)]">
          <DialogHeader>
            <DialogTitle>Select services for the offer</DialogTitle>
            <DialogDescription>
              Add from your service menu, or create a one-off custom service for emergencies.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Service menu</p>
                <div className="w-28">
                  <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border bg-white rounded-xl max-h-[340px] overflow-y-auto">
                {menuServices.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No services found.</div>
                ) : (
                  menuServices.map((svc: any) => {
                    const selected = offerItems.find((x) => x.serviceId === svc.id);
                    return (
                      <div key={svc.id} className="flex items-center justify-between gap-3 p-3 border-b last:border-b-0 hover:bg-zinc-50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">{getCurrencySymbol(offerCurrency)}{Number(svc.basePrice || 0).toFixed(2)} {svc.durationMinutes ? `• ${svc.durationMinutes}m` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-md" onClick={() => removeServiceFromOffer(svc.id)} disabled={!selected}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          {selected ? (
                            <span className="text-sm font-medium w-3 text-center">{selected.quantity}</span>
                          ) : (
                            <span className="text-sm font-medium w-3 text-center opacity-0">0</span>
                          )}
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-md bg-[var(--primary-start)]/10 text-[var(--primary-end)] hover:bg-[var(--primary-start)]/20 border-none" onClick={() => addServiceToOffer(svc.id)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Button variant="outline" className="w-full bg-white border-dashed" onClick={addCustomItem}>
                <Plus className="h-4 w-4 mr-2 text-zinc-500" /> Create New Service
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Offer items</p>
              <div className="border bg-white rounded-xl p-3 space-y-3 max-h-[380px] overflow-y-auto">
                {offerItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center flex flex-col items-center">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    Nothing selected yet.
                  </div>
                ) : (
                  offerItems.map((it, idx) => {
                    if (it.serviceId) {
                      const svc = menuServices.find((s: any) => s.id === it.serviceId);
                      return (
                        <div key={`${it.serviceId}_${idx}`} className="flex items-center justify-between gap-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{svc?.name || 'Service'}</p>
                            <p className="text-xs text-muted-foreground">Qty {it.quantity} • {it.durationMinutes}m</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-white" onClick={() => removeServiceFromOffer(it.serviceId!)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-white" onClick={() => addServiceToOffer(it.serviceId!)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={`custom_${idx}`} className="border rounded-xl p-4 space-y-4 bg-zinc-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Service name</Label>
                            <Input
                              className="bg-white h-8"
                              value={it.name || ''}
                              onChange={(e) => updateCustomItem(idx, { name: e.target.value })}
                              placeholder="Custom service name"
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setOfferItems(prev => prev.filter((_, i) => i !== idx))}
                            className="mt-5 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Price ({getCurrencySymbol(offerCurrency)})</Label>
                            <Input
                              className="bg-white h-8"
                              type="number"
                              step="0.01"
                              value={it.basePrice ?? 0}
                              onChange={(e) => updateCustomItem(idx, { basePrice: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Duration</Label>
                            <Input
                              className="bg-white h-8"
                              type="number"
                              value={it.durationMinutes ?? 30}
                              onChange={(e) => updateCustomItem(idx, { durationMinutes: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Quantity</Label>
                            <Input
                              className="bg-white h-8"
                              type="number"
                              value={it.quantity}
                              onChange={(e) => updateCustomItem(idx, { quantity: Math.max(1, Number(e.target.value || 1)) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-200 mt-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Discount</Label>
                            <Select
                              value={it.discountType || 'none'}
                              onValueChange={(v) => updateCustomItem(idx, { discountType: v === 'none' ? null : (v as any) })}
                            >
                              <SelectTrigger className="bg-white h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="percent">Percent (%)</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-zinc-600">Value</Label>
                            <Input
                              className="bg-white h-8"
                              type="number"
                              step="0.01"
                              value={it.discountValue ?? ''}
                              onChange={(e) => updateCustomItem(idx, { discountValue: e.target.value === '' ? null : Number(e.target.value) })}
                              disabled={!it.discountType}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendOffer}
              disabled={offerItems.length === 0}
              className="bg-gradient-to-r from-[var(--primary-start)] to-[var(--primary-end)] hover:opacity-90 text-white border-none"
            >
              Confirm Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}