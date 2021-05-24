import { inject, TestBed } from '@angular/core/testing';

import { PatientService } from './patient.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('PatientService', () => {

    let service: PatientService;

    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule
            ],
            providers: [PatientService],
        }),
    );

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        service = TestBed.inject(PatientService);

    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
