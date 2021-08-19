import { Injectable } from '@angular/core';
import { MediaPasteService } from '../media-paste/media-paste.service';

@Injectable({
    providedIn: 'root'
})
export class LogoService {
    constructor(
        private mediaPasteService: MediaPasteService
    ){}

    uploadLogo(file:File, organisationId: number)
    {
        const mediaItem = this.mediaPasteService.handleUpload(file, organisationId, (new Date()).toString(), 'logo');
        mediaItem.mediaItemId.subscribe(() => {

            if(mediaItem.mediaItem?.remoteURL){
                console.log(mediaItem.mediaItem?.remoteURL);
            }
            
        });        
        
    }
    
}