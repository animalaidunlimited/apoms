import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaCaptureComponent } from './media-capture.component';

describe('MediaCaptureComponent', () => {
  let component: MediaCaptureComponent;
  let fixture: ComponentFixture<MediaCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaCaptureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
