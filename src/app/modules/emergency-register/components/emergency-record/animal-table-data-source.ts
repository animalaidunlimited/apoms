// import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

export class AnimalsDataSource extends DataSource<any> {
    constructor(private displayAnimals) {
        super();
    }

    getSelected() {
        return this.displayAnimals.filter(item => item.selected);
    }

    connect(): Observable<any> {
        return of(this.displayAnimals);
    }

    disconnect() {
        // No-op
    }
}
