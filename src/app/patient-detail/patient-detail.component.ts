import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '../models/patient.model';
import { CarePathwayService } from '../service/care-pathway.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { SharedDataService } from "../shared-data.service"

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  patientId: string | null = null;
  selectedMenu: string = 'patient';
  selectedSubTab: string = 'data';
  patient: Patient | undefined; 
  
  constructor(private route: ActivatedRoute, 
    private carePathwayService: CarePathwayService, 
    public dialog: MatDialog,
    private sharedDataService: SharedDataService
    ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      const id = +this.patientId;
      this.carePathwayService.getPatientDetails(id).subscribe({
        next:  (patientData) => {
          console.log(patientData);
          this.patient = patientData;
          this.sharedDataService.setPatient(patientData);
        },
        error :  (error) => {
          console.error('Error fetching patient details:', error)
        }
      });
    }
  }

  associerMontre() {
    console.log(this.patient?.carePathwayId)
    // Votre logique pour associer une montre
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width:'300px',
      data: { carePathwayId: this.patient?.carePathwayId }
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);
    });
  }

  dissocierMontre() {
    console.log(this.patient?.carePathwayId)
    if(this.patient?.carePathwayId) {
      this.carePathwayService.resetDevice(this.patient.carePathwayId).subscribe({
        next:  (response) => {
          console.log(response);
        },
        error :  (error) => {
          console.error('Error: ', error)
        }
      })
    }
  }
}
