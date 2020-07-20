import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Database} from "../database";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NavigationService} from "../navigation.service";
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {AlertService} from "ngx-alerts";

@Component({
  selector: 'app-delete-database',
  templateUrl: './delete-database.component.html',
  styleUrls: ['./delete-database.component.scss']
})
export class DeleteDatabaseComponent implements OnInit {
  private _data = new BehaviorSubject<Database>(null);
  private _database: Database;

  public submitted: boolean = false;

  @Input() set database(value) {
    this._data.next(value);
  };

  @Output() databaseDeleted = new EventEmitter<Database>();

  get database() {
    return this._data.getValue();
  }

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this._data.subscribe(database => {
      this._database = database;
    })
  }

  deleteDatabase(content) {
    this.modalService.open(content, { size: 'sm', ariaLabelledBy: 'delete-database-title', backdrop: 'static', keyboard: false, centered: true }).result.then((result) => {
      if (result) {
        this.submitted = true;
        this.api.deleteDatabase(this._database.name).subscribe(
          data => {
            this.submitted = false;
            this.databaseDeleted.emit(this._database);
          },
          error => {
            this.submitted = false;
            this.alertService.danger(error);
          }
        )
      }
    });
  }
}
