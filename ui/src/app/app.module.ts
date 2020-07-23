import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TreeviewModule } from 'ngx-treeview';
import { NgxBootstrapTreeviewModule } from 'ngx-bootstrap-treeview';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-alerts';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor } from './jwt.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DatabaseComponent } from './database/database.component';
import { TableComponent } from './table/table.component';
import { TreeviewSelectComponent } from './treeview-select/treeview-select.component';
import { StatisticComponent } from './statistic/statistic.component';
import { DatabaseBasicInfoComponent } from './database-basic-info/database-basic-info.component';
import { DatabaseTablesListComponent } from './database-tables-list/database-tables-list.component';
import { CreateTableComponent } from './create-table/create-table.component';
import { DeleteDatabaseComponent } from './delete-database/delete-database.component';
import { EditDatabaseComponent } from './edit-database/edit-database.component';
import { CreateDatabaseComponent } from './create-database/create-database.component';
import { DeleteTableComponent } from './delete-table/delete-table.component';
import { EditTableComponent } from './edit-table/edit-table.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    DatabaseComponent,
    TableComponent,
    TreeviewSelectComponent,
    StatisticComponent,
    DatabaseBasicInfoComponent,
    DatabaseTablesListComponent,
    CreateTableComponent,
    DeleteDatabaseComponent,
    EditDatabaseComponent,
    CreateDatabaseComponent,
    DeleteTableComponent,
    EditTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxBootstrapTreeviewModule,
    FontAwesomeModule,
    AlertModule.forRoot({maxMessages: 5, timeout: 5000, position: 'right'}),
    TreeviewModule.forRoot(),
    BrowserAnimationsModule,
    TypeaheadModule.forRoot(),
    NgbModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
