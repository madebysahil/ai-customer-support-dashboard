export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SLACK';

export class NotificationPreferencesService {
  /**
   * Evaluates if a user wants a specific notification on a specific channel.
   * Mock implementation: Defaults all users to IN_APP only.
   */
  async getChannelsForUserAndEvent(userId: string, eventType: string): Promise<NotificationChannel[]> {
    // In production, fetch from a `NotificationPreferences` table mapping userId -> eventType -> channels[]
    return ['IN_APP'];
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
