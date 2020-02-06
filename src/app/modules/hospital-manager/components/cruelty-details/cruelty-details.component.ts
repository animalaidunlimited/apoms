import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'cruelty-details',
  templateUrl: './cruelty-details.component.html',
  styleUrls: ['./cruelty-details.component.scss']
})
export class CrueltyDetailsComponent implements OnInit {

  crueltyForm;
  crueltyInspectors;

  constructor(private fb: FormBuilder, private dropdowns: DropdownService) {}

  ngOnInit() {

    this.crueltyInspectors = this.dropdowns.getCrueltyInspectors();
    
    this.crueltyForm = this.fb.group({

    crueltyDetails: this.fb.group({
      crueltyReport: ["", Validators.required],
      postCrueltyReport: [''],
      crueltyInspector: ['']

    })

  });

  }

}
