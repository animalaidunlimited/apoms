import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, Validators } from '@angular/forms';
import { TeamDetails } from 'src/app/core/models/team';
import { ViewChild } from '@angular/core';
import { TeamDetailsService } from 'src/app/core/services/team-details/team-details.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { take } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
    selector: 'app-teams-page',
    templateUrl: './teams-page.component.html',
    styleUrls: ['./teams-page.component.scss'],
})
export class TeamsPageComponent implements OnInit, OnDestroy {

    dataSource: MatTableDataSource<TeamDetails>;
    teamSubsciption: Subscription | undefined;
    @ViewChild(MatTable) table!: MatTable<TeamDetails>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private teamDetailService: TeamDetailsService,
        private fb: FormBuilder,
        private snackBar: SnackbarService,
        private dialog: MatDialog,
    ) {
        const emptyTeam = {
            TeamId: 0,
            TeamName: '',
            IsDeleted: '0',
            Capacity: 0,
            TeamColour: ''
        };
        this.dataSource = new MatTableDataSource([emptyTeam]);
    }

    displayedColumns: string[] = [
        'TeamName',
        'Capacity',
    ];

    teamDetails = this.fb.group({
        TeamId: [],
        TeamName: ['', Validators.required],
        Capacity: [, Validators.required],
        IsDeleted: [],
    });

    disabledDeleteBtn = true;

    ngOnInit() {
        this.getrefreshTableData();
    }

    getrefreshTableData() {
        this.teamSubsciption = this.teamDetailService
            .getAllTeams()
            .pipe(take(1))
            .subscribe((teamListData: TeamDetails[]) => {
                this.dataSource = new MatTableDataSource(teamListData);
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.teamSubsciption?.unsubscribe();
            });
    }

    refreshTable() {
        this.getrefreshTableData();
    }

    resetForm() {
        this.teamDetails.reset();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    ngOnDestroy() {
        this.teamSubsciption?.unsubscribe();
    }

    submit() {
        if (this.teamDetails.valid) {
            this.teamDetailService
                .saveTeam(this.teamDetails.value)
                .then((res: any) => {
                    if (res.vSuccess) {
                        this.snackBar.successSnackBar(
                            'Team saved succesfully!',
                            'Ok',
                        );
                        this.refreshTable();
                        this.resetForm();
                    } else {
                        this.snackBar.errorSnackBar('Error occured!', 'Ok');
                    }
                });
        } else {
            this.snackBar.errorSnackBar('Invalid input fields', 'Ok');
        }
    }

    selectRow(selectedTeam: TeamDetails) {
        try {
            this.teamDetails.patchValue(selectedTeam);
            this.disabledDeleteBtn =
                this.teamDetails.get('TeamId')?.value === null ? true : false;
        } catch (error) {
            console.log(error);
        }
        this.teamDetails.get('selectedTeam')?.setValue(selectedTeam);
    }

    deleteTeam() {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
            data: {
                message: 'Are you sure want to delete?',
                buttonText: {
                    ok: 'Yes',
                    cancel: 'No',
                },
            },
        });
        dialogRef.afterClosed().pipe(take(1)).subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.teamDetails.get('IsDeleted')?.setValue(true);
                this.submit();
            }
        });
    }
}
