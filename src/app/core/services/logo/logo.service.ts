import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIService } from '../http/api.service';
import { MediaService } from '../media/media.service';

@Injectable({
    providedIn: 'root'
})
export class LogoService extends APIService {
    endpoint = 'Logo';

    constructor(
        http: HttpClient,
        private MediaService: MediaService
    ){super(http);}

    uploadLogo(file:File, organisationId: number)
    {

        const mediaItem = this.MediaService.handleUpload(file, organisationId, (new Date()).toString(), 'logo');

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