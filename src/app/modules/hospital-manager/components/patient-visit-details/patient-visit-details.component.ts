
import { VisitType } from './../../../../core/models/visit-type';
import { TeamDetails } from './../../../../core/models/team';
import { Component, OnInit, Inject, ChangeDetectorRef, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { StreetTreatMainProblem } from 'src/app/core/models/responses';
import { Status } from 'src/app/core/models/status';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { ReleaseService } from 'src/app/core/services/release/release.service';
import { UniqueValidators } from 'src/app/modules/hospital-manager/components/patient-visit-details/unique-validators';
import { Priority } from 'src/app/core/models/priority';
import { EventEmitter } from '@angular/core';
import { ReleaseResponse, VisitResponse } from 'src/app/core/models/release';



@Component({
	selector: 'app-patient-visit-details',
	templateUrl: './patient-visit-details.component.html',
	styleUrls: ['./patient-visit-details.component.scss']
})
export class PatientVisitDetailsComponent implements OnInit {
	
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
	showVisitDate: boolean = false;
	prevVisits: any[]=[];
	@Input() recordForm!: FormGroup;
	private _dateSelected!: any[];
	@Input() set dateSelected(value:any[]){
		this._dateSelected = value;
	}
	get dateSelected(): any[] {
		return this._dateSelected;
	}

	@Output() public saveSuccessResponse = new EventEmitter<VisitResponse[]>();
	constructor(
		
		private fb: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private dropdown: DropdownService,
		private releaseService: ReleaseService,
	) {}

	private subscriptions: { [key: string]: Subscription } = {};

	public get patientId(){
		return this.recordForm.get("patientId")?.value;
	}

	ngOnInit(): void {
		if(!this.recordForm) this.recordForm = new FormGroup({});
		
		this.recordForm.addControl(
			'streatTreatForm',
			this.fb.group({
				streetTreatCaseId:[],
				patientId: [this.patientId,Validators.required],
				casePriority: [, Validators.required],
				teamId: [, Validators.required],
				mainProblem: [, Validators.required],
				adminNotes: [,Validators.required],
				streetTreatCaseStatus:[],
				visits: this.fb.array(
								[this.getVisitFormGroup()],
								[
									UniqueValidators.uniqueBy('visit_day'),
									UniqueValidators.uniqueBy('visit_date')
								]
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
		this.initStreetTreatForm();
	}
	
	public get visitArray(){
		let castedVisitsArray:string[] = [];
		this.visitsArray &&
		this.visitsArray.controls.forEach( (value,index) => castedVisitsArray.push(value.get('visit_date')?.value));
		return [...new Set(castedVisitsArray)];
	}
	

	addCalenderVisit(dateSelected:string[]){
		let insertDate = dateSelected.filter(x => !this.visitArray.includes(x))[0];
		(insertDate) &&
		this.visitsArray.push(this.getVisitFormGroup(insertDate));
		let difference = this.visitArray.filter(x => ![...this.prevVisits, ...dateSelected].includes(x) && x!='null')[0];
		if(this.visitsArray)
		{
			let removeIndex = this.visitsArray.controls.findIndex(visitData => visitData.value.visit_date === difference);
			if(removeIndex >= 0)
			this.visitsArray.removeAt(removeIndex);
		}
		
	} 
	ngOnChanges(changes: SimpleChanges) {
		if(this.dateSelected){
			this.addCalenderVisit(this.dateSelected);
		}
		// user remove the dates remove formgroup
	}

	getVisitFormGroup(date?: string ): FormGroup {
		let visitArray = this.fb.group({
			visitId:[],
			visit_status: [1, Validators.required],
			visit_type: [1, Validators.required],
			visit_comments: [, Validators.required],
			visit_day:[,Validators.required],
			visit_date:[date,Validators.required],
		});
		return visitArray;
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
		this.releaseService.getReleaseDetails(this.patientId).subscribe((res:ReleaseResponse) =>{
			
			if(res?.streetTreatForm){
				if(res.streetTreatForm.visits.length )
				{
					for(let i = 0; i<res.streetTreatForm.visits.length-1;i++)
					{
						if(res.streetTreatForm.visits[i].visit_date){
							this.showVisitDate = true;
						}
						this.visitsArray.push(this.getVisitFormGroup());
					}
				}
				this.prevVisits = res.streetTreatForm.visits.map(prevVisits => prevVisits.visit_date?.toString());
				
				this.streatTreatForm.patchValue(res.streetTreatForm);
				this.changeDetectorRef.detectChanges();
			}
		});
	}
}
