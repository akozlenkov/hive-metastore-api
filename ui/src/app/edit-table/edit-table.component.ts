import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from "../api.service";
import {AlertService} from "ngx-alerts";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {Table} from "../table";

@Component({
  selector: 'app-edit-table',
  templateUrl: './edit-table.component.html',
  styleUrls: ['./edit-table.component.scss']
})
export class EditTableComponent implements OnInit {
  private _data = new BehaviorSubject<Table>(null);
  private _table: Table;

  public loading: boolean = false;
  public submitted: boolean = false;
  public formGroup: FormGroup;

  @Input() set table(value) {
    this._data.next(value);
  };

  @Output() tableUpdated = new EventEmitter<Table>();

  get table() {
    return this._data.getValue();
  }

  constructor(
    private api: ApiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this._data.subscribe(table => {
      this._table = table;
      this.resetForm();
      this.setupForm();
    })
  }

  get f() { return this.formGroup.controls; }
  get tableParameters() { return this.f.parameters as FormArray; }
  get storageParameters() { return this.f.storageParameters as FormArray; }
  get serializationParameters() { return this.f.serializationParameters as FormArray; }
  get columns() { return this.f.columns as FormArray; }

  addColumn(arr) {
    arr.push(this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      comment: ['', null]
    }));
  }

  addParameter(arr) {
    arr.push(this.formBuilder.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  deleteParameter(arr, index) {
    arr.removeAt(index);
  }

  editTable(content) {
    this.modalService.open(content, { size: 'xl', ariaLabelledBy: 'modal-basic-title', centered: true});
  }

  cancelEdit(modal) {
    modal.close();
    this.resetForm();
    this.setupForm();
  }

  saveTable(modal) {
    this.submitted = true;

    if (this.formGroup.invalid) {
      return;
    }

    this.loading = true;

    let table = {
      name: this.f.name.value,
      tableType: this.f.tableType.value,
      owner: this.f.owner.value,
      storageDescriptor: {
        columns: this.f.columns.value,
        location: this.f.location.value,
        inputFormat: this.f.inputFormat.value,
        outputFormat: this.f.outputFormat.value,
        serDeInfo: {
          serializationLib: this.f.serializationLib.value,
          parameters: this.paramsToObject(this.f.serializationParameters.value)
        },
        parameters: this.paramsToObject(this.f.storageParameters.value)
      },
      parameters: this.paramsToObject(this.f.parameters.value)
    };

    this.api.updateTable(this._table.database, this._table.name, table).subscribe(
      (table:Table) => {
        this._table = table;
        this.loading = false;
        this.submitted = false;
        modal.close();
        this.tableUpdated.emit(table)
      },
      (error) => this.alertService.danger(error)
    )
  }

  private resetForm() {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      tableType: ['', Validators.required],
      owner: ['', null],
      columns: new FormArray([]),
      location: ['', null],
      inputFormat: ['', Validators.required],
      outputFormat: ['', Validators.required],
      storageParameters: new FormArray([]),
      serializationLib: ['', Validators.required],
      serializationParameters: new FormArray([]),
      parameters: new FormArray([]),
    });
  }

  private setupForm() {
    this.formGroup.setValue({
      name: this._table.name,
      tableType: this._table.tableType,
      owner: this._table.owner,
      columns: [],
      location: this._table.storageDescriptor.location,
      inputFormat: this._table.storageDescriptor.inputFormat,
      outputFormat: this._table.storageDescriptor.outputFormat,
      storageParameters: [],
      serializationLib: this._table.storageDescriptor.serDeInfo.serializationLib,
      serializationParameters: [],
      parameters: []
    });

    this.columnsToForm(this._table.storageDescriptor.columns, this.columns);
    this.parametersToForm(this._table.storageDescriptor.parameters, this.storageParameters);
    this.parametersToForm(this._table.storageDescriptor.serDeInfo.parameters, this.serializationParameters);
    this.parametersToForm(this._table.parameters, this.tableParameters);
  }

  private columnsToForm(columns, arr) {
    if (columns != undefined) {
      columns.forEach(column => {
        let form = this.formBuilder.group({
          name: ['', Validators.required],
          type: ['', Validators.required],
          comment: ['', null]
        });
        form.setValue({ name: column.name, type: column.type, comment: column.hasOwnProperty('comment') ? column.comment : null })
        arr.push(form);
      })
    }
  }

  private parametersToForm(parameters, arr) {
    if (parameters != undefined) {
      for (const [key, value] of Object.entries(parameters)) {
        let form = this.formBuilder.group({
          key: ['', Validators.required],
          value: ['', Validators.required]
        });
        form.setValue({ key, value })
        arr.push(form);
      }
    }
  }

  private paramsToObject(arr) {
    let parameters = {};
    if (arr != undefined && arr.length != 0) {
      arr.forEach(item => {
        parameters[item.key] = item.value;
      })
    }
    return parameters;
  }
}
