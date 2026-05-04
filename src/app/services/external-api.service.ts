import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExternalApiService {
  private baseUrl = 'https://dniruc.apisperu.com/api/v1';
  private token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InF1aWNhbm9qdW5pb3IwNTdAZ21haWwuY29tIn0.Ucc42kVpqBhBwzkmuxPsbfsDBxrsvTBEyQn_Idd8VAg';

  constructor(private http: HttpClient) {}

  getDni(dni: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/dni/${dni}?token=${this.token}`);
  }

  getRuc(ruc: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ruc/${ruc}?token=${this.token}`);
  }
}
