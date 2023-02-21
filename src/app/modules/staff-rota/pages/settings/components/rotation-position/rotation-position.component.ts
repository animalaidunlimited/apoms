import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { startWith, takeUntil, map } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { GroupedRotationAreaPosition } from 'src/app/core/models/rota';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaSettingsService } from '../../services/rota-settings.service';
import { MaterialModule } from './../../../../../../material-module';
import { CommonModule } from '@angular/common';
import { generateUUID } from 'src/app/core/helpers/utils';

@Component({
  standalone: true,
  imports: [
            MaterialModule,
            ReactiveFormsModule,
            CommonModule
  ],

selector: 'app-rotation-position',
  templateUrl: './rotation-position.component.html',
  styleUrls: ['./rotation-position.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationPositionComponent implements OnInit, OnDestroy {

  @Input() inputRotationPositionForm!: AbstractControl<any, any>;
  
  @Output() saveRequired: EventEmitter<boolean> = new EventEmitter(false);

  private ngUnsubscribe = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  groupedRotationAreaPosition!: GroupedRotationAreaPosition[];
  filteredGroupedRotationAreaPosition: Observable<GroupedRotationAreaPosition[]>  | undefined;  

  rotationPositionForm = this.fb.group({
    rotationRoleShiftSegmentId: new FormControl<number | null>(null),
    rotationRoleShiftSegmentUUID: new FormControl<string | null>(generateUUID()),
    startTime: new FormControl<string | null>(null, Validators.required),
    endTime: new FormControl<string | null>(null, Validators.required),
    sameDay: new FormControl<boolean | null>(false, Validators.required),
    shiftSegmentTypeId: new FormControl<number | string>("", Validators.required),
    isDeleted: new FormControl<boolean>(false, Validators.required)
  });

  get shiftSegmentTypeId() : FormControl<number | null> {
    return this.rotationPositionForm?.get('shiftSegmentTypeId') as FormControl<number | null>;
  }

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private rotaSettingsService: RotaSettingsService,
    private changeDetector : ChangeDetectorRef
  ) {   

   }

  ngOnInit() {

    this.rotaSettingsService.getGroupedRotationAreaPositions(false).pipe(takeUntil(this.ngUnsubscribe)).subscribe(positions => {
      
      this.groupedRotationAreaPosition = positions;
      
      this.rotationPositionForm = this.inputRotationPositionForm as FormGroup;

      this.filteredGroupedRotationAreaPosition = this.rotationPositionForm?.get("shiftSegmentTypeId")?.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      );

      this.changeDetector.detectChanges();
      
    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private _filter(value: string | number): GroupedRotationAreaPosition[] {

    if(typeof value === "number" || !value) return this.groupedRotationAreaPosition;

    const filterValue = value.toLowerCase();

    return this.groupedRotationAreaPosition.reduce((returnValue, currentPosition) => {

      const foundValue = currentPosition.positions.filter(position => position.rotationAreaPosition.toLowerCase().includes(filterValue));

      if(foundValue.length > 0){

        currentPosition.positions = currentPosition.positions.filter(position => position.rotationAreaPosition.toLowerCase().includes(filterValue));
        returnValue.push(currentPosition);
      }      

      return returnValue;
      
    }, [] as GroupedRotationAreaPosition[]);

  }

  deleteShiftSegmentType(){

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
        this.rotationPositionForm.get('isDeleted')?.setValue(true);

        this.changeDetector.detectChanges();

        if(this.rotationPositionForm.get('rotationRoleShiftSegmentId')?.value){
          this.saveRequired.emit(true);
        }
      }
    });
    
  }

  get displayFn() {

    return (rotationAreaPositionId: number) => this.findRotationAreaPosition(rotationAreaPositionId);
    
  }

  private findRotationAreaPosition(rotationAreaPositionId: number) : string {

    if(rotationAreaPositionId === -3) {
      return "Tea break";
    }

    if(rotationAreaPositionId === -2) {
      return "Lunch break"
    }

    const foundArea =  this.groupedRotationAreaPosition?.find(groups =>
                                                                groups.positions?.some(position => position.rotationAreaPositionId === rotationAreaPositionId)
    );

    const foundValue = foundArea?.positions.find(position => position.rotationAreaPositionId === rotationAreaPositionId)

    return foundValue?.rotationAreaPosition || "";
  }
}
