"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  Mail,
  MessageSquare,
  Star,
  TrendingUp
} from "lucide-react";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const allNotifications = [
    {
      id: 1,
      title: "New Booking Request",
      description: "John Doe requested a session with Dr. Sarah Smith for tomorrow at 2:00 PM",
      type: "booking",
      priority: "high",
      status: "unread",
      time: "5 minutes ago",
      avatar: "/avatars/john.jpg",
      actionRequired: true
    },
    {
      id: 2,
      title: "Expert Profile Updated",
      description: "Dr. Michael Johnson updated his profile with new specializations",
      type: "profile",
      priority: "medium",
      status: "unread",
      time: "1 hour ago",
      avatar: "/avatars/michael.jpg",
      actionRequired: false
    },
    {
      id: 3,
      title: "Payment Received",
      description: "Payment of $120 received for booking #1234 from Jane Smith",
      type: "payment",
      priority: "low",
      status: "read",
      time: "2 hours ago",
      avatar: "/avatars/jane.jpg",
      actionRequired: false
    },
    {
      id: 4,
      title: "System Maintenance",
      description: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM",
      type: "system",
      priority: "medium",
      status: "read",
      time: "3 hours ago",
      avatar: null,
      actionRequired: false
    },
    {
      id: 5,
      title: "New Expert Registration",
      description: "Dr. Emily Davis has registered and is awaiting approval",
      type: "registration",
      priority: "high",
      status: "unread",
      time: "4 hours ago",
      avatar: "/avatars/emily.jpg",
      actionRequired: true
    },
    {
      id: 6,
      title: "Review Received",
      description: "Alice Brown left a 5-star review for her session with Dr. Carol White",
      type: "review",
      priority: "low",
      status: "read",
      time: "5 hours ago",
      avatar: "/avatars/alice.jpg",
      actionRequired: false
    },
    {
      id: 7,
      title: "Booking Cancelled",
      description: "Bob Johnson cancelled his session with Dr. Sarah Smith scheduled for today",
      type: "booking",
      priority: "high",
      status: "unread",
      time: "6 hours ago",
      avatar: "/avatars/bob.jpg",
      actionRequired: true
    },
    {
      id: 8,
      title: "Revenue Milestone",
      description: "Congratulations! Your organization has reached $50,000 in monthly revenue",
      type: "achievement",
      priority: "low",
      status: "read",
      time: "1 day ago",
      avatar: null,
      actionRequired: false
    }
  ];

  const unreadNotifications = allNotifications.filter(n => n.status === "unread");
  const readNotifications = allNotifications.filter(n => n.status === "read");

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "payment":
        return <TrendingUp className="h-4 w-4" />;
      case "profile":
        return <User className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "registration":
        return <User className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "achievement":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case "read":
        return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
      default:
        return null;
    }
  };

  const NotificationCard = ({ notification }: { notification: typeof allNotifications[0] }) => (
    <Card className={`transition-all hover:shadow-md ${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getStatusIcon(notification.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getTypeIcon(notification.type)}
                <CardTitle className="text-base">{notification.title}</CardTitle>
                {getPriorityBadge(notification.priority)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                {notification.avatar && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={notification.avatar} alt="User" />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                )}
                <span>{notification.time}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {notification.description}
              </div>
              {notification.actionRequired && (
                <div className="mt-3 flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Action Required
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allNotifications.filter(n => n.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allNotifications.filter(n => n.actionRequired).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending actions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({allNotifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
          <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="space-y-3">
            {allNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unreadNotifications.length} unread notifications
            </p>
            <Button variant="outline" size="sm">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          </div>

          <div className="space-y-3">
            {unreadNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {readNotifications.length} read notifications
            </p>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {readNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
