import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PrintPatient, PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';
import { Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient/patient.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplate';
  printTemplateSubscription:Subscription | undefined;
  public isPrinting:BehaviorSubject<boolean> = new BehaviorSubject(Boolean(false));

  public printTemplates:BehaviorSubject<PrintTemplate[]> = new BehaviorSubject<PrintTemplate[]>([]);

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

    // TODO type this properly
    this.getObservable('').subscribe((templates:any[]) => {
      if(templates){
        templates.forEach(template => {

          // The database returns 0 instead of false, so we need to change to booleans.
          template.printElements.forEach((element:any) => {

            element.bold = Boolean(element.bold);
            element.italics = Boolean(element.italics);
            element.underlined = Boolean(element.underlined);
            element.showStyleBar = Boolean(element.showStyleBar);

          });

        });
    }

      this.printTemplates.next(templates as PrintTemplate[]);

    });
  }


  public getPrintTemplates() : BehaviorSubject<PrintTemplate[]> {

    return this.printTemplates;

  }

  public insertIntoPrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    let haveRun = false;

    const printTemplateSubscription = this.printTemplates.subscribe(templates => {

      if(haveRun){
        return;
      }
      else{
        haveRun = true;
      }

      templateList = templates;

      if(templateList){
        templateList.push(template);
      }

      this.printTemplates.next(templateList);

      printTemplateSubscription.unsubscribe();
    });

  }

  public updatePrintTemplateList(template:PrintTemplate) : void {

    let templateList: PrintTemplate[];

    let haveRun = false;

    const printTemplateSubscription = this.printTemplates.subscribe(templates => {

      if(haveRun){
        return;
      }
      else{
        haveRun = true;
      }

      templateList = templates;

      const index = templateList.findIndex(existingElement => existingElement.printTemplateId === template.printTemplateId);

      templateList.splice(index, 1, template);

      this.printTemplates.next(templateList);


    });

    printTemplateSubscription.unsubscribe();



  }

  public async insertTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return this.post(template);
  }

  public async updateTemplate(template:PrintTemplate) :Promise<any>{

    return this.put(template);
  }

  public printPatientDocument(printTemplateId: number, patientId: number) {


    this.printTemplateSubscription = this.getPrintTemplate(printTemplateId).subscribe((printTemplate:PrintTemplate) => {

      // Get all of the patient details
      this.patientService.getPrintPatientByPatientId(patientId).subscribe((printPatient:PrintPatient) => {

        const newTemplate = this.populatePrintTemplateWithPatientData(printTemplate, printPatient);


        // The print content component takes an array of print templates.
        this.sendContentToPrinter(JSON.stringify([newTemplate]));
        this.printTemplateSubscription?.unsubscribe();

      });

    });

  }

  private populatePrintTemplateWithPatientData(printTemplate:PrintTemplate, printPatient:PrintPatient){

    const newTemplate:PrintTemplate = JSON.parse(JSON.stringify(printTemplate));

    newTemplate.printElements.forEach(element => {

      const elementName = this.toCamelCase(element.name);

      // The typescript interface is only at compile time, so change this to an object so we can access its values by property name.
      const patientObject = JSON.parse(JSON.stringify(printPatient));

      element.value = patientObject[elementName];

    });

    return newTemplate;

  }

  public printEmergencyCaseDocument(printTemplateId: number, emergencyCaseId: number){

    // Get all of the patient details by Emergency Case Id
      this.patientService.getPrintPatientsByEmergencyCaseId(emergencyCaseId).subscribe((resultPatient:PrintPatient[]) => {

        const templates:PrintTemplate[] = [];

        resultPatient.forEach(printPatient => {

          this.printTemplateSubscription = this.getPrintTemplate(printTemplateId).subscribe((printTemplate:PrintTemplate) => {

            const newTemplate = this.populatePrintTemplateWithPatientData(printTemplate, printPatient);

            templates.push(newTemplate);

          });

        });

        this.sendContentToPrinter(JSON.stringify(templates));
        this.printTemplateSubscription?.unsubscribe();

      });
}

private toCamelCase(str:string) : string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) {return '';} // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

  private getPrintTemplate(printTemplateId: number) : Observable<PrintTemplate>{

    return this.getPrintTemplates().pipe(map((templates:PrintTemplate[]) =>{

      const foundTemplate = templates.find(template => template.printTemplateId === printTemplateId);

      if (foundTemplate === undefined) {
        throw new TypeError('Missing print template!');
      }

      return foundTemplate;

    }));

  }

  public sendContentToPrinter(contentToPrint: string){

    this.isPrinting.next(true);

    this.router.navigate(['/',
    {
      outlets: {
      print: ['print', 'print-content', contentToPrint]
    }}]);

  }

  public sendTreatmentListToPrinter(contentToPrint: string){

    this.isPrinting.next(true);

    this.router.navigate(['/',
    {
      outlets: {
      'treatment-list': ['treatment-list', 'treatment-list', contentToPrint]
    }}]);

  }

  public onDataReady(printItemName:string) {

    setTimeout(() => {
      window.print();
      this.isPrinting.next(false);

      if(printItemName === 'print-template'){
        this.router.navigate([{ outlets: { print: null }}]);

      }
      else if(printItemName === 'treatment-list'){
        this.router.navigate([{ outlets: { 'treatment-list': null }}]);
      }


    }, 0);
  }

}
