
import { VisitType } from './../../../../core/models/visit-type';
import { TeamDetails } from './../../../../core/models/team';
import {
	Component,
	OnInit,
	Inject,
	ChangeDetectorRef,
	Input
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormArray,
	FormControl,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { ProblemDropdownResponse } from 'src/app/core/models/responses';
import { Status } from 'src/app/core/models/status';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { ReleaseService } from 'src/app/core/services/release/release.service';
import {UniqueValidators} from 'src/app/modules/hospital-manager/components/patient-visit-details/unique-validators';

interface DialogData {
	patientId: number;
	EmergencyCaseId: number;
	EmergencyNumber: number;
}

@Component({
	selector: 'app-patient-visit-details',
	templateUrl: './patient-visit-details.component.html',
	styleUrls: ['./patient-visit-details.component.scss']
})
export class PatientVisitDetailsComponent implements OnInit {
	visitForm!: FormGroup;
	visitsArray!: FormArray;
	teamSubscription: Subscription | undefined;
	teamListData: TeamDetails[] = [];
	problemsSubscription: Subscription | undefined;
	problems$: ProblemDropdownResponse[] = [];
	statusSubscription: Subscription | undefined;
	status$: Status[] = [];
	visitTypeSubscription: Subscription | undefined;
	treatmentPrioritySubscription: Subscription | undefined;
	visitType$: VisitType[] = [];
	treatmentPriority$: any;
	@Input() recordForm!: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<PatientVisitDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData,
		private fb: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private dropdown: DropdownService,
		private releaseService: ReleaseService,
	) {}

	private subscriptions: { [key: string]: Subscription } = {};
	ngOnInit(): void {

		this.recordForm.addControl(
			'visitForm',
			this.fb.group({
				streetTreatCaseId:[],
				patientId: [this.data.patientId,Validators.required],
				casePriority: [, Validators.required],
				teamId: [, Validators.required],
				mainProblem: [, Validators.required],
				adminNotes: [,Validators.required],
				streetTreatCaseStatus:[],
				visits: this.fb.array([this.getVisitFormGroup()],UniqueValidators.uniqueBy('visit_day')),
			})
		);
		this.visitForm = this.recordForm.get('visitForm') as FormGroup;
		this.visitsArray = this.visitForm.get('visits') as FormArray;

		this.teamSubscription = this.dropdown.getAllTeams().subscribe(team => {
			this.teamListData = team;
			this.teamSubscription?.unsubscribe();
		});
		this.problemsSubscription = this.dropdown.getProblems().subscribe(problems => {
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
		this.treatmentPrioritySubscription = this.dropdown.getTreatmentPriority().subscribe(treatmentPriority => {
			this.treatmentPriority$ = treatmentPriority;
			this.treatmentPrioritySubscription?.unsubscribe();
		});
		this.initStreetTreatForm();
	}


	getVisitFormGroup(): FormGroup {
		return this.fb.group({
			visitId:[],
			visit_day: [,Validators.required],
			visit_status: [, Validators.required],
			visit_type: [, Validators.required],
			visit_comments: ['', Validators.required],
		});
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
		event.preventDefault();
		if (this.visitForm.controls.visits.valid) {
			this.visitsArray.push(this.getVisitFormGroup());
		}
	}
	deleteVisits(index: number) {
		this.visitsArray.removeAt(index);
	}

	initStreetTreatForm(){
		this.releaseService.getReleaseDetails(this.data.patientId).subscribe((res:any) =>{
			console.log(res);
			/* for(let i = 0; i<res.visits.length-1;i++)
			{
				this.visitsArray.push(this.getVisitFormGroup());
			}
			this.visitForm.patchValue(res);
			this.changeDetectorRef.detectChanges(); */
		});
	}
}
