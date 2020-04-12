import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailSliderComponent } from './thumbnail-slider.component';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';

describe('ThumbnailSliderComponent', () => {
  let component: ThumbnailSliderComponent;
  let fixture: ComponentFixture<ThumbnailSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxGalleryModule],
      declarations: [ ThumbnailSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
