'use client';

import { useState } from 'react';

import {
  Clock,
  Filter,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MoreHorizontal,
  Pause,
  PenTool,
  Phone,
  Play,
  Search,
  Square,
  Users,
  Video,
  VideoOff,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const activeSessions = [
    {
      id: 1,
      userName: 'John Doe',
      expertName: 'Dr. Sarah Smith',
      startTime: '2:00 PM',
      duration: '45 min',
      type: 'online',
      status: 'active',
      hasWhiteboard: true,
      userAvatar: '/avatars/john.jpg',
      expertAvatar: '/avatars/sarah.jpg',
    },
    {
      id: 2,
      userName: 'Jane Smith',
      expertName: 'Dr. Michael Johnson',
      startTime: '2:30 PM',
      duration: '30 min',
      type: 'offline',
      status: 'active',
      hasWhiteboard: false,
      userAvatar: '/avatars/jane.jpg',
      expertAvatar: '/avatars/michael.jpg',
    },
  ];

  const scheduledSessions = [
    {
      id: 3,
      userName: 'Bob Johnson',
      expertName: 'Dr. Emily Davis',
      scheduledTime: '3:00 PM',
      duration: '60 min',
      type: 'online',
      status: 'scheduled',
      hasWhiteboard: true,
      userAvatar: '/avatars/bob.jpg',
      expertAvatar: '/avatars/emily.jpg',
    },
  ];

  const getTypeIcon = (type: string) => {
    return type === 'online' ? (
      <Video className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Session Management
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Play className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">3 online, 5 offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Today
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-muted-foreground text-xs">Next in 30 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Whiteboard Active
            </CardTitle>
            <PenTool className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground text-xs">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52 min</div>
            <p className="text-muted-foreground text-xs">
              +5 min from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Sessions ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledSessions.length})
          </TabsTrigger>
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.userAvatar}
                            alt={session.userName}
                          />
                          <AvatarFallback>
                            {session.userName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-border h-px w-4"></div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.expertAvatar}
                            alt={session.expertName}
                          />
                          <AvatarFallback>
                            {session.expertName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {session.userName} → {session.expertName}
                        </CardTitle>
                        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                          <span>Started at {session.startTime}</span>
                          <span>•</span>
                          <span>{session.duration}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(session.type)}
                            <span>{session.type}</span>
                          </div>
                          {session.hasWhiteboard && (
                            <>
                              <span>•</span>
                              <PenTool className="h-3 w-3" />
                              <span>Whiteboard</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(session.status)}
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground text-sm">
                          Live
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Monitor className="mr-2 h-4 w-4" />
                        Join Session
                      </Button>
                      {session.hasWhiteboard && (
                        <Button size="sm" variant="outline">
                          <PenTool className="mr-2 h-4 w-4" />
                          View Whiteboard
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {scheduledSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.userAvatar}
                            alt={session.userName}
                          />
                          <AvatarFallback>
                            {session.userName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-border h-px w-4"></div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.expertAvatar}
                            alt={session.expertName}
                          />
                          <AvatarFallback>
                            {session.expertName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {session.userName} → {session.expertName}
                        </CardTitle>
                        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                          <span>Scheduled for {session.scheduledTime}</span>
                          <span>•</span>
                          <span>{session.duration}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(session.type)}
                            <span>{session.type}</span>
                          </div>
                          {session.hasWhiteboard && (
                            <>
                              <span>•</span>
                              <PenTool className="h-3 w-3" />
                              <span>Whiteboard</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Start Session
                      </Button>
                      <Button size="sm" variant="outline">
                        <Clock className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="whiteboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Whiteboards</CardTitle>
              <CardDescription>
                Real-time collaboration boards currently in use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {activeSessions
                  .filter((s) => s.hasWhiteboard)
                  .map((session) => (
                    <Card
                      key={session.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {session.userName} & {session.expertName}
                            </CardTitle>
                            <CardDescription>
                              Session started at {session.startTime} •{' '}
                              {session.duration}
                            </CardDescription>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <PenTool className="h-4 w-4" />
                              <span className="text-sm">
                                Drawing tools available
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span className="text-sm">2 participants</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Monitor className="mr-2 h-4 w-4" />
                              View Board
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
