import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CallerNumberResponse } from '../../models/responses';


export abstract class CrudService<T = any> {
    abstract endpoint;
    url = '';

    protected constructor(
        protected http: HttpClient
        ) {}

    public async get<G>(request: string): Promise<G | null> {
        let response = null;
        try {
            response = await this.http
                // .get<G>(`${this.url}/${this.endpoint}/${request}`)
                .get<G>(`${this.url}/${this.endpoint}`)

                .toPromise();
        } catch (error) {
            response = this.errorHandler('GET', error);
        }
        return response;
    }

    public getObservable(request: string): Observable<any> {
        // let response = null;

        console.log(`${this.url}/${this.endpoint}?${request}`);

        // try {
        //     response = this.http
        //         .get(`${this.url}/${this.endpoint}?${request}`);
        //         // .pipe(
        //         //   map((res: Response) => {
        //         //     return res.body;
        //         //   })
        //         //);
        // } catch (error) {
        //     response = this.errorHandler('GET', error);
        // }
        // return response;

        return this.http
        .get(`${this.url}/${this.endpoint}?${request}`);
    }

    public async getList(): Promise<T[] | null> {
        return this.get<T[]>('list');
    }

    public async getById(id: number | string): Promise<T | null> {
        return this.get<T>('' + id);
    }

    public async deleteById(id: number | string): Promise<any> {
        let response = null;
        try {
            response = await this.http
                .delete(`${this.url}/${this.endpoint}/${id}`)
                .toPromise();
        } catch (error) {
            response = this.errorHandler('DELETE', error);
        }
        return response;
    }





    public async put(body): Promise<any> {
        let response = null;
        try {
            response = await this.http
                .put(`${this.url}/${this.endpoint}`, body)
                .toPromise();
        } catch (error) {
            response = this.errorHandler('PUT', error);
        }
        return response;
    }

    public async post(body): Promise<any> {

        let response = null;
        try {
            response = await this.http
                .post(`${this.url}/${this.endpoint}`, body)
                .toPromise();
        } catch (error) {
            response = this.errorHandler('POST', error);
        }
        return response;
    }

    public errorHandler(
        method: string,
        error: HttpErrorResponse,
    ): Promise<never> {
        console.error(
            `Error occurred during ${method} ${this.url}/${this.endpoint}`,
            error,
        );
        return Promise.reject(error);
    }
}
