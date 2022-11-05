import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Comment } from '../../models/comment'
import { CommentService } from '../../services/comment/comment.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserDetailsService } from './../../services/user-details/user-details.service';
import { UserOptionsService } from './../../services/user-option/user-options.service';
import { UserDetails } from '../../models/user';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {

  comments$: BehaviorSubject<Comment[]> = new BehaviorSubject<Comment[]>([]);

  commentForm: FormGroup = this.fb.group({currentComment: ""});

  private ngUnsubscribe = new Subject();
  private ngUnsubscribeImages = new Subject();

  currentMentions: UserDetails[] = [];

  @Input() parentRecordId! : number;
  @Input() parentRecordType! : string;

  mentionUsers: UserDetails[] = [];
  mentionConfig = {triggerChar:'@', labelKey:'firstName'}

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private snackbar: SnackbarService,
    private route: ActivatedRoute,
    private userOptionsService: UserOptionsService,
    private userDetailsService: UserDetailsService
  ) { 

    route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {      
      
            setTimeout(() => {
              if(this.route.snapshot.fragment){            
    
                const element = document.querySelector(`#${this.route.snapshot.fragment}`);
                if (element) {
                    element.scrollIntoView();
                }
              }
            }, 1500)
  });

  }

  ngOnInit() {

    this.loadComments();

    this.userDetailsService.getUsersByIdRange(this.userOptionsService.getUserName()).then((userListData: UserDetails[])=>{
      this.mentionUsers = userListData;
    });


  }
  ngOnChanges(changes: SimpleChanges) : void {

    this.ngUnsubscribeImages.next();
    this.loadComments();

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribeImages.next();
    this.ngUnsubscribeImages.complete();
  }

  private loadComments() {
    this.commentService.getComments(this.parentRecordId || -1, this.parentRecordType)
      .pipe(takeUntil(this.ngUnsubscribeImages))
      .subscribe((comments) => this.comments$.next(comments));
  }



  submitComment(): void {

    let comment = this.commentForm.get("currentComment")?.value;

    if(!comment){
      return;
    }

    const mentionedUsers = this.currentMentions.filter(user => comment.toLowerCase().includes(user.userName.toLowerCase()))
                                                  .map(user => user.userId);

    

    const commentResponse = this.commentService.saveComment(this.parentRecordId || -1, this.parentRecordType, comment, mentionedUsers);

    commentResponse.then((response) => {

      if(response.success === 1){
        this.commentForm.get("currentComment")?.reset();
        // tslint:disable-next-line: deprecation
        this.commentService.getComments(this.parentRecordId || -1, this.parentRecordType)
                            .pipe(takeUntil(this.ngUnsubscribe))
                            .subscribe((comments)=> this.comments$.next(comments));

        this.snackbar.successSnackBar('Comment added successfully', 'OK');

      }
      else if(response.success === 2){
        this.snackbar.errorSnackBar('Unable to add duplicate message', 'OK');

      }
      else      
      {
        this.snackbar.errorSnackBar('Error adding comment: ERR-CC:61', 'OK');
      }
    });


  }

  userMentioned($event:UserDetails) : void {

    this.currentMentions.push($event);

  }

  
  trackComment(index:number, item:any){
    return item.timestamp;
  }

}
