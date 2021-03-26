import { TestBed, getTestBed } from '@angular/core/testing';

import { DropdownService } from './dropdown.service';

import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { AnimalType } from '../../models/animal-type';

describe('DropdownService', () => {
    let injector: TestBed;
    let service: DropdownService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DropdownService],
        });

        injector = getTestBed();
        service = injector.get(DropdownService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getExclusions() should return data', () => {
        const dummyExclusions = [
            {
                animalType: 'Bird (other)',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Buffalo',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Buffalo Calf',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Bull',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Calf',
                exclusionList: [
                    'Can\'t fly',
                    'Shifted puppies',
                    'Pregnancy problem',
                ],
            },
            {
                animalType: 'Camel',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Cat',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Chicken',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Cow',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Dog',
                exclusionList: ['Horn/hoof problem', 'Can\'t fly'],
            },
            {
                animalType: 'Donkey',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Egret',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Fox',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Goat',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Horse',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Kitten',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Monkey',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Nevala',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Parrot',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Pig',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Pigeon',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Puppy',
                exclusionList: ['Horn/hoof problem', 'Can\'t fly'],
            },
            {
                animalType: 'Rabbit',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Sheep',
                exclusionList: ['Can\'t fly', 'Shifted puppies'],
            },
            {
                animalType: 'Sparrow',
                exclusionList: [
                    'Horn/hoof problem',
                    'Normal behaviour - biting',
                    'Penis coming out',
                    'Pregnancy problem',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Squirrel',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
            {
                animalType: 'Tortoise',
                exclusionList: [
                    'Horn/hoof problem',
                    'Can\'t fly',
                    'Shifted puppies',
                ],
            },
        ];

        const res = service.getExclusions();

        expect(res).toEqual(dummyExclusions);
    });

    it('getAnimalTypes() should return data', () => {

        const animalTypes:AnimalType[] = [{ AnimalTypeId: 1, AnimalType: 'Cat', Sort: 10 }];

        service.getAnimalTypes().subscribe(res => {
            expect(res).toEqual(animalTypes);
        });
    });
});
