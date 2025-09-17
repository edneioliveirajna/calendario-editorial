export type ContentType = 'video' | 'image' | 'text' | 'campaign' | 'ad';
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'linkedin';
export type Status = 'pending' | 'completed' | 'overdue';

export type FilterValue = ContentType | Platform | Status | 'all';

export interface CalendarTask {
  id: string;
  title: string;
  contentType: ContentType;
  platforms: Platform[];
  status: Status;
  date: Date;
  description?: string;
  notes_count?: number;
  has_notes?: boolean;
  // Permissões do calendário compartilhado
  calendarPermissions?: {
    can_edit: boolean;
    can_delete: boolean;
    can_share: boolean;
  };
  isCalendarOwner?: boolean;
}

export interface CalendarSettings {
  companyName: string;
  startMonth: string;
  uniqueUrl?: string;
  calendarId?: number;
}