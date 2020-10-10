import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrintPatient, PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';
import { Router } from '@angular/router';
import { PatientService } from '../../emergency-register/services/patient.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplate';
  public isPrinting:BehaviorSubject<boolean> = new BehaviorSubject(false);

  public printTemplates:BehaviorSubject<PrintTemplate[]> = new BehaviorSubject<PrintTemplate[]>(null);

  constructor(
    http: HttpClient,
    private patientService: PatientService,
    private router: Router) {
    super(http);
  }

  public setIsPrinting(isPrinting:boolean){
    this.isPrinting.next(isPrinting);
  }

  public getIsPrinting(){
    return this.isPrinting;
  }

  public initialisePrintTemplates(){

    this.getObservable('').subscribe((templates:any[]) => {

      templates.forEach(template => {

        // The database returns 0 instead of false, so we need to change to booleans.
        template.printElements.forEach(element => {

          element.bold = element.bold === 0 ? false : true;
          element.italics = element.italics === 0 ? false : true;
          element.underlined = element.underlined === 0 ? false : true;
          element.showStyleBar = element.showStyleBar === 0 ? false : true;

        });

      });

      this.printTemplates.next(templates as PrintTemplate[]);

    });
  }


  public getPrintTemplates() : BehaviorSubject<PrintTemplate[]> {

    return this.printTemplates;

  }

  public insertIntoPrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    const printTemplateSubscription = this.printTemplates.subscribe(templates => {

      templateList = templates;
    });

      if(templateList){
        templateList.push(template);
      }

      this.printTemplates.next(templateList);

      printTemplateSubscription.unsubscribe();

  }

  public updatePrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    const printTemplateSubscription = this.printTemplates.subscribe(templates => {

      templateList = templates;
    });

    const index = templateList.findIndex(existingElement => existingElement.printTemplateId === template.printTemplateId);

    templateList.splice(index, 1, template);

    this.printTemplates.next(templateList);

    printTemplateSubscription.unsubscribe();

  }

  public async insertTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.post(template);
  }

  public async updateTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.put(template);
  }

  public printPatientDocument(printTemplateId: number, patientId: number) {

    this.getPrintTemplate(printTemplateId).subscribe((printTemplate:PrintTemplate) => {

      // Get all of the patient details
      this.patientService.getPrintPatientByPatientId(patientId).subscribe((printPatient:PrintPatient) => {

        const newTemplate = this.populatePrintTemplateWithPatientData(printTemplate, printPatient);

        // The print content component takes an array of print templates.
        this.sendContentToPrinter(JSON.stringify([newTemplate]));

      });

    });

  }

  private populatePrintTemplateWithPatientData(printTemplate:PrintTemplate, printPatient:PrintPatient){

    const newTemplate:PrintTemplate = JSON.parse(JSON.stringify(printTemplate));

    newTemplate.printElements.forEach(element => {

      element.value = printPatient[this.toCamelCase(element.name)];

    });

    return newTemplate;

  }

  public printEmergencyCaseDocument(printTemplateId: number, emergencyCaseId: number){

    // Get all of the patient details by Emergency Case Id
      this.patientService.getPrintPatientsByEmergencyCaseId(emergencyCaseId).subscribe((resultPatient:PrintPatient[]) => {

        const templates:PrintTemplate[] = [];

        resultPatient.forEach(printPatient => {

          this.getPrintTemplate(printTemplateId).subscribe((printTemplate:PrintTemplate) => {

            const newTemplate = this.populatePrintTemplateWithPatientData(printTemplate, printPatient);

            templates.push(newTemplate);

          });

        });

        this.sendContentToPrinter(JSON.stringify(templates));

      });
}

private toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) {return '';} // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

  private getPrintTemplate(printTemplateId: number) : Observable<PrintTemplate>{

    return this.getPrintTemplates().pipe(map((templates:PrintTemplate[]) =>

      templates.find(template => template.printTemplateId === printTemplateId)

    ));

  }

  public sendContentToPrinter(contentToPrint: string){

    this.isPrinting.next(true);

    this.router.navigate(['/',
    {
      outlets: {
      print: ['print', 'print-content', contentToPrint]
    }}]);

  }

  public sendCensusListToPrinter(contentToPrint: string){

    this.isPrinting.next(true);

    this.router.navigate(['/',
    {
      outlets: {
      'census-list': ['census-list', 'census-list-content', contentToPrint]
    }}]);

  }

  public onDataReady(printItemName:string) {

    setTimeout(() => {
      window.print();
      this.isPrinting.next(false);

      if(printItemName === 'print-template'){
        this.router.navigate([{ outlets: { print: null }}]);

      }
      else if(printItemName === 'census-list'){
        this.router.navigate([{ outlets: { 'census-list': null }}]);
      }


    });
  }

}
