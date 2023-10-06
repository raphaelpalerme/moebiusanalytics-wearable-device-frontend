import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { TableComponent } from './table/table.component';

const routes: Routes = [
  { path: '', redirectTo: '/table', pathMatch: 'full' },
  { path: 'table', component: TableComponent },
  { path: 'patient/:id', component: PatientDetailComponent },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
