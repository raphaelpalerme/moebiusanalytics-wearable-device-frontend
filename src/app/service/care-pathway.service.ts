import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class CarePathwayService {
  private baseUrl = 'https://moebiusanalyticswearable.azurewebsites.net';
  constructor(private http: HttpClient) { }

  getCarePathwayData(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/api/carepathway/data');
  }

  getPatientDetails(id: number): Observable<Patient> {
    return this.http.get<Patient>(this.baseUrl + `/api/carepathway/data/${id}` )
  }

  updateDevice(deviceId: string, carePathwayId: string): Observable<any> {
    const body = {
      deviceId,
      carePathwayId
    };

    return this.http.post(this.baseUrl + '/api/carepathway/updateDevice', body)
  }

  resetDevice(carePathwayId: string): Observable<any> {
    const body = {
      carePathwayId
    };
    return this.http.put(this.baseUrl + '/api/carepathway/resetDevice', body)
  }

  getHeartRateData(deviceId: string): Observable<any> {
    return this.http.get(this.baseUrl + `/api/heartRate/data/${deviceId}`)
  }

}
