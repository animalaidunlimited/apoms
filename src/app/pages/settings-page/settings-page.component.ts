import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    releaseVersion! : string;

    constructor() {}

    ngOnInit() {

        this.releaseVersion = '1.0.12';



    }
}
