import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintTemplate } from 'src/app/core/models/print-templates';
import { PrintTemplateService } from '../../services/print-template.service';

@Component({
  selector: 'print-content',
  templateUrl: './print-content.component.html',
  styleUrls: ['./print-content.component.scss']
})
export class PrintContentComponent implements OnInit {

  printTemplates:PrintTemplate[];

  constructor(
    route: ActivatedRoute,
    private printService: PrintTemplateService
  ) {
    this.printTemplates = JSON.parse(route.snapshot.params.printTemplate);
  }

  ngOnInit(): void {

    this.printService.onDataReady('print-template');

  }

}
