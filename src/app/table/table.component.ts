import { Component, OnInit } from '@angular/core';
import { CarePathwayService } from '../service/care-pathway.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  rows: any[] = [];

  constructor(private carePathService: CarePathwayService, private router: Router) {}

  ngOnInit(): void {
    this.carePathService.getCarePathwayData().subscribe(data => {
      console.log(data);
      this.rows = data;
    })
  }

  onRowClicked(patient: any) {
    this.router.navigate(['/patient', patient.id])
  }
}
