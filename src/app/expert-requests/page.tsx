'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Mail,
  MapPin,
  Mic,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  UserCheck,
  Users,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Video,
  Ban,
  MessageSquare,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExpertRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const router = useRouter();

  const pendingExperts = [
    {
      id: 1,
      name: 'Dr. Alice Brown',
      specialty: 'Business Consulting',
      experience: '5 years',
      email: 'alice@example.com',
      phone: '+1 234-567-8901',
      location: 'New York, NY',
      rating: 4.8,
      avatar: '/avatars/alice.jpg',
      bio: 'Experienced business consultant with MBA from Harvard. Specialized in startup strategy and digital transformation.',
      education: 'MBA - Harvard Business School',
      certifications: ['PMP', 'Six Sigma Black Belt'],
      portfolio: 'Successfully helped 50+ startups scale their operations',
      hourlyRate: 150,
      availability: 'Full-time',
      languages: ['English', 'Spanish'],
      status: 'pending',
    },
    {
      id: 2,
      name: 'Dr. Carol White',
      specialty: 'Financial Advisory',
      experience: '3 years',
      email: 'carol@example.com',
      phone: '+1 234-567-8902',
      location: 'Los Angeles, CA',
      rating: 4.6,
      avatar: '/avatars/carol.jpg',
      bio: 'Certified Financial Advisor with expertise in investment planning and risk management.',
      education: 'MS Finance - Stanford University',
      certifications: ['CFA Level 2', 'Series 7'],
      portfolio: 'Managed $10M+ in client portfolios',
      hourlyRate: 200,
      availability: 'Part-time',
      languages: ['English', 'Mandarin'],
      status: 'pending',
    },
    {
      id: 3,
      name: 'Dr. Robert Green',
      specialty: 'Legal Consulting',
      experience: '2 years',
      email: 'robert@example.com',
      phone: '+1 234-567-8905',
      location: 'Chicago, IL',
      rating: 4.4,
      avatar: '/avatars/robert.jpg',
      bio: 'Corporate lawyer specializing in compliance and contract law.',
      education: 'JD - Yale Law School',
      certifications: ['Bar Admission - NY, CA, IL'],
      portfolio: 'Handled 100+ corporate compliance cases',
      hourlyRate: 250,
      availability: 'Contract',
      languages: ['English'],
      status: 'pending',
    },
  ];

  const filteredExperts = pendingExperts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = (expert: any) => {
    console.log('Approving expert:', expert.name);
    // In real app, this would approve the expert and add to active experts
  };

  const handleReject = (expert: any) => {
    console.log('Rejecting expert:', expert.name);
    // In real app, This would reject the expert and send notification
  };

  const handleViewProfile = (expert: any) => {
    router.push(`/expert-requests/${expert.id}`);
  };

  return (
    <div className="flex-1 bg-[var(--card-bg-light)] min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expert Requests</h1>
              <p className="text-gray-600">Review and approve expert applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search experts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 h-10 border-gray-300"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{pendingExperts.length} Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">0 Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperts.map((expert) => (
            <div key={expert.id} className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--primary-start)] overflow-hidden hover:shadow-lg transition-shadow duration-200 w-[280px] mx-auto">
              {/* Card Content */}
              <div className="p-6 flex flex-col">
                {/* Header with Name and Menu */}
                <div className="flex items-start justify-between mb-6">
                  {/* Name and Title */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{expert.name}</h3>
                    <p className="text-sm text-gray-500">{expert.specialty}</p>
                  </div>
                  
                  {/* Three-dot menu */}
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {expert.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>

                {/* Stacked Action Buttons */}
                <div className="w-full space-y-3">
                  {/* View Profile Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleViewProfile(expert)}
                    className="w-full h-10 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>

                  {/* Chat Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-10 text-sm font-medium">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {expert.name}</DialogTitle>
                        <DialogDescription>
                          Send a message before making your decision
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <Button variant="outline" className="h-10">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                          <Button variant="outline" className="h-10">
                            <Video className="w-4 h-4 mr-2" />
                            Video
                          </Button>
                          <Button variant="outline" className="h-10">
                            <Mic className="w-4 h-4 mr-2" />
                            Audio
                          </Button>
                        </div>
                        <Input 
                          placeholder="Type your message..." 
                          className="resize-none"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Send Message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Accept and Decline Buttons Side by Side */}
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 h-10 text-sm font-medium bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(expert)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-10 text-sm font-medium"
                      onClick={() => handleReject(expert)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredExperts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expert Requests Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no expert requests matching your search criteria. Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
