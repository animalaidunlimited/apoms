import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmergencyTab } from 'src/app/core/models/emergency-record';
import { EmergencyRegisterTabBarService } from '../../services/emergency-register-tab-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSearchMediaDialogComponent } from '../add-search-media-dialog/add-search-media-dialog.component';
import { CaseService } from '../../services/case.service';
import { Subject } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'tab-bar',
    templateUrl: './tab-bar.component.html',
    styleUrls: ['./tab-bar.component.scss'],
})
export class TabBarComponent implements OnInit {
    selected = new FormControl(0);
    guIdVal!: string;

    tabs = [
        { id: 0, value: 'Board', emergencyCaseId: 0, icon: '' , GUID: ''},
        { id: 1, value: 'Search', emergencyCaseId: 0, icon: '', GUID: '' },
    ];

    constructor(private cdr: ChangeDetectorRef,
        private emergencytabBar: EmergencyRegisterTabBarService,
        private caseService: CaseService,
        private dialog: MatDialog) {}

    ngOnInit() {

        const sharedMediaItem = this.emergencytabBar.getSharedMediaItem();

        sharedMediaItem.subscribe((mediaItem:File[])=>{

           if(mediaItem.length > 0){
                this.openSearchMediaDialog(mediaItem);
           }
        });

    }

    removeTab(index: number) {
        // TODO find out why the ngif in the mat-label causes and error and fix
        if (index > 1 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
            this.selected.setValue(this.tabs.length - 1);
        }
    }

    // getEmergencyGuid(guId: any) {
    //     this.guIdVal.next(guId);
    // }

    addTab(emergencyCaseId: number, emergencyNumber: number | string) {

        this.guIdVal = this.caseService.generateUUID();
        this.tabs.push({
            id: this.tabs.length,
            value: emergencyNumber.toString(),
            emergencyCaseId,
            icon: 'close',
            GUID: this.guIdVal
        });

        console.log(this.tabs);
        
        // this.tabs.push({
        //     id: this.tabs.length,
        //     value: emergencyNumber.toString(),
        //     emergencyCaseId,
        //     icon: 'close',
        //     GUID: this.guIdVal
        // });

        setTimeout(() => {
        this.selected.setValue(this.tabs.length - 1);
        this.cdr.detectChanges();
        });
    }

    openCase(result: EmergencyTab) {

        const tabExists = this.tabs.find(
            card =>
                card.emergencyCaseId === result.EmergencyCaseId
        );

        tabExists
            ? (this.selected.setValue(tabExists.id), this.cdr.detectChanges())
            : this.addTab(
                  result.EmergencyCaseId,
                  result.EmergencyNumber
              );
    }

    updateEmergencyNumber(emergencyNumberAndGuId: any) {

        console.log(emergencyNumberAndGuId);

        this.tabs.forEach(tab=> {
            
            console.log(tab.value !== 'Board' && tab.value !== 'Search' && tab.GUID === emergencyNumberAndGuId.guId);
            if(tab.value !== 'Board' && tab.value !== 'Search' && tab.GUID === emergencyNumberAndGuId.guId) {
                tab.value = (
                    emergencyNumberAndGuId.emergencyNumber || 'New Case*'
                ).toString();
                this.cdr.detectChanges();
            }
        });

        // if(this.tabs[this.selected.value].value !== 'Board' && this.tabs[this.selected.value].value !== 'Search' && 
        // this.tabs[this.selected.value].GUID === emergencyNumberAndGuId.guId){

        //     this.tabs[this.selected.value].value = (
        //         emergencyNumberAndGuId.emergencyNumber || 'New Case*'
        //     ).toString();

        //     this.cdr.detectChanges();
        // }


    }



    openSearchMediaDialog(mediaVal:File[]){

       this.dialog.open(AddSearchMediaDialogComponent, {
        minWidth: '50%',
        data: {
           mediaVal
        }
    });
    }
}
