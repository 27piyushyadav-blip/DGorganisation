'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
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

export default function ExpertsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    specialty: 'all',
    location: 'all',
    experience: 'all',
    rating: 'all',
  });

  const specialties = [
    'Psychology',
    'Clinical Psychology',
    'Counseling',
    'Psychiatry',
  ];
  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
  ];
  const experiences = ['1-3 years', '3-5 years', '5-8 years', '8+ years'];
  const ratings = ['4.5+', '4.0+', '3.5+', '3.0+'];

  const pendingExperts = [
    {
      id: 1,
      name: 'Dr. Alice Brown',
      specialty: 'Psychology',
      experience: '5 years',
      email: 'alice@example.com',
      phone: '+1 234-567-8901',
      location: 'New York, NY',
      rating: 4.8,
      avatar: '/avatars/alice.jpg',
    },
    {
      id: 2,
      name: 'Dr. Carol White',
      specialty: 'Counseling',
      experience: '3 years',
      email: 'carol@example.com',
      phone: '+1 234-567-8902',
      location: 'Los Angeles, CA',
      rating: 4.6,
      avatar: '/avatars/carol.jpg',
    },
    {
      id: 5,
      name: 'Dr. Robert Green',
      specialty: 'Psychiatry',
      experience: '2 years',
      email: 'robert@example.com',
      phone: '+1 234-567-8905',
      location: 'Chicago, IL',
      rating: 4.4,
      avatar: '/avatars/robert.jpg',
    },
  ];

  const activeExperts = [
    {
      id: 3,
      name: 'Dr. Sarah Smith',
      specialty: 'Clinical Psychology',
      experience: '8 years',
      email: 'sarah@example.com',
      phone: '+1 234-567-8903',
      location: 'Chicago, IL',
      rating: 4.9,
      status: 'active',
      totalBookings: 45,
      avatar: '/avatars/sarah.jpg',
    },
    {
      id: 4,
      name: 'Dr. Michael Johnson',
      specialty: 'Psychiatry',
      experience: '10 years',
      email: 'michael@example.com',
      phone: '+1 234-567-8904',
      location: 'Houston, TX',
      rating: 4.7,
      status: 'active',
      totalBookings: 38,
      avatar: '/avatars/michael.jpg',
    },
    {
      id: 6,
      name: 'Dr. Lisa Chen',
      specialty: 'Psychology',
      experience: '6 years',
      email: 'lisa@example.com',
      phone: '+1 234-567-8906',
      location: 'Los Angeles, CA',
      rating: 4.5,
      status: 'active',
      totalBookings: 52,
      avatar: '/avatars/lisa.jpg',
    },
  ];

  const filterExperts = (experts: any[]) => {
    return experts.filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        filters.specialty === 'all' || expert.specialty === filters.specialty;
      const matchesLocation =
        filters.location === 'all' || expert.location === filters.location;
      const matchesExperience =
        filters.experience === 'all' ||
        (filters.experience === '1-3 years' &&
          parseInt(expert.experience) >= 1 &&
          parseInt(expert.experience) <= 3) ||
        (filters.experience === '3-5 years' &&
          parseInt(expert.experience) >= 3 &&
          parseInt(expert.experience) <= 5) ||
        (filters.experience === '5-8 years' &&
          parseInt(expert.experience) >= 5 &&
          parseInt(expert.experience) <= 8) ||
        (filters.experience === '8+ years' && parseInt(expert.experience) >= 8);
      const matchesRating =
        filters.rating === 'all' ||
        (filters.rating === '4.5+' && expert.rating >= 4.5) ||
        (filters.rating === '4.0+' && expert.rating >= 4.0) ||
        (filters.rating === '3.5+' && expert.rating >= 3.5) ||
        (filters.rating === '3.0+' && expert.rating >= 3.0);

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesLocation &&
        matchesExperience &&
        matchesRating
      );
    });
  };

  const clearFilters = () => {
    setFilters({
      specialty: 'all',
      location: 'all',
      experience: 'all',
      rating: 'all',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== 'all',
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expert Management</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={hasActiveFilters ? 'bg-accent' : ''}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    {Object.values(filters).filter((v) => v !== '').length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Experts</DialogTitle>
                <DialogDescription>
                  Filter experts by specialty, location, experience, and rating.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <Select
                    value={filters.specialty}
                    onValueChange={(value) =>
                      setFilters({ ...filters, specialty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) =>
                      setFilters({ ...filters, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Experience</label>
                  <Select
                    value={filters.experience}
                    onValueChange={(value) =>
                      setFilters({ ...filters, experience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All experience levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All experience levels</SelectItem>
                      {experiences.map((experience) => (
                        <SelectItem key={experience} value={experience}>
                          {experience}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <Select
                    value={filters.rating}
                    onValueChange={(value) =>
                      setFilters({ ...filters, rating: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ratings</SelectItem>
                      {ratings.map((rating) => (
                        <SelectItem key={rating} value={rating}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Requests ({pendingExperts.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active Experts ({activeExperts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {filterExperts(pendingExperts).map((expert) => (
              <Card key={expert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={expert.avatar} alt={expert.name} />
                        <AvatarFallback>
                          {expert.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{expert.name}</CardTitle>
                        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                          <span>{expert.specialty}</span>
                          {hasActiveFilters && (
                            <>
                              <span>•</span>
                              <span className="text-xs">{expert.location}</span>
                              <span>•</span>
                              <span className="text-xs">
                                {expert.experience}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{expert.experience}</Badge>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{expert.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{expert.email}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{expert.phone}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{expert.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log(
                          'Navigating to profile for expert:',
                          expert.id,
                        );
                        router.push(`/experts/${expert.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterExperts(pendingExperts).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No pending experts found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {filterExperts(activeExperts).map((expert) => (
              <Card key={expert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={expert.avatar} alt={expert.name} />
                        <AvatarFallback>
                          {expert.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{expert.name}</CardTitle>
                        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                          <span>{expert.specialty}</span>
                          {hasActiveFilters && (
                            <>
                              <span>•</span>
                              <span className="text-xs">{expert.location}</span>
                              <span>•</span>
                              <span className="text-xs">
                                {expert.experience}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                      <Badge variant="secondary">{expert.experience}</Badge>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{expert.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>{expert.email}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{expert.phone}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{expert.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{expert.totalBookings} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Schedule
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterExperts(activeExperts).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No active experts found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
