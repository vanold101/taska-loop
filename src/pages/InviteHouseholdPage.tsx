import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { AppLayout } from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  UserPlus,
  Mail,
  Phone,
  Send,
  Users,
  ArrowLeft,
  Check,
  X,
  Crown,
  User,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { inviteService, Invitation } from '../services/InviteService';

export default function InviteHouseholdPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { members, currentHousehold, inviteMember, removeMember, updateMember } = useHousehold();
  
  const [emailInvite, setEmailInvite] = useState('');
  const [phoneInvite, setPhoneInvite] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);

  // Load sent invitations
  useEffect(() => {
    const loadSentInvitations = async () => {
      if (user) {
        try {
          const invitations = await inviteService.getSentInvitations(user.id);
          setSentInvitations(invitations);
        } catch (error) {
          console.error('Error loading sent invitations:', error);
        }
      }
    };
    
    loadSentInvitations();
  }, [user]);

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInvite.trim()) {
      console.log("Email required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInvite)) {
      console.log("Invalid email");
      return;
    }

    try {
      setIsLoading(true);
      await inviteMember(emailInvite, customMessage || undefined);
      
      console.log(`Invitation sent to ${emailInvite}. Check the browser console to see the invitation details (demo mode).`);
      
      // Reset form
      setEmailInvite('');
      setCustomMessage('');
      
      // Refresh sent invitations
      const invitations = await inviteService.getSentInvitations(user?.id || '');
      setSentInvitations(invitations);
      
    } catch (error) {
      console.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneInvite.trim()) {
      console.log("Phone number required");
      return;
    }

    // For now, we'll convert phone invites to email-style invites
    // In a real app, you'd integrate with SMS services like Twilio
    console.log("Phone invites coming soon!");
    console.log("SMS invitations are not yet available. Please use email invitations for now.");
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (memberId === user?.id) {
      console.log("Cannot remove yourself");
      return;
    }

    try {
      removeMember(memberId);
      console.log(`${memberName} has been removed from your household.`);
    } catch (error) {
      console.error("Failed to remove member");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Household</h1>
            <p className="text-slate-500">Invite people to join your household and manage shared expenses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Members
              </CardTitle>
              <CardDescription>
                {currentHousehold?.name} • {members.length} member{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                          {member.email && <span>• {member.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      {member.id !== user?.id && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invite Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite New Members
              </CardTitle>
              <CardDescription>
                Send invitations to join your household
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleEmailInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="friend@example.com"
                        value={emailInvite}
                        onChange={(e) => setEmailInvite(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Custom Message (optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Join our household on TaskaLoop to coordinate shopping trips and split expenses..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={4}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Email Invitation
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4">
                  <form onSubmit={handlePhoneInvite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneInvite}
                        onChange={(e) => setPhoneInvite(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sms-message">Custom Message (optional)</Label>
                      <Textarea
                        id="sms-message"
                        placeholder="Join our household on TaskaLoop..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS Invitation (Coming Soon)
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Send Invitation</h3>
                <p className="text-sm text-slate-600">
                  Enter their email or phone number and send an invitation
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">They Join</h3>
                <p className="text-sm text-slate-600">
                  They'll receive instructions to download TaskaLoop and join your household
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Start Collaborating</h3>
                <p className="text-sm text-slate-600">
                  Share shopping lists, split expenses, and coordinate household tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invitations */}
        {sentInvitations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Recent Invitations
              </CardTitle>
              <CardDescription>
                Invitations you've sent recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentInvitations.slice(0, 5).map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{invitation.toEmail}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={invitation.status === 'pending' ? 'default' : 
                                invitation.status === 'accepted' ? 'success' : 'destructive'}
                        className="flex items-center gap-1"
                      >
                        {invitation.status === 'pending' && <Clock className="h-3 w-3" />}
                        {invitation.status === 'accepted' && <CheckCircle className="h-3 w-3" />}
                        {invitation.status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Demo Mode:</strong> Invitations are currently simulated. Check the browser console (Developer Tools) to see the invitation details and links. In production, these would be sent as real emails.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 