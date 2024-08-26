import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnouncementsRoutingModule } from './announcements-routing.module';
import { AnnouncementsComponent } from './announcements.component';


@NgModule({
  declarations: [
    AnnouncementsComponent
  ],
  imports: [
    CommonModule,
    AnnouncementsRoutingModule
  ]
})
export class AnnouncementsModule { }
