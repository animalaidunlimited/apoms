import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, BehaviorSubject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { Festival, LeaveRequest, LeaveRequestReason, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { LeaveRequestService } from '../../../../services/leave-request.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { maxDateTodayValidator, maxDateValidator, minDateValidator } from 'src/app/core/validators/date-validators';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';



  export const DATE_FORMATS = {
    parse: {
      dateInput: ["dd.MM.yyyy", "DD/MM/yyyy", "dd,MM,yyyy"], // to accept different input styles from user
    },
    display: {
      dateInput: "DD/MM/yyyy", // display format in input field
      monthYearLabel: 'yyyy MMMM',
      dateA11yLabel: 'MMMM d, y',//'LL',
      monthYearA11yLabel: 'MMMM yyyy'
    },
  };

interface DialogData {
  leaveRequestId: number;
}

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' }
  ],
})
export class LeaveRequestFormComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  festivals$: Observable<Festival[]>;
  
  leaveCancelled = false;

  leaveRequestForm: ModelFormGroup<LeaveRequest> = this.fb.nonNullable.group({
    leaveRequestId: new FormControl<number | null>(null),
    userId: new FormControl<number | null>(null, Validators.required),
    requestDate: new FormControl< Date | string | null>(new Date(getCurrentDateString()), [Validators.required, maxDateTodayValidator()]),
    leaveRequestReasonId: new FormControl<any | null>(null, Validators.required),
    leaveRequestReason: [''],
    leaveStartDate: new FormControl< Date | string | null>(null, Validators.required ),
    leaveEndDate: new FormControl< Date | string | null>(null, Validators.required ),    
    additionalInformation: [''],
    numberOfDays: [-1],
    granted: new FormControl<number | null>(null),
    commentReasonManagementOnly: [''],
    dateApprovedRejected: new FormControl< Date | string | null>(null, maxDateTodayValidator()),
    dateLeaveCancelled: new FormControl< Date | string | null>(null, maxDateTodayValidator()),
    recordedOnNoticeBoard: new FormControl<boolean | null>(null, maxDateTodayValidator()),
    withinProtocol: new FormControl<boolean | null>(null),
    festivalId: new FormControl<number | null>(null),
    lastFestivalDetails: new FormControl<any | null>(null),
    isDeleted: [false]
  });  

  leaveRequestId = 0;

  minDate = getCurrentDateString();

  requestReasons$: Observable<LeaveRequestReason[]>;

  userList: BehaviorSubject<UserDetails[]>;

  get requestDate() : string | Date | null | undefined {
    return this.leaveRequestForm.get('requestDate')?.value;
  }

  get leaveStartDate() : string | Date | null | undefined {
    return this.leaveRequestForm.get('leaveStartDate')?.value;
  }

  get leaveEndDate() : string | Date | null | undefined{
    return this.leaveRequestForm.get('leaveEndDate')?.value;
  }

  get numberOfDays() : AbstractControl<number, number> | null {
    return this.leaveRequestForm.get('numberOfDays');
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private requestService: LeaveRequestService,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private dropdown: DropdownService,
    private userDetailsService: UserDetailsService,
    private MatDialogRef: MatDialogRef<boolean>) {

        this.userList = this.userDetailsService.getScheduleUserList();
        this.requestReasons$ = this.dropdown.getLeaveRequestReasons();
        this.festivals$ = this.dropdown.getFestivals();
        this.watchRequestDateChanges();
        this.watchGrantedChanges();
      
      }

  ngOnInit() : void {

    if(this.data.leaveRequestId){
      this.leaveRequestId = this.data.leaveRequestId;
      this.loadLeaveRequest(this.leaveRequestId);
      this.checkAgainstProtocol();
    }

  }

  ngOnDestroy() : void {

    this.ngUnsubscribe.next();

  }

  loadLeaveRequest(loadLeaveRequest: number) : void {

    this.requestService.leaveRequests
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe(requests => {

      let foundRequest = requests.find(element => element.leaveRequestId === loadLeaveRequest);

      if(foundRequest){
        
        this.leaveRequestForm.patchValue(foundRequest);

      }

    });

  }

  compareRequestReason(o1: LeaveRequestReason, selectedReason: number) : boolean {

    return o1?.leaveRequestReasonId === selectedReason;
}

  requestReasonSelected(reason: LeaveRequestReason) : void {
    this.leaveRequestForm.get('leaveRequestReasonId')?.setValue(reason.leaveRequestReasonId);
    this.leaveRequestForm.get('leaveRequestReason')?.setValue(reason.leaveRequestReason);
  }

  watchRequestDateChanges() : void {

    const leaveStart = this.leaveRequestForm.get('leaveStartDate');
    const leaveEnd = this.leaveRequestForm.get('leaveEndDate');

    const startDate = leaveStart?.valueChanges;
    const endDate = leaveEnd?.valueChanges;

    if(startDate && endDate){

      merge(startDate, endDate).subscribe(() => {

        this.setLeaveDays();
        this.checkAgainstProtocol();

        this.resetLeaveDateValidators(leaveStart, leaveEnd);

      });

    }
    
  }

  watchGrantedChanges() : void {

    this.leaveRequestForm.get('granted')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => {

      if(!changes) return;
  
      if(changes < 3){
        this.leaveCancelled = false;
        this.leaveRequestForm.get('dateApprovedRejected')?.setValue(new Date(getCurrentDateString()));
        this.leaveRequestForm.get('dateLeaveCancelled')?.reset();
        return;
      }
        
      this.leaveCancelled = true;
      this.leaveRequestForm.get('dateLeaveCancelled')?.setValue(new Date(getCurrentDateString()));

    })

  }

  private resetLeaveDateValidators(leaveStart: AbstractControl<string | Date | null, string | Date | null>, leaveEnd: AbstractControl<string | Date | null, string | Date | null>) {
    
    leaveStart?.clearValidators();
    leaveEnd?.clearValidators();

    leaveStart?.setValidators([ Validators.required,
                                minDateValidator(new Date(this.requestDate || "")),
                                maxDateValidator(new Date(leaveEnd?.value || ""))]);

    leaveEnd?.setValidators([Validators.required, minDateValidator(new Date(leaveStart?.value || ""))]);

  }

  private setLeaveDays() {
    if (this.leaveStartDate && this.leaveEndDate) {

      let startDate = new Date(this.leaveStartDate);
      let endDate = new Date(this.leaveEndDate);

      startDate.setHours(0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const numberOfDays = Math.floor(((endDate.getTime() - startDate.getTime()) / 1000 / 86400)) + 1;

      this.numberOfDays?.setValue(numberOfDays);

    }
  }

  checkAgainstProtocol() : void {

    let noticeDaysRequired = this.leaveRequestForm.get('leaveRequestReason')?.value?.toLowerCase() === 'festival' ?
      this.requestService.getFestivalNoticeDays(this.leaveRequestForm.get('leaveRequestReasonId')?.value || -1) :
      this.requestService.getNonFestivalNoticeDays(this.numberOfDays?.value || -1);

    const noticeGiven = ((new Date(this.leaveStartDate || "").getTime()) - (new Date(this.requestDate || "").getTime())) / 86400 / 1000;

    this.leaveRequestForm.get('withinProtocol')?.setValue(noticeGiven > noticeDaysRequired);

  }

  onConfirmClick(): void {
    this.ngUnsubscribe.next();
    this.MatDialogRef.close(true);
  }

  onCancel(): void {
    this.ngUnsubscribe.next();
    this.MatDialogRef.close(false);
  }

  get displayFn() {
    return (userId:number) => this.userDetailsService.getUserCode(userId);
  }

  saveLeaveRequestAndClose() : void {

    this.saveLeaveRequest();
    this.MatDialogRef.close(true);

  }


  saveLeaveRequest() : void {  

    this.requestService.saveLeaveRequest(this.leaveRequestForm.value).then((response: LeaveRequestSaveResponse) => {

      switch(response.success){
        case 1 : {
          this.requestService.getLeaveRequests();
          this.leaveRequestForm.get('leaveRequestId')?.setValue(response.leaveRequestId);
          this.snackbar.successSnackBar("Leave request saved successfully", "OK");
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

  }

}
