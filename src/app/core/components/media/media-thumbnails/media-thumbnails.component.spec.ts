import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material-module';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';

import { MediaThumbnailsComponent } from './media-thumbnails.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MediaThumbnailsComponent', () => {
    let component: MediaThumbnailsComponent;
    let fixture: ComponentFixture<MediaThumbnailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports:[   MaterialModule,
                        HttpClientTestingModule,
                        AngularFireModule.initializeApp(environment.firebase) ],
            declarations: [ MediaThumbnailsComponent ],
            providers: [ DatePipe ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MediaThumbnailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});