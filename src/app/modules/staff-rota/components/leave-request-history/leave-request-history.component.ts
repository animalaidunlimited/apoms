import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { DisplayLeaveRequest } from 'src/app/core/models/rota';
import { LeaveRequestFormComponent } from '../leave-request-form/leave-request-form.component';
import { LeaveRequestService } from './../../services/leave-request.service';
import { FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { UserDetails } from 'src/app/core/models/user';
import { DailyRotaService } from '../../services/daily-rota.service';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';

interface DialogData {
  userId?: number
}

@Component({
  selector: 'app-leave-request-history',
  templateUrl: './leave-request-history.component.html',
  styleUrls: ['./leave-request-history.component.scss']
})
export class LeaveRequestHistoryComponent implements OnInit {

  requests: Observable<DisplayLeaveRequest[]> | undefined;

  userForm = this.fb.group({
    userId: new FormControl<number | null>(null)
  });

  get userControl() : AbstractControl<any,any> {
    return this.userForm.get('userId') as unknown as AbstractControl<any,any>;
  }


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private leaveRequestService: LeaveRequestService,
    private fb: FormBuilder,
    private userDetailsService: UserDetailsService,
    private dailyRotaService: DailyRotaService,
    private dialogRef: MatDialogRef<LeaveRequestFormComponent>
  ) {


   }

  ngOnInit() {

    const userId = this.data.userId;

    if(userId){
      this.requests = this.leaveRequestService.getLeaveRequestsForUser(userId);
    }

  }

  dis() {
    console.log(this.userForm.value);
  }

}
