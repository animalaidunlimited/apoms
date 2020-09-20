import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { PaperDimensions, PrintElement, PrintTemplate } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplates';

  constructor(http: HttpClient) {
    super(http);
  }

  getPrintableElements(){

    let printableElements:PrintElement[] = [{
      printElementId: 1,
      name: "Admission date",
      example: "25/07/2020",
      width: 175,
      height: 45,
      top: 0,
      left: 0,
      showStyleBar: false,
      bold: false,
      italics: false,
      underlined: false,
      fontSize: 12,
      alignment: "left"
    },
    {
      printElementId: 2,
      name: "Animal type",
      example: "Buffalo",
      width: 175,
      height: 45,
      top: 0,
      left: 0,
      showStyleBar: false,
      bold: false,
      italics: false,
      underlined: false,
      fontSize: 12,
      alignment: "left"
    },
    {
      printElementId: 3,
      name: "Emergency number",
      example: "314159",
      width: 175,
      height: 45,
      top: 0,
      left: 0,
      showStyleBar: false,
      bold: false,
      italics: false,
      underlined: false,
      fontSize: 12,
      alignment: "left"
    },
    {
      printElementId: 4,
      name: "Tag number",
      example: "A374",
      width: 175,
      height: 45,
      top: 0,
      left: 0,
      showStyleBar: false,
      bold: false,
      italics: false,
      underlined: false,
      fontSize: 12,
      alignment: "left"
    }];

    return of(printableElements);

  }

  getPaperDimensions(){

  let paperDimensions:PaperDimensions[] = [
  {name:"A4", height: "297mm", width:"210mm"},
  {name:"A3", height: "420mm", width:"297mm"},
  {name:"A5", height: "210mm", width:"140mm"},
  {name:"Custom", height: "210mm", width:"140mm"}
  ];

  return of(paperDimensions);

  }

  getPrintTemplates(){

    let templates:PrintTemplate[] = [{"printTemplateId":1,"templateName":"Emergency Form", "updated": false, "updateDateTime": null,"showTemplateImage":true,"backgroundImageUrl":"blob:http://localhost:4200/687f6f9b-abb2-46cb-a321-ea1f046c34aa","paperDimensions":{"name":"A4","height":"297mm","width":"210mm"},"orientation":"Portrait","printElements":[{"printElementId":1,"name":"Admission date","example":"25/07/2020","width":175,"height":45,"top":130,"left":155.84375,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":2,"name":"Animal type","example":"Buffalo","width":175,"height":45,"top":414,"left":443.84375,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":3,"name":"Admission date","example":"25/07/2020","width":175,"height":45,"top":227,"left":545.84375,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":4,"name":"Emergency number","example":"314159","width":175,"height":45,"top":468,"left":105.84375,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":5,"name":"Tag number","example":"A374","width":175,"height":45,"top":598,"left":525.84375,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"}]},
    {"printTemplateId":null,"templateName":"Release Request", "updated": false, "updateDateTime": null,"showTemplateImage":true,"backgroundImageUrl":"blob:http://localhost:4200/ae9bcfd4-e6ef-4eff-b2db-f992720b54f9","paperDimensions":{"name":"A4","height":"297mm","width":"210mm"},"orientation":"Portrait","printElements":[{"printElementId":1,"name":"Admission date","example":"25/07/2020","width":175,"height":45,"top":154,"left":187.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":2,"name":"Animal type","example":"Buffalo","width":175,"height":45,"top":360,"left":470.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":3,"name":"Emergency number","example":"314159","width":175,"height":45,"top":427,"left":122.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":4,"name":"Tag number","example":"A374","width":175,"height":45,"top":543,"left":383.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":5,"name":"Tag number","example":"A374","width":175,"height":45,"top":609,"left":352.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":6,"name":"Tag number","example":"A374","width":175,"height":45,"top":681,"left":435.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"},{"printElementId":7,"name":"Tag number","example":"A374","width":175,"height":45,"top":752,"left":314.6875,"showStyleBar":false,"bold":false,"italics":false,"underlined":false,"fontSize":12,"alignment":"left"}]}]

    return of(templates);

  }

  saveTemplates(templates:PrintTemplate[]){



  }
}
