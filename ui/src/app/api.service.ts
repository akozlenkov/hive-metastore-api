import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getDatabases() {
    return this.http.get('/api/v1/databases');
  }

  getDatabase(database) {
    return this.http.get(`/api/v1/databases/${database}`);
  }

  createDatabase(payload) {
    return this.http.post(`/api/v1/databases`, payload);
  }

  updateDatabase(database, payload) {
    return this.http.patch(`/api/v1/databases/${database}`, payload);
  }

  deleteDatabase(database) {
    return this.http.delete(`/api/v1/databases/${database}`);
  }

  getTables(database) {
    return this.http.get(`/api/v1/databases/${database}/tables`);
  }

  getTable(database, table) {
    return this.http.get(`/api/v1/databases/${database}/tables/${table}`);
  }
}
