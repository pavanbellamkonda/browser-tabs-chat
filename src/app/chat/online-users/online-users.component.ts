import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.css']
})
export class OnlineUsersComponent implements OnInit {

  constructor(
    private readonly appService: AppService,
    private cd: ChangeDetectorRef
  ) { }

  users: any[] = [];
  usersMap = new Map();

  async ngOnInit() {
    this.users = await this.appService.getAllUsers();
    console.log(this.users)
    this.users.forEach(user => {
      this.usersMap.set(user.username, user);
    });
    this.appService.onlineUsersChannel.onmessage = this.onUsersUpdate;
  }

  onUsersUpdate = (event:  MessageEvent) => {
    const { data } = event;
    console.log(data)
    if (data) {
      if (this.usersMap.has(data.username)) {
        this.usersMap.set(data.username, data);
        this.users = Array.from(this.usersMap.values());
      } else {
        this.users = [
          ...this.users,
          data
        ];
        this.usersMap.set(data.username, data);
      }
    }
    this.cd.detectChanges();
  }

  userClicked(user: {username: string, online: boolean}) {
    this.appService.openchat(user);
  }

}
