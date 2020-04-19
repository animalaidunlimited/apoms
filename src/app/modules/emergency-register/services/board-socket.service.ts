import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { OutstandingCase, UpdatedRescue } from 'src/app/core/models/outstanding-case';


@Injectable({
  providedIn: 'root'
})
export class BoardSocketService {

  socket;

  constructor(private authService: AuthService) { }

  async setupSocketConnection() {

    let room = await this.authService.getOrganisationSocketEndPoint();

    this.socket = io(`${environment.SOCKET_ENDPOINT}/${room}`);

  }

  getOutstandingRescues():Observable<OutstandingCase[]>
  {

    let observable:Observable<OutstandingCase[]> = new Observable(observer => {

      this.socket.on('OUTSTANDING_RESCUES', (data: OutstandingCase[]) => {
        observer.next(data);
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    })
    return observable;
  }

  getUpdatedRescues():Observable<UpdatedRescue>
  {

    let observable = new Observable<UpdatedRescue>(observer => {

      this.socket.on('UPDATING_RESCUE', (data: UpdatedRescue) => {
        observer.next(data);
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    })
    return observable;
  }

}
