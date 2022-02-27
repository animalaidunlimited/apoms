import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { HourRange, Vehicle, VehicleShift } from 'src/app/core/models/vehicle';
import { VehicleService } from '../../services/vehicle.service';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VehicleShiftDialogComponent } from '../../dialogs/vehicle-shift-dialog/vehicle-shift-dialog.component';

@Component({
  selector: 'app-vehicle-shift',
  templateUrl: './vehicle-shift.component.html',
  styleUrls: ['./vehicle-shift.component.scss']
})
export class VehicleShiftComponent implements OnInit {

  @Input() vehicle!: Vehicle;
  @Input() shiftDate!: Date;

  currentDayStart!:Date;
  currentDayEnd!:Date;

  hours:number[] = [];
  hourRange!: HourRange;

  shifts$!: Observable<VehicleShift[]>;
  private ngUnsubscribe = new Subject();

  constructor(
    private vehicleService: VehicleService,
    private dialog: MatDialog
  ) {
   }

  ngOnInit(): void {

    this.vehicle.imageURL = this.vehicle.imageURL || "assets/images/image_placeholder.png";


    this.hourRange = this.vehicleService.getHourRange();
    this.hours = this.hourRange.range;

    this.currentDayStart = new Date(this.shiftDate);
    this.currentDayStart.setHours(this.hourRange.start,0,0);

    this.currentDayEnd = new Date(this.shiftDate);
    this.currentDayEnd.setHours(this.hourRange.end,59,59,999);

    this.shifts$ = this.vehicleService.vehicleShifts.pipe(map(shifts => shifts
      .filter(shift => shift.vehicleId === this.vehicle.vehicleId)
      .map(shift => {

      // We need to work out how long the shift is in minutes and then work that out as a % of the number of minutes in a day.
      // Then this becomes the width of the element as a % of the parent width.
      shift.length = this.getShiftLengthAsPercentageOf24Hours(shift.shiftEndTimeDate.getTime(), shift.shiftStartTimeDate.getTime());

      // Now we need to work out how far to the right we need to shift the div. This is the difference between midnight and the start
      // time of the shift as a % of 24 hours.
      let midnight = new Date(shift.shiftStartTimeDate.getTime());

      shift.left = (((shift.shiftStartTimeDate.getTime() - midnight.setHours(this.hourRange.start,0,0,0) - 6000) / 1000) / ((this.hourRange.end - this.hourRange.start + 1) * 60 * 60) * 100);

      return shift;

    }

    )));

  }

  // A function that determines the length of the shift in minutes and returns that as a % of 24 hours
  getShiftLengthAsPercentageOf24Hours(endTime: number, startTime: number) : number {

    const shiftLengthInSeconds = Math.round((endTime - startTime) / 1000);

    return shiftLengthInSeconds / ((this.hourRange.end - this.hourRange.start + 1) * 60 * 60) * 100;

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
