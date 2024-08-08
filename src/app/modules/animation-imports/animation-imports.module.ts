import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const modules = [
  BrowserAnimationsModule,
  BrowserModule,
  MatProgressSpinnerModule
]

@NgModule({
  declarations: [],
  imports: [ modules ],
  exports: [ modules ]
})
export class AnimationImportsModule { }
