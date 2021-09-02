import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { APIService } from '../http/api.service';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class OnlineStatusService  extends APIService{

    endpoint = 'Health';
    private internalConnectionChanged = new BehaviorSubject<boolean>(true);

    get connectionChanged() {
        return this.internalConnectionChanged;
    }

   
    constructor(http: HttpClient) {
        super(http);
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
       
    }

    private updateOnlineStatus() {
        this.internalConnectionChanged.next(window.navigator.onLine);


        this.checkApiStatus();
       
        
    }

    public checkApiStatus() {
      
        if(!window.navigator.onLine){
            const limitedInterval = setInterval(() => {
               
                
                if (window.navigator.onLine) {
                    const request = '';
                    this.get(request).then((status:any) => {
                        if(status.status === 'UP'){
                            this.internalConnectionChanged.next(true);
                        }
                    });
                    
                    clearInterval(limitedInterval);
                }

            }, 1000);
        }
    }

    public updateOnlineStatusAfterUnsuccessfulHTTPRequest(){
        
        this.internalConnectionChanged.next(false);
        
    }

    public updateOnlineStatusAfterSuccessfulHTTPRequest(){

        this.internalConnectionChanged.next(true);
    }
}
