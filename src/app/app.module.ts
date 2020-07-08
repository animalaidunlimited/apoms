import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavModule } from './core/components/nav/nav.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/services/http/interceptor.service';

import { MaterialModule } from './material-module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';



@Injectable({
    providedIn: 'root'
  })

class UIErrorHandler extends ErrorHandler {
  constructor() {
    super();
  }
  handleError(error) {
    super.handleError(error);
    //TODO Style these errors properly and provide them in a dialog with more info about what to do.
    alert(`Error occurred:${error.message}`);
  }
}


@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NavModule,
        HttpClientModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase),
    ],
    exports: [

    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true},
        {provide: ErrorHandler, useClass: UIErrorHandler}
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
