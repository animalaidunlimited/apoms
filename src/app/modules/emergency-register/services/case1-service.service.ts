import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
import { ConnectionService } from 'ng-connection-service';

@Injectable({
  providedIn: 'root'
})
export class Case1ServiceService extends APIService{

  endpoint = 'EmergencyRegister';

  online : boolean;
  constructor(http: HttpClient,
    private connectionService: ConnectionService,
    private onlineStatus: OnlineStatusService) { 
    super(http);
    this.online = this.onlineStatus.isOnline;

    this.connectionService.monitor().subscribe(data=> {
      console.log(data);
    });

    this.findConnection(onlineStatus);
  }

  private async findConnection(onlineStatus: OnlineStatusService) {
    onlineStatus.connectionChanged.subscribe(online=> {
      console.log(online);
    });
  }
}
