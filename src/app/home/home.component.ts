import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  culture_code: string;
  constructor(private authService: MsalService, 
    private msalBroadcastService: MsalBroadcastService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
      )
      .subscribe((result: EventMessage) => {
        debugger;
        console.log(result);

        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);  
        this.setCulture();
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      })
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  setCulture(){
    this.culture_code = String(this.authService.instance.getActiveAccount()?.idTokenClaims?.culture_code);
    //set cookie
    console.log("culture_code: " + this.culture_code);
    this.cookieService.set('culture_code', this.culture_code);
    //if (this.culture_code === 'en'){

    //}

  }

}
