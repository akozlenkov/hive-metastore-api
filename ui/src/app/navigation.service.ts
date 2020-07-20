import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AlertService } from 'ngx-alerts';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { TreeviewItem } from 'ngx-treeview';
import { Database } from './database';
import { Router, Event, NavigationEnd} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public tree: TreeviewItem[] = [];
  private url;

  constructor(private api: ApiService, private alert: AlertService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;

        // console.log(this.tree.findIndex(i => {
        //   console.log(i)
        //   i.value.url === event.url
        // }));
      }
    })
  }

  getNavigationTree(): TreeviewItem[] {
    this.api.getDatabases().subscribe(
      (data: { count, databases}) => {
        let obs = [];
        data.databases.forEach(database => {
          obs.push(this.api.getTables(database).pipe(map((data: { count, tables }) => {
            return { database: database, tables: data.tables }
          })))
        })

        forkJoin(obs).subscribe(results => {
          results.forEach(result => {
            if (result['tables'].length !== 0) {
              let children = []
              result['tables'].forEach(table => {
                children.push(new TreeviewItem({ text: table, value: { type: 'table', database: result['database'], active: (this.url === `/databases/${result['database']}/tables/${table}`) }}))
              });
              this.tree.push(new TreeviewItem({ text: result['database'], value: { type: 'database', active: (this.url === `/databases/${result['database']}`) }, children: children, collapsed: true }))
            } else {
              this.tree.push(new TreeviewItem({ text: result['database'], value: { type: 'database', active: (this.url === `/databases/${result['database']}`) }, collapsed: true }))
            }
          })
        });
      })
    return this.tree;
  }

  addDatabaseIntoTree(database:string) {
    this.tree.push(new TreeviewItem({ text: database, value: { type: 'database' }}))
  }

  deleteDatabaseFromTree(database:string) {
    this.tree.splice(this.tree.findIndex(i => i.text === database), 1);
  }
}
