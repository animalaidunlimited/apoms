import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplate';

  public printTemplates:BehaviorSubject<PrintTemplate[]> = new BehaviorSubject<PrintTemplate[]>(null);;

  constructor(http: HttpClient) {
    super(http);
  }

  private initialisePrintTemplates(){

    this.getObservable("").subscribe(templates => {
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
}
