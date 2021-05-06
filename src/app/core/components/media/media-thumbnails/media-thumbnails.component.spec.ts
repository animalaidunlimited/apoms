import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material-module';

import { MediaThumbnailsComponent } from './media-thumbnails.component';

describe('MediaThumbnailsComponent', () => {
    let component: MediaThumbnailsComponent;
    let fixture: ComponentFixture<MediaThumbnailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports:[MaterialModule],
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