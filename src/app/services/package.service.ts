import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Package {
  id: string;
  weeklyDownloads: number;
  dependencyCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  //я проксирую запросы через Angular CLI, чтобы избежать ошибок CORS(proxy.conf.json)
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/packages`);
  }

  getDependencies(packageId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/packages/${packageId}/dependencies`);
  }
}
