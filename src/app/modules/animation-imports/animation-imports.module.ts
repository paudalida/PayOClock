import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

const modules = [
  BrowserAnimationsModule,
  BrowserModule
]

@NgModule({
  declarations: [],
  imports: [ modules ],
  exports: [ modules ]
})
export class AnimationImportsModule { }
