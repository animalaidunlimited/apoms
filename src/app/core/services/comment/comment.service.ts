import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIService } from 'src/app/core/services/http/api.service';
import { getNotificationTypeFromCommentType } from '../../helpers/utils';
import { Comment } from '../../models/comment';
import { UnsavedNotification } from '../../models/notification';
import { UserNotificationService } from '../user-notification/user-notification.service';

interface CommentResponse{
  success: number;
}

@Injectable({
  providedIn: 'root'
})

export class CommentService extends APIService{

  endpoint = 'Comment';

  

constructor(
  private userNotificationService: UserNotificationService,
  http: HttpClient
) { super(http); }

public async saveComment(parentRecordId: number, parentRecordType: string, comment: string, mentionedUsers: number[]) : Promise<CommentResponse> {

  const saveValue = {
    parentRecordId, 
    parentRecordType,
    comment,
    mentionedUsers
  }

  return await this.post(saveValue).then(result => {

    if(result.success === 1) {

      for (let user of mentionedUsers) {
        
        let type = getNotificationTypeFromCommentType(parentRecordType);

        const notification: UnsavedNotification = {
          notifiedUserId: user,
          notificationTypeId: type,
          notificationParentRecordId: parentRecordId,
          notificationRecordId: result.commentId

        }

        this.userNotificationService.insertUserNotification(notification)

      }
      
    }

    return result;

  })
  .catch(error => {
      console.log(error);
  });

}

public getComments(parentRecordId: number, parentRecordType: string): Observable<Comment[]> {

  const request = `?parentRecordId=${parentRecordId}&parentRecordType=${parentRecordType}`;

  return this.getObservable(request).pipe(
      map(response => {
          return  response?.sort((comment1: Comment,comment2:Comment)=> {
              return new Date(comment2.timestamp).valueOf() - new Date(comment1.timestamp).valueOf();
          });

      })
  );
}

}
