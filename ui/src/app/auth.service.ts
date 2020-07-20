import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentTokenSubject: BehaviorSubject<string>;
  public currentToken: Observable<string>;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<string>(localStorage.getItem('token'));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentTokeValue(): string {
    return this.currentTokenSubject.value;
  }

  login(username, password) {
    return this.http.post('/auth/token', { username, password })
      .pipe(map(data => {
        localStorage.setItem('token', data['token']);
        this.currentTokenSubject.next(data['token']);
        return data;
      }))
  }

  logout() {
    localStorage.removeItem('token');
    this.currentTokenSubject.next(null);
  }
}
