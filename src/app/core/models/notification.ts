

export interface Notification {
  patientId: number,
  notificationId: number,
  notificationText: string;
  notificationTypeId: number;
  notificationRecordId: number;
  notificationParentRecordId: number;
  acknowledged: boolean;
  timestamp: string;
  tagNumber: string;
}

export interface NotificationResponse{
  notifications: Notification[],
  totalUnacknowledged: number
}

export interface UnsavedNotification {
  notifiedUserId: number,
  notificationTypeId: number,
  notificationParentRecordId: number,
  notificationRecordId: number
}

export interface AcknowledgedNotificationResponse{
  success: number;
  totalUnacknowledged: number
}

export interface NotificationInsertResponse{
  success: number;
  notificationId: number
}