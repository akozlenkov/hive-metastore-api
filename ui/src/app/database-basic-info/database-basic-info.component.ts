import { Component, OnInit, Input } from '@angular/core';
import { Database } from '../database';

@Component({
  selector: 'app-database-basic-info',
  templateUrl: './database-basic-info.component.html',
  styleUrls: ['./database-basic-info.component.scss']
})
export class DatabaseBasicInfoComponent implements OnInit {
  @Input() data: Database;

  constructor() { }

  ngOnInit(): void {}

}
