import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../../core/services/dropdown/dropdown.service'
import { FormGroup } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { getCurrentTimeString } from '../../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';

@Component({
  selector: 'patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {

  animalTypes$;
  @Input() recordForm: FormGroup;
  dialog: any;
  maxDate;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private dropdown: DropdownService) { }

  ngOnInit() {

    this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);
    this.recordForm.get("patientStatus.currentArea").setValue("A Kennel");
    this.maxDate = getCurrentTimeString();
  }


  statusChange()
  {

    switch(this.recordForm.get("patientStatus.status").value)
    {
      case "2":
        {
          this.recordForm.get("patientStatus.currentArea").setValue("Released");
          break;
        }
      case "3":
        {
          this.recordForm.get("patientStatus.currentArea").setValue("Died");
          break;
        }
        case "4":
          {
            this.recordForm.get("patientStatus.currentArea").setValue("Escaped");
            break;
          }
      default:
        {
          //TODO set this to be the last area
          this.recordForm.get("patientStatus.currentArea").setValue("A Kennel");
          break;
        }

    }

  }




}
