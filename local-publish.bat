
:: 1. build project artifact and deploy to dist/b2c-msal-angular-internationalization/ folder
ng build --localize

:: 2. copy index.html to dist/b2c-msal-angular-internationalization/ folder
copy index.html ./dist/b2c-msal-angular-internationalization/

:: 3. run on local server
serve dist/b2c-msal-angular-internationalization/

