import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { AlertService } from 'ngx-alerts';
import { Database } from '../database';
import { NavigationService } from '../navigation.service';


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
    private alertService: AlertService,
    private router: Router,
    private activateRoute: ActivatedRoute)
  {
    this.activateRoute.params.subscribe(params => {
      this.api.getDatabase(params['database']).subscribe((database: Database) => {
        this.database = database;
        this.api.getTables(params['database']).subscribe((result: { count, tables }) => {
          this.tables = result.tables;
        });
      }, error => this.alertService.danger(error));
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

  tableCreated(table) {
    this.router.navigate(['/databases', table.database, 'tables', table.name]);
  }
}
