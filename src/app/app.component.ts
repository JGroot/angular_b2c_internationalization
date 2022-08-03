import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionType, InteractionStatus, PopupRequest, RedirectRequest, AuthenticationResult, AuthError } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { b2cPolicies } from './b2c-config';
import { CookieService } from 'ngx-cookie-service';

interface Payload extends AuthenticationResult {
  idTokenClaims: {
    tfp?: string
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'MSAL Angular B2C & Internationalization';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  selectedCulture: string;
  routing = {
    "en": 'http://localhost:3000/en-US',
    "fr": 'http://localhost:3000/fr-FR'
  };

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private cookieService: CookieService,
  ) { }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.setLoginDisplay();
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {

        let payload: Payload = <AuthenticationResult>result.payload;

        /**
         * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
         * from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy policies may use "acr" instead of "tfp").
         * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
         */
        if (payload.idTokenClaims['tfp'] === b2cPolicies.names.editProfile) {
          window.alert('Profile has been updated successfully. \nPlease sign-in again.');
          return this.logout();
        }

        return result;
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_FAILURE || msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        // Add your auth error handling logic here
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }


  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  login(userFlowRequest?: RedirectRequest | PopupRequest) {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
          });
      } else {
        this.authService.loginPopup(userFlowRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
      } else {
        this.authService.loginRedirect(userFlowRequest);
      }
    }
  }

  logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  editProfile() {
    let editProfileFlowRequest = {
      scopes: ["openid"],
      authority: b2cPolicies.authorities.editProfile.authority,
    };

    this.login(editProfileFlowRequest);
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  onCultureChanged(selectedCulture: string) {
    console.log("onCultureChange() Changing Culture to: " + selectedCulture);
    this.selectedCulture = selectedCulture;

    console.log("onCultureChanged() setting cookie: " + selectedCulture);
    this.cookieService.set('culture_code', selectedCulture, null, '/');

    const url = new URL(document.location.href);
    console.log("onCultureChange() url is: " + url.toString());

    var route = this.routing[selectedCulture];
    if (route != null) {
      console.log('onCultureChanged() RedirectToRoute: will redirect to ' + route);
      var subPath = getSubPath();
      if (subPath) {
        if (!route.endsWith('/')) route += '/';
        route += subPath;
        console.log('onCultureChanged() RedirectToRoute: full url will be ' + route);
      }
      window.location.replace(route);
      return;
    }

    function getSubPath() {
      var url = window.location.href;
      console.log("GetSubPath full url: " + url);
      
      var domainNameIndex = url.indexOf("//");
      var firstSlashIndex = url.indexOf("/", domainNameIndex + 2);
      console.log("getSubPath firstSlashIndex: " + firstSlashIndex);
      console.log("getSubPath firstSlashSubstring: " + url.substring(firstSlashIndex))
       
      var subPath = url.substring(firstSlashIndex + 7); //skip /en-US/
      console.log("Returning subpath from getSubPath: " + subPath);
      return subPath;
    }
  }
}
