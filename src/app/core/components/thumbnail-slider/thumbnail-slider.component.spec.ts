import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from 'src/app/material-module';
import { MediaItem } from '../../models/media';
import { TimeAgoPipe } from '../media/media-preview/time-ago.pipe';

import { ThumbnailSliderComponent } from './thumbnail-slider.component';

describe('ThumbnailSliderComponent', () => {
    let component: ThumbnailSliderComponent;
    let fixture: ComponentFixture<ThumbnailSliderComponent>;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialModule
            ],
            declarations: [
                ThumbnailSliderComponent
            ],
            providers: [
                DatePipe,
                TimeAgoPipe
              ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ThumbnailSliderComponent);
        component = fixture.componentInstance;

        component.mediaData = new BehaviorSubject<MediaItem[]>([]);


        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
