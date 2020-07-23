import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AlertService } from 'ngx-alerts';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { TreeviewItem } from 'ngx-treeview';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Database } from './database';


@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public tree: TreeviewItem[] = [];
  private currentUrl;

  constructor(
    private api: ApiService,
    private alert: AlertService,
    private router: Router,
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    })
  }

  getNavigationTree(): Observable<TreeviewItem[]> {
    return new Observable<TreeviewItem[]>((observer) => {
      this.api.getDatabases().subscribe(
        (data: { count, databases}) => {
          let jobs = [];
          data.databases.forEach(database => {
            jobs.push(this.api.getTables(database).pipe(map((data: { count, tables }) => {
              return { database: database, tables: data.tables, count: data.count }
            })))
          })

          forkJoin(jobs).subscribe(results => {
            results.forEach((result: {database, tables, count}) => {
              if (result.count == 0) {
                this.tree.push(new TreeviewItem({
                  text: result.database,
                  value: {
                    type: 'database',
                    count: result.count,
                  }
                }));
              } else {
                let children = [];
                let collapsed = true;
                result.tables.forEach(table => {
                  children.push(new TreeviewItem({
                    text: table,
                    value: {
                      type: 'table',
                      database: result.database
                    }
                  }));
                })
                this.tree.push(new TreeviewItem({
                  text: result.database,
                  value: {
                    type: 'database',
                    count: result.count
                  },
                  children,
                  collapsed
                }));
              }
            })
            observer.next(this.tree);
          }, error => observer.error(error), () => observer.complete());
        }, error => {
          observer.error(error);
          observer.complete();
        })
    });
  }

  getByUrl(url:string) {
    return this.tree.find(i => i.value.url === url);
  }

  addDatabaseIntoTree(database:string) {
    this.tree.push(new TreeviewItem({ text: database, value: { type: 'database' }}))
  }

  deleteDatabaseFromTree(database:string) {
    this.tree.splice(this.tree.findIndex(i => i.text === database), 1);
  }

  getDatabaseNodeFromTree(database:Database): TreeviewItem {
    return this.tree.find(i => i.text === database.name);
  }
}
