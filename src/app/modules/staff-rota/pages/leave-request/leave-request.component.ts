import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeaveRequestService } from './../../services/leave-request.service';
import { LeaveRequest, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { Observable, of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LeaveRequestFormComponent } from '../../components/leave-request-form/leave-request-form.component';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { take, takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { LeaveRequestHistoryComponent } from '../../components/leave-request-history/leave-request-history.component';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject();

  leaveRequests: Observable<LeaveRequest[]>;
  displayColumns: Observable<string[]>;

  constructor(
    private requestService: LeaveRequestService,
    private dialog: MatDialog,
    private snackbar: SnackbarService
  ) {

    this.leaveRequests = this.requestService.getLeaveRequests();

    this.displayColumns = of(["edit","department","userCode","requestDate","leaveRequestReason",
    "additionalInformation","leaveStartDate","leaveEndDate","numberOfDays","granted","commentReasonManagementOnly",
    "dateApprovedRejected","recordedOnNoticeBoard","delete"
    ]);

    this.requestService.leavesUpdated.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() =>    
        this.leaveRequests = this.requestService.getLeaveRequests()    
    )

   }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
  }

  launchEditModal(leaveRequestId?: number) : void {

    const dialogRef = this.dialog.open(LeaveRequestFormComponent, {
      width: '650px',
      height: '100vh',
      autoFocus: false,
      data: {
        leaveRequestId
      },
    });


  }

  confirmDeleteLeaveRequest(leaveRequestId: number) : void {

    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Yes',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteLeaveRequest(leaveRequestId)
      }
    });

  }

  deleteLeaveRequest(leaveRequestId: number) : void {

    this.leaveRequests.pipe(take(1)).subscribe(requests => {

      const requestToDelete = requests.find(request => request.leaveRequestId === leaveRequestId);

      if(!requestToDelete){
        return;
      }

      requestToDelete.isDeleted = true;

      this.requestService.deleteLeaveRequest(requestToDelete).then((response: LeaveRequestSaveResponse) => {

        switch(response.success){
          case 1 : {
            this.snackbar.successSnackBar("Leave request deleted successfully", "OK");
            break;
          }
          case 2 : {
            this.snackbar.errorSnackBar("Leave request does not exist", "OK");
            break;
          }
          default : {
            this.snackbar.errorSnackBar("An error occurred: LRF-135", "OK");
          }
        }

      });

    });

  }

  launchSearchModal(userId?: number) : void {

    const dialogRef = this.dialog.open(LeaveRequestHistoryComponent, {
      width: '650px',
      height: '100vh',
      autoFocus: false,
      data: {
        userId
      },
    });
    
  }

}
