
import { VisitType } from '../../models/visit-type';
import { Component, OnInit, ChangeDetectorRef, Input, Output, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { StreetTreatMainProblem } from 'src/app/core/models/responses';
import { Status } from 'src/app/core/models/status';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { EventEmitter } from '@angular/core';
import { VisitResponse } from 'src/app/core/models/release';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { StreetTreatService } from 'src/app/modules/streettreat/services/streettreat.service';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { UniqueValidators } from '../../validators/unique-validators';
import { Observable, Subject } from 'rxjs';
import { ConfirmationDialog } from '../confirm-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { map, takeUntil } from 'rxjs/operators';
import { formatDateForMinMax, getCurrentTimeString } from '../../helpers/utils';
import { Vehicle } from '../../models/vehicle';
import { VehicleService } from 'src/app/modules/vehicle/services/vehicle.service';
import { DatePipe } from '@angular/common';

interface VisitCalender {
	status: number;
	date: Date;
}

@Component({
	selector: 'app-patient-visit-details',
	templateUrl: './patient-visit-details.component.html',
	styleUrls: ['./patient-visit-details.component.scss'],
	animations: [
		trigger('listAnimation', [
			transition('* => *', [
				query(':enter', style({ opacity: 0 }), { optional: true }),
				query(':enter', stagger('100ms', [
					animate('0.5s ease-in', keyframes([
						style({
							opacity: 0,
							transform: 'translateY(-75px)',
							offset: 0
						}),
						style({
							opacity: .5,
							transform: 'translateY(35px)',
							offset: 0.3
						}),
						style({
							opacity: 1,
							transform: 'translateY(0)',
							offset: 1
						}),
					]))
				]), { optional: true }),
				query(':leave', stagger('100ms', [
					animate('0.5s ease-in', keyframes([
						style({
							opacity: 1,
							transform: 'translateY(0)',
							offset: 0
						}),
						style({
							opacity: .5,
							transform: 'translateY(35px)',
							offset: 0.3
						}),
						style({
							opacity: 0,
							transform: 'translateY(-75px)',
							offset: 1
						}),
					]))
				]), { optional: true }),
			])
		])
	]
})
export class PatientVisitDetailsComponent implements OnInit, OnChanges, OnDestroy {

    private ngUnsubscribe = new Subject();

	@Input() dateSelected!: string[];
	@Input() isStreetTreatTrue!: boolean;
	@Input() recordForm!: FormGroup;

	@Output() public saveSuccessResponse = new EventEmitter<VisitResponse[]>();
	@Output() streetTreatCaseIdEmit = new EventEmitter<number>();

	@ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

	callDateTime:string|Date = '';
	currentTime = getCurrentTimeString();

	errorMatcher = new CrossFieldErrorMatcher();

	loadCalendarComponent = true;

	prevVisits: string[] = [];
	problems$!: Observable<StreetTreatMainProblem[]>;

	showVisitDate = false;
	status$!: Observable<Status[]>;
	streetTreatCase!: any;
	streatTreatForm!: FormGroup;
	treatmentPriority$!: Observable<Priority[]>;
	visitsArray!: FormArray;
	visitDates: VisitCalender[] = [];
	visitType$!: Observable<VisitType[]>;
	vehicleList$!: Observable<Vehicle[]>;

	minVisitDate!: string|Date;

	constructor(

		private fb: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private dropdown: DropdownService,
		private streetTreatService: StreetTreatService,
		private dialog: MatDialog,
		private datepipe: DatePipe,
		private vehicleService: VehicleService

	) { }

	public get patientId() {
		return this.recordForm.get('patientId')?.value;
	}

	ngOnInit() {

		if (!this.recordForm) this.recordForm = new FormGroup({});

		this.recordForm.addControl(
			'streatTreatForm',
			this.fb.group({
				streetTreatCaseId: [],
				patientId: [this.patientId],
				callDateTime: [''],
				casePriority: [, Validators.required],
				assignedVehicleId: [, Validators.required],
				ambulanceAssignmentTime: ['', Validators.required],
				mainProblem: [, Validators.required],
				adminNotes: [, Validators.required],
				streetTreatCaseStatus: [, Validators.required],
				visits: this.fb.array([])
			})
		);

		this.streatTreatForm = this.recordForm.get('streatTreatForm') as FormGroup;
		this.visitsArray = this.streatTreatForm.get('visits') as FormArray;
		this.problems$ = this.dropdown.getStreetTreatMainProblems();
		this.status$ = this.dropdown.getStatus();
		this.visitType$ = this.dropdown.getVisitType();
		this.treatmentPriority$ = this.dropdown.getPriority();
		this.vehicleList$ = this.vehicleService.getVehicleListObservable().pipe(map(vehicles => vehicles.filter(vehicle => vehicle.streetTreatVehicle)));

		setTimeout(() => {
			if (!this.isStreetTreatTrue) {
				this.clearValidators();
			}
			else {
				this.initStreetTreatForm();
			}

		}, 0);
	}

	ngOnChanges() {

		if (this.streatTreatForm) {
			if (this.isStreetTreatTrue) {
				this.initStreetTreatForm();
				this.streetTreatSetValidators();
			}
			else if (!this.isStreetTreatTrue) {
				if (this.streetTreatCase) {
					this.deleteDialog();
				}
				else {
					this.clearValidators();
				}
			}
		}

	}

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

	initStreetTreatForm() {

		this.recordForm.get('streatTreatForm.visits')?.setValidators([UniqueValidators.uniqueBy('visit_day')]);

		this.streetTreatService.getStreetTreatWithVisitDetailsByPatientId(this.patientId)
		.pipe(takeUntil(this.ngUnsubscribe))
		.subscribe((response) => {

			if (response?.streetTreatCaseId) {

				this.showVisitDate = (response.autoAdded || !!response.patientReleaseDate);


				if (response.visits.length > 0) {
					response.visits.forEach((visit: VisitResponse) => {
						/**
						 * Checking if patient already has released status with release date
						 * if patient is released user can assign dates
						 * else
						 * tentative dates like day 0, day 1
						 */

						if (visit.visit_date || this.showVisitDate) {

							this.minVisitDate = response.autoAdded ?
													this.datepipe.transform(response.callDateTime,'yyyy-MM-dd') || ''
													:
													this.datepipe.transform(response.patientReleaseDate,'yyyy-MM-dd') || '';

							// Set Validators Visit Date Unique When Date are finialized
							this.recordForm.get('streatTreatForm.visits')?.clearValidators();
							this.recordForm.get('streatTreatForm.visits')?.setValidators([UniqueValidators.uniqueBy('visit_date')]);

						}
						if (visit.visit_date) {

							this.visitDates.push(
							{
								status: visit.visit_status,
								date: visit.visit_date
							});

						}
						if(response.visits.length > this.visitsArray.length) {
							this.visitsArray.push(this.getVisitFormGroup());
						}
					});
				}

				this.streetTreatCase = response;
				this.streetTreatCaseIdEmit.emit(response.streetTreatCaseId);

				this.visitsArray.controls.sort((a, b) => new Date(a.get('visit_date')?.value).valueOf() < new Date(b.get('visit_date')?.value).valueOf() ? -1 : 1);

				if (this.visitDates?.length > 0) {
					this.dateClass();
					if(this.calendar){
						this.calendar.updateTodaysDate();
					}
				}

				this.prevVisits = response.visits.map((prevVisits: any) => prevVisits.visit_date ? prevVisits.visit_date.toString() : '');

				this.streatTreatForm.patchValue(response);
				this.callDateTime = formatDateForMinMax(response.callDateTime);

				this.visitsArray.controls.sort((a, b) => new Date(a.get('visit_date')?.value).valueOf() < new Date(b.get('visit_date')?.value).valueOf() ? -1 : 1);

				this.changeDetectorRef.detectChanges();
			}
			else {
				this.visitsArray.push(this.getVisitFormGroup());
			}
		});
	}


	public get castedVisitArray() {
		const castedVisitsArray: string[] = [];

		if (this.visitsArray) {
			this.visitsArray.controls.forEach((value) => castedVisitsArray.push(value.get('visit_date')?.value));
		}

		return [...new Set(castedVisitsArray)];
	}


	addCalenderVisit(dateSelected: string[]) {
		const insertDate = dateSelected.filter(x => !this.castedVisitArray.includes(x))[0];

		if (insertDate) {
			this.visitsArray.push(this.getVisitFormGroup(insertDate));
		}

		const difference = this.castedVisitArray.filter(x => ![...this.prevVisits, ...dateSelected].includes(x) && x !== 'null')[0];

		if (this.visitsArray) {
			const removeIndex = this.visitsArray.controls.findIndex(visitData => visitData.value.visit_date === difference);
			if (removeIndex >= 0)
				this.visitsArray.removeAt(removeIndex);
		}

	}

	getVisitFormGroup(date?: string): FormGroup {
		const visitArray = this.fb.group({
			visitId: [],
			visit_status: [1, Validators.required],
			visit_type: [1, Validators.required],
			visit_comments: [, Validators.required],
			operator_notes: [],
			visit_day: [0],
			visit_date: [date],
		});

		if (this.showVisitDate) {
				visitArray.get('visit_date')?.setValidators(Validators.required);
			}
			else {
				visitArray.get('visit_day')?.setValidators(Validators.required);
		}
		return visitArray;
	}

	loadCalendar($event: Event) {
		$event.preventDefault();
		$event.stopPropagation();
		this.loadCalendarComponent = !this.loadCalendarComponent;
	}

	keyPressNumbers(event: any) {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode < 48 || charCode > 57) {
			event.preventDefault();
			return false;
		} else {
			return true;
		}
	}

	addVisits($event?: Event) {

		this.preventPropogation($event);
		this.visitsArray.push(this.getVisitFormGroup());
		this.updateValidityAndDetectChanges();
	}

	deleteVisits(index: number, $event: Event) {

		this.preventPropogation($event);
		this.visitsArray.removeAt(index);
		this.updateValidityAndDetectChanges();
	}

	private preventPropogation($event: Event | undefined) {
		$event?.preventDefault();
		$event?.stopPropagation();
	}

	private updateValidityAndDetectChanges() {
		this.visitsArray.updateValueAndValidity();
		this.changeDetectorRef.detectChanges();
	}



	deleteDialog() {
		const message = `If you save this record, the StreetTreat case and its visits will be deleted,
		                Are you sure you want to continue?`;

		const dialogRef = this.dialog.open(ConfirmationDialog, {
			data: {
				message,
				buttonText: {
					ok: 'Yes',
					cancel: 'Cancel'
				}
			}
		});

		dialogRef.afterClosed()
		.pipe(takeUntil(this.ngUnsubscribe))
		.subscribe((confirmed: boolean) => {
			if (confirmed) {
				this.clearValidators();
			}
			else {
				this.streetTreatCaseIdEmit.emit(this.streetTreatCase.streetTreatCaseId);
			}
		});
	}

	streetTreatSetValidators() {
		if (this.visitsArray.length === 0) {
			this.visitsArray.push(this.getVisitFormGroup());
			this.recordForm.get('streatTreatForm.visits')?.clearValidators();
			this.recordForm.get('streatTreatForm.visits')?.setValidators([UniqueValidators.uniqueBy('visit_day')]);
		}
		this.streatTreatForm.get('patientId')?.setValue(this.patientId);

		this.clearAndUpdateValidity(true);

		this.changeDetectorRef.detectChanges();

	}

	clearValidators() {
		this.streatTreatForm.reset();
		this.streatTreatForm.get('PatientId')?.setValue(this.patientId);

		this.clearAndUpdateValidity(false);

		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < this.visitsArray?.controls.length; i++) {
			this.visitsArray.removeAt(i);
		}

		this.streatTreatForm.get('ambulanceAssignmentTime')?.updateValueAndValidity({ emitEvent: false });

		this.changeDetectorRef.detectChanges();

	}

	private clearAndUpdateValidity(setRequired: boolean) {

		const controlsToClear = ['casePriority', 'assignedVehicleId', 'mainProblem', 'adminNotes', 'streetTreatCaseStatus', 'ambulanceAssignmentTime',
			'visit_status', 'visit_type'];

		for (const control of controlsToClear) {

			setRequired ?
				this.streatTreatForm.get(control)?.setValidators([Validators.required])
				:
				this.streatTreatForm.get(control)?.clearValidators();
			this.streatTreatForm.get(control)?.updateValueAndValidity({ emitEvent: false });

		}
	}

	onSelect(selectedDate: Date | null) {

		if(!selectedDate) {
			return;
		}

		const date = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().substring(0, 10);

		const index = this.dateSelected.findIndex(x => x === date);
		if (index < 0) {
			this.dateSelected = [...this.dateSelected, date];
			this.addCalenderVisit(this.dateSelected);
		}
		else {
			this.dateSelected.splice(index, 1);
			this.dateSelected = this.dateSelected.slice();
			this.addCalenderVisit(this.dateSelected);
		}

		this.changeDetectorRef.detectChanges();
		this.calendar.updateTodaysDate();
	}

	dateClass() {

		return (date: Date): MatCalendarCellCssClasses => {
			let calenderCSS = '';

			for (const visit of this.visitDates) {
				const d = new Date(visit.date);
				if (new Date(d).toDateString() === new Date(date).toDateString()) {
					if (visit.status === 1) {
						calenderCSS = 'to-do';
					}
					else if (visit.status === 2) {
						calenderCSS = 'in-progress';
					}
					else if (visit.status === 3) {
						calenderCSS = 'missed';
					}
					else if (visit.status === 4) {
						calenderCSS = 'complete';
					}
					else if (visit.status === 5) {
						calenderCSS = 'complete-early-release';
					}
					else if (visit.status === 6) {
						calenderCSS = 'complete-animal-died';
					}
					else if (visit.status === 7) {
						calenderCSS = 'complete-animal-not-found';
					}
					else if (visit.status === 8) {
						calenderCSS = 'readmission';
					}
				}
			}

			if (this.dateSelected?.length > 0) {
				const highlightDate = this.dateSelected.map(calenderSelectedDate => new Date(calenderSelectedDate))
					.some(
						currentCalenderSelectedDate =>
							new Date(currentCalenderSelectedDate).toDateString() === new Date(date).toDateString() &&
							!this.visitDates.find(x => new Date(x.date).toDateString() === new Date(date).toDateString())
					);
				if (highlightDate) {
					calenderCSS = 'selected-date';
				}
			}
			return calenderCSS ? calenderCSS : '';
		};

	}

	//Take a date as input and comapre it with today's date. If they match return true,
	//if they don't match return false
	isToday(visitDate: string | Date){
		const today = new Date();
		const visit = new Date(visitDate);
		return today.toDateString() === visit.toDateString();
	}



}
