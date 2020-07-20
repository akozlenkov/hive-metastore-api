import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Database} from "../database";
import {ApiService} from "../api.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AlertService} from "ngx-alerts";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-create-database',
  templateUrl: './create-database.component.html',
  styleUrls: ['./create-database.component.scss']
})
export class CreateDatabaseComponent implements OnInit {
  public loading:boolean = false;
  public submitted:boolean = false;
  public formGroup: FormGroup;

  @Output() databaseCreated = new EventEmitter<Database>();

  constructor(
    private api: ApiService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.resetForm();
  }

  get f() { return this.formGroup.controls; }
  get t() { return this.f.parameters as FormArray; }

  openModal(content) {
    this.modalService.open(content, { size: 'xl', ariaLabelledBy: 'modal-basic-title', centered: true}).result.then((result) => {
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

  createDatabase(modal) {
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

    this.api.createDatabase({
      name: this.f.name.value,
      location: this.f.location.value,
      description: this.f.description.value,
      owner: this.f.owner.value,
      ownerType: this.f.ownerType.value,
      parameters
    }).subscribe(
      (data) => {
        this.api.getDatabase(this.f.name.value).subscribe((database:Database) => {
          this.loading = false;
          this.submitted = false;
          this.databaseCreated.emit(database)
          modal.close();
          this.resetForm();
        });
      },
      error => {
        this.loading = false;
        this.submitted = false;
        this.alertService.danger(error);
      }
    )
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
      location: ['', null],
      description: ['', null],
      owner: ['', null],
      ownerType: ['',null],
      parameters: new FormArray([])
    });
  }
}
