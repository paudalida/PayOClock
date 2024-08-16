import { NgModule } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

/* Routing imports */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { EmployeeComponent as EmployeeLoginComponent } from './components/login/employee/employee.component';
import { AdminComponent as AdminLoginComponent } from './components/login/admin/admin.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';

/* Modules imports */
import { CommonImportsModule } from './modules/common-imports/common-imports.module';
import { AnimationImportsModule } from './modules/animation-imports/animation-imports.module';
import { FormsImportsModule } from './modules/forms-imports/forms-imports.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    EmployeeLoginComponent,
    AdminLoginComponent,
    NotFoundComponent
  ],
  imports: [
    AppRoutingModule,

    /* Other Modules */
    AnimationImportsModule,
    CommonImportsModule,
    FormsImportsModule,
    SweetAlert2Module.forRoot(),
    MatProgressSpinner
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
