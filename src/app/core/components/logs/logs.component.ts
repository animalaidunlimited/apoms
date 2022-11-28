import { LogsService } from './../../services/logger/logger.service';
import {
    Component,
    Inject,
    Input,
    OnInit,
    Optional,
    ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LogsData, LogSearchObject } from '../../models/logs-data';

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

        let incomingData = this.logsData || this.data;

        if(!incomingData) return;

        const searchQuery: LogSearchObject = {
                emergencyCaseId : incomingData?.emergencyCaseId,
                patientIds : [ incomingData.patientFormArray?.map(patientDetails => patientDetails.get('patientId')?.value) ].join(',')
        }

        this.initLogs(searchQuery);
    }

    async initLogs(searchQuery: LogSearchObject) {

        const logs = await this.logsService.getLogger(searchQuery);

        if (logs) {
          this.dataSource = new MatTableDataSource(logs);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
    }
}
