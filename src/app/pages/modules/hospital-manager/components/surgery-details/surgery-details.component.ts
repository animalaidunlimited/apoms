import { Component, OnInit } from '@angular/core';

export interface SurgeryRecord {
  date: string;
  type: string;
  surgeon: string;
  site: string;
  anesthesiaMinutes: number;
  died: string;
  comments: string;
  antibioticsGiven: string;
}

const ELEMENT_DATA: SurgeryRecord[] = [
  {date : "", type : "", surgeon : "", site : "", anesthesiaMinutes : 0, died : "", comments : "", antibioticsGiven: ""}
];


@Component({
  selector: 'surgery-details',
  templateUrl: './surgery-details.component.html',
  styleUrls: ['./surgery-details.component.scss']
})
export class SurgeryDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  displayedColumns: string[] = ["Date","Type","Surgeon","Site","Anesthesia Minutes"];
  surgeryRecords = ELEMENT_DATA;

  

}
