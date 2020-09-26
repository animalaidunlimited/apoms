import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintTemplateService } from '../../services/print-template.service';

@Component({
  selector: 'print-content',
  templateUrl: './print-content.component.html',
  styleUrls: ['./print-content.component.scss']
})
export class PrintContentComponent implements OnInit {

  content:string;

  constructor(
    route: ActivatedRoute,
    private printService: PrintTemplateService
  ) {
    this.content = route.snapshot.params['content']
  }

  ngOnInit(): void {


    this.printService.onDataReady()

  }

}
