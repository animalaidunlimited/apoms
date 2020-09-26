import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplate';
  isPrinting:boolean=false;

  public printTemplates:BehaviorSubject<PrintTemplate[]> = new BehaviorSubject<PrintTemplate[]>(null);;

  constructor(
    http: HttpClient,
    private router: Router) {
    super(http);
  }

  private initialisePrintTemplates(){

    console.log("Initialising");

    this.getObservable("").subscribe(templates => {

      console.log("templates");
      this.printTemplates.next(templates);
    });
  }


  public getPrintTemplates() : BehaviorSubject<PrintTemplate[]> {

    this.printTemplates.subscribe(val => {

      if(!val){
        this.initialisePrintTemplates();
      }

    });

    return this.printTemplates;



}

  public insertIntoPrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    let printTemplateSubscription = this.printTemplates.subscribe(templates => {

      templateList = templates
    });

      if(templateList){
        templateList.push(template);
      }

      this.printTemplates.next(templateList);

      printTemplateSubscription.unsubscribe();

  }

  public updatePrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    let printTemplateSubscription = this.printTemplates.subscribe(templates => {

      templateList = templates
    });

    let index = templateList.findIndex(existingElement => existingElement.printTemplateId === template.printTemplateId);

    templateList.splice(index, 1, template)

    this.printTemplates.next(templateList);

    printTemplateSubscription.unsubscribe();

  }

  public async insertTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.post(template);
  }

  public async updateTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.put(template);
  }

  public printDocument(printTemplateId: number, patientId: number) {

    let printTemplate:PrintTemplate;

    let templates = this.getPrintTemplates();

    console.log("1");

    templates.subscribe(templates => {

      if(!templates) return;

      printTemplate = templates.find(template => template.printTemplateId === printTemplateId);

      console.log(printTemplate);

      this.isPrinting = true;

      let innerHTML=`<div style='height: ${printTemplate.paperDimensions.height}; width: ${printTemplate.paperDimensions.width}'>`;

      printTemplate.printElements.forEach(printElement => {

      innerHTML += `<div style='position: absolute;
      top: ${printElement.top}px;
      left: ${printElement.left}px;
      height: ${printElement.height}px;
      width: ${printElement.width}px;
      font-size: ${printElement.fontSize}px;
      '>${printElement.example}</div>`;

      });

      innerHTML += "</div>";

      console.log(innerHTML);


      this.router.navigate(['/',
      { outlets: {
        'print': ['print', 'print-content', innerHTML]
      }}]);

    });



  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null }}]);
    });
  }

}
