import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Database} from "../database";
import {FormArray, FormBuilder, FormGroup, NgModel, Validators} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TreeviewItem} from "ngx-treeview";
import {ApiService} from "../api.service";
import {AlertService} from "ngx-alerts";

@Component({
  selector: 'app-edit-database',
  templateUrl: './edit-database.component.html',
  styleUrls: ['./edit-database.component.scss']
})
export class EditDatabaseComponent implements OnInit {
  private _data = new BehaviorSubject<Database>(null);
  private _database: Database;

  public loading: boolean = false;
  public submitted: boolean = false;
  public formGroup: FormGroup;

  @Input() set database(value) {
    this._data.next(value);
  };

  @Output() databaseSaved = new EventEmitter<Database>();

  get database() {
    return this._data.getValue();
  }

  constructor(
    private api: ApiService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this._data.subscribe(database => {
      this._database = database;
      this.resetForm();
      this.setupForm();
    })
  }

  get f() { return this.formGroup.controls; }
  get t() { return this.f.parameters as FormArray; }

  editDatabase(content) {
    this.modalService.open(content, { size: 'xl', ariaLabelledBy: 'edit-database-title', centered: true}).result.then((result) => {
    }, (reason) => {
    });
  }

  addParameter() {
    this.t.push(this.formBuilder.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  deleteParameter(index) {
    this.t.removeAt(index);
  }

  private resetForm() {
    this.formGroup = this.formBuilder.group({
      owner: ['', null],
      ownerType: ['',null],
      parameters: new FormArray([])
    });
  }

  private setupForm() {
    this.formGroup.setValue({
      owner: this._database.owner,
      ownerType: this._database.ownerType,
      parameters: [] });

    if (this._database.parameters != undefined) {
      for (const [key, value] of Object.entries(this._database.parameters)) {
        let form = this.formBuilder.group({
          key: ['', Validators.required],
          value: ['', Validators.required]
        });
        form.setValue({ key, value })
        this.t.push(form);
      }
    }
  }

  cancelEdit(modal) {
    modal.close();
    this.resetForm();
    this.setupForm();
  }

  saveDatabase(modal) {
    this.submitted = true;

    if (this.formGroup.invalid) {
      return;
    }

    this.loading = true;

    let parameters = {};
    if (this.f.parameters.value.length !== 0) {
      this.f.parameters.value.forEach(item => {
        parameters[item.key] = item.value;
      })
    }

    this.api.updateDatabase(this._database.name, {
      owner: this.f.owner.value,
      ownerType: this.f.ownerType.value,
      parameters
    }).subscribe(data => {
      this.api.getDatabase(this._database.name).subscribe((database: Database) => {
        this._database = database;
        this.loading = false;
        this.submitted = false;
        modal.close();
        this.databaseSaved.emit(database);
      })
    }, error => this.alertService.danger(error));
  }
}
