import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css']
})
export class ChatMessagesComponent implements OnInit {

  chatter: any;
  messages: any[] = [];
  newMessage = '';
  channel!: BroadcastChannel;
  constructor(
    private readonly appService: AppService,
    private readonly cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.appService.chatClicked.subscribe(async user => {
      this.chatter = user;
      this.messages = await this.appService.getChatMessages(user);
      this.cd.detectChanges();
    });
    this.appService.chatMessagesChannel.onmessage = message => {
      if (message.data.receiver === this.appService.username) {
        if (!this.chatter) {
          this.appService.openchat({
            username: message.data.sender,
            online: true
          });
        } else if (this.chatter.username !== message.data.sender) {
          this.appService.openchat({
            username: message.data.sender,
            online: true,
            setActive: false
          });
        } else {
          this.messages = [
            ...this.messages,
            message.data
          ];
          this.cd.detectChanges();
        }
      }
    };
  }

  async send() {
    const newMessage = this.newMessage;
    this.newMessage = '';
    const chatRecord = await this.appService.sendChat(this.chatter, newMessage);
    this.messages.push({
      ...chatRecord,
      fromSelf: true
    });
    this.cd.detectChanges()
    this.appService.chatMessagesChannel.postMessage(chatRecord);
  }

}
