import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavModule } from './core/components/nav/nav.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/services/http/interceptor.service';

import { MaterialModule } from './material-module';
import { AutocompleteSelectComponent } from './core/components/autocomplete-select/autocomplete-select.component';



@NgModule({
    declarations: [AppComponent, AutocompleteSelectComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NavModule,
        HttpClientModule,
        MaterialModule,




    ],
    exports: [

    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpConfigInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
