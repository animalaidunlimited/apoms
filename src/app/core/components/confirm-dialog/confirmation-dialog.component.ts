import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


export interface DialogData {
  message: string;
  buttonText: ButtonText;
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

  get vals() {
    return this.message.split('\n');
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private dialogRef: MatDialogRef<ConfirmationDialog>) {
      if(data){
        this.message = data.message || this.message;
        this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
      }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}