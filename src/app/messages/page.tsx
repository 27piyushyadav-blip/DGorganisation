'use client';

import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Ban,
  Building2,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Square,
  Users,
  Video,
  X,
} from 'lucide-react';

import { apiClient } from '@/client/api/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'pdf' | 'offer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedChatRef = useRef<string | null>(null);

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'AUD':
        return '$';
      case 'USD':
        return '$';
      case 'INR':
        return '₹';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
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

  useEffect(() => {
    const initPage = async () => {
      try {
        setIsLoading(true);

        const expertsRes = await apiClient<any>(
          `${API_BASE}/organizations/experts`
        );
        setOrganizationExperts(expertsRes.experts || []);

        const conversationsRes = await apiClient<any>(
          `${API_BASE}/organizations/conversations`
        );
        setAllConversations(conversationsRes.conversations || []);

        const token = localStorage.getItem('access_token');

        if (token && !socketRef.current) {
          const socket = io(`${API_BASE}/chat`, {
            auth: { token },
            transports: ['websocket'],
          });

          socket.on('connect', () => {
            console.log('Socket connected');

            if (selectedChatRef.current) {
              socket.emit('join-conversation', {
                conversationId: selectedChatRef.current,
              });
            }
          });

          socket.on('new-message', (message: any) => {
            console.log('🔥 New message received via socket:', message);

            const currentSelectedChat = selectedChatRef.current;

            if (message.conversationId === currentSelectedChat) {
              setMessages((prev) => {
                if (prev.some((m) => m._id === message._id)) return prev;

                const optimisticIdx = prev.findIndex(
                  (m) =>
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
                socket.emit('mark-read', {
                  conversationId: currentSelectedChat,
                });
              }
            }

            setAllConversations((prev) =>
              prev.map((conversation) => {
                if (conversation._id === message.conversationId) {
                  const isNotSelected =
                    message.conversationId !== currentSelectedChat;

                  return {
                    ...conversation,
                    lastMessage: message.content,
                    lastMessageAt: message.createdAt,
                    unreadCount: isNotSelected
                      ? (conversation.unreadCount || 0) + 1
                      : 0,
                  };
                }

                return conversation;
              })
            );
          });

          socket.on('messages-read', (data: any) => {
            if (data.conversationId === selectedChatRef.current) {
              setMessages((prev) =>
                prev.map((message) => {
                  if (!message.readBy?.includes(data.readByUserId)) {
                    return {
                      ...message,
                      readBy: [...(message.readBy || []), data.readByUserId],
                    };
                  }

                  return message;
                })
              );
            }
          });

          socket.on('offer-updated', (data: any) => {
            if (data.conversationId === selectedChatRef.current) {
              setMessages((prev) =>
                prev.map((message) =>
                  message.contentType === 'offer' &&
                  message.payload?.id === data.offerId
                    ? {
                        ...message,
                        payload: {
                          ...message.payload,
                          status: data.status,
                        },
                      }
                    : message
                )
              );
            }
          });

          socketRef.current = socket;
        }
      } catch (error) {
        console.error('Failed to load page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void initPage();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    socketRef.current?.emit('join-conversation', {
      conversationId: selectedChat,
    });

    const fetchMessages = async () => {
      try {
        const response = await apiClient<any>(
          `${API_BASE}/organizations/conversations/${selectedChat}/messages`
        );

        setMessages(response.messages || []);

        const hasUnread = response.messages?.some(
          (message: any) =>
            message.senderType === 'client' &&
            !message.readBy?.includes(currentUser?.id)
        );

        if (hasUnread) {
          await apiClient(`${API_BASE}/chat/${selectedChat}/read`, {
            method: 'POST',
            body: JSON.stringify({ userType: 'expert' }),
          });
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    void fetchMessages();

    setAllConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === selectedChat
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );

    const interval = setInterval(fetchMessages, 10000);

    return () => {
      clearInterval(interval);

      socketRef.current?.emit('leave-conversation', {
        conversationId: selectedChat,
      });
    };
  }, [selectedChat, currentUser]);

  const filteredConversations =
    selectedExpert === 'all'
      ? allConversations
      : allConversations.filter((chat) => chat.expertId === selectedExpert);

  const currentChat = selectedChat
    ? allConversations.find((chat) => chat._id === selectedChat)
    : null;

  const sendMessage = async (
    customContent?: string,
    customType: MessageType = 'text'
  ) => {
    const content = customContent || messageInput;

    if (!content.trim() || !selectedChat) return;

    try {
      const payload = {
        content,
        contentType: customType,
        senderType: isOrganizationReply ? 'organization' : 'expert',
        recipientId: currentChat?.otherUser?._id,
        recipientType: 'client',
      };

      const tempId = `temp-${Date.now()}`;

      const optimisticMsg = {
        _id: tempId,
        conversationId: selectedChat,
        senderType: payload.senderType,
        content: payload.content,
        contentType: payload.contentType,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      if (!customContent) {
        setMessageInput('');
      }

      await apiClient<any>(`${API_BASE}/chat/${selectedChat}/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

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
      const idx = prev.findIndex((item) => item.serviceId === serviceId);

      if (idx !== -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + 1,
        };
        return next;
      }

      const svc = menuServices.find((service: any) => service.id === serviceId);

      return [
        ...prev,
        {
          serviceId,
          quantity: 1,
          durationMinutes: svc?.durationMinutes || 0,
        },
      ];
    });
  };

  const removeServiceFromOffer = (serviceId: string) => {
    setOfferItems((prev) => {
      const idx = prev.findIndex((item) => item.serviceId === serviceId);

      if (idx === -1) return prev;

      const item = prev[idx];

      if (item.quantity > 1) {
        const next = [...prev];
        next[idx] = {
          ...item,
          quantity: item.quantity - 1,
        };
        return next;
      }

      return prev.filter((item) => item.serviceId !== serviceId);
    });
  };

  const addCustomItem = () => {
    setOfferItems((prev) => [
      ...prev,
      {
        name: '',
        basePrice: 0,
        discountType: null,
        discountValue: null,
        quantity: 1,
        durationMinutes: 30,
      },
    ]);
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
    }>
  ) => {
    setOfferItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    );
  };

  const sendOffer = async () => {
    if (!selectedChat) return;

    const items = offerItems
      .map((item) => {
        if (item.serviceId) {
          return {
            serviceId: item.serviceId,
            quantity: item.quantity,
            durationMinutes: item.durationMinutes,
          };
        }

        if (!item.name) return null;

        return {
          name: item.name,
          basePrice: Number(item.basePrice || 0),
          discountType: item.discountType || null,
          discountValue:
            item.discountValue === null || item.discountValue === undefined
              ? null
              : Number(item.discountValue),
          quantity: item.quantity,
          durationMinutes: item.durationMinutes || 0,
        };
      })
      .filter(Boolean);

    if (items.length === 0) return;

    try {
      await apiClient<any>(`${API_BASE}/chat/${selectedChat}/send-offer`, {
        method: 'POST',
        body: JSON.stringify({
          currency: offerCurrency,
          items,
        }),
      });

      setIsOfferOpen(false);
      setOfferItems([]);
    } catch (error) {
      console.error('Failed to send offer:', error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: MessageType
  ) => {
    const file = event.target.files?.[0];

    if (!file || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.fileUrl) {
        await sendMessage(res.fileUrl, type);
      }

      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        const file = new File([audioBlob], 'voice-message.webm', {
          type: 'audio/webm',
        });

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
            method: 'POST',
            body: formData,
          });

          if (res.fileUrl) {
            await sendMessage(res.fileUrl, 'audio');
          }
        } catch (error) {
          console.error('Failed to upload audio:', error);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
      <div className="flex h-full items-center justify-center bg-[var(--card-bg-light)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-4rem)] bg-[var(--card-bg-light)]">
      <div className="flex h-full gap-3 p-3">
        {/* Left Panel - Expert List */}
        <div className="w-80 border rounded-2xl p-2 shadow-[2px_2px_4px_var(--primary-start)] bg-[var(--card-bg-light)]">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold mb-4">Experts</h2>

            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input placeholder="Search chats..." className="pl-8" />
            </div>
          </div>

          <div className="overflow-y-auto">
            <div
              className={`p-4 border-b cursor-pointer hover:bg-[var(--card-bg)] transition-colors rounded-xl ${
                selectedExpert === 'all' ? 'bg-[var(--card-bg)]' : ''
              }`}
              onClick={() => handleExpertSelect('all')}
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-medium">All Conversations</p>
                  <p className="text-sm text-muted-foreground">
                    {allConversations.length} total chats
                  </p>
                </div>
              </div>
            </div>

            {organizationExperts.map((expert) => (
              <div
                key={expert.id}
                className={`p-4 border-b cursor-pointer hover:bg-[var(--card-bg)] transition-colors rounded-xl ${
                  selectedExpert === expert.id ? 'bg-[var(--card-bg)]' : ''
                }`}
                onClick={() => handleExpertSelect(expert.id)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={expert.profileImage} />
                    <AvatarFallback>
                      {expert.name
                        ?.split(' ')
                        .map((namePart: string) => namePart[0])
                        .join('') || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expert.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {expert.specialization}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {
                          allConversations.filter(
                            (conversation) =>
                              conversation.expertId === expert.id
                          ).length
                        }{' '}
                        chats
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {organizationExperts.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No experts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Chat Conversation */}
        <div className="flex-1 flex flex-col border rounded-2xl p-2 border-[var(--primary-start)] bg-[var(--card-bg)]">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChat.otherUser?.profilePicture} />
                      <AvatarFallback>
                        {currentChat.otherUser?.name
                          ?.split(' ')
                          .map((namePart: string) => namePart[0])
                          .join('') || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">
                        {currentChat.otherUser?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Conversation ID: {currentChat._id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={openOfferModal}
                      disabled={!selectedChat}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Give Offer
                    </Button>

                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>

                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === currentChat._id
                              ? null
                              : currentChat._id
                          )
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {openDropdownId === currentChat._id && (
                        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                          <div className="px-1 py-1 text-sm text-gray-700">
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <Eye className="mr-2 h-4 w-4" />
                              View Customer Profile
                            </div>

                            <div
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => imageInputRef.current?.click()}
                            >
                              <Paperclip className="mr-2 h-4 w-4" />
                              Send Image
                            </div>

                            <div
                              className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={startRecording}
                            >
                              <Mic className="mr-2 h-4 w-4" />
                              Send Audio Message
                            </div>

                            <div className="border-t border-gray-100 my-1" />

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
                    const isFromMe =
                      message.senderType === 'organization' ||
                      message.senderType === 'expert';

                    const isRead = message.readBy?.length > 1;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isFromMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            isFromMe ? 'items-end' : 'items-start'
                          } flex flex-col`}
                        >
                          <div
                            className={`px-4 py-2 relative rounded-2xl text-sm ${
                              isFromMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white border rounded-tl-none shadow-sm'
                            }`}
                          >
                            <div className="space-y-1">
                              {message.senderType === 'organization' && (
                                <div className="flex items-center space-x-1 mb-1 text-[10px] opacity-80 uppercase font-bold tracking-wider">
                                  <Building2 className="h-3 w-3" />
                                  <span>Organization Reply</span>
                                </div>
                              )}

                              {message.contentType === 'image' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={message.content}
                                  alt="Shared image"
                                  className="rounded-lg max-w-[280px] max-h-[350px] object-cover cursor-pointer hover:opacity-90 shadow-sm border border-white/10"
                                  onClick={() =>
                                    window.open(message.content, '_blank')
                                  }
                                />
                              ) : message.contentType === 'video' ? (
                                <video
                                  src={message.content}
                                  controls
                                  className="rounded-lg max-w-[400px] h-auto shadow-sm border border-white/10"
                                />
                              ) : message.contentType === 'audio' ? (
                                <div className="flex items-center space-x-2 min-w-[200px]">
                                  <audio
                                    src={message.content}
                                    controls
                                    className="h-8 w-full"
                                  />
                                </div>
                              ) : message.contentType === 'pdf' ? (
                                <div className="flex items-center space-x-2 p-2 bg-black/5 rounded-lg">
                                  <FileText className="h-8 w-8 text-red-500" />

                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      Document.pdf
                                    </p>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-[10px]"
                                      onClick={() =>
                                        window.open(message.content, '_blank')
                                      }
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ) : message.contentType === 'offer' ? (
                                <div
                                  className={`rounded-lg p-3 ${
                                    isFromMe ? 'bg-primary/10' : 'bg-muted'
                                  } min-w-[260px]`}
                                >
                                  <p className="text-xs font-semibold mb-2">
                                    Offer
                                  </p>

                                  <div className="space-y-2">
                                    {(message.payload?.items || []).map(
                                      (item: any) => (
                                        <div
                                          key={item.id || item.nameSnapshot}
                                          className="flex items-start justify-between gap-2 text-xs"
                                        >
                                          <div className="min-w-0">
                                            <p className="font-medium truncate">
                                              {item.nameSnapshot}
                                            </p>
                                            <p className="text-[10px] opacity-80">
                                              Qty {item.quantity} · $
                                              {Number(
                                                item.finalPriceSnapshot
                                              ).toFixed(2)}
                                            </p>
                                          </div>

                                          <p className="font-semibold">
                                            $
                                            {(
                                              Number(
                                                item.finalPriceSnapshot
                                              ) *
                                              Number(item.quantity || 1)
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                      )
                                    )}

                                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                                      <span className="opacity-80">Total</span>
                                      <span className="font-bold">
                                        {message.payload?.currency || 'USD'} $
                                        {Number(
                                          message.payload?.total || 0
                                        ).toFixed(2)}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] opacity-80">
                                      <span>Status</span>
                                      <span className="uppercase">
                                        {message.payload?.status || 'sent'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p>{message.content}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <p
                                className={`text-[10px] ${
                                  isFromMe
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </p>

                              {isFromMe && (
                                <div className="flex items-center">
                                  {isRead ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-3 w-3 text-sky-300"
                                    >
                                      <path d="M18 6 7 17l-5-5" />
                                      <path d="m22 10-7.5 7.5L13 16" />
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-3 w-3 text-primary-foreground/50"
                                    >
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
              <div className="p-4 border-t space-y-3 bg-[var(--card-bg)] rounded-b-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-4 p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-300 flex-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="org-reply"
                        checked={isOrganizationReply}
                        onChange={(event) =>
                          setIsOrganizationReply(event.target.checked)
                        }
                        className="rounded border-zinc-300 accent-primary w-4 h-4"
                      />

                      <label
                        htmlFor="org-reply"
                        className="text-sm font-semibold flex items-center space-x-2 cursor-pointer"
                      >
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>Official Organization Response</span>
                      </label>
                    </div>

                    <p className="text-xs text-muted-foreground flex-1 italic">
                      {isOrganizationReply
                        ? 'Messages will be marked as coming from the dashboard admin level.'
                        : 'Messages will be sent as standard expert communication.'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openOfferModal}
                    disabled={!selectedChat}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Give Offer
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="file"
                      ref={imageInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(event) => handleFileUpload(event, 'image')}
                    />

                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-primary"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={(event) => handleFileUpload(event, 'video')}
                    />

                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-primary"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 flex items-center bg-zinc-100 rounded-lg px-3 py-1 border border-zinc-200">
                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-sm font-medium text-red-500">
                            Recording... {formatTime(recordingTime)}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={stopRecording}
                        >
                          <Square className="h-4 w-4 mr-1 fill-red-500" />
                          Stop & Send
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder="Type your message here..."
                          value={messageInput}
                          onChange={(event) =>
                            setMessageInput(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              void sendMessage();
                            }
                          }}
                          className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none"
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0 text-muted-foreground hover:text-primary"
                          onClick={startRecording}
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {!isRecording && (
                    <Button
                      onClick={() => void sendMessage()}
                      className="px-5 shadow-sm"
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
                <div className="bg-primary/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-primary/10">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-2">
                  Customer Communications
                </h3>

                <p className="text-muted-foreground">
                  Select an expert on the left and then pick a conversation to
                  view customer messages and provide support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Conversations */}
        <div className="w-80 border rounded-2xl p-2 shadow-[-2px_2px_4px_var(--primary-start)] bg-[var(--card-bg-light)]">
          <div className="p-4 border-b">
            <h3 className="text-2xl font-bold mb-4">
              {selectedExpert === 'all'
                ? 'All Recent'
                : `${
                    organizationExperts
                      .find((expert) => expert.id === selectedExpert)
                      ?.name?.split(' ')[0] || 'Expert'
                  } Chats`}
            </h3>

            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input placeholder="Search conversations..." className="pl-8" />
            </div>
          </div>

          <div className="overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 border-b cursor-pointer hover:bg-[var(--card-bg)] transition-colors relative rounded-xl ${
                    selectedChat === conversation._id
                      ? 'bg-[var(--card-bg)] border-r-4 border-r-primary'
                      : ''
                  }`}
                  onClick={() => handleChatSelect(conversation._id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.otherUser?.profilePicture}
                      />
                      <AvatarFallback>
                        {conversation.otherUser?.name
                          ?.split(' ')
                          .map((namePart: string) => namePart[0])
                          .join('') || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate text-sm">
                          {conversation.otherUser?.name}
                        </p>

                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {conversation.lastMessageAt &&
                          new Date(
                            conversation.lastMessageAt
                          ).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                            ? new Date(
                                conversation.lastMessageAt
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : conversation.lastMessageAt
                              ? new Date(
                                  conversation.lastMessageAt
                                ).toLocaleDateString()
                              : ''}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground truncate italic">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1 opacity-70"
                        >
                          {selectedExpert === 'all' && (
                            <span className="mr-1">
                              to{' '}
                              {organizationExperts
                                .find(
                                  (expert) =>
                                    expert.id === conversation.expertId
                                )
                                ?.name?.split(' ')[0] || 'Expert'}
                            </span>
                          )}
                        </Badge>

                        {conversation.unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] rounded-full">
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

      {/* Real Backend Offer Modal */}
      <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select services for the offer</DialogTitle>
            <DialogDescription>
              Add from your service menu, or create a one-off custom service for
              emergencies.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Service menu</p>

                <div className="w-28">
                  <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                    <SelectTrigger className="h-9">
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

              <div className="border rounded-lg max-h-[340px] overflow-y-auto">
                {menuServices.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No services found.
                  </div>
                ) : (
                  menuServices.map((service: any) => {
                    const selected = offerItems.find(
                      (item) => item.serviceId === service.id
                    );

                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-3 p-3 border-b last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {service.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {getCurrencySymbol(offerCurrency)}
                            {Number(service.basePrice || 0).toFixed(2)}{' '}
                            {service.durationMinutes
                              ? `• ${service.durationMinutes}m`
                              : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeServiceFromOffer(service.id)}
                            disabled={!selected}
                          >
                            remove
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => addServiceToOffer(service.id)}
                          >
                            + add
                          </Button>

                          {selected && (
                            <Badge variant="secondary">
                              x{selected.quantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Button variant="outline" onClick={addCustomItem}>
                + Create New Service
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Offer items</p>

              <div className="border rounded-lg p-3 space-y-3 max-h-[380px] overflow-y-auto">
                {offerItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nothing selected yet.
                  </div>
                ) : (
                  offerItems.map((item, index) => {
                    if (item.serviceId) {
                      const service = menuServices.find(
                        (menuService: any) =>
                          menuService.id === item.serviceId
                      );

                      return (
                        <div
                          key={`${item.serviceId}_${index}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {service?.name || 'Service'}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Qty {item.quantity} • {item.durationMinutes}m
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                removeServiceFromOffer(item.serviceId!)
                              }
                            >
                              -
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                addServiceToOffer(item.serviceId!)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`custom_${index}`}
                        className="border rounded-lg p-4 space-y-4 bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Service name</Label>
                            <Input
                              value={item.name || ''}
                              onChange={(event) =>
                                updateCustomItem(index, {
                                  name: event.target.value,
                                })
                              }
                              placeholder="Custom service name"
                            />
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setOfferItems((prev) =>
                                prev.filter((_, itemIndex) => itemIndex !== index)
                              )
                            }
                            className="mt-6 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Price ({getCurrencySymbol(offerCurrency)})
                            </Label>

                            <Input
                              type="number"
                              step="0.01"
                              value={item.basePrice ?? 0}
                              onChange={(event) =>
                                updateCustomItem(index, {
                                  basePrice: Number(event.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Duration (min)</Label>

                            <Input
                              type="number"
                              value={item.durationMinutes ?? 30}
                              onChange={(event) =>
                                updateCustomItem(index, {
                                  durationMinutes: Number(event.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Quantity</Label>

                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(event) =>
                                updateCustomItem(index, {
                                  quantity: Math.max(
                                    1,
                                    Number(event.target.value || 1)
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Discount type</Label>

                            <Select
                              value={item.discountType || 'none'}
                              onValueChange={(value) =>
                                updateCustomItem(index, {
                                  discountType:
                                    value === 'none'
                                      ? null
                                      : (value as 'percent' | 'fixed'),
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="percent">
                                  Percentage (%)
                                </SelectItem>
                                <SelectItem value="fixed">
                                  Fixed Amount
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Discount value</Label>

                            <Input
                              type="number"
                              step="0.01"
                              value={item.discountValue ?? ''}
                              onChange={(event) =>
                                updateCustomItem(index, {
                                  discountValue:
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value),
                                })
                              }
                              disabled={!item.discountType}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>
              Cancel
            </Button>

            <Button onClick={sendOffer} disabled={offerItems.length === 0}>
              Confirm Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}