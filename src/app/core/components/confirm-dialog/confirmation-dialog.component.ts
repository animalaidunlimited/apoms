import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


export interface DialogData {
  title: string;
  message: string;
  buttonText: ButtonText;
  icon: string;
}

interface ButtonText {
  ok: string;
  cancel: string;
}



@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
})

export class ConfirmationDialog {

  message = 'Are you sure?';
  confirmButtonText = 'Yes';
  cancelButtonText = 'Cancel';
  title = 'Confirm action';
  icon = 'warn';

  get vals() {
    return this.message.split('\n');
  }

  @HostListener('document:keydown.enter', ['$event'])
  closeConfirmationDialog(event: KeyboardEvent){
    event.preventDefault();
    this.onConfirmClick();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private dialogRef: MatDialogRef<ConfirmationDialog>) {

        if(data){

          this.message = data.message || this.message;
          this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
          this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
          this.title = data.title || this.title;
          this.icon = data.icon || this.icon;
        }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}