import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { OutstandingCase } from 'src/app/core/models/outstanding-case';


@Injectable({
  providedIn: 'root'
})
export class BoardSocketService {

  socket;

  constructor(private authService: AuthService) { }

  async setupSocketConnection() {

    let room = await this.authService.getOrganisationSocketEndPoint();

    console.log(`env: ${environment.SOCKET_ENDPOINT}/${room}`);

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

  // getAssigned():Observable<any>
  // {

  //   let observable = new Observable(observer => {

  //     this.socket.on('OUTSTANDING_RESCUES', (data: ReceivedList[]) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   })
  //   return observable;
  // }

}
