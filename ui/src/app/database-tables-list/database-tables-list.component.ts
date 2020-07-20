import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import {BehaviorSubject, forkJoin} from 'rxjs';
import { Database } from '../database';

@Component({
  selector: 'app-database-tables-list',
  templateUrl: './database-tables-list.component.html',
  styleUrls: ['./database-tables-list.component.scss']
})
export class DatabaseTablesListComponent implements OnInit {
  private _data = new BehaviorSubject<Database>(null);

  public database;
  public pages;
  public currentPage = 0;
  private tables;
  public currentTables;

  @Input() set data(value) {
    this._data.next(value);
  };

  get data() {
    return this._data.getValue();
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this._data.subscribe(database => {
      this.database = database;

      this.api.getTables(database.name).subscribe((resp:{ count, tables }) => {
        this.tables = resp.tables;
        if (resp.count == 0) {
          this.currentTables = [];
        } else {
          let i = Math.floor(resp.count/10);
          if ((i*10) == resp.count) {
            this.pages = i;
          } else {
            this.pages = i+1;
          }
          this.selectPage();
        }
      });
    });
  }

  selectPage() {
    this.currentTables = null;
    let obs = [];
    this.tables.slice((this.currentPage * 10), (this.currentPage * 10 + 10)).forEach(table => {
      obs.push(this.api.getTable(this.database.name, table))
    })
    forkJoin(obs).subscribe(tables => this.currentTables = tables);
  }
}
