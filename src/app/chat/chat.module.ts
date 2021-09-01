import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ChatListModule } from './chat-list/chat-list.module';
import { ChatMessagesModule } from './chat-messages/chat-messages.module';
import { OnlineUsersModule } from './online-users/online-users.module';


@NgModule({
  declarations: [
    ChatComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    ChatListModule,
    ChatMessagesModule,
    OnlineUsersModule
  ]
})
export class ChatModule { }
