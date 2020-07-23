import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Table } from '../table';
import {AlertService} from "ngx-alerts";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  public table: Table;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private alertService: AlertService,
    private api: ApiService,
    ){
    this.activateRoute.params.subscribe(params => {
      this.table = null;
      this.api.getTable(params['database'], params['table']).subscribe(
        (table:Table) => this.table = table,
        error => this.alertService.danger(error));
    });
  }

  ngOnInit(): void {}

  onDelete(table) {
    this.router.navigate(['/databases', table.database]);
  }

  onUpdate(table) {
    this.table = table;
    this.router.navigate(['/databases', table.database, 'tables', table.name]);
  }
}
