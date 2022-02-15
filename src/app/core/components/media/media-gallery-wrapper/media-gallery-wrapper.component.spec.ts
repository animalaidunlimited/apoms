import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from 'src/app/material-module';
import { MediaItem } from '../../../models/media';
import { TimeAgoPipe } from '../media-preview/time-ago.pipe';

import { GalleryWrapperComponent } from './media-gallery-wrapper.component';

describe('GalleryWrapperComponent', () => {
    let component: GalleryWrapperComponent;
    let fixture: ComponentFixture<GalleryWrapperComponent>;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule
            ],
            declarations: [
                GalleryWrapperComponent
            ],
            providers: [
                DatePipe,
                TimeAgoPipe
              ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GalleryWrapperComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
