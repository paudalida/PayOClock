import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnouncementsRoutingModule } from './announcements-routing.module';
import { AnnouncementsComponent } from './announcements.component';
import { EditAnnouncementComponent } from '../dialogs/edit-announcement/edit-announcement.component';


@NgModule({
  declarations: [
    AnnouncementsComponent,
    EditAnnouncementComponent
  ],
  imports: [
    CommonModule,
    AnnouncementsRoutingModule
  ]
})
export class AnnouncementsModule { }
