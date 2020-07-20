import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { StatisticComponent } from './statistic/statistic.component';
import { DatabaseComponent } from './database/database.component';

import { TableComponent } from './table/table.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard], children: [
      { path: '', component: StatisticComponent },
      { path: 'databases/:database', component: DatabaseComponent },
      { path: 'databases/:database/tables/:table', component: TableComponent },
      //{ path: '', redirectTo: '/databases/default', pathMatch: 'full' }
    ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
