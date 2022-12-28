import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { Department, DisplayLeaveRequest } from 'src/app/core/models/rota';
import { LeaveRequestService } from '../../../../services/leave-request.service';
import { FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { take, takeUntil } from 'rxjs/operators';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

interface DialogData {
  userId?: number
}

@Component({
  selector: 'app-leave-request-history',
  templateUrl: './leave-request-history.component.html',
  styleUrls: ['./leave-request-history.component.scss']
})
export class LeaveRequestHistoryComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject();

  @ViewChild(MatSort) sort!: MatSort;

  request!: DisplayLeaveRequest;

  dataSource!: MatTableDataSource<DisplayLeaveRequest>;

  departments$: Observable<Department[]>;

  displayColumns = ["requestDate","leaveStartDate","leaveEndDate","numberOfDays","leaveRequestReason","granted","additionalInformation"];

  userForm = this.fb.group({
    userId: new FormControl<number | null>(null),
    // departmentId: new FormControl<number | null>({value: null, disabled: true})
    departmentId: new FormControl<number | null>(null)

  });

  get userControl() : AbstractControl<any,any> {
    return this.userForm.get('userId') as unknown as AbstractControl<any,any>;
  }


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private leaveRequestService: LeaveRequestService,
    private fb: FormBuilder,
    private dropdownService: DropdownService,
    private _liveAnnouncer: LiveAnnouncer
  ) {

    this.departments$ = this.dropdownService.getDepartments();

   }

  ngOnInit() {

    const userId = this.data.userId;

    if(userId){
      this.loadRequestsForUserId(userId);
    }

    this.watchUserId();

  }

  ngOnDestroy(): void {
      this.ngUnsubscribe.next();
  }

  private loadRequestsForUserId(userId: number) {
    this.leaveRequestService.getLeaveRequestsForUser(userId).pipe(take(1)).subscribe(requests => {

      if(!requests){
        return;
      }

      this.dataSource = new MatTableDataSource(requests);
      this.dataSource.sort = this.sort;
      this.request = requests[0];
      this.userForm.patchValue(this.request,{emitEvent: false});
    });
  }

  watchUserId() : void {

    this.userControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((userId: number) =>
      this.loadRequestsForUserId(userId)
      );

  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

}
