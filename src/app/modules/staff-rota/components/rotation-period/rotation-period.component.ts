import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { RotationPeriodSaveResponse } from 'src/app/core/models/rota';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaService } from '../../services/rota.service';

@Component({
  selector: 'app-rotation-period',
  templateUrl: './rotation-period.component.html',
  styleUrls: ['./rotation-period.component.scss']
})
export class RotationPeriodComponent implements OnInit {

  @Input() inputPeriod! : string;
  period!: FormGroup; 

  private ngUnsubscribe = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  periodPreviousValue = {};

  constructor(
    private rotaService: RotaService,
    public dialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService,
    // private rotationPeriodValidator: RotationPeriodValidator,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.period = this.rotaService.getPeriodByGUID(this.inputPeriod);
  }

  ngOnChanges(change: SimpleChanges) {
    this.period = this.rotaService.getPeriodByGUID(change.inputPeriod.currentValue);

    // const groupId = this.period.get("rotationPeriodGUID")?.value;

    // this.period.get("startDate")?.setValidators(Validators.required);
    // this.period.get("startDate")?.setAsyncValidators(this.rotationPeriodValidator.checkDateNotInExistingRange(groupId, this.rotaService.getRotationPeriodArray));
    // this.period.get("endDate")?.setValidators(Validators.required);
    // this.period.get("endDate")?.setAsyncValidators(this.rotationPeriodValidator.checkDateNotInExistingRange(groupId, this.rotaService.getRotationPeriodArray));

  }

  checkUnassignedStaff(period: string, checked: boolean) : void {

    this.rotaService.getRotationPeriodArray.controls.some(rotationPeriod => {
      if(rotationPeriod.get('rotationPeriodGUID')?.value === period){
  
        rotationPeriod.get('checkUnassigned')?.setValue(checked);
  
      }
  
      return false;
    });
  
    this.rotaService.updateUnassignedStaffList()
  
   }

   async copyRotationPeriod(period : AbstractControl, cycle: boolean){

    const newRotationPeriodGUID = await this.rotaService.addRotationPeriod(undefined, false, true);

    const staffAssignmentAreaShifts = this.rotaService.filterStaffAssignments(period.get('rotationPeriodGUID')?.value, 1)
                               .map(element => {                                

                                 let staffAssignment = this.rotaService.getMatrix.get(element);

                                return {
                                    areaShiftGUID: "" + staffAssignment?.get('staffTaskId')?.value.split('|')[0],
                                    assignedUser: staffAssignment?.get('assignedUser')?.value
                                  };

                              
                              });

    let populatedAssignments = staffAssignmentAreaShifts;

    if(cycle){

      populatedAssignments = staffAssignmentAreaShifts.filter(element => !!element?.assignedUser?.userId);

      const popped = populatedAssignments.pop();

      if(popped) populatedAssignments.unshift(popped);      

    }    

    for(let i = 0, assigned = 0; i < staffAssignmentAreaShifts.length; i++){

      let assignedUser = undefined;
      
      if(!!staffAssignmentAreaShifts[i].assignedUser?.userId || !cycle){

        assignedUser = populatedAssignments[assigned]?.assignedUser;
        assigned++;
      }

      this.rotaService.addAssignedStaffControlToMatrix(staffAssignmentAreaShifts[i]?.areaShiftGUID, newRotationPeriodGUID, assignedUser);   
      this.rotaService.generateTableDataSource();   
   
    }

  this.changeDetector.detectChanges();

  }

  saveRotationPeriod(period: AbstractControl){

    this.rotaService.saveRotationPeriod(period.value).then((response: RotationPeriodSaveResponse) => {

      if(response.success === 1){

        this.updateMatrix()

        this.period.markAsPristine();
        this.changeDetector.detectChanges();

        this.period.get("rotationPeriodId")?.setValue(response.rotationPeriodId);

        this.snackbarService.successSnackBar("Rotation period added successfully", "OK");
      }
      else {

        this.snackbarService.errorSnackBar("ERR: RPC-130: Error adding rotation period, please see administrator", "OK");
      }

    });

  }

  generateRotationPeriodDays(period: AbstractControl) : void {

    this.confirm("Are you sure you want to generate the rota days for this period?").subscribe(response => {

      if(response){
        this.insertRotaDayAssignments(period);
      }

    })

  }

  navigateToRotationPeriod(period: AbstractControl) : void {

    let rotationPeriodId = '' + period.get('rotationPeriodId')?.value;

    this.router.navigate(['/nav/staff-rotation', {rotationPeriodId}], { replaceUrl: true });

  }

  insertRotaDayAssignments(period: AbstractControl) : void {

    this.rotaService.insertRotaDayAssignments(period).then((result:SuccessOnlyResponse) => {

      if(result.success === 1){
        this.snackbarService.successSnackBar("Rota created for all days in the period", "OK");        
        this.rotaService.updateRotationPeriodLocked(period.get('rotationPeriodId')?.value, true);
      }
      else {
        this.snackbarService.errorSnackBar("ERR: RPC-163: Error generating rota day assignments, please see administrator", "OK");
      }

    })
  }

  updateMatrix() : void {

    this.rotaService.upsertMatrix(this.period.get('rotationPeriodGUID')?.value)
    
    /*.then((result:SuccessOnlyResponse) => {

      if(result.success === 1){
        this.snackbarService.successSnackBar("Staff matrix updated successfully", "OK");
      }
      else {
        this.snackbarService.errorSnackBar("ERR: RPC-155: Error updating staff matrix, please see administrator", "OK");
      }

    })
    */

  }

  deleteRotationPeriod(period: AbstractControl) : void {
    
    this.confirm('Are you sure you want to remove this period?').subscribe(response => {

      if(response === true){

        if(!period.get("rotationPeriodId")?.value){
          this.removeRotationPeriodFromArray(period);
          return;
        }

        period.get("isDeleted")?.setValue(true);

        this.rotaService.saveRotationPeriod(period.value).then((response: RotationPeriodSaveResponse) => {

          if(response.success === 1){
    
            this.period.markAsPristine();
            this.changeDetector.detectChanges();
    
            this.snackbarService.successSnackBar("Rotation period deleted successfully", "OK");
          }
          else {
    
            this.snackbarService.errorSnackBar("ERR: RPC-166: Error deleting rotation period, please see administrator", "OK");
          }
    
        });
        
        this.removeRotationPeriodFromArray(period);

      }
    });
    
  }

  private removeRotationPeriodFromArray(period: AbstractControl) {
    const index = this.rotaService.getRotationPeriodArray.controls.findIndex(element => element?.get('rotationPeriodId')?.value === period.get('rotationPeriodId')?.value);

    this.rotaService.getRotationPeriodArray.removeAt(index);
    this.rotaService.generateTableDataSource();
    
    this.changeDetector.detectChanges();
  }

  confirm(message: string) : Observable<any> {

    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message: message,
        buttonText: {
          ok: 'Yes',
          cancel: 'No'
        }
      }
    });
  
    return dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe));  
  
   } 

   editPeriod(period: AbstractControl, editable: boolean) : void {

    this.periodPreviousValue = period.value;
    period?.get('editable')?.setValue(editable);

    this.saveRotationPeriod(period);

  }

  cancelPeriodEdit(period: AbstractControl, editable: boolean) : void {

    period.patchValue(this.periodPreviousValue);
    period?.get('editable')?.setValue(editable);

  }
}
