import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    public readonly appService: AppService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    if (!this.appService.username) {
      this.router.navigate(['login']);
    }
  }
}
