import { Injectable, NgZone } from '@angular/core';
import { APIService } from '../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../core/services/storage/storage.service';
import { StorageKey } from '../core/services/storage/storage.model';
import { BootController } from '../../boot-controller';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { BehaviorSubject } from 'rxjs';
const { AUTH_TOKEN } = StorageKey;

export interface Response {
    success: boolean;
    message: string;
    socketEndPoint: string;
    token: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService extends APIService {
    endpoint = 'Auth';
    loggedIn: BehaviorSubject<boolean>;
    redirectUrl: string | null = null;
    response!: Response;
    socketEndPoint!: string;
    token: string;

    constructor(
        http: HttpClient,
        private ngZone: NgZone,
        private storage: StorageService,
        private userService: UserOptionsService,
    ) {
        super(http);
        this.token = this.storage.read(AUTH_TOKEN) || '';

        this.loggedIn = new BehaviorSubject<boolean>(this.token.length > 0);

    }

    public async login(username: string, password: string) {
        try {
            this.response = (await this.post({
                username,
                password,
            })) as Response;

            console.log(this.response)

            this.token = this.response.token || '';

            if (!this.response.success) {
                throw new Error('Wrong Credentials!');
            }
            this.userService.userName = username;

            this.loggedIn.next(true);
            this.storage.save(AUTH_TOKEN, this.token);
            this.storage.save('SOCKET_END_POINT', this.response.socketEndPoint);

            return this.redirectUrl;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async mockLogin(email: string, password: string) {
        try {
            if (!(email === 'user' && password === 'user')) {
                throw new Error(
                    'When using mockLogin, login with credentials: \nemail: user\npassword:user',
                );
            }
            this.token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImppbSIsImV4cGlyZXMiOjI2MDkzMTE5MTQzOTR9.dJ7j8Fr6NHMzchI3FbljUcWCZCczFaRj2Tdh6SfnlKA';

            this.storage.save(StorageKey.AUTH_TOKEN, this.token);
            return this.redirectUrl;
        } catch (e) {
            return Promise.reject(e.message);
        }
    }

    public getToken(): string {
        return this.token;
    }

    public logout() {

        this.loggedIn.next(false);

        this.token = '';
        this.storage.remove(AUTH_TOKEN);

        this.ngZone.runOutsideAngular(() =>
            BootController.getbootControl().restart(),
        );
    }

    public isLogged() : boolean {
        return false;
    }

    public getOrganisationSocketEndPoint() {
        return this.storage.read('SOCKET_END_POINT');
    }
}
