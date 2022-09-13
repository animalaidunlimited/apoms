/*
import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {

        const token: string = this.authService.getToken();

        if (token) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            });
        }

        // return next.handle(req);

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.error instanceof ErrorEvent) {
                    // client-side error or network error
                } else {
                    // TODO: Clean up following by introducing method
                    if (error.status === 498) {
                        // TODO: Destroy local session; redirect to /login
                    }
                    if (error.status === 401) {
                        // Permission denied; log out
                        this.authService.logout();
                        this.router.navigate(['login'], { replaceUrl: true });
                    }
                    if (error.status === 404) {
                        // TODO: Not found; show toast
                        console.log(error);
                    }
                }
                return throwError(error);
            }),
        );
    }
}
*/



import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
    HttpEventType,
} from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

    private activeCalls: Map<string, Subject<any>> = new Map();

    constructor(private authService: AuthService, private router: Router) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {

        const token: string = this.authService.getToken();        

        if (token) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            });
        }

        //Let's see if we already have an active call
        if (this.activeCalls.has(req.url) && req.method === 'GET') {

            const subject = this.activeCalls.get(req.url);

            if(subject)
            return subject.asObservable();
        }

        this.activeCalls.set(req.url, new Subject<any>());

        // return next.handle(req);

        return next.handle(req).pipe(
            filter(res => res.type === HttpEventType.Response),
            tap(res => {
            const subject = this.activeCalls.get(req.url);
            subject?.next(res);
            subject?.complete();
            this.activeCalls.delete(req.url);
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.error instanceof ErrorEvent) {
                    // client-side error or network error
                } else {
                    // TODO: Clean up following by introducing method
                    if (error.status === 498) {
                        // TODO: Destroy local session; redirect to /login
                    }
                    if (error.status === 401) {
                        // Permission denied; log out
                        this.authService.logout();
                        this.router.navigate(['login'], { replaceUrl: true });
                    }
                    if (error.status === 404) {
                        // TODO: Not found; show toast
                        console.log(error);
                    }
                    if (error.status === 504) {
                        // TODO: We're offline, handle.
                        console.log(error);
                    }
                }
                return throwError(error);
            }),
        );
    }

}
