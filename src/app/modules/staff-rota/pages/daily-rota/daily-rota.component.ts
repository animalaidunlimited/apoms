import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RotaService } from '../../services/rota.service';
import { RotaDay, RotaDayAssignmentResponse } from './../../../../core/models/rota';

@Component({
  selector: 'app-daily-rota',
  templateUrl: './daily-rota.component.html',
  styleUrls: ['./daily-rota.component.scss']
})
export class DailyRotaComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  constructor(
    route: ActivatedRoute,
    private rotaService: RotaService
  ) {

    route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      
      if(route.snapshot.params.rotationPeriodId){

          const rotationPeriodId = Number(`${route.snapshot.params.rotationPeriodId}`);

          console.log(rotationPeriodId);

          this.rotaService.getRotaDayAssignmentsByRotationPeriodId(rotationPeriodId).then(rotaDays => this.processRotaDays(rotaDays));

      }

  });

  }

  ngOnInit() {
  }

  processRotaDays(rotaDays: RotaDayAssignmentResponse | null) : void {

    console.log(rotaDays);

  }

}
