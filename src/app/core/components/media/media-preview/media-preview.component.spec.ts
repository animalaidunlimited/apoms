import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPreviewComponent } from './media-preview.component';

describe('MediaPreviewComponent', () => {
  let component: MediaPreviewComponent;
  let fixture: ComponentFixture<MediaPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
