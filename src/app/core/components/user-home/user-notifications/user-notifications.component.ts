import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { Notification } from 'src/app/core/models/notification';
import { UserNotificationService } from './../../../services/user-notification/user-notification.service';
import { Router } from '@angular/router';
import { MediaPreviewComponent } from '../../media/media-preview/media-preview.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MediaService } from 'src/app/core/services/media/media.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';



@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.scss']
})
export class UserNotificationsComponent implements OnInit, OnDestroy {

  unsubscribePatientMedia = new Subject();


  @Output() navigationOccurred: EventEmitter<boolean> = new EventEmitter();

  notificationForm:FormGroup = this.fb.group({
    notifications: this.fb.array([])
  });

  get notificationArray() : FormArray { return this.notificationForm.get('notifications') as FormArray }

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private mediaService: MediaService,
    private notificationsService: UserNotificationService
  ) { }

  ngOnInit() {

    this.notificationsService.getNotifications().subscribe(notifications => this.processNotifications(notifications))
  }

  ngOnDestroy() {
    this.unsubscribePatientMedia.next();
    this.unsubscribePatientMedia.complete();
  }

  processNotifications(notifications: Notification[]) : void {

    this.notificationArray.clear();

    for(let notification of notifications) {

      const newNotification = this.fb.group({
        patientId: notification.patientId,
        notificationId: notification.notificationId,
        notificationText: notification.notificationText,
        notificationTypeId: notification.notificationTypeId,
        notificationRecordId: notification.notificationRecordId,
        notificationParentRecordId: notification.notificationParentRecordId,
        acknowledged: notification.acknowledged,
        timestamp: notification.timestamp,
        tagNumber: notification.tagNumber
      });

      this.notificationArray.controls.push(newNotification);

    }

  }

  followNotification(note: AbstractControl) : void {

    const tagNumber = note.get('tagNumber')?.value;
    const notificationRecordId = `comment-${note.get('notificationRecordId')?.value}`;
    const notificationType = note.get('notificationTypeId')?.value;

    const acknowledged = note.get('acknowledged');

    if(acknowledged?.value){

      this.navigateToComment(notificationType, tagNumber, notificationRecordId, note);
      return;
    }

    acknowledged?.setValue(true);
    this.notificationsService.acknowledgeNotification(note.get('notificationId')?.value).then(result => {

      if(result.success !== 1){
        return;
      }
  
      this.navigateToComment(notificationType, tagNumber, notificationRecordId, note);  
    });

  }

  private navigateToComment(notificationType: any, tagNumber: any, notificationRecordId: string, note: AbstractControl) {

    if (notificationType === 1) {
      this.navigateToFragment(tagNumber, notificationRecordId);
    }
    else {
      this.openPatientMediaItemPreview(note, tagNumber, notificationRecordId);
    }
  }

  private openPatientMediaItemPreview(note: AbstractControl, tagNumber: any, notificationRecordId: string) {

    this.unsubscribePatientMedia.next();

    this.mediaService.getPatientMediaItemsByPatientId(note.get('patientId')?.value).pipe(takeUntil(this.unsubscribePatientMedia)).subscribe(patientMediaItems => {

      let taggedMedia = patientMediaItems.find(items => items.patientMediaItemId === note.get('notificationParentRecordId')?.value);

      if (taggedMedia) {

        const dialogRef = this.dialog.open(MediaPreviewComponent, {
          minWidth: '75vw',
          panelClass: 'media-preview-dialog',
          data: {
            mediaData: taggedMedia
          }
        });

        if (tagNumber) {
          this.navigateToFragment(tagNumber, notificationRecordId);
        }


      }

    });
  }

  private navigateToFragment(tagNumber: any, notificationRecordId: string) {
    this.navigationOccurred.emit(true);
    this.router.navigate(['/nav/hospital-manager', { tagNumber }], { fragment: notificationRecordId, replaceUrl: true });
  }  

  notificationListNextPage() : void {
    this.notificationsService.notificationListNextPage();
  }

  refreshNotifications() : void {
    this.notificationsService.refreshNotifications();
  }

}
