export interface Invitation {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toEmail: string;
  type: 'household' | 'expense_split' | 'app_download';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message: string;
  data?: {
    householdId?: string;
    householdName?: string;
    expenseAmount?: number;
    expenseDescription?: string;
    tripId?: string;
    tripName?: string;
  };
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface InviteOptions {
  email: string;
  message?: string;
  type: 'household' | 'expense_split' | 'app_download';
  expenseAmount?: number;
  expenseDescription?: string;
  tripId?: string;
  tripName?: string;
  householdId?: string;
  householdName?: string;
}

class InviteService {
  private static instance: InviteService;
  
  static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService();
    }
    return InviteService.instance;
  }

  /**
   * Send an invitation to join household
   */
  async sendHouseholdInvite(options: {
    email: string;
    message?: string;
    householdId: string;
    householdName: string;
    fromUser: { id: string; name: string; email?: string };
  }): Promise<Invitation> {
    const defaultMessage = `You've been invited to join "${options.householdName}" on TaskaLoop! 
    
TaskaLoop helps households manage shopping trips, split expenses, and coordinate tasks together. Join us to:
• Share shopping lists and coordinate trips
• Split expenses fairly and track who owes what
• Manage household tasks and chores
• Stay organized together

Click the link below to download TaskaLoop and accept the invitation.`;

    const invitation: Omit<Invitation, 'id'> = {
      fromUserId: options.fromUser.id,
      fromUserName: options.fromUser.name,
      fromUserEmail: options.fromUser.email || '',
      toEmail: options.email,
      type: 'household',
      status: 'pending',
      message: options.message || defaultMessage,
      data: {
        householdId: options.householdId,
        householdName: options.householdName
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    return this.saveInvitation(invitation);
  }

  /**
   * Send an invitation to split an expense
   */
  async sendExpenseSplitInvite(options: {
    email: string;
    message?: string;
    expenseAmount: number;
    expenseDescription: string;
    tripId?: string;
    tripName?: string;
    fromUser: { id: string; name: string; email?: string };
  }): Promise<Invitation> {
    const defaultMessage = `${options.fromUser.name} is asking you to split an expense of $${options.expenseAmount.toFixed(2)} for "${options.expenseDescription}".

You can download TaskaLoop to easily split expenses, track who owes what, and manage shared costs with your friends and family.

Payment details:
• Amount: $${options.expenseAmount.toFixed(2)}
• Description: ${options.expenseDescription}
• Your share: $${(options.expenseAmount / 2).toFixed(2)} (split equally)

Download TaskaLoop to pay and track shared expenses easily!`;

    const invitation: Omit<Invitation, 'id'> = {
      fromUserId: options.fromUser.id,
      fromUserName: options.fromUser.name,
      fromUserEmail: options.fromUser.email || '',
      toEmail: options.email,
      type: 'expense_split',
      status: 'pending',
      message: options.message || defaultMessage,
      data: {
        expenseAmount: options.expenseAmount,
        expenseDescription: options.expenseDescription,
        tripId: options.tripId,
        tripName: options.tripName
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    return this.saveInvitation(invitation);
  }

  /**
   * Send an invitation to download the app
   */
  async sendAppDownloadInvite(options: {
    email: string;
    message?: string;
    fromUser: { id: string; name: string; email?: string };
  }): Promise<Invitation> {
    const defaultMessage = `${options.fromUser.name} invited you to try TaskaLoop!

TaskaLoop is the easiest way to manage your household:
• Create and share shopping lists
• Split expenses fairly with automatic calculations
• Coordinate trips and tasks with family/roommates
• Track who owes what and settle up easily

Join thousands of households who stay organized with TaskaLoop!

Download the app to get started:`;

    const invitation: Omit<Invitation, 'id'> = {
      fromUserId: options.fromUser.id,
      fromUserName: options.fromUser.name,
      fromUserEmail: options.fromUser.email || '',
      toEmail: options.email,
      type: 'app_download',
      status: 'pending',
      message: options.message || defaultMessage,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    };

    return this.saveInvitation(invitation);
  }

  /**
   * Save invitation locally only
   */
  private async saveInvitation(invitation: Omit<Invitation, 'id'>): Promise<Invitation> {
    // Generate a unique ID
    const invitationId = Date.now().toString() + Math.random().toString(36).substring(2);
    
    const savedInvitation: Invitation = {
      ...invitation,
      id: invitationId
    };

    // Save to localStorage
    this.saveInvitationLocally(savedInvitation);

    // Simulate sending
    this.simulateEmailSending(savedInvitation);

    return savedInvitation;
  }

  /**
   * Save invitation to localStorage
   */
  private saveInvitationLocally(invitation: Invitation): void {
    try {
      const existingInvitations = this.getLocalInvitations();
      existingInvitations.push(invitation);
      localStorage.setItem('taska_invitations', JSON.stringify(existingInvitations));
    } catch (error) {
      console.error('Error saving invitation locally:', error);
    }
  }

  /**
   * Get invitations from localStorage
   */
  private getLocalInvitations(): Invitation[] {
    try {
      const stored = localStorage.getItem('taska_invitations');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting local invitations:', error);
      return [];
    }
  }

  /**
   * Simulate email sending for demo
   */
  private simulateEmailSending(invitation: Invitation): void {
    console.log('📧 INVITATION SENT (Demo Mode):');
    console.log('📧 To:', invitation.toEmail);
    console.log('📧 From:', invitation.fromUserName);
    console.log('📧 Type:', invitation.type);
    console.log('📧 ID:', invitation.id);
  }

  /**
   * Update invitation in localStorage
   */
  private updateInvitationLocally(invitationId: string, updates: Partial<Invitation>): void {
    try {
      const invitations = this.getLocalInvitations();
      const index = invitations.findIndex(inv => inv.id === invitationId);
      if (index !== -1) {
        invitations[index] = { ...invitations[index], ...updates };
        localStorage.setItem('taska_invitations', JSON.stringify(invitations));
      }
    } catch (error) {
      console.error('Error updating invitation locally:', error);
    }
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationId: string): Promise<void> {
    this.updateInvitationLocally(invitationId, { 
      status: 'accepted',
      respondedAt: new Date().toISOString()
    });
  }

  /**
   * Reject an invitation
   */
  async rejectInvitation(invitationId: string): Promise<void> {
    this.updateInvitationLocally(invitationId, { 
      status: 'rejected',
      respondedAt: new Date().toISOString()
    });
  }

  /**
   * Get invitations sent by a user
   */
  async getSentInvitations(userId: string): Promise<Invitation[]> {
    try {
      const localInvitations = this.getLocalInvitations();
      return localInvitations.filter(inv => inv.fromUserId === userId);
    } catch (error) {
      console.error('Error getting sent invitations:', error);
      return [];
    }
  }

  /**
   * Get invitations received by an email
   */
  async getReceivedInvitations(email: string): Promise<Invitation[]> {
    try {
      const localInvitations = this.getLocalInvitations();
      return localInvitations.filter(inv => inv.toEmail === email);
    } catch (error) {
      console.error('Error getting received invitations:', error);
      return [];
    }
  }
}

export const inviteService = InviteService.getInstance(); 