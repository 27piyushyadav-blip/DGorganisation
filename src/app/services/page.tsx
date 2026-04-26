'use client';

import { useState } from 'react';
import { Check, ChevronRight, MessageCircle, DollarSign, Link, X, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const experts = [
  { id: 1, name: 'Akan', image: '/avatars/akan.jpg' },
  { id: 2, name: 'Suraj', image: '/avatars/suraj.jpg' },
  { id: 3, name: 'Mehta', image: '/avatars/mehta.jpg' },
  { id: 4, name: 'Kunal', image: '/avatars/kunal.jpg' },
  { id: 5, name: 'Ashish', image: '/avatars/ashish.jpg' },
  { id: 6, name: 'Manav', image: '/avatars/manav.jpg' },
];

const flowSteps = [
  {
    id: 1,
    type: 'initial' as const,
    title: 'Initial Message',
    description: 'Hi! Let\'s discuss your requirements and finalize the details.',
    expertName: 'Akan',
    expertImage: '/avatars/akan.jpg',
  },
  {
    id: 2,
    type: 'step' as const,
    icon: MessageCircle as LucideIcon,
    title: 'Chat & Negotiate',
    description: 'Discuss requirements and finalize a custom service',
  },
  {
    id: 3,
    type: 'step' as const,
    icon: DollarSign as LucideIcon,
    title: 'Set Custom Price',
    description: 'Agree on the final negotiated price',
  },
  {
    id: 4,
    type: 'step' as const,
    icon: Link as LucideIcon,
    title: 'Send Payment Link',
    description: 'Akan will generate and send a payment link',
  },
  {
    id: 5,
    type: 'action' as const,
    icon: Check as LucideIcon,
    title: 'Customer Books or Not',
    description: 'Customer decides to book or decline the service',
    actions: ['Book Service', 'Decline'],
  },
];

export default function ServicesPage() {
  const [selectedExpert, setSelectedExpert] = useState(experts[0]);

  const handleExpertSelect = (expert: typeof experts[0]) => {
    setSelectedExpert(expert);
  };

  return (
    <div className="min-h-screen bg-[var(--card-bg-light)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Live Service Flow</h1>
            <nav className="flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Orders</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Messages</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Earnings</a>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Choose Expert Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Expert</h2>
            <div className="grid grid-cols-3 gap-4">
              {experts.map((expert) => (
                <Card
                  key={expert.id}
                  className={`cursor-pointer transition-all ${
                    selectedExpert.id === expert.id
                      ? 'border-green-500 border-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleExpertSelect(expert)}
                >
                  <CardContent className="p-4">
                    <div className="relative">
                      {selectedExpert.id === expert.id && (
                        <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1 z-10">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>
                        <h3 className="font-medium text-gray-900">{expert.name}</h3>
                        <Button
                          variant={selectedExpert.id === expert.id ? "default" : "outline"}
                          size="sm"
                          className="mt-2"
                        >
                          {selectedExpert.id === expert.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create Custom Service Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Create Custom Service</h2>
            <p className="text-sm text-gray-600 mb-6">Selected Expert: {selectedExpert.name}</p>
            
            {/* Flow Diagram */}
            <div className="space-y-4">
              {flowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  {/* Arrow indicator */}
                  {index < flowSteps.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                    </div>
                  )}
                  
                  {index === flowSteps.length - 1 && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="flex-1">
                    {step.type === 'initial' && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-sm text-gray-800">{step.description}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {step.type === 'step' && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <step.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{step.title}</h3>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {step.type === 'action' && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <step.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{step.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                              <div className="flex space-x-2">
                                <Button className="bg-green-600 hover:bg-green-700">
                                  Book Service
                                </Button>
                                <Button variant="outline" className="border-gray-300">
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
