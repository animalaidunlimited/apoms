import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { TeamRescueAssingerComponent } from './team-rescue-assinger.component';


@NgModule({
    declarations: [
        TeamRescueAssingerComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        ],
    exports: [TeamRescueAssingerComponent]
})
export class TeamRescueAssingerModule {}