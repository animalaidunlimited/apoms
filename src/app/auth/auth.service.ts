import { Injectable, NgZone } from '@angular/core';
import { APIService } from '../core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../core/services/storage/storage.service';
import { StorageKey } from '../core/services/storage/storage.model';
import { BootController } from '../../boot-controller';
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
    token: string;
    response!: Response;
    redirectUrl!: string;
    socketEndPoint!: string;

    constructor(
        http: HttpClient,
        private ngZone: NgZone,
        private storage: StorageService,
    ) {
        super(http);
        this.token = this.storage.read(AUTH_TOKEN) || '';
    }

    public async login(username: string, password: string) {
        try {
            this.response = (await this.post({
                username,
                password,
            })) as Response;
            this.token = this.response.token || '';

            if (!this.response.success) {
                throw new Error('Wrong Credentials!');
            }
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
            this.token = 'user';
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
        this.token = '';
        this.storage.remove(AUTH_TOKEN);

        this.ngZone.runOutsideAngular(() =>
            BootController.getbootControl().restart(),
        );
    }

    public isLogged(): boolean {
        return this.token.length > 0;
    }

    public getOrganisationSocketEndPoint() {
        return this.storage.read('SOCKET_END_POINT');
    }
}
