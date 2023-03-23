import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BrokenCaseService } from '../services/broken-case.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Router } from '@angular/router';

export interface BrokenCase {
  brokenCaseDetailsId: number;
  emergencyNumber: string;
  issue: string;
  updated: boolean;
}

@Component({
  selector: 'app-broken-cases',
  templateUrl: './broken-cases.component.html',
  styleUrls: ['./broken-cases.component.scss']
})
export class BrokenCasesComponent implements OnInit {

  brokenCases = new MatTableDataSource<BrokenCase>();

  displayedColumns: string[] = ['EmergencyNumber', 'Issue', 'Updated', 'delete'];
  
  loading = true;

  constructor(
    private brokenCaseService: BrokenCaseService,
    private router: Router,
    private snackbar: SnackbarService
  ) {
    this.brokenCases.data = [
      {brokenCaseDetailsId: 1, emergencyNumber: '911', issue: 'Fire', updated: true},
      {brokenCaseDetailsId: 2, emergencyNumber: '112', issue: 'Medical', updated: false}
    ];
  }

  ngOnInit() : void {

    this.getBrokenCases();
  }

  getBrokenCases() : void {

    this.loading = true;

    this.brokenCaseService.getBrokenCases().then(cases => {

      this.brokenCases.data = cases;
      this.loading = false;

    })
  }

  resolveBrokenCases() : void {

    this.brokenCaseService.resolveBrokenCases().then(() => this.getBrokenCases());

  }

  deleteBrokenCase(brokenCaseDetailsId: number) {
    // Delete the broken case from the data source
    
    this.brokenCaseService.deleteBrokenCase(brokenCaseDetailsId).then(result => {

      if(result.success === 1) {

        this.brokenCases.data = this.brokenCases.data.filter(bc => bc.brokenCaseDetailsId !== brokenCaseDetailsId);

      }
      else {
        this.snackbar.errorSnackBar("ERR: BCC-43: An error has ocurred deleting the broken case","OK");
      }

    })
  }

  openEmergencyCase(emergencyNumber: number) : void {

    this.router.navigate(['/nav/emergency-register', {emergencyNumber}], { replaceUrl: true });

  }
}
