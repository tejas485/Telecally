import { InterviewEvent, JobApplication } from '../types';
import { telephonyAudio } from './telephonyAudio';

export interface ActiveAlert {
  id: string;
  type: 'interview' | 'deadline' | 'follow_up';
  title: string;
  subtitle: string;
  timeRemaining: string;
  urgency: 'critical' | 'warning' | 'info';
  applicationId?: string;
  recruiterPhone?: string;
  meetingUrl?: string;
}

class ReminderManager {
  private hasRequestedPermission = false;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasRequestedPermission = true;
      return permission === 'granted';
    }
    return false;
  }

  notify(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }
    }
    // Also play audio chime
    telephonyAudio.playNotificationChime();
  }

  calculateTimeRemaining(dateStr: string, timeStr?: string): {
    formatted: string;
    diffHours: number;
    diffDays: number;
    isPast: boolean;
  } {
    const now = new Date();
    const target = new Date(timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T23:59:59`);
    const diffMs = target.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    const remainingMins = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (isPast) {
      if (diffDays > 0) return { formatted: `${diffDays}d ago`, diffHours, diffDays, isPast: true };
      return { formatted: `${diffHours}h ${remainingMins}m ago`, diffHours, diffDays, isPast: true };
    }

    if (diffDays > 1) {
      return { formatted: `in ${diffDays} days`, diffHours, diffDays, isPast: false };
    }
    if (diffDays === 1) {
      return { formatted: `Tomorrow (${timeStr || 'EOD'})`, diffHours, diffDays, isPast: false };
    }
    if (diffHours > 0) {
      return { formatted: `in ${diffHours}h ${remainingMins}m`, diffHours, diffDays, isPast: false };
    }
    return { formatted: `in ${remainingMins} mins!`, diffHours, diffDays, isPast: false };
  }

  getActiveAlerts(applications: JobApplication[]): ActiveAlert[] {
    const alerts: ActiveAlert[] = [];
    const now = new Date();

    applications.forEach(app => {
      // Check upcoming interviews
      app.interviews?.forEach(int => {
        if (int.status === 'upcoming') {
          const { formatted, diffHours, isPast } = this.calculateTimeRemaining(int.date, int.time);
          if (!isPast && diffHours <= 48) {
            alerts.push({
              id: `alert-int-${int.id}`,
              type: 'interview',
              title: `${int.title} - ${int.company}`,
              subtitle: `Scheduled for ${int.date} at ${int.time} (${int.durationMinutes} min round)`,
              timeRemaining: formatted,
              urgency: diffHours <= 3 ? 'critical' : diffHours <= 24 ? 'warning' : 'info',
              applicationId: app.id,
              recruiterPhone: int.interviewerPhone || app.recruiterPhone,
              meetingUrl: int.meetingUrl
            });
          }
        }
      });

      // Check upcoming application deadlines
      if (app.deadlineDate && app.stage !== 'rejected' && app.stage !== 'hr_offer') {
        const { formatted, diffDays, diffHours, isPast } = this.calculateTimeRemaining(app.deadlineDate);
        if (!isPast && diffDays <= 4) {
          alerts.push({
            id: `alert-dead-${app.id}`,
            type: 'deadline',
            title: `Action Deadline: ${app.role}`,
            subtitle: `${app.company} application review deadline approaching`,
            timeRemaining: formatted,
            urgency: diffDays <= 1 ? 'critical' : 'warning',
            applicationId: app.id,
            recruiterPhone: app.recruiterPhone
          });
        }
      }

      // Check pending recruiter follow-ups if last contact was > 4 days ago
      if (app.lastContactDate && (app.stage === 'screening' || app.stage === 'technical')) {
        const lastContact = new Date(app.lastContactDate);
        const daysSinceContact = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceContact >= 4) {
          alerts.push({
            id: `alert-follow-${app.id}`,
            type: 'follow_up',
            title: `Follow-up recommended: ${app.company}`,
            subtitle: `No contact with ${app.recruiterName} for ${daysSinceContact} days`,
            timeRemaining: `${daysSinceContact}d since contact`,
            urgency: 'info',
            applicationId: app.id,
            recruiterPhone: app.recruiterPhone
          });
        }
      }
    });

    return alerts;
  }

  downloadIcsFile(interview: InterviewEvent) {
    const startTimeStr = interview.time.replace(':', '');
    const dateFormatted = interview.date.replace(/-/g, '');
    const dtStart = `${dateFormatted}T${startTimeStr}00`;
    
    // End time
    const startHour = parseInt(interview.time.split(':')[0], 10);
    const startMin = parseInt(interview.time.split(':')[1], 10);
    const endTotalMin = startHour * 60 + startMin + interview.durationMinutes;
    const endHour = String(Math.floor(endTotalMin / 60) % 24).padStart(2, '0');
    const endMin = String(endTotalMin % 60).padStart(2, '0');
    const dtEnd = `${dateFormatted}T${endHour}${endMin}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OmniCareer//Job Interview Organizer//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${interview.id}@omnicareer.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${interview.title} - ${interview.company}`,
      `DESCRIPTION:Interview for ${interview.role}. Interviewer: ${interview.interviewerNames}. Notes: ${interview.notes || 'None'}`,
      `LOCATION:${interview.meetingUrl || 'Virtual Softphone / Video'}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${interview.title} in 15 minutes`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${interview.company.replace(/\s+/g, '_')}_Interview.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const reminderManager = new ReminderManager();
