import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export abstract class APIService<T = any> {
    abstract endpoint: string;
    url = environment.API_URL;

    protected constructor(protected http: HttpClient) {}

    public async get<G>(request: string): Promise<G | null> {
        let response = null;
        try {
            response = await this.http
                .get<G>(`${this.url}/${this.endpoint}` + request)
                .toPromise();
        } catch (error: any) {
            response = this.errorHandler('GET', error);
        }

        return response;
    }

    public getObservable(request: string): Observable<any> {
        return this.http.get(`${this.url}/${this.endpoint}${request}`);
    }

    public getByField(subEndpoint: string, request: string): Observable<any> {
        return timer(200).pipe(
            switchMap(() => {
                // Check if username is available
                return this.http.get(`${this.url}/${this.endpoint}/${subEndpoint}?${request}`);
            }),
        );
    }

    public async getList(): Promise<T[] | null> {
        return this.get<T[]>('list');
    }

    public getById(id: number | string): Observable<any | null> {
        return timer(200).pipe(
            switchMap(() => {
                return this.http.get(`${this.url}/${this.endpoint}/?id=${id}`);
            }),
        );
    }

    public async deleteById(id: number | string): Promise<any> {
        let response = null;
        try {
            response = await this.http
                .delete(`${this.url}/${this.endpoint}/${id}`)
                .toPromise();
        } catch (error: any) {
            response = this.errorHandler('DELETE', error);
        }
        return response;
    }

    public async delete(body: any): Promise<any> {
        let response = null;

        try {
            response = await this.http
                .put(`${this.url}/${this.endpoint}`, body)
                .toPromise();
        } catch (error: any) {
            response = this.errorHandler('DELETE', error);
        }
        return response;
    }

    public async put(body: any): Promise<any> {
        let response = null;
        try {
            response = await this.http
                .put(`${this.url}/${this.endpoint}`, body)
                .toPromise();
        } catch (error: any) {
            response = this.errorHandler('PUT', error);
        }
        return response;
    }

    public async putSubEndpoint(subEndpoint: string, body: any): Promise<any> {
        let response = null;
        try {
            response = await this.http
                .put(`${this.url}/${this.endpoint}/${subEndpoint}`, body)
                .toPromise();
        } catch (error: any) {
            response = this.errorHandler('PUT', error);
        }
        return response;
    }

    public async post(body: any): Promise<any> {
        let response = null;
        try {

            response = await this.http
                .post(`${this.url}/${this.endpoint}`, body)
                .toPromise();

        } catch (error: any) {
            response = this.errorHandler('POST', error);
        }

        return response;

    }

    public async postSubEndpoint(subEndpoint: string, body: any): Promise<any> {

        let response = null;

        try {
            response = await this.http
                .post(`${this.url}/${this.endpoint}/${subEndpoint}`, body)
                .toPromise();
        } catch (error: any) {
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
