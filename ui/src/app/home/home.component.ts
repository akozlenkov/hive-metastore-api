import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../navigation.service';
import { AlertService } from 'ngx-alerts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public items;
  public filterText;
  public config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 500
  }
  public selectedItem;
  public eventEmitter = new EventEmitter();



  constructor(
    private auth: AuthService,
    private api: ApiService,
    private nav: NavigationService,
    private router: Router
  ){
    this.items = this.nav.getNavigationTree();
  }

  ngOnInit(): void {

  }

  logout() {
    this.router.navigate(['/login']);
    this.auth.logout();
  }

  onSelectedChange(item) {
    this.selectedItem = item
    switch (item.value.type) {
      case "table":
        this.router.navigate(['databases', item.value.database, 'tables', item.text]);
        break
      case "database":
        this.router.navigate(['/databases', item.text])
        break
    }
  }

  onFilterChanged(event) {
    this.eventEmitter.emit(event);
  }

  onDatabaseCreated(database) {
    this.nav.addDatabaseIntoTree(database.name);
    this.router.navigate(['/databases', database.name])
  }
}
