import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { HourRange, Vehicle, VehicleShift } from 'src/app/core/models/vehicle';
import { VehicleService } from '../../services/vehicle.service';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VehicleShiftDialogComponent } from '../../dialogs/vehicle-shift-dialog/vehicle-shift-dialog.component';
import { getShiftLeftStartingPosition, getShiftLengthAsPercentageOf24Hours } from 'src/app/core/helpers/utils';

@Component({
  selector: 'app-vehicle-shift',
  templateUrl: './vehicle-shift.component.html',
  styleUrls: ['./vehicle-shift.component.scss']
})
export class VehicleShiftComponent implements OnInit {

  @Input() vehicle!: Vehicle;
  @Input() shiftDate!: string | null | undefined;

  currentDayStart!:Date;
  currentDayEnd!:Date;  

  hours:number[] = [];
  hourRange!: HourRange;

  shifts$!: Observable<VehicleShift[]>;
  private ngUnsubscribe = new Subject();

  constructor(
    private vehicleService: VehicleService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.vehicle.imageURL = this.vehicle.imageURL || "assets/images/image_placeholder.png";

    this.vehicleService.vehicleDefaultsChanged.subscribe((changed) => {

      if(changed){
        this.initialiseShiftRange();        
      }     
    
    });

    this.initialiseShiftRange();

  }

  private initialiseShiftRange() {
    this.hourRange = this.vehicleService.getHourRange();
    this.hours = this.hourRange.range;

    this.currentDayStart = new Date(this.shiftDate || "");
    this.currentDayStart.setHours(this.hourRange.start, 0, 0);

    this.currentDayEnd = new Date(this.shiftDate || "");
    this.currentDayEnd.setHours(this.hourRange.end, 59, 59, 999);

    this.shifts$ = this.vehicleService.vehicleShifts.pipe(map(shifts => shifts
      .filter(shift => shift.vehicleId === this.vehicle.vehicleId)
      .map(shift => {

        // We need to work out how long the shift is in minutes and then work that out as a % of the number of minutes in a day.
        // Then this becomes the width of the element as a % of the parent width.
        shift.length = getShiftLengthAsPercentageOf24Hours(shift.shiftEndTimeDate.getTime(), shift.shiftStartTimeDate.getTime(), this.hourRange);

        // Now we need to work out how far to the right we need to shift the div. This is the difference between midnight and the start
        // time of the shift as a % of 24 hours.
        shift.left = getShiftLeftStartingPosition(shift.shiftStartTimeDate.getTime(), this.hourRange)

        return shift;

      }

      )));
  }

  addShift() : void {

    this.dialog.open(VehicleShiftDialogComponent, {
      data:{
        vehicle: this.vehicle,
        currentDate: this.shiftDate
      }
    });

  }

  editShift(editShift: VehicleShift) : void {

    this.dialog.open(VehicleShiftDialogComponent, {
      data:{
        vehicle: this.vehicle,
        shift: editShift,
        currentDate: this.shiftDate
      }
    });

  }

  removeShift(shift: VehicleShift) : void{

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
        this.vehicleService.removeShift(shift);
      }
    });

  }


}
