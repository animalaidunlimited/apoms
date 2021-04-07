import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'census-page',
    templateUrl: './census-page.component.html',
    styleUrls: ['./census-page.component.scss'],
})
export class CensusPageComponent implements OnInit {


    defaultDate = new Date();
 constructor(
    ) {}

    ngOnInit() {}

}
