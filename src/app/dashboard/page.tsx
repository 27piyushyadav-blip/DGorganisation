import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, MessageSquare, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Button size="lg">
          <Calendar className="mr-2 h-4 w-4" />
          View All Bookings
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
              <p className="text-3xl font-bold mt-2">$1,245</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% from yesterday</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Experts</p>
              <p className="text-3xl font-bold mt-2">18</p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>3 on vacation</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Bookings</p>
              <p className="text-3xl font-bold mt-2">7</p>
              <div className="flex items-center mt-2 text-sm text-orange-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Need confirmation</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Messages</p>
              <p className="text-3xl font-bold mt-2">12</p>
              <div className="flex items-center mt-2 text-sm text-purple-600">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>5 unread</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <CardDescription>Latest bookings that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "John Doe", expert: "Dr. Sarah Smith", time: "2:00 PM", status: "Confirmed" },
                { name: "Jane Smith", expert: "Dr. Michael Johnson", time: "3:30 PM", status: "Pending" },
                { name: "Bob Johnson", expert: "Dr. Emily Davis", time: "4:00 PM", status: "Confirmed" },
              ].map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-muted-foreground">with {booking.expert}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{booking.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expert Requests</CardTitle>
            <CardDescription>New experts waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Dr. Alice Brown", specialty: "Psychology", experience: "5 years" },
                { name: "Dr. Carol White", specialty: "Counseling", experience: "3 years" },
              ].map((expert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{expert.name}</p>
                    <p className="text-sm text-muted-foreground">{expert.specialty} • {expert.experience}</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
