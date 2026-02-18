'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Star,
  Clock,
  DollarSign,
  Calendar,
  Award,
  FileText,
  Video,
  Mic,
  MessageSquare,
  CheckCircle,
  XCircle,
  User,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Mock expert data - in real app this would come from API
const mockExperts = [
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
    expertise: ['Startup Strategy', 'Digital Transformation', 'Business Analysis', 'Project Management'],
    achievements: ['Helped 50+ startups', 'Harvard MBA', 'PMP Certified'],
    previousClients: ['TechCorp', 'StartupHub', 'Innovation Labs'],
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
    expertise: ['Investment Planning', 'Risk Management', 'Portfolio Management', 'Financial Analysis'],
    achievements: ['Managed $10M+ portfolios', 'Stanford MS Finance', 'CFA Level 2'],
    previousClients: ['Wealth Management Co', 'Investment Firm', 'Financial Services Inc'],
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
    expertise: ['Corporate Law', 'Compliance', 'Contract Law', 'Legal Advisory'],
    achievements: ['100+ cases handled', 'Yale Law School', 'Multi-state Bar Admission'],
    previousClients: ['Legal Corp', 'Compliance Agency', 'Contract Services Ltd'],
  },
];

export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const expertId = parseInt(params.id as string);
  
  const expert = mockExperts.find(e => e.id === expertId);

  if (!expert) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Expert Not Found</h2>
          <p className="text-gray-600 mb-4">The expert profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    console.log('Approving expert:', expert.name);
    // In real app, this would approve the expert
    router.push('/expert-requests');
  };

  const handleReject = () => {
    console.log('Rejecting expert:', expert.name);
    // In real app, this would reject the expert
    router.push('/expert-requests');
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expert Profile</h1>
              <p className="text-gray-600">Detailed information about {expert.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {expert.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{expert.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{expert.specialty}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {expert.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {expert.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {expert.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {expert.experience}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      ${expert.hourlyRate}/hour
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {expert.availability}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
            </div>

            {/* Expertise Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Certifications</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{expert.education}</p>
                  </div>
                </div>
                {expert.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center">
                    <Award className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{cert}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfolio Highlights</h3>
              <p className="text-gray-600">{expert.portfolio}</p>
            </div>

            {/* Previous Clients */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Previous Clients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expert.previousClients.map((client, index) => (
                  <div key={index} className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{client}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating & Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                  <span className="text-lg font-semibold text-gray-900">{expert.rating}</span>
                  <span className="text-gray-500 ml-1">/5.0</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="text-sm">Languages: {expert.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Expert
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

                <div className="flex space-x-3">
                  <Button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
