import { NgModule, isDevMode } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

/* Routing imports */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
// import { EmployeeComponent as EmployeeLoginComponent } from './components/login/employee/employee.component';
// import { AdminComponent as AdminLoginComponent } from './components/login/admin/admin.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';

/* Modules imports */
import { CommonImportsModule } from './modules/common-imports/common-imports.module';
import { AnimationImportsModule } from './modules/animation-imports/animation-imports.module';
import { FormsImportsModule } from './modules/forms-imports/forms-imports.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatProgressSpinner } from '@angular/material/progress-spinner';


/* Landing Page imports */ 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { MatDialogModule } from '@angular/material/dialog';
import { ServiceWorkerModule } from '@angular/service-worker';

import { HttpClientModule } from '@angular/common/http';
import { TermsAndConditionsComponent } from './components/login/terms-and-conditions/terms-and-conditions.component';
// import { TermsConditionsComponent } from './components/login/employee/terms-conditions/terms-conditions.component';
import { LoginComponent } from './components/login/login.component';
import { PrivacyPolicyComponent } from './components/login/privacy-policy/privacy-policy.component';
import { httpInterceptor } from './http.interceptor';
// import { ActivitylogsComponent } from './main/admin/components/activitylogs/activitylogs.component';

import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    // EmployeeLoginComponent,
    // AdminLoginComponent,
    NotFoundComponent,
    TermsAndConditionsComponent, 
    // TermsConditionsComponent, 
    LoginComponent,
    PrivacyPolicyComponent,
    // ActivitylogsComponent

  ],
  imports: [
    AppRoutingModule,

    /* Other Modules */
    AnimationImportsModule,
    CommonImportsModule,
    FormsImportsModule,
    SweetAlert2Module.forRoot(),
    MatProgressSpinner,

    /* Landing imports */ 
    HttpClientModule, // Sa ano Visitor Count 
    MatToolbarModule,
    MatIconModule, 
    MatDialogModule, ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
})
    
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(), 
      withInterceptors([httpInterceptor])
    ), 
    DatePipe
  ],
  bootstrap: [AppComponent], 
})
export class AppModule { }
