import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ApiService} from "../api.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AlertService} from "ngx-alerts";
import {Table} from "../table";

@Component({
  selector: 'app-delete-table',
  templateUrl: './delete-table.component.html',
  styleUrls: ['./delete-table.component.scss']
})
export class DeleteTableComponent implements OnInit {
  private _data = new BehaviorSubject<Table>(null);
  private _table: Table;

  public submitted: boolean = false;

  @Input() set table(value) {
    this._data.next(value);
  };

  @Output() tableDeleted = new EventEmitter<Table>();

  get table() {
    return this._data.getValue();
  }

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this._data.subscribe(table => {
      this._table = table;
    })
  }

  deleteTable(content) {
    this.modalService.open(content, { size: 'sm', ariaLabelledBy: 'delete-database-title', backdrop: 'static', keyboard: false, centered: true }).result.then((result) => {
      if (result) {
        this.submitted = true;
        this.api.deleteTable(this._table).subscribe(
          () => {
            this.submitted = false;
            this.tableDeleted.emit(this._table);
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
