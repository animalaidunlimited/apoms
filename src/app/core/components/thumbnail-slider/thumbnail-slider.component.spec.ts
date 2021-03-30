import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgxGalleryModule } from '@animalaidunlimited/ngx-gallery-aau';
import { BehaviorSubject } from 'rxjs';
import { MediaItem } from '../../models/media';

import { ThumbnailSliderComponent } from './thumbnail-slider.component';

describe('ThumbnailSliderComponent', () => {
    let component: ThumbnailSliderComponent;
    let fixture: ComponentFixture<ThumbnailSliderComponent>;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [NgxGalleryModule],
            declarations: [ThumbnailSliderComponent],
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
