import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AnimalType } from 'src/app/core/models/animal-type';
import { StreetTreatSearchResponse, StreetTreatTab } from 'src/app/core/models/streettreet';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { StreetTreatService } from '../../services/streettreat.service';
import { Priority } from '../../../../core/models/priority';
import { MediaItem } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-streettreat-record',
  templateUrl: './streettreat-record.component.html',
  styleUrls: ['./streettreat-record.component.scss']
})
export class StreetTreatRecordComponent implements OnInit {

  @Input() inputStreetTreatCase!: StreetTreatTab;

  recordForm!: FormGroup;
  animalTypesSubscription: Subscription | undefined;
  animalTypes$: AnimalType[] = [];
  treatmentPrioritySubscription: Subscription | undefined;
  treatmentPriority$: Priority[] = [];

  profileUrl: SafeUrl = '';

  mediaData!: BehaviorSubject<MediaItem[]>;

  constructor(
    private fb: FormBuilder,
    private streetTreatService: StreetTreatService,
    private dropdown: DropdownService,
    private patientService: PatientService,
    private changeDetector: ChangeDetectorRef
  ) { }

  public get emergencyCaseId() {
    return this.inputStreetTreatCase.emergencyCaseId;
  }

  public get patientId() {
    return this.inputStreetTreatCase.patientId as number;
  }

  ngOnInit(): void {
    this.recordForm = this.fb.group({
      EmergencyNumber: ['', Validators.required],//this.inputStreetTreatCase.emergencyNumber,
      TagNumber: ['', Validators.required],//this.inputStreetTreatCase.tagNumber,
      NextVisit: ['', Validators.required],//this.inputStreetTreatCase.nextVisit,
      PercentComplete: ['', Validators.required],
      AnimalTypeId: ['', Validators.required],
      PriorityId: ['', Validators.required],
      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.emergencyCaseId, Validators.required]
      }),
      patientDetails: this.fb.group(
        {
          tagNumber: [this.inputStreetTreatCase.value,Validators.required],
          patientId: [this.inputStreetTreatCase.patientId,Validators.required],
          currentLocation: this.inputStreetTreatCase.currentLocation
        }
      ),
    });
    this.mediaData = this.patientService.getPatientMediaItemsByPatientId(this.patientId);

    if (this.mediaData) {
      this.mediaData.subscribe(media => {
        if (media.length === 0) {
          return;
        }
        this.profileUrl = media.find(item => Boolean(item.isPrimary) === true)?.remoteURL || media[0].remoteURL || '../../../../../../assets/images/image_placeholder.png';
        this.changeDetector.detectChanges();
      });
    }

    this.animalTypesSubscription = this.dropdown.getAnimalTypes().subscribe(animalTypes => {
      this.animalTypes$ = animalTypes;
      this.animalTypesSubscription?.unsubscribe();
    });

    this.treatmentPrioritySubscription = this.dropdown.getPriority().subscribe(treatmentPriority => {
      this.treatmentPriority$ = treatmentPriority;
      this.treatmentPrioritySubscription?.unsubscribe();
    });

    this.streetTreatService.getStreetTreatCaseById(this.inputStreetTreatCase.streetTreatCaseId).subscribe((res: StreetTreatSearchResponse) => {
      this.recordForm.patchValue(res);
    });

  }

}
