import { Component, OnInit } from '@angular/core';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { HighlightSpanKind } from 'typescript';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
    constructor(
        private snackbarService: SnackbarService
    ) {}

    ngOnInit() {}

    clickCounter = 1;

    wearSunscreen = [
        "Wear sunscreen. If I could offer you only one tip for the future, sunscreen would be it. The long term benefits of sunscreen have been proved by scientists whereas the rest of my advice has no basis more reliable than my own meandering experience. I will dispense this advice now",
"Enjoy the power and beauty of your youth; or never mind. You will not understand the power and beauty of your youth until they have faded. But trust me, in 20 years you'll look back at photos of yourself and recall in a way you can't grasp now how much possibility lay before you and how fabulous you really looked. You are not as fat as you imagine",
"Don't worry about the future; or worry, but know that worrying is as effective as trying to solve an algebra equation by chewing Bubblegum. The real troubles in your life are apt to be things that Never crossed your worried mind; the kind that blindside you at 4 PM on some idle Tuesday",
"Do one thing every day that scares you",
"Sing",
"Don't be reckless with other people's hearts; don't put up with people who are reckless with yours",
"Floss",
"Don't waste your time on jealousy; sometimes you're ahead, sometimes you're behind. The race is long, and in the end, it's only with yourself",
"Remember the compliments you receive; forget the insults. If you succeed in doing this, tell me how",
"Keep your old love letters. Throw away your old bank statements",
"Stretch",
"Don't feel guilty if you don't know what you want to do with your life. The most interesting people I know didn't know at 22 what they wanted to do with their lives. Some of the most interesting 40-year-olds I know still don't",
"Get plenty of calcium",
"Be kind to your knees, you'll miss them when they're gone",
"Maybe you'll marry, maybe you won't",
"Maybe you'll have children, maybe you won't",
"Maybe you'll divorce at 40",
"Maybe you'll dance the funky chicken on your 75th wedding anniversary",
"Whatever you do, don't congratulate yourself too much, or berate yourself either. Your choices are half chance; so are everybody else's",
"Enjoy your body. Use it every way you can. Don't be afraid of it, or what other people think of it. It's the greatest instrument you'll ever own",
"Dance, even if you have nowhere to do it but in your own living room",
"Read the directions, even if you don't follow them",
"Do not read beauty magazines; they will only make you feel ugly",
    ]

    registerClick($event: Event){

        let rand = Math.round(Math.random() * 23);

        if(this.clickCounter % 7 === 0){
            this.snackbarService.successSnackBar(this.wearSunscreen[rand], 'Thank you :-)');
        }

        this.clickCounter++;


    }
}
