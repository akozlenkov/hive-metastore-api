import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Database} from "../database";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-create-table',
  templateUrl: './create-table.component.html',
  styleUrls: ['./create-table.component.scss']
})
export class CreateTableComponent implements OnInit {
  private _data = new BehaviorSubject<Database>(null);
  private _database: Database;

  @Input() set database(value) {
    this._data.next(value);
  };

  get database() {
    return this._data.getValue();
  }

  constructor(
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this._data.subscribe(database => {
      this._database = database;
    })
  }

  createTable(content) {
    this.modalService.open(content, { size: 'xl', ariaLabelledBy: 'create-table-title', centered: true}).result.then((result) => {
    }, (reason) => {
    });
  }
}
