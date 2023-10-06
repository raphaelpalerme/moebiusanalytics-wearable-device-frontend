import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CarePathwayService } from '../service/care-pathway.service';

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css']
})
export class DialogContentComponent {
  deviceId: string = '';
  public errorMessage: string | null = null;

  constructor(private carePathwayService: CarePathwayService, 
    public dialogRef: MatDialogRef<DialogContentComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any ) {

    }

  annuler(): void {
    this.dialogRef.close();
  }


  valider(): void {
    // Code pour valider le deviceId
    console.log(this.data.carePathwayId)
    console.log(this.deviceId)
    if(this.data.carePathwayId && this.deviceId) {
      this.carePathwayService.updateDevice(this.deviceId, this.data.carePathwayId).subscribe({
        next: (response) => {
          console.log(response);
          this.dialogRef.close({success: true, deviceId: this.deviceId});
        },
        error: (error) => {
          console.error('Error updating device:', error);
          this.errorMessage = "L'ID rentré n'est pas valide.";
        }
      })
    }
  }
}
