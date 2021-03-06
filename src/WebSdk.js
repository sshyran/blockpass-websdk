// @flow
import EventEmitter from "events";

type BlockpassEnv = "local" | "staging" | "prod";

const APPLINK_ENV = {
  local: "blockpass-local",
  staging: "blockpass-staging",
  prod: "blockpass"
};

const DEFAULT_API = {
  local: "http://172.16.0.203:1337",
  dev: "http://172.16.21.165:1337",
  qa: "https://qa-api.blockpass.org",
  staging: "https://sandbox-api.blockpass.org",
  prod: "https://asia-api.blockpass.org"
};

/**
 * Blockpass WebSDK
 */
class WebSDK extends EventEmitter {
  static VERSION = "2.1";

  baseUrl: string;
  clientId: string;
  stopTicket: any;
  env: BlockpassEnv;
  _currentSessionId: string;
  refreshRateMs: number;

  /**
   * Constructor
   * @param {...ConstructorParams} configData
   */
  constructor(configData: {
    baseUrl: string,
    clientId: string,
    refreshRateMs: number,
    env?: BlockpassEnv
  }) {
    super();

    const { baseUrl, clientId, env, refreshRateMs } = configData || {};

    if (!clientId)
      throw new Error("Missing critical config paramaters: clientId");

    this.env = env || "prod";
    this.refreshRateMs = refreshRateMs || 500;
    this.baseUrl = baseUrl || DEFAULT_API[this.env];
    this.clientId = clientId;
  }

  /**
   * Generate new SSO code and monitor status
   * @fire WebSDK#code-refresh
   * @fire WebSDK#sso-processing
   * @fire WebSDK#sso-complete
   */
  async generateSSOData() {
    const { baseUrl, clientId } = this;
    try {
      const response = await WebSDK._fetchAsync(
        `${baseUrl}/api/3rdService/register/session/${clientId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const { data } = response;
      this.emit("code-refresh", data);
      this._currentSessionId = data.session;

      // Start watching for status
      this.stopTicket = this._waitingLoginComplete(this._currentSessionId);

      return response;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Deconstructor
   *
   */
  destroy() {
    if (this.stopTicket) {
      this.stopTicket();
      this.stopTicket = null;
    }
  }

  /**
   * Generate appLink string
   * Example: blockpass-local://service-register/3rd_service_demo?session=c33ab4f2-c208-4cc0-9adf-e49cccff6d2c
   */
  async getApplink(): Promise<?string> {
    return new Promise(async resolve => {
      let applinkString;
      while (true) {
        if (this._currentSessionId) {
          const prefix = APPLINK_ENV[this.env];
          applinkString = `${prefix}://service-register/${
            this.clientId
          }?session=${this._currentSessionId}`;
          break;
        }
        await WebSDK._sleep(this.refreshRateMs / 2);
      }

      resolve(applinkString);
    });
  }

  _waitingLoginComplete(sessionId: string): any {
    if (this.stopTicket) {
      this.stopTicket();
      this.stopTicket = null;
    }

    const self = this;
    const { refreshRateMs } = this;

    function InternalJob() {
      let _isRunning = true;

      this.start = async () => {
        while (_isRunning) {
          const response = await self._refreshSessionTicket(sessionId);

          if (!_isRunning) return;
          if (!response) {
            this.stop();
            self.emit("code-expired");
            break;
          }

          const { data } = response;
          const { status } = data;

          if (status === "success" || status === "failed") {
            self.emit("sso-complete", data);
            break;
          } else if (status === "processing") self.emit("sso-processing", data);

          await WebSDK._sleep(refreshRateMs);
        }
      };

      this.stop = function stop() {
        _isRunning = false;
      };
    }

    const ins = new InternalJob();
    ins.start();

    return ins.stop;
  }

  async _refreshSessionTicket(sessionId: string): any {
    try {
      const { baseUrl } = this;
      const response = await WebSDK._fetchAsync(
        `${baseUrl}/api/3rdService/register/status/${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      return response;
    } catch (ex) {
      console.error(ex);
      return null;
    }
  }

  static async _fetchAsync(url: string, configs: Object): Promise<any> {
    const response = await window.fetch(url, configs);
    if (response.ok) return response.json();
    return null;
  }

  static async _sleep(timeMs: number = 1) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, timeMs);
    });
  }
}

export default WebSDK;

/**
 * ----------------------------------------------------------
 */

/**
 * @typedef {object} ConstructorParams
 * @property {string} env - Deployment env (local|staging|prod).
 * @property {string} clientId - Blockpass ClientId (obtain when register with Blockpass platform). 
 
 */

/**
 * Generated session code, can only be used once. Life cycles (created -> processing -> success|failed)
 * Client must refresh code after sso failed / timeout
 * @event WebSDK#code-refresh
 * @type {object}
 * @property {string} session - sessionID
 */

/**
 * Session code switch to processing
 * @event WebSDK#sso-processing
 * @type {object}
 * @property {string} status - status of session code
 */

/**
 * Session code switch to processing
 * @event WebSDK#sso-complete
 * @type {object}
 * @property {string} status - status of session code (success|failed)
 * @property {object} customData - customData
 * @property {string} customData.sessionData - session code
 * @property {object} customData.extraData - Services' extra data
 */

/**
 * Session code expired
 * @event WebSDK#code-expired
 * @type {object}
 */
