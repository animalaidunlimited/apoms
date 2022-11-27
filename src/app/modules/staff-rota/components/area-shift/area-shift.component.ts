import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { Observable, Subject } from 'rxjs';
import { map, skip, takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { RotationRole, AreaShiftResponse } from 'src/app/core/models/rota';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { SnackbarService } from './../../../../core/services/snackbar/snackbar.service';
import { RotaSettingsService } from './../../pages/settings/services/rota-settings.service';

@Component({
  selector: 'app-area-shift',
  templateUrl: './area-shift.component.html',
  styleUrls: ['./area-shift.component.scss']
})

export class AreaShiftComponent implements OnInit, OnChanges {

  @Input() inputAreaShift!: AbstractControl;

  private ngUnsubscribe = new Subject();
  private groupSelectedUnsubscribe = new Subject();  

  areaShift!: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  rotationRoles$!:Observable<RotationRole[]>;


  constructor(
    private rotaService: RotaService,
    private snackbarService: SnackbarService,
    private rotaSettingsService: RotaSettingsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {

    this.areaShift = this.inputAreaShift as FormGroup;


    this.rotationRoles$ = this.rotaSettingsService.getRotationRoles(false);

    // this.rotaSettingsService.getRotationRoles(false).subscribe(values => {
    //     // this.rotationRoles$ = values;
    //     console.log(values)
    //   });

    // skip(1), 
    // this.areaShift.get('colour')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

    //   //This takes a tick to update, so let's wait
    //   setTimeout(() => this.saveAreaShift(this.areaShift), 1);
      
    // });
  }

  ngOnDestroy() : void {
    this.ngUnsubscribe.next();
    this.groupSelectedUnsubscribe.next();
    
  }

  ngOnChanges(change: SimpleChanges) {    
    // this.areaShift = this.inputAreaShift as FormGroup;
  }

  groupSelected($event: MatSelectChange, areaShift: AbstractControl) : void {

    this.groupSelectedUnsubscribe.next();

    // let role = this.rotationRoles$.find(element => element.rotationRoleId === $event.value);

    //   areaShift.patchValue(role);   
      
    //   this.saveAreaShift(areaShift);

    this.rotationRoles$.pipe(takeUntil(this.groupSelectedUnsubscribe)).subscribe(roles => {

      let role = roles.find(element => element.rotationRoleId === $event.value);

      areaShift.patchValue(role);   
      
      this.saveAreaShift(areaShift);

    });

  }

  private saveAreaShift(areaShift: AbstractControl) {

    this.rotaService.upsertAreaShift(areaShift.value).then((result: AreaShiftResponse) => {

      if (result.success !== 1)  {
        this.snackbarService.errorSnackBar("ERR: RS-90: Error adding area shift, please see administrator", "OK");
      }

    });
  }

  deleteAreaShift(areaShift: AbstractControl) : void
  {

  this.confirm('Are you sure you want to remove this shift?').subscribe(response => {
    if(response === true){

      this.rotaService.deleteAreaShift(areaShift).then(result => {

        if(result.success === 1){
          this.rotaService.updateUnassignedStaffList();
          this.snackbarService.successSnackBar("Group deleted successfully", "OK");
        }
        else {
          this.snackbarService.errorSnackBar("ERR: SRP-259: Error removing area shift, please see administrator", "OK");
        }

      });

    }
  });

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

  return dialogRef.afterClosed()
  .pipe(takeUntil(this.ngUnsubscribe));  

  }

  updateColour() : void {
    this.saveAreaShift(this.areaShift);
  }

}
