import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LogoService } from './logo.service';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';

describe('LogoService', () => {
  let service: LogoService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase),
      ],
    });
    service = TestBed.inject(LogoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
