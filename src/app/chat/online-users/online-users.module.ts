import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineUsersComponent } from './online-users.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    OnlineUsersComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  exports: [
    OnlineUsersComponent
  ]
})
export class OnlineUsersModule { }
