import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaThumbnailsComponent } from './media-thumbnails.component';

describe('MediaThumbnailsComponent', () => {
    let component: MediaThumbnailsComponent;
    let fixture: ComponentFixture<MediaThumbnailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MediaThumbnailsComponent ]
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