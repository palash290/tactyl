import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})

export class CommonService {

  //baseUrl = 'https://13.61.168.187:4000/api/';;
  baseUrl = 'http://192.168.1.44:4009/api/';
  //baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(url: string): Observable<T> {
    const authToken = localStorage.getItem('tactylToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.get<T>(this.baseUrl + url, { headers: headers });
  };

  post<T, U>(url: string, data: U): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, data)
  };

    postAPI(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('austriaAdminToken')
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${authToken}`
    })
    return this.http.post(this.baseUrl + url, data, { headers: headers })
  }

  update<T, U>(url: string, data: U): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, data)
  };

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.baseUrl + url);
  };

  setToken(token: string) {
    localStorage.setItem('tactylToken', token)
  }

  private refreshSidebarSource = new BehaviorSubject<void | null>(null);
  refreshSidebar$ = this.refreshSidebarSource.asObservable();

  triggerRefresh() {
    this.refreshSidebarSource.next(null);
  }


}
