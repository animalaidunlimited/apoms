import { inject, TestBed } from '@angular/core/testing';

import { PatientService } from './patient.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('PatientService', () => {

    let service: PatientService;

    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule
            ],
            providers: [
                PatientService,
                { provide: UntypedFormBuilder, useValue: formBuilder }
            ],
        }),
    );

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        service = TestBed.inject(PatientService);

    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
