'use client';

import { useState, useRef, useEffect } from 'react';

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

type MessageType = 'text' | 'pdf' | 'audio';

interface Message {
  id: number;
  sender: 'customer' | 'expert' | 'organization';
  content: string;
  time: string;
  type: MessageType;
  fileName?: string;
  audioUrl?: string | null;
  expertName?: string | undefined;
  isOrganizationReply: boolean;
}

import { apiClient } from '@/client/api/api-client';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

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

  // 1. Initial Data Fetching
  useEffect(() => {
    const initPage = async () => {
      try {
        setIsLoading(true);
        // Fetch experts
        const expertsRes = await apiClient<any>(`${API_BASE}/organizations/experts`);
        setOrganizationExperts(expertsRes.experts || []);
        
        // Fetch conversations
        const conversationsRes = await apiClient<any>(`${API_BASE}/organizations/conversations`);
        setAllConversations(conversationsRes.conversations || []);
      } catch (error) {
        console.error("Failed to load page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, []);

  // 2. Fetch Messages when Chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await apiClient<any>(`${API_BASE}/organizations/conversations/${selectedChat}/messages`);
        setMessages(response.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Filter conversations by selected expert
  const filteredConversations = selectedExpert === 'all' 
    ? allConversations 
    : allConversations.filter(chat => chat.expertId === selectedExpert);

  const currentChat = selectedChat ? allConversations.find(chat => chat._id === selectedChat) : null;

  // 3. Send Message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const payload = {
        content: messageInput,
        senderType: isOrganizationReply ? 'organization' : 'expert',
        recipientId: currentChat?.otherUser?._id,
        recipientType: 'client'
      };

      await apiClient<any>(`${API_BASE}/chat/${selectedChat}/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setMessageInput('');
      // Refresh messages immediately
      const response = await apiClient<any>(`http://localhost:3000/organizations/conversations/${selectedChat}/messages`);
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle expert selection
  const handleExpertSelect = (expertId: string) => {
    setSelectedExpert(expertId);
    setSelectedChat(null); 
  };

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* Left Panel - Expert List */}
        <div className="w-80 border-r bg-white">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Experts</h2>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
             <div
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                  selectedExpert === 'all' ? 'bg-accent' : ''
                }`}
                onClick={() => handleExpertSelect('all')}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
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
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                  selectedExpert === expert.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleExpertSelect(expert.id)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={expert.profileImage} />
                    <AvatarFallback>
                      {expert.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expert.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{expert.specialization}</p>
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
        <div className="flex-1 flex flex-col bg-zinc-50">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
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
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSystem = message.senderType === 'system';
                    const isFromMe = message.senderType === 'organization' || message.senderType === 'expert';
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isFromMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm ${
                              isFromMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white border rounded-tl-none shadow-sm'
                            }`}
                          >
                            {message.senderType === 'organization' && (
                              <div className="flex items-center space-x-1 mb-1 text-[10px] opacity-80 uppercase font-bold tracking-wider">
                                <Building2 className="h-3 w-3" />
                                <span>Organization Reply</span>
                              </div>
                            )}
                            <p>{message.content}</p>
                            <p className={`text-[10px] mt-1 ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white space-y-3">
                {/* Organization Reply Toggle */}
                <div className="flex items-center space-x-4 p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="org-reply"
                      checked={isOrganizationReply}
                      onChange={(e) => setIsOrganizationReply(e.target.checked)}
                      className="rounded border-zinc-300 accent-primary w-4 h-4"
                    />
                    <label htmlFor="org-reply" className="text-sm font-semibold flex items-center space-x-2 cursor-pointer">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Official Organization Response</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1 italic">
                    {isOrganizationReply 
                      ? "Messages will be marked as coming from the dashboard admin level."
                      : "Messages will be sent as standard expert communication."}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="icon" variant="outline" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message here..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} className="px-5">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm p-6">
                <div className="bg-primary/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-primary/10">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Communications</h3>
                <p className="text-muted-foreground">
                  Select an expert on the left and then pick a conversation to view customer messages and provide support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Expert Chats */}
        <div className="w-80 border-l bg-white">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold mb-4">
              {selectedExpert === 'all' ? 'All Recent' : organizationExperts.find(e => e.id === selectedExpert)?.name?.split(' ')[1] || 'Expert'} Chats
            </h3>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 border-b cursor-pointer hover:bg-zinc-50 transition-colors relative ${
                    selectedChat === conversation._id ? 'bg-zinc-50 border-r-4 border-r-primary' : ''
                  }`}
                  onClick={() => handleChatSelect(conversation._id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.otherUser?.profilePicture} />
                      <AvatarFallback>
                        {conversation.otherUser?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate text-sm">{conversation.otherUser?.name}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(conversation.lastMessageAt).toLocaleDateString() === new Date().toLocaleDateString()
                            ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate italic">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-[10px] py-0 px-1 opacity-70">
                          {selectedExpert === 'all' && (
                            <span className="mr-1">
                              to {organizationExperts.find(e => e.id === conversation.expertId)?.name?.split(' ')[1] || 'Expert'}
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
    </div>
  );
}

