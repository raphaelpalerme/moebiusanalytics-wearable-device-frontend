import { Component, OnInit } from '@angular/core';
import { CarePathwayService } from '../service/care-pathway.service';
import { Patient } from '../models/patient.model';
import { SharedDataService } from "../shared-data.service"

@Component({
  selector: 'app-tableau-vfc',
  templateUrl: './tableau-vfc.component.html',
  styleUrls: ['./tableau-vfc.component.css']
})
export class TableauVfcComponent implements OnInit {
  rows: any[] = [];
  patient: Patient | undefined;

  constructor(private carePathService: CarePathwayService,
    private sharedDataService: SharedDataService
    ) {}

  ngOnInit(): void {
    this.sharedDataService.getPatient().subscribe(patient => {
      this.patient = patient;
      if (this.patient?.deviceId) {
        this.carePathService.getHeartRateData(this.patient.deviceId).subscribe(data => {
          console.log("heartRate",data);
          this.rows = data;
        })
      }
    });
  }
}
