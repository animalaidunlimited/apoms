import { LogsService } from './../../services/logger/logger.service';
import {
    Component,
    Inject,
    Input,
    OnInit,
    Optional,
    ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LogsData } from '../../models/logs-data';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {

    @Input() logsData!:LogsData;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    logs: any;
    dataSource!: MatTableDataSource<any>;

    displayedColumns: string[] = [
        'userName',
        'changeTable',
        'loggedAction',
        'Date',
        'Time',
    ];
    constructor(
        @Inject(MAT_DIALOG_DATA) @Optional() public data: LogsData,
        private logsService: LogsService,
    ) {}

    ngOnInit(): void {
        let searchQuery='';
        if(this.data)
        {
            searchQuery = [
                this.data.emergencyCaseId,
                this.data.patientFormArray?.map(patientDetails => {
                    if (
                        patientDetails.value.tagNumber !== null &&
                        patientDetails.value.patientId !== 0
                    ) {
                        return `${patientDetails.value.patientId},${patientDetails.value.tagNumber}`;
                    } else if (patientDetails.value.patientId !== 0) {
                        return patientDetails.value.patientId;
                    }
                }),
            ].join(',');
        }
        else{
            searchQuery = Object.values(this.logsData).toString();
        }

        this.initLogs(searchQuery);
    }

    async initLogs(searchQuery: string) {
        const logs = await this.logsService.getLogger(searchQuery);

        if (logs) {
          this.dataSource = new MatTableDataSource(logs);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
    }
}
