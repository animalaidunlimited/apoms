import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIService } from '../http/api.service';
import { MediaPasteService } from '../media-paste/media-paste.service';

@Injectable({
    providedIn: 'root'
})
export class LogoService extends APIService {
    endpoint = 'Logo';
    
    constructor(
        http: HttpClient,
        private mediaPasteService: MediaPasteService
    ){super(http);}

    uploadLogo(file:File, organisationId: number)
    {
        
        const mediaItem = this.mediaPasteService.handleUpload(file, organisationId, (new Date()).toString(), 'logo');

        mediaItem.mediaItemId.subscribe(async () => {

            if(mediaItem.mediaItem?.remoteURL){
                
                return await this.put({remoteURL : mediaItem.mediaItem?.remoteURL , organisationId })
                .then(data => {
                    return data;
                })
                .catch(error => {
                    console.log(error);
                });
                
            }
            
        }); 

     
         
    }
    
}