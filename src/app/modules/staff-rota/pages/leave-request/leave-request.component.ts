import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LeaveRequestService } from './../../services/leave-request.service';
import { Department, DisplayLeaveRequest, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { Observable, of, Subject } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LeaveRequestFormComponent } from '../../components/leave-request-form/leave-request-form.component';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { take, takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { LeaveRequestHistoryComponent } from '../../components/leave-request-history/leave-request-history.component';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort) sort!: MatSort;

  ngUnsubscribe = new Subject();

  currentDate = getCurrentDateString();

  dataSource!: MatTableDataSource<DisplayLeaveRequest>;

  defaultFilterPredicate?: (data: any, filter: string) => boolean;

  departments$!: Observable<Department[]>;
  
  displayColumns: Observable<string[]>;
  
  leaveRequests: Observable<DisplayLeaveRequest[]>;

  requests!: DisplayLeaveRequest[];


  constructor(
    private requestService: LeaveRequestService,
    private dialog: MatDialog,
    private dropdown: DropdownService,
    private _liveAnnouncer: LiveAnnouncer,
    private snackbar: SnackbarService
  ) {

    this.leaveRequests = this.requestService.getLeaveRequests();

    this.leaveRequests.pipe(take(1), takeUntil(this.ngUnsubscribe)).subscribe(requests => {
        this.dataSource = new MatTableDataSource(requests);
        this.dataSource.sort = this.sort;
        this.requests = requests;
      });


    this.displayColumns = of(["edit","department","userCode","requestDate","leaveRequestReason",
    "additionalInformation","leaveStartDate","leaveEndDate","numberOfDays","granted","commentReasonManagementOnly",
    "dateApprovedRejected","recordedOnNoticeBoard","delete"
    ]);

    this.requestService.leavesUpdated.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() =>    
        this.leaveRequests = this.requestService.getLeaveRequests()    
    )

    this.departments$ = this.dropdown.getDepartments();

   }

  ngOnInit() {
    this.defaultFilterPredicate = this.dataSource.filterPredicate;    
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
      width: '1000px',
      height: '100vh',
      autoFocus: false,
      data: {
        userId
      },
    });
    
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  departmentFilterChanged(selectedDepartments: number[]) : void {

    console.log(selectedDepartments);

    let filteredRequests = this.requests.filter(request => selectedDepartments.includes(request.departmentId));

    this.dataSource = new MatTableDataSource(selectedDepartments.length > 0 ? filteredRequests : this.requests);
  }

}
