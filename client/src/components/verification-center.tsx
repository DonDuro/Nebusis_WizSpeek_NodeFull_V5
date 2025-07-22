import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  Users, 
  Award, 
  UserCheck,
  FileText,
  AlertTriangle,
  Star,
  Eye
} from 'lucide-react';

interface VerificationData {
  id: number;
  userId: number;
  verificationType: 'document' | 'contact' | 'peer_endorsement' | 'guardian_approval';
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  documentType?: string;
  contactInfo?: string;
  endorsementCount?: number;
  trustScore: number;
}

const mockVerificationData: VerificationData[] = [
  {
    id: 1,
    userId: 1,
    verificationType: 'document',
    status: 'verified',
    submittedAt: new Date('2025-01-15'),
    verifiedAt: new Date('2025-01-16'),
    documentType: 'Government ID',
    trustScore: 95
  },
  {
    id: 2,
    userId: 1,
    verificationType: 'contact',
    status: 'verified',
    submittedAt: new Date('2025-01-14'),
    verifiedAt: new Date('2025-01-15'),
    contactInfo: 'work@company.com',
    trustScore: 88
  },
  {
    id: 3,
    userId: 1,
    verificationType: 'peer_endorsement',
    status: 'verified',
    submittedAt: new Date('2025-01-10'),
    verifiedAt: new Date('2025-01-12'),
    endorsementCount: 5,
    trustScore: 92
  },
  {
    id: 4,
    userId: 1,
    verificationType: 'document',
    status: 'pending',
    submittedAt: new Date('2025-01-18'),
    documentType: 'Professional License',
    trustScore: 0
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getVerificationIcon = (type: string) => {
  switch (type) {
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'contact':
      return <UserCheck className="h-5 w-5" />;
    case 'peer_endorsement':
      return <Users className="h-5 w-5" />;
    case 'guardian_approval':
      return <Shield className="h-5 w-5" />;
    default:
      return <Award className="h-5 w-5" />;
  }
};

export function VerificationCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [verifications] = useState<VerificationData[]>(mockVerificationData);

  const verifiedCount = verifications.filter(v => v.status === 'verified').length;
  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const overallTrustScore = Math.round(
    verifications.filter(v => v.status === 'verified').reduce((acc, v) => acc + v.trustScore, 0) / 
    Math.max(verifiedCount, 1)
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Center</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your identity verification and build trust with other users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {overallTrustScore}% Trust Score
          </span>
        </div>
      </div>

      {/* Trust Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Verification Overview</span>
          </CardTitle>
          <CardDescription>
            Your verification status helps build trust with other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {verifiedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallTrustScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Trust Score</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Verification Progress</span>
              <span>{Math.round((verifiedCount / 4) * 100)}%</span>
            </div>
            <Progress value={(verifiedCount / 4) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {verifications.map((verification) => (
              <Card key={verification.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getVerificationIcon(verification.verificationType)}
                      <div>
                        <div className="font-medium capitalize">
                          {verification.verificationType.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {verification.documentType || verification.contactInfo || 
                           `${verification.endorsementCount} endorsements` || 'Guardian approval'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {verification.status === 'verified' && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Score: {verification.trustScore}%
                        </div>
                      )}
                      <Badge className={getStatusColor(verification.status)}>
                        {getStatusIcon(verification.status)}
                        <span className="ml-1 capitalize">{verification.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Upload official documents to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Upload a government-issued ID or professional license
                </p>
                <Button variant="outline">Choose File</Button>
              </div>
              
              <div className="grid gap-2">
                <h4 className="font-medium">Accepted Documents:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Government-issued photo ID (driver's license, passport)</li>
                  <li>• Professional licenses and certifications</li>
                  <li>• Student ID with verification code</li>
                  <li>• Employment verification letter</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Verification</CardTitle>
              <CardDescription>
                Verify your identity through trusted contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Work Email Verification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Verify your professional identity using your work email
                  </p>
                  <Button>Add Work Email</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Educational Institution</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Verify through your school or university email
                  </p>
                  <Button variant="outline">Add School Email</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endorsements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peer Endorsements</CardTitle>
              <CardDescription>
                Get endorsed by verified users who know you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Professional Endorsements</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Colleagues and business contacts
                    </p>
                  </div>
                  <Badge variant="outline">3 received</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Personal Endorsements</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Friends and family members
                    </p>
                  </div>
                  <Badge variant="outline">2 received</Badge>
                </div>
                
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Request Endorsement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}