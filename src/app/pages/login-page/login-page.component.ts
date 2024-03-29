import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    username = '';
    password = '';
    errorMessage = '';
    hide = true;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit() {
        this.errorMessage = '';
        if (this.authService.loggedIn.value) {
            this.navigateTo();
        }
    }

    public async login(username: string, password: string) {

        this.errorMessage = '';

        try {
            const url = (
                await this.authService.login(
                username,
                password,
            )) as string;

            this.navigateTo(url);

        } catch (error:any) {

            console.log(error);

            this.errorMessage =
                error.status === 504
                    ? 'Cannot connect to server'
                    : 'Wrong Credentials!';
        }
    }

    // public async login(username: string, password: string) {
    //     try {
    //         const url = (await this.authService.mockLogin(
    //             username,
    //             password,
    //         )) as string;
    //         this.navigateTo(url);
    //     } catch (e) {
    //         this.errorMessage = 'Wrong Credentials!';
    //         console.error('Unable to Login!\n', e);
    //     }
    // }

    public navigateTo(url?: string) {
        url = url || 'nav';
        this.router.navigate([url], { replaceUrl: true });
    }
}
