import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, BehaviorSubject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { LeaveRequest, LeaveRequestReason, LeaveRequestSaveResponse } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { LeaveRequestService } from '../../services/leave-request.service';
import { DailyRotaService } from './../../services/daily-rota.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { getCurrentDateString } from 'src/app/core/helpers/utils';

interface DialogData {
  leaveRequestId: number;
}



@Component({
  selector: 'app-leave-request-form',
  templateUrl: './leave-request-form.component.html',
  styleUrls: ['./leave-request-form.component.scss']
})
export class LeaveRequestFormComponent {

  private ngUnsubscribe = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  leaveRequestForm: ModelFormGroup<LeaveRequest> = this.fb.nonNullable.group({
    leaveRequestId: new FormControl<number | null>(null),
    userId: new FormControl<number | null>(null, Validators.required),
    requestDate: new FormControl<string | Date | null>(getCurrentDateString(), Validators.required),
    leaveRequestReasonId: new FormControl<number | null>(null, Validators.required),
    leaveRequestReason: [''],
    additionalInformation: [''],
    emergencyMedicalLeave: new FormControl<boolean | null>(null),
    leaveStartDate: new FormControl<string | Date | null>(null),
    leaveEndDate: new FormControl<string | Date | null>(null),
    numberOfDays: [-1],
    granted: new FormControl<number | null>(null),
    commentReasonManagementOnly: [''],
    dateApprovedRejected: new FormControl<string | Date | null>(null),
    recordedOnNoticeBoard: new FormControl<boolean | null>(null),
    leaveTaken: new FormControl<number | null>(null),
    leaveTakenComment: [''],
    documentOrMedicalSlipProvided: new FormControl<boolean | null>(null),
    documentOrMedicalSlipAccepted: new FormControl<boolean | null>(null),
    comment: [''],
    isDeleted: [false]
  });

  minDate = getCurrentDateString();

  leaveRequestId = 0;

  requestReasons: Observable<LeaveRequestReason[]>;

  userList: BehaviorSubject<UserDetails[]>;

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
    private dailyRotaService: DailyRotaService,
    private dialogRef: MatDialogRef<LeaveRequestFormComponent>) {

        if(data.leaveRequestId){
          this.leaveRequestId = data.leaveRequestId;
          this.loadLeaveRequest(this.leaveRequestId);
        }

        this.userList = this.dailyRotaService.getUserList();
        this.requestReasons = this.dropdown.getLeaveRequestReasons();
        this.watchRequestDateChanges()
  }

  loadLeaveRequest(loadLeaveRequest: number) : void {

    this.requestService.getLeaveRequests()
    .pipe(takeUntil(this.ngUnsubscribe)).subscribe(requests => {

      let foundRequest = requests.find(element => element.leaveRequestId === loadLeaveRequest);

      console.log(foundRequest);

      if(foundRequest){
        this.leaveRequestForm.patchValue(foundRequest);
      }


    })


  }

  watchRequestDateChanges() : void {

    const startDate = this.leaveRequestForm.get('leaveStartDate')?.valueChanges;
    const endDate = this.leaveRequestForm.get('leaveEndDate')?.valueChanges;

    if(startDate && endDate){

      merge(startDate, endDate).subscribe(() => {

        if(this.leaveStartDate && this.leaveEndDate){

          let startDate = new Date(this.leaveStartDate);
          let endDate = new Date(this.leaveEndDate);

        const numberOfDays = ((endDate.getTime() - startDate.getTime()) / 1000 / 86400) + 1;

        this.numberOfDays?.setValue(numberOfDays);

      }

      });

    }
    
  }

  onConfirmClick(): void {
    this.ngUnsubscribe.next();
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.ngUnsubscribe.next();
    this.dialogRef.close(false);
  }

  get displayFn() {
    return (userId:number) => this.findUser(userId);
  }

  findUser(userId: number) : string {

    let foundUser = this.userList.value.find(user => user.userId === userId);

    return foundUser ? `${foundUser.employeeNumber} - ${foundUser.firstName}` : '';

  }

  saveLeaveRequest() : void {  

    this.requestService.saveLeaveRequest(this.leaveRequestForm.value).then((response: LeaveRequestSaveResponse) => {

      console.log(response);

      switch(response.success){
        case 1 : {
          this.requestService.markLeavesUpdated();
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
