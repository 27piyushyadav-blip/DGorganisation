'use client';

import { useState } from 'react';

import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Users,
  XCircle,
  Video,
  Calendar,
  User,
  Settings,
  Ban,
  ChevronDown,
  CalendarDays,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function ExpertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const experts = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      username: '@dr_sarah_consulting',
      avatar: '/avatars/sarah.jpg',
      status: 'active',
      rating: 4.8,
      timings: [
        { day: 'Mon', time: '9AM - 5PM' },
        { day: 'Wed', time: '9AM - 5PM' },
        { day: 'Fri', time: '9AM - 5PM' },
      ],
      totalBookings: 45,
      revenue: 1250,
      services: ['Business Consulting', 'Strategy Planning'],
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      username: '@dr_michael_advisor',
      avatar: '/avatars/michael.jpg',
      status: 'active',
      rating: 4.6,
      timings: [
        { day: 'Tue', time: '10AM - 6PM' },
        { day: 'Thu', time: '10AM - 6PM' },
        { day: 'Sat', time: '10AM - 2PM' },
      ],
      totalBookings: 38,
      revenue: 980,
      services: ['Financial Advisory', 'Investment Planning'],
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      username: '@dr_emily_expert',
      avatar: '/avatars/emily.jpg',
      status: 'active',
      rating: 4.9,
      timings: [],
      totalBookings: 52,
      revenue: 1450,
      services: ['Legal Consulting', 'Compliance Advisory'],
    },
    {
      id: 4,
      name: 'Dr. Robert Wilson',
      username: '@dr_robert_consultant',
      avatar: '/avatars/robert.jpg',
      status: 'hidden',
      rating: 4.7,
      timings: [
        { day: 'Mon', time: '1PM - 8PM' },
        { day: 'Fri', time: '1PM - 8PM' },
      ],
      totalBookings: 28,
      revenue: 720,
      services: ['Technology Consulting', 'Digital Transformation'],
    },
  ];

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expert Management System</h2>
          <p className="text-muted-foreground">Manage your expert team and their profiles</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="w-[280px] shadow-sm border-gray-100">
            <CardContent className="p-6">
              {/* Name and Username Section */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{expert.username}</p>
                </div>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setOpenDropdownId(openDropdownId === expert.id ? null : expert.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {openDropdownId === expert.id && (
                    <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                      <div className="px-1 py-1 text-sm text-gray-700">
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </div>
                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <User className="mr-2 h-4 w-4" />
                          Change D.P
                        </div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <Video className="mr-2 h-4 w-4" />
                          Change Video
                        </div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <Calendar className="mr-2 h-4 w-4" />
                          Change Timings
                        </div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <Link href={`/experts/${expert.id}/booking-details`}>
                            Booking Details
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded">
                          {expert.status === 'hidden' ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Show Profile
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Hide Profile
                            </>
                          )}
                        </div>
                        <div className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer rounded text-red-600">
                          <Ban className="mr-2 h-4 w-4" />
                          Disconnect Expert
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={expert.avatar} alt={expert.name} />
                  <AvatarFallback className="text-lg">
                    {expert.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Timings Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    <span>Timings</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  {expert.timings.length > 0 ? (
                    <div className="space-y-2">
                      {expert.timings.map((timing, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {timing.day} – {timing.time}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No timings added</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="w-[280px] border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer shadow-sm border-gray-100">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Add New Expert</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Invite an expert to join your organization
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
