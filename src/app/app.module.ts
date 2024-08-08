import { NgModule } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

/* Routing imports */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

/* Modules imports */
import { CommonImportsModule } from './modules/common-imports/common-imports.module';
import { AnimationImportsModule } from './modules/animation-imports/animation-imports.module';
import { FormsImportsModule } from './modules/forms-imports/forms-imports.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    AnimationImportsModule,
    CommonImportsModule,
    FormsImportsModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
