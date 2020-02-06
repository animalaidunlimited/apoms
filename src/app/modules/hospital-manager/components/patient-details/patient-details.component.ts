import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service'
import { FormGroup } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';

@Component({
  selector: 'patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {

  species;
  @Input() recordForm: FormGroup;
  dialog: any;

  constructor(private dropdowns: DropdownService) { }

  ngOnInit() {

    this.species = this.dropdowns.getSpecies();
    this.recordForm.get("patientStatus.currentArea").setValue("A Kennel");
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
