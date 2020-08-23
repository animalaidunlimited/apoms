import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
})

export class ConfirmationDialog {
  message: string = "Are you sure?"
  confirmButtonText = "Yes"
  cancelButtonText = "Cancel"
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ConfirmationDialog>) {
      if(data){
    this.message = data.message || this.message;
    if (data.buttonText) {
      this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
      this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
    }
      }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}