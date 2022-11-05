import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentComponent } from './comment.component';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { MentionModule } from 'angular-mentions';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    MentionModule,
    SharedPipesModule
  ],
  declarations: [CommentComponent],
  exports: [CommentComponent]
})
export class CommentModule { }
