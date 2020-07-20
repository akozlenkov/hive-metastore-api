import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  public table;

  constructor(private activateRoute: ActivatedRoute, private api: ApiService) {
    this.activateRoute.params.subscribe(params => {
      this.table = null;
      this.api.getTable(params['database'], params['table']).subscribe(data => this.table = data);
    });
  }

  ngOnInit(): void {
  }

}
