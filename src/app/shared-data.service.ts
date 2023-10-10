import { Injectable } from '@angular/core';
import { Patient } from './models/patient.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private patientSubject: BehaviorSubject<Patient | undefined> = new BehaviorSubject<Patient | undefined>(undefined);

  constructor() { }

  setPatient(patient: Patient): void {
    this.patientSubject.next(patient);
  }

  getPatient(): Observable<Patient | undefined> {
    return this.patientSubject.asObservable();
  }
}
