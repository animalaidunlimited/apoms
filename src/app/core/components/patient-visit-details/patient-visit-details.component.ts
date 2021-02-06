
import { VisitType } from '../../models/visit-type';
import { TeamDetails } from '../../models/team';
import { Component, OnInit, ChangeDetectorRef, Input, Output, SimpleChanges, OnChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { StreetTreatMainProblem } from 'src/app/core/models/responses';
import { Status } from 'src/app/core/models/status';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { ReleaseService } from 'src/app/core/services/release/release.service';
import { UniqueValidators } from 'src/app/core/components/patient-visit-details/unique-validators';
import { Priority } from 'src/app/core/models/priority';
import { EventEmitter } from '@angular/core';
import { VisitResponse } from 'src/app/core/models/release';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
import { StreetTreatService } from 'src/app/modules/streettreat/services/streettreat.service';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { StreetTreatSearchVisitsResponse } from 'src/app/core/models/streettreet';

interface VisitCalender{
	status:number;
	date:Date;
}
@Component({
	selector: 'app-patient-visit-details',
	templateUrl: './patient-visit-details.component.html',
	styleUrls: ['./patient-visit-details.component.scss'],
	animations:[
		trigger('listAnimation',[
			transition('* => *',[
				query(':enter', style({opacity: 0}), {optional: true}),
				query(':enter', stagger('100ms',[
					animate('0.5s ease-in', keyframes([
						style({
							opacity: 0,
							transform: 'translateY(-75px)',
							offset:0
						}),
						style({
							opacity: .5,
							transform: 'translateY(35px)',
							offset:0.3
						}),
						style({
							opacity: 1,
							transform: 'translateY(0)',
							offset:1
						}),
					]))
				]),{optional: true}),
				query(':leave', stagger('100ms',[
					animate('0.5s ease-in', keyframes([
						style({
							opacity: 1,
							transform: 'translateY(0)',
							offset:0
						}),
						style({
							opacity: .5,
							transform: 'translateY(35px)',
							offset:0.3
						}),
						style({
							opacity: 0,
							transform: 'translateY(-75px)',
							offset:1
						}),
					]))
				]),{optional: true}),
			])
		])
	]
})
export class PatientVisitDetailsComponent implements OnInit, OnChanges {

	streatTreatForm!: FormGroup;

	visitsArray!: FormArray;

	teamSubscription: Subscription | undefined;

	teamListData: TeamDetails[] = [];

	problemsSubscription: Subscription | undefined;

	problems$: StreetTreatMainProblem[] = [];

	statusSubscription: Subscription | undefined;

	status$: Status[] = [];

	visitTypeSubscription: Subscription | undefined;

	treatmentPrioritySubscription: Subscription | undefined;

	visitType$: VisitType[] = [];

	treatmentPriority$: Priority[]= [];

	showVisitDate = false;

	prevVisits: string[] = [];

	visitDates: VisitCalender[] = [];

	loadCalendarComponent = true;

	streetTreatServiceSubscription: Subscription | undefined;

	@Input() recordForm!: FormGroup;

	@Input() isStreetTreatTrue!: boolean;

	@Output() streetTreatCaseIdEmit = new EventEmitter<number>();

	@Input() dateSelected!: string[] ;

	@Output() public saveSuccessResponse = new EventEmitter<VisitResponse[]>();


	@ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
	constructor(

		private fb: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private dropdown: DropdownService,
		private releaseService: ReleaseService,
		private streetTreatService:StreetTreatService

	) {}

	private subscriptions: { [key: string]: Subscription } = {};

	public get patientId(){
		return this.recordForm.get('patientId')?.value;
	}

	ngOnInit(): void {

		console.log(this.isStreetTreatTrue);

		if(!this.recordForm) this.recordForm = new FormGroup({});

		this.recordForm.addControl(
			'streatTreatForm',
			this.fb.group({
				streetTreatCaseId:[],
				patientId: [this.patientId],
				casePriority: [, Validators.required],
				teamId: [, Validators.required],
				mainProblem: [, Validators.required],
				adminNotes: [,Validators.required],
				streetTreatCaseStatus:[],
				visits: this.fb.array(
								[this.getVisitFormGroup()]
							),
			})
		);
		this.streatTreatForm = this.recordForm.get('streatTreatForm') as FormGroup;

		this.visitsArray = this.streatTreatForm.get('visits') as FormArray;

		this.teamSubscription = this.dropdown.getAllTeams().subscribe(team => {
			this.teamListData = team;
			this.teamSubscription?.unsubscribe();
		});

		this.problemsSubscription = this.dropdown.getStreetTreatMainProblems().subscribe(problems => {
			this.problems$ = problems;
			this.problemsSubscription?.unsubscribe();
		});

		this.statusSubscription = this.dropdown.getStatus().subscribe(status => {
			this.status$ = status;
			this.statusSubscription?.unsubscribe();
		});

		this.visitTypeSubscription = this.dropdown.getVisitType().subscribe(visitTypes => {
			this.visitType$ = visitTypes;
			this.visitTypeSubscription?.unsubscribe();
		});

		this.treatmentPrioritySubscription = this.dropdown.getPriority().subscribe(treatmentPriority => {
			this.treatmentPriority$ = treatmentPriority;
			this.treatmentPrioritySubscription?.unsubscribe();
		});
		this.initStreetTreatForm()
		if(!this.isStreetTreatTrue) {
			this.clearValidators();
		}

	}

	ngOnChanges(changes: SimpleChanges) {
		if(this.dateSelected){
			this.addCalenderVisit(this.dateSelected);
		}

		 if(this.streatTreatForm) { 
			if(this.isStreetTreatTrue){
				this.initStreetTreatForm();
				this.streetTreatSetValidators();
			}else
			{
				this.clearValidators();
			}
		} 
		
	}

	public get castedVisitArray(){
		const castedVisitsArray:string[] = [];

		if(this.visitsArray){
			this.visitsArray.controls.forEach( (value) => castedVisitsArray.push(value.get('visit_date')?.value));
		}

		return [...new Set(castedVisitsArray)];
	}


	addCalenderVisit(dateSelected:string[]){
		const insertDate = dateSelected.filter(x => !this.castedVisitArray.includes(x))[0];

		if(insertDate){
			this.visitsArray.push(this.getVisitFormGroup(insertDate));
		}


		const difference = this.castedVisitArray.filter(x => ![...this.prevVisits, ...dateSelected].includes(x) && x !== 'null')[0];

		if(this.visitsArray)
		{
			const removeIndex = this.visitsArray.controls.findIndex(visitData => visitData.value.visit_date === difference);
			if(removeIndex >= 0)
			this.visitsArray.removeAt(removeIndex);
		}

	}
	
	dateSelectedEventHandler($event:any){
    
		this.dateSelected = [...$event];
	
		if(this.calendar) {
		  this.calendar.updateTodaysDate(); 
		} 
	}

	getVisitFormGroup(date?: string ): FormGroup {
		const visitArray = this.fb.group({
			visitId:[],
			visit_status: [1, Validators.required],
			visit_type: [1, Validators.required],
			visit_comments: [],
			operator_notes: [],
			visit_day: [],
			visit_date: [date],
		});

		if(this.castedVisitArray.length > 0)
		{

			visitArray.get('visit_date')?.setValidators(Validators.required);


			// if(this.prevVisits.length > 0)
			// {
				// visitArray.get('visit_date')?.setValidators(Validators.required);
			// }
			// else{
			// visitArray.get('visit_date')?.setValidators(Validators.required);
			// }
		}
		return visitArray;
	}

	loadCalendar(){
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

	addVisits(event: Event) {

		if (this.streatTreatForm.controls.visits.valid) {
			this.visitsArray.push(this.getVisitFormGroup());
		}
	}

	deleteVisits(index: number) {
		this.visitsArray.removeAt(index);
	}

	initStreetTreatForm(){

		this.streetTreatService.getStreetTreatWithVisitDetailsByPatientId(this.patientId).subscribe((response)=>{

			if(response){
				
				this.streetTreatCaseIdEmit.emit(response.streetTreatCaseId);
			}

			if(response.visits.length)
			{
				response.visits.forEach((visit:any,index:number) =>
				{
					if(visit.visit_date){
						this.showVisitDate = true;
						this.recordForm.get('streatTreatForm.visits')?.setValidators([UniqueValidators.uniqueBy('visit_date')]);
					}
					else{
						this.recordForm.get('streatTreatForm.visits')?.setValidators([UniqueValidators.uniqueBy('visit_day')]);
					}
				
					this.visitsArray.push(this.getVisitFormGroup());
				});
			}

			this.prevVisits = response.visits.map((prevVisits:any) => {
				if(prevVisits.visit_date)
					return prevVisits.visit_date.toString();
				else
					return '';
			});

			this.streetTreatServiceSubscription = this.streetTreatService.getVisitDatesByStreetTreatCaseId(response.streetTreatCaseId)
			.subscribe((visitResponse:StreetTreatSearchVisitsResponse[])=>{
			visitResponse.map((visitResponseVal)=> {
				this.visitDates.push(
				{
					status: visitResponseVal.StatusId,
					date:visitResponseVal.Date
				}
				);
			});
			this.streetTreatServiceSubscription?.unsubscribe();
			});

			this.streatTreatForm.patchValue(response);
			this.changeDetectorRef.detectChanges();
		});
	}

	streetTreatSetValidators() {
		this.streatTreatForm.get('casePriority')?.setValidators([Validators.required]);
		this.streatTreatForm.get('casePriority')?.updateValueAndValidity({emitEvent: false });

		this.streatTreatForm.get('teamId')?.setValidators([Validators.required]);
		this.streatTreatForm.get('teamId')?.updateValueAndValidity({emitEvent: false });

		this.streatTreatForm.get('mainProblem')?.setValidators([Validators.required]);
		this.streatTreatForm.get('mainProblem')?.updateValueAndValidity({emitEvent: false });

		this.streatTreatForm.get('adminNotes')?.setValidators([Validators.required]);
		this.streatTreatForm.get('adminNotes')?.updateValueAndValidity({emitEvent: false });

		this.visitsArray.get('visit_status')?.setValidators([Validators.required]);
		this.visitsArray.get('visit_status')?.updateValueAndValidity({emitEvent: false});

		this.visitsArray.get('visit_type')?.setValidators([Validators.required]);
		this.visitsArray.get('visit_type')?.updateValueAndValidity({emitEvent: false});

	}

	clearValidators() {
		this.streatTreatForm.reset();
		this.streatTreatForm.get('PatientId')?.setValue(this.patientId);
		this.streatTreatForm.get('casePriority')?.clearValidators();
		this.streatTreatForm.get('teamId')?.clearValidators();
		this.streatTreatForm.get('mainProblem')?.clearValidators();
		this.streatTreatForm.get('adminNotes')?.clearValidators();
		
		// tslint:disable-next-line:prefer-for-of
		for(let i=0; i< this.visitsArray?.controls.length; i++) {
			this.visitsArray.removeAt(i);
		}

		this.visitsArray.get('visit_status')?.clearValidators();
		this.visitsArray.get('visit_type')?.clearValidators();
		this.streatTreatForm.get('casePriority')?.updateValueAndValidity({emitEvent: false });
		this.streatTreatForm.get('teamId')?.updateValueAndValidity({emitEvent: false });
		this.streatTreatForm.get('mainProblem')?.updateValueAndValidity({emitEvent: false });
		this.streatTreatForm.get('adminNotes')?.updateValueAndValidity({emitEvent: false });
		this.visitsArray.get('visit_status')?.updateValueAndValidity({emitEvent: false });
		this.visitsArray.get('visit_type')?.updateValueAndValidity({emitEvent: false });
		
	}
	onSelect(selectedDate:Date)
	{
	
		const date = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().substring(0,10);
		const index = this.dateSelected.findIndex(x => x === date);
		if (index < 0) {
		this.dateSelected = [...this.dateSelected, date];
		}
		else {
		this.dateSelected.splice(index, 1);
		this.dateSelected = this.dateSelected.slice();
		}
		this.changeDetectorRef.detectChanges();
		this.calendar.updateTodaysDate(); 
	} 
	dateClass() {
		return (date: Date): MatCalendarCellCssClasses  => {
		let calenderCSS = '';
		for(const visit of this.visitDates){
		  const d = new Date(visit.date);
		  if(
			new Date(d).toDateString() === new Date(date).toDateString() 
		  )
		  {
			  if(visit.status === 1)
			  {
				calenderCSS ='to-do';
			  }
			  else if(visit.status === 2) {
				calenderCSS ='in-progress';
			  }
			  else if(visit.status === 3) {
				calenderCSS ='missed';
			  }
			  else if(visit.status === 4){
				calenderCSS ='complete';
			  }
			  else if(visit.status === 5){
				calenderCSS ='complete-early-release';
			  }
			  else if(visit.status === 6){
				calenderCSS ='complete-animal-died';
			  }
			  else if(visit.status === 7){
				calenderCSS ='complete-animal-not-found';
			  }
			  else if(visit.status === 8){
				calenderCSS ='readmission';
			  }
		  }
		}
		if(this.dateSelected.length > 0)
		{        
		  
		  const highlightDate = this.dateSelected.map(calenderSelectedDate => new Date(calenderSelectedDate))
		  .some(
			currentCalenderSelectedDate => 
			  new Date(currentCalenderSelectedDate).toDateString() === new Date(date).toDateString() &&
			  !this.visitDates.find(x=> new Date(x.date).toDateString() === new Date(date).toDateString())
		  );
		  if(highlightDate)
		  { 
		  calenderCSS = 'selected-date';
		  }
		}
		return  calenderCSS ? calenderCSS : '';
		};
	  }
}
