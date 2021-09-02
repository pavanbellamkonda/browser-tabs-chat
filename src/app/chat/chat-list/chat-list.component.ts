import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  chats: any[] = [];
  activeChatter = '';
  constructor(
    private readonly appService: AppService,
    private readonly cd: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.chats = await this.appService.getUserChats();
    console.log(this.chats, '<--')
    this.appService.userToChat.subscribe(user => {
      const chat = this.chats.find(c => c.chatter === user.username);
      if (!chat) {
        this.chats = [
          ...this.chats,
          {
            chatter: user.username
          }
        ];
      }
      if (user.setActive) {
        this.activeChatter = user.username;
        this.appService.chatClicked.next(user);
      }

      this.cd.detectChanges();
    });
  }

  chatClicked(chat: any) {
    this.activeChatter = chat.chatter;
    this.appService.chatClicked.next({
      username: chat.chatter,
      online: chat.online
    });
    this.cd.detectChanges();

  }

}
