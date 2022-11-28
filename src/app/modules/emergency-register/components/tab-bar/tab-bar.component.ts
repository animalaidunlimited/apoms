import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CaseToOpen } from 'src/app/core/models/emergency-record';
import { EmergencyRegisterTabBarService } from '../../services/emergency-register-tab-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSearchMediaDialogComponent } from '../add-search-media-dialog/add-search-media-dialog.component';
import { NavigationService } from 'navigation/navigation.service';
import { CaseService } from '../../services/case.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KeyboardShortcutsComponent } from 'src/app/core/components/keyboard-shortcuts/keyboard-shortcuts.component';
import { generateUUID } from 'src/app/core/helpers/utils';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';

interface EmergencyCaseIdentifiers {
    emergencyNumber : number | string;
    GUID : string;
}


@Component({

    // tslint:disable-next-line: component-selector
    selector: 'tab-bar',
    templateUrl: './tab-bar.component.html',
    styleUrls: ['./tab-bar.component.scss'],
})

export class TabBarComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    loadBoard = false;

    selected = new FormControl(0);

    tabs = [
        { id: 0, value: 'Board', emergencyCaseId: 0, icon: '', GUID: new BehaviorSubject<string>('') },
        { id: 1, value: 'Search', emergencyCaseId: 0, icon: '', GUID: new BehaviorSubject<string>('') },
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private emergencytabBar: EmergencyRegisterTabBarService,
        private dialog: MatDialog,
        private navigationService:NavigationService,
        private caseService: CaseService,
        private printService: PrintTemplateService
    ) {}

    ngOnInit() {

        this.printService.initialisePrintTemplates();

        this.selected.setValue(1);

        this.caseService.caseToOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(caseValue => {

                if(caseValue?.source === "emergencyRegister"){
                    this.openCase(caseValue);
                }
            });

        this.navigationService.isSearchClicked
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((clicked)=>
            {
                if(clicked)
                {
                    this.selected.setValue(1);
                }
            }
        );

        const sharedMediaItem = this.emergencytabBar.getSharedMediaItem();

        sharedMediaItem.pipe(takeUntil(this.ngUnsubscribe))
                        .subscribe((mediaItem:File[])=>{

                        if(mediaItem.length > 0){
                                this.openSearchMediaDialog(mediaItem);
                        }
                        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    removeTab(index: number) {
        // TODO find out why the ngif in the mat-label causes and error and fix
        if (index > 1 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
            this.selected.setValue(this.tabs.length - 1);
        }
    }

    addTab(emergencyCaseId: number, emergencyNumber: number | string) {

        const guIdVal = new BehaviorSubject<string>(generateUUID());

        this.tabs.push({
            id: this.tabs.length,
            value: emergencyNumber.toString(),
            emergencyCaseId,
            icon: 'close',
            GUID: guIdVal
        });
        setTimeout(() => {
        this.selected.setValue(this.tabs.length - 1);
        this.cdr.detectChanges();
        });
    }

    openCase(result: CaseToOpen) {

        const tabExists = this.tabs.find(
            card =>
                card.emergencyCaseId === result.tab.EmergencyCaseId
        );

        tabExists
            ? (this.selected.setValue(tabExists.id), this.cdr.detectChanges())
            : this.addTab(
                  result.tab.EmergencyCaseId,
                  result.tab.EmergencyNumber
              );
    }

    updateEmergencyNumber(emergencyCaseIdentifiers: EmergencyCaseIdentifiers) {

        this.tabs.forEach(tab=> {

              if(tab.value !== 'Board' && tab.value !== 'Search' && tab.GUID.value === emergencyCaseIdentifiers.GUID) {
            // if(tab.GUID.value === emergencyCaseIdentifiers.GUID) {

                tab.value = (
                    emergencyCaseIdentifiers.emergencyNumber || 'New Case*'
                ).toString();
                this.cdr.detectChanges();
            }
        });

    }


    openSearchMediaDialog(mediaVal:File[]){

       this.dialog.open(AddSearchMediaDialogComponent, {
        minWidth: '50%',
        data: {
           mediaVal
        }
    });
    }


    openShortcutsDialog($event:Event, tabIndex:number){
        
        const dialog = this.dialog.open(KeyboardShortcutsComponent, {
            minWidth: '50%'
        });

        dialog.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(()=> this.selected.setValue(tabIndex));
    }

    tabChanged($event:number){

        if($event === 0){
            this.loadBoard = true;
        }
        else if($event === 1){
            setTimeout(() => {
                this.navigationService.isSearchClicked.next(true);
            }, 1);
        }

        this.selected.setValue($event);

    }
}
