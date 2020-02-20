import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from 'src/app/core/services/http/crud.service';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { EmergencyResponse } from 'src/app/core/models/responses';
import { OnlineStatusService } from 'src/app/core/services/online-status.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CaseService extends CrudService {

  constructor(
    http: HttpClient,
    private readonly onlineStatus: OnlineStatusService,
    protected storage: StorageService
    ) {
      super(http);
      this.online = this.onlineStatus.isOnline;
      this.checkStatus(onlineStatus);
    }

    endpoint = 'EmergencyRegister';
    response: EmergencyResponse;
    redirectUrl: string;

    online: boolean;

    private async checkStatus(onlineStatus: OnlineStatusService)
    {
        onlineStatus.connectionChanged.subscribe(async online => {
            if (online) {
              this.online = true;
              //TODO push this message to the user in snackbar
              console.log("We're online: online = " + online);

              await this.postFromLocalStorage(this.storage.getItemArray("POST"))
              .then((message) => {
                console.log(message);
              })
              .catch((error) =>
                console.log(error)
              );

              await this.putFromLocalStorage(this.storage.getItemArray("PUT"))
              .then((message) => {
                console.log(message);
              })
              .catch((error) =>
                console.log(error)
              );


            } else {
              this.online = false;
              //TODO push this message to the user in snackbar
              console.log("We're offline: online = " + online);
            }
          });
    }

    public async updateCase(emergencyCase:EmergencyCase): Promise<any>{
        if(this.online)
        {
            return await this.baseUpdateCase(emergencyCase);
        }
        else
        {
            return await this.saveToLocalDatabase("PUT", emergencyCase);
        }
    }

    public async insertCase(emergencyCase:EmergencyCase): Promise<any>
    {

        if(this.online)
        {
            return await this.baseInsertCase(emergencyCase);
        }
        else
        {
            return await this.saveToLocalDatabase("POST", emergencyCase);
        }
    }

  public async baseInsertCase(emergencyCase:EmergencyCase)
  {

      try {
          this.response = await this.post({ emergencyCase }) as EmergencyResponse;

          if(!this.response){
              throw new Error(
                "Unable to insert Emergency Case",
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async baseUpdateCase(emergencyCase:EmergencyCase)
  {
      try {
          this.response = await this.put({ emergencyCase }) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                "Unable to update Emergency Case",
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async getCaseById(emergencyNumber:number)
  {
      try {

          this.response = await this.getById(emergencyNumber) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                  "Unable to get Case with ID: emergencyNumber: " + emergencyNumber,
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async deleteById(emergencyNumber:number)
  {
      try {
          this.response = await this.deleteById(emergencyNumber) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                "Unable to delete Case with ID: emergencyNumber: " + emergencyNumber,
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }



  private async postFromLocalStorage(postsToSync)
  {

    return postsToSync.forEach(async element => {
      return await this.baseInsertCase(element.value)
      .then((res) =>
      {
        if(res.status == "success"){
          try{
            this.storage.remove(element.key);
            return res;
          }
          catch(error)
          {
            console.log(error);
            return Error("Error updating case");
          }


        };
      })
      .catch((error) => {
        console.log("Error adding item: " + error);
      });
    });
  }

  private async putFromLocalStorage(putsToSync)
  {

    putsToSync.forEach(async element => {
      let response = await this.baseUpdateCase(element.value)
      .then((res) =>
      {
        if(res.status == "success"){
          try{
            this.storage.remove(element.key);
            return res;
          }
          catch(error)
          {
            console.log(error);
            return Error("Error updating case");
          }

        };
      })
      .catch((error) => {
        console.log("Error updating item: " + error);
      });

      return response;

    });



  }

  // private async syncInsertsWithRemote()
  // {
  //   let postArray = this.storage.getItemArray("POST");

  //   await this.postFromLocalStorage(postArray)
  //   .then(() => {
  //     return Promise.resolve("Finished sending offline case inserts data to server");
  //   }).catch((error) => {
  //     return Promise.reject("An error occured when saving offline data to the server: " + error)
  //   });

  // }

  // private async syncUpdatesWithRemote()
  // {
  //   console.log("Beginning sync with server");

  //   let putArray = this.storage.getItemArray("PUT");

  //   await this.putFromLocalStorage(putArray)
  //   .then(() => {
  //     return Promise.resolve("Finished sending offline case updates data to server");
  //   }).catch((error) => {
  //     return Promise.reject("An error occured when saving offline data to the server: " + error)
  //   });
  // }

  private async saveToLocalDatabase(key, body)
  {
    //Make a unique identified so we don't overwrite anything in local storage.
    let guid = uuid();

    try {
      this.storage.save(key + guid, body);
      return Promise.resolve("Record successfully saved to offline storage.");
    }
    catch(error)
    {
      return Promise.reject("An error occured saving to offline storage: " + error);
    }

  }
}


