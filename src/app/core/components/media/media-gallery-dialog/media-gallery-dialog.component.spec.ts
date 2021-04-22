import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaGalleryDialogComponent } from './media-gallery-dialog.component';

describe('MediaGalleryDialogComponent', () => {
  let component: MediaGalleryDialogComponent;
  let fixture: ComponentFixture<MediaGalleryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaGalleryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaGalleryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
