# Blockpass SdkWeb

## Structure

This packages contains:

-   ES6 source code `src/`
-   Transpiler for node (below 6) `dist/node`
-   Transpiler for web-browser `dist/browser`

## Getting started (browser)

1.  Add blockpass-web package via `<script>` tag

```html
<script src="https://cdn.blockpass.org/sdk/v2.0.1/blockpass.dev.js"></script>
```

2.  Init SDK

```javascript
/*
Blockpass Clientid
*/
const clientId = "...";

/*
Blockpass Environments:
  - staging: Our testing enviroment (Blockpass partner and tester)
  - prod: Live enviroment of Blockpass
*/
const env = "staging|prod";

/*
Reference Id: Your generated code. Which use to match KycRecord with your userId
*/
const refId = "";

sdk = new window.Blockpass.WebSDK({
  clientId,
  env,
  refreshRateMs: 1000
});
```

3.  Subscribe to SDK events

```javascript
function onBlockpassCodeRefresh(params) {
  // session code ready to use now

  // demo qrcode images ( using demo online qrserver ).
  // DON'T USE THIS FOR YOUR SERVICE
  document.getElementById(
    "step1-qr"
  ).src = `http://api.qrserver.com/v1/create-qr-code/?data=${JSON.stringify({
    clientId: "...",
    session: params.session,
    refId
  })}`;
}

function onBlockpassProcessing(params) {
  // session code invalid from now
  // Show loading indicator
}

function onBlockpassSSoResult(params) {
  // sso complete. handle your logic here
}

function onBlockpassSessionExpired() {
  // session code expired.
  // Note: You can reset new code via
  //    sdk.generateSSOData()
  //
}

// Setup events handler
sdk.on("code-refresh", onBlockpassCodeRefresh);
sdk.on("sso-processing", onBlockpassProcessing);
sdk.on("sso-complete", onBlockpassSSoResult);
sdk.on("code-expired", onBlockpassSessionExpired);

// request for new sso code
sdk.generateSSOData();
```

## Development Instalation

```sh
$ yarn install
```

## Development Commands

```sh
$ npm test # run tests with Jest
$ npm run coverage # run tests with coverage and open it on browser
$ npm run lint # lint code
$ npm run docs # generate docs
$ npm run build # generate docs and transpile code
$ npm run watch # watch code changes and run scripts automatically
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [WebSDK](#websdk)
    -   [generateSSOData](#generatessodata)
    -   [destroy](#destroy)
    -   [getApplink](#getapplink)
-   [ConstructorParams](#constructorparams)
-   [WebSDK#code-refresh](#websdkcode-refresh)
-   [WebSDK#sso-processing](#websdksso-processing)
-   [WebSDK#sso-complete](#websdksso-complete)
-   [WebSDK#code-expired](#websdkcode-expired)

### WebSDK

**Extends EventEmitter**

Blockpass WebSDK

**Parameters**

-   `configData` **...[ConstructorParams](#constructorparams)** 

#### generateSSOData

Generate new SSO code and monitor status

#### destroy

Deconstructor

#### getApplink

Generate appLink string
Example: blockpass-local://service-register/3rd_service_demo?session=c33ab4f2-c208-4cc0-9adf-e49cccff6d2c

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?>** 

### 

* * *

### ConstructorParams

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `env` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Deployment env (local|staging|prod).
-   `clientId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Blockpass ClientId (obtain when register with Blockpass platform).

### WebSDK#code-refresh

Generated session code, can only be used once. Life cycles (created -> processing -> success|failed)
Client must refresh code after sso failed / timeout

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `session` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** sessionID

### WebSDK#sso-processing

Session code switch to processing

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `status` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** status of session code

### WebSDK#sso-complete

Session code switch to processing

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `status` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** status of session code (success|failed)
-   `customData` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** customData
    -   `customData.sessionData` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** session code
    -   `customData.extraData` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Services' extra data

### WebSDK#code-expired

Session code expired

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

## License

ApacheV2
