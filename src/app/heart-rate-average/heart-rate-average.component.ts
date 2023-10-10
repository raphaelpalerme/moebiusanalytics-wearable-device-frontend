import { Component, OnInit } from '@angular/core';
import { CarePathwayService } from '../service/care-pathway.service';
import { Patient } from '../models/patient.model';
import { SharedDataService } from "../shared-data.service"

@Component({
  selector: 'app-heart-rate-average',
  templateUrl: './heart-rate-average.component.html',
  styleUrls: ['./heart-rate-average.component.css']
})
export class HeartRateAverageComponent implements OnInit {
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
