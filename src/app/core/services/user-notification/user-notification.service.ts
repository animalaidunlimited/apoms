import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AcknowledgedNotificationResponse, Notification, NotificationResponse, NotificationInsertResponse, UnsavedNotification } from '../../models/notification';
import { APIService } from '../http/api.service';
import { SuccessOnlyResponse } from './../../models/responses';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService extends APIService {

  endpoint = 'UserAdmin';

  notification = new BehaviorSubject<Notification[]>([]);
  unacknowledgedNotifications = new BehaviorSubject<number>(0);

  fetchLimit = 5;
  offset = 0;

constructor(public http: HttpClient) {
  super(http);
  this.populateNotifications(this.fetchLimit, this.offset, false);
 }

 public getNotifications() : BehaviorSubject<Notification[]> {
  return this.notification;
 }

 public notificationCount() : BehaviorSubject<number> {

  return this.unacknowledgedNotifications;

 }

 public refreshNotifications() {

  this.fetchLimit = 5;
  this.offset = 0;

  this.notification.next([]);

  this.populateNotifications(this.fetchLimit, this.offset, false);

 }

 public populateNotifications(start: number, offset:number, unshift:boolean): void {

    const request = `/GetNotificationsForUser?start=${start}&offset=${offset}`;

    this.get(request)
    .then((result:any) => {

      result.notifications = JSON.parse(result.notifications)
      
      return result as NotificationResponse
    })
    .then(notificationResponse => {

    let currentNotifications = this.notification.value;

    //If we're adding a brand new notification, then it needs to go to the front, not the back.
    for (let notification of notificationResponse.notifications){

      unshift ? currentNotifications.unshift(notification) : currentNotifications.push(notification)

    }    

    this.unacknowledgedNotifications.next(notificationResponse.totalUnacknowledged)

    this.notification.next(currentNotifications)});
}

public async acknowledgeNotification(notificationId: number | undefined) : Promise<AcknowledgedNotificationResponse> {

  const body = {
    notificationId,
    acknowledged: true
  };

  return this.putSubEndpoint("UpdateUserNotification", body).then((response:AcknowledgedNotificationResponse) => {

    this.unacknowledgedNotifications.next(response.totalUnacknowledged);

    this.updateNotificationAcknowledged(notificationId);

    return response;

  });

}

  private updateNotificationAcknowledged(notificationId: number | undefined) {

    let current = this.notification.value;

    const index = current.findIndex(element => element.notificationId === notificationId);

    current[index].acknowledged = true;

    this.notification.next(current);
  }

public insertUserNotification(notification: UnsavedNotification) : void {

  this.postSubEndpoint("InsertUserNotification",notification).then((result: NotificationInsertResponse) => {

    this.populateNotifications(1, 0, true);
  });

}

public notificationListNextPage() : void {
  
  this.offset = this.offset + 5;

  this.populateNotifications(this.fetchLimit, this.offset, false);
  }
}
