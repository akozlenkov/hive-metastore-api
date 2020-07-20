import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'ngx-alerts';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Database } from '../database';
import { NavigationService } from '../navigation.service';
import { forkJoin } from 'rxjs';
import { Table } from "../table";

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit {
  public database: Database;
  public tables: string[];

  constructor(
    private api: ApiService,
    private nav: NavigationService,
    private router: Router,
    private activateRoute: ActivatedRoute)
  {
    this.activateRoute.params.subscribe(params => {
      this.api.getDatabase(params['database']).subscribe((database: Database) => {
        this.database = database;
        this.api.getTables(params['database']).subscribe((result: { count, tables }) => {
          this.tables = result.tables;
        });
      });
    });
  }

  ngOnInit() {}

  onEdit(database) {
    this.database = database;
  }

  onDelete(database) {
    this.nav.deleteDatabaseFromTree(database.name);
    this.router.navigate(['/']);
  }
}
