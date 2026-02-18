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

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string>('expert-1');
  const [messageInput, setMessageInput] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isOrganizationReply, setIsOrganizationReply] = useState(false);
  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'customer',
      content: 'Hi, I wanted to ask about the therapy session',
      time: '10:00 AM',
      type: 'text',
      isOrganizationReply: false,
    },
    {
      id: 2,
      sender: 'expert',
      content: 'Hello! I\'m here to help. What would you like to know?',
      time: '10:02 AM',
      type: 'text',
      isOrganizationReply: false,
    },
    {
      id: 3,
      sender: 'customer',
      content: 'Thank you for the session today',
      time: '10:05 AM',
      type: 'text',
      isOrganizationReply: false,
    },
  ]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const conversations = [
    {
      id: 1,
      name: 'John Doe',
      expert: 'Dr. Sarah Smith',
      expertId: 'expert-1',
      lastMessage: 'Thank you for the session today',
      time: '2 min ago',
      unread: 2,
      avatar: '/avatars/john.jpg',
      status: 'online',
    },
    {
      id: 2,
      name: 'Jane Smith',
      expert: 'Dr. Michael Johnson',
      expertId: 'expert-2',
      lastMessage: 'Can we reschedule tomorrow?',
      time: '1 hour ago',
      unread: 0,
      avatar: '/avatars/jane.jpg',
      status: 'offline',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      expert: 'Dr. Emily Davis',
      expertId: 'expert-3',
      lastMessage: 'Looking forward to our next session',
      time: '3 hours ago',
      unread: 1,
      avatar: '/avatars/bob.jpg',
      status: 'online',
    },
  ];

  const organizationExperts = [
    { id: 'expert-1', name: 'Dr. Sarah Smith', specialty: 'Psychology' },
    { id: 'expert-2', name: 'Dr. Michael Johnson', specialty: 'Psychiatry' },
    { id: 'expert-3', name: 'Dr. Emily Davis', specialty: 'Counseling' },
    { id: 'expert-4', name: 'Dr. James Wilson', specialty: 'Therapy' },
  ];

  // Filter conversations by selected expert
  const expertConversations = conversations.filter(chat => chat.expertId === selectedExpert);
  const currentChat = selectedChat ? conversations.find(chat => chat.id === selectedChat) : null;

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // PDF upload function
  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setAttachedPdf(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  // Message sending function
  const sendMessage = () => {
    if (!messageInput.trim() && !attachedPdf && !audioBlob) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      sender: isOrganizationReply ? 'organization' : 'expert',
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: attachedPdf ? 'pdf' : audioBlob ? 'audio' : 'text',
      fileName: attachedPdf?.name,
      audioUrl: audioUrl,
      expertName: isOrganizationReply && selectedExpert 
        ? organizationExperts.find(e => e.id === selectedExpert)?.name 
        : currentChat?.expert,
      isOrganizationReply: isOrganizationReply,
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    setAttachedPdf(null);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Auto-select expert when chat changes
  useEffect(() => {
    if (currentChat) {
      setSelectedExpert(currentChat.expertId);
    }
  }, [selectedChat, currentChat]);

  // Handle expert selection
  const handleExpertSelect = (expertId: string) => {
    setSelectedExpert(expertId);
    setSelectedChat(null); // Reset selected chat when switching experts
  };

  // Handle chat selection
  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId);
  };

  return (
    <div className="flex-1 h-full">
      <div className="flex h-full">
        {/* Left Panel - Expert List */}
        <div className="w-80 border-r">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold mb-4">Experts</h2>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {organizationExperts.map((expert) => (
              <div
                key={expert.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                  selectedExpert === expert.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleExpertSelect(expert.id)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {expert.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{expert.name}</p>
                    <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground">
                        {conversations.filter(c => c.expertId === expert.id).length} conversations
                      </p>
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section - Chat Conversation */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                      <AvatarFallback>
                        {currentChat.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentChat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        with {currentChat.expert}
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
                    <div className="relative">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setOpenDropdownId(openDropdownId === currentChat.id ? null : currentChat.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      
                      {openDropdownId === currentChat.id && (
                        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                          <div className="px-1 py-1 text-sm text-gray-700">
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <Eye className="mr-2 h-4 w-4" />
                              View Expert Profile
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                              <Paperclip className="mr-2 h-4 w-4" />
                              Send PDF File
                            </div>
                            <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'organization' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.sender === 'organization' ? 'space-y-2' : ''}`}>
                      {/* Organization indicator */}
                      {message.isOrganizationReply && (
                        <div className="flex items-center justify-end space-x-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>Sent by Organization on behalf of {message.expertName}</span>
                        </div>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.sender === 'organization'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {/* Text message */}
                        {message.type === 'text' && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        {/* PDF message */}
                        {message.type === 'pdf' && (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <div>
                              <p className="text-sm font-medium">{message.fileName}</p>
                              <p className="text-xs opacity-70">PDF Document</p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-auto">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {/* Audio message */}
                        {message.type === 'audio' && message.audioUrl && (
                          <div className="flex items-center space-x-2">
                            <audio ref={audioRef} src={message.audioUrl} className="hidden" />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (audioRef.current) {
                                  if (isPlaying) {
                                    audioRef.current.pause();
                                  } else {
                                    audioRef.current.play();
                                  }
                                  setIsPlaying(!isPlaying);
                                }
                              }}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1">
                              <p className="text-sm">Voice Message</p>
                              <div className="w-full bg-current/20 rounded-full h-1">
                                <div className="bg-current h-1 rounded-full w-1/3"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <p className={`text-xs mt-1 ${
                          message.sender === 'organization'
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t space-y-3">
                {/* Organization Reply Toggle */}
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="org-reply"
                      checked={isOrganizationReply}
                      onChange={(e) => setIsOrganizationReply(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="org-reply" className="text-sm font-medium flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Reply as Organization</span>
                    </label>
                  </div>
                  
                  {isOrganizationReply && (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm text-muted-foreground">on behalf of:</span>
                      <Select value={selectedExpert} onValueChange={setSelectedExpert}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select expert" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationExperts.map((expert) => (
                            <SelectItem key={expert.id} value={expert.id}>
                              <div>
                                <p className="font-medium">{expert.name}</p>
                                <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Attachment Preview */}
                {(attachedPdf || audioBlob) && (
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                    {attachedPdf && (
                      <div className="flex items-center space-x-2 flex-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{attachedPdf.name}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setAttachedPdf(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {audioBlob && (
                      <div className="flex items-center space-x-2 flex-1">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm">Voice recording ready</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Message Input Controls */}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? 'bg-red-100 text-red-600' : ''}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Select a chat</h3>
                <p className="text-muted-foreground">Choose an expert and select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Expert Chats */}
        <div className="w-80 border-l">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold mb-2">
              {organizationExperts.find(e => e.id === selectedExpert)?.name || 'Expert'} Chats
            </h3>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search chats..."
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {expertConversations.length > 0 ? (
              expertConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    selectedChat === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleChatSelect(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>
                          {conversation.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.status === 'online' && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {conversation.status}
                        </p>
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No chats found for this expert</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
