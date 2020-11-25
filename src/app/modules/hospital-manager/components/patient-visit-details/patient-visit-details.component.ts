
import { VisitType } from './../../../../core/models/visit-type';
import { TeamDetails } from './../../../../core/models/team';
import {
	Component,
	OnInit,
	Inject,
	ChangeDetectionStrategy,
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
import { TreatmentPriority } from 'src/app/core/enums/patient-details';
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
	styleUrls: ['./patient-visit-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientVisitDetailsComponent implements OnInit {
	visitForm!: FormGroup;
	visitsArray!: FormArray;
	visitPriority: any = TreatmentPriority;
	visitPriorityKeys!: string[];
	teamSubsciption: Subscription | undefined;
	teamListData: TeamDetails[] = [];
	problemsSubsciption: Subscription | undefined;
	problems$: ProblemDropdownResponse[] = [];
	statusSubscription: Subscription | undefined;
	status$: Status[] = [];
	visitTypeSubscription: Subscription | undefined;
	visitType$: VisitType[] = [];
	// @Input() recordForm!: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<PatientVisitDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData,
		private fb: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private dropdown: DropdownService,
		private releaseService: ReleaseService,
	) {
		this.visitPriorityKeys = Object.keys(this.visitPriority).filter(
			f => !isNaN(Number(f)),
		);
	}

	private subscriptions: { [key: string]: Subscription } = {};
	ngOnInit(): void {
		// console.log(this.recordForm);
		/* this.recordForm.addControl(
			'visitForm',
			this.fb.group({
				casePriority: [, Validators.required],
				teamId: [, Validators.required],
				mainProblem: [, Validators.required],
				visits: this.fb.array([this.visitFields()]),
			}),
		); */
		this.visitForm =
			this.fb.group({
				patientId: this.data.patientId,
				casePriority: [, Validators.required],
				teamId: [, Validators.required],
				mainProblem: [, Validators.required],
				adminNotes: [,Validators.required],
				stcaseStatus:[],
				visits: this.fb.array([this.getVisitFormGroup()],UniqueValidators.uniqueBy('visit_day')),
			});
		// this.visitForm = this.recordForm.get('visitForm') as FormGroup;
		this.visitsArray = this.visitForm.get('visits') as FormArray;

		this.teamSubsciption = this.dropdown.getAllTeams().subscribe(team => {
			this.teamListData = team;
			this.teamSubsciption?.unsubscribe();
		});
		this.problemsSubsciption = this.dropdown.getProblems().subscribe(problems => {
			this.problems$ = problems;
			this.problemsSubsciption?.unsubscribe();
		});
		this.statusSubscription = this.dropdown.getStatus().subscribe(status => {
			this.status$ = status;
			this.statusSubscription?.unsubscribe();
		});
		this.statusSubscription = this.dropdown.getStatus().subscribe(status => {
			this.status$ = status;
			this.statusSubscription?.unsubscribe();
		});
		this.visitTypeSubscription = this.dropdown.getVisitType().subscribe(visitTypes => {
			this.visitType$ = visitTypes;
			this.statusSubscription?.unsubscribe();
		});
		//this.onChanges();
	}
	/* ngOnDestroy() {
		Object.keys(this.subscriptions).forEach(sk =>
		this.subscriptions[sk].unsubscribe()
		);
	}
	onChanges(): void {

		if (this.subscriptions.formArrayChanges) {
		this.subscriptions.formArrayChanges.unsubscribe();
		}
	this.subscriptions.formArrayChanges = this.visitsArray.valueChanges.subscribe((visits: any) => {
		(_result: any) => {
			this.changeDetectorRef.detectChanges();
		}
		});
  	}  */
	getVisitFormGroup(): FormGroup {
		return this.fb.group({
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

	addVists(event: Event) {
		event.preventDefault();
		if (this.visitForm.controls.visits.valid) {
			this.visitsArray.push(this.getVisitFormGroup());
		}
	}
	deleteVisits(index: number) {
		this.visitsArray.removeAt(index);
	}
	submit(visitForm:any){
		this.releaseService.saveStreatTreatCase(visitForm.value).then((res:any)=>{
			console.log(res.vSuccess);
		});
	}
}
