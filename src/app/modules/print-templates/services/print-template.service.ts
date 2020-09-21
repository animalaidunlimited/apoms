import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrintTemplate, SavePrintTemplateResponse } from 'src/app/core/models/print-templates';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplateService extends APIService {

  endpoint = 'PrintTemplate';

  constructor(http: HttpClient) {
    super(http);
  }


  public getPrintTemplates(): Observable<PrintTemplate[]> {

    return this.getObservable("");
}

  public async saveTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.post(template);

  }

  public async updateTemplate(template:PrintTemplate) :Promise<SavePrintTemplateResponse>{

    return await this.put(template);

  }
}
