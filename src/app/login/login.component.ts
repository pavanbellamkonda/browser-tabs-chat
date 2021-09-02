import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';

  constructor(
    private readonly appService: AppService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
  }

  async submit() {
    if (this.username.length > 0) {
      await this.appService.logInUser(this.username);
      await this.router.navigate(['chat']);
    }
  }

}
