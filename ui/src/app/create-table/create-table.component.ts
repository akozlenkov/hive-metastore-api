import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Database} from "../database";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../api.service";
import {AlertService} from "ngx-alerts";
import {Table} from "../table";

@Component({
  selector: 'app-create-table',
  templateUrl: './create-table.component.html',
  styleUrls: ['./create-table.component.scss']
})
export class CreateTableComponent implements OnInit {
  private _data = new BehaviorSubject<Database>(null);
  private _database: Database;

  public loading:boolean = false;
  public submitted:boolean = false;
  public formGroup: FormGroup;

  @Output() tableCreated = new EventEmitter<Table>();

  @Input() set database(value) {
    this._data.next(value);
  };

  get database() {
    return this._data.getValue();
  }

  constructor(
    private api: ApiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this._data.subscribe(database => {
      this._database = database;
      this.resetForm();
    })
  }

  get f() { return this.formGroup.controls; }
  get parameters() { return this.f.parameters as FormArray; }
  get storageParameters() { return this.f.storageParameters as FormArray; }
  get serializationParameters() { return this.f.serializationParameters as FormArray; }
  get columns() { return this.f.columns as FormArray; }
  get partitionKeys() { return this.f.partitionKeys as FormArray; }

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

  createTable(content) {
    this.modalService.open(content, { size: 'xl', ariaLabelledBy: 'modal-basic-title', centered: true}).result.then((result) => {
    }, (reason) => {
    });
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
      partitionKeys: this.f.partitionKeys.value,
      parameters: this.paramsToObject(this.f.parameters.value)
    }


    this.api.createTable(this.database.name, table).subscribe(
      (table:Table) => {
        this.loading = false;
        this.submitted = false;
        this.tableCreated.emit(table);
        modal.close();
        this.resetForm();
      },
      (error) => {
        this.loading = false;
        this.submitted = false;
        this.alertService.danger(error);
      });
  }

  cancelCreation(modal) {
    modal.close();
    this.submitted = false;
    this.loading = false;
    this.resetForm();
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
      partitionKeys: new FormArray([]),
      parameters: new FormArray([]),
    });
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
