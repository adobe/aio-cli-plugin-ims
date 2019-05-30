/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { flags } = require('@oclif/command')
const BaseImsCommand = require('../../base-ims-command')
const { getToken } = require('../../token-utils')
const { Ims } = require('@adobe/aio-cli-ims')
const debug = require('debug')('@adobe/aio-cli-plugin-ims/login');

class LoginCommand extends BaseImsCommand {
  async run() {
    const { args, flags } = this.parse(LoginCommand)

    const contextData = this.getContext(args.ctx);
    debug("LoginCommand:contextData - %O", contextData);

    if (!contextData) {
      this.error(`IMS context '${args.ctx || this.currentContext}' is not configured`, { exit: 1});
    }

    try {
      const token = await this._getOrCreateToken(contextData)
          .then(result => this._persistTokens(args.ctx, contextData, result));
      this.printObject(token);
    } catch (err) {
      this.error(`Cannot get token for context '${args.ctx || this.currentContext}': ${err.message}`, { exit: 1 });
      this.debug(err.stack);
    }
  }

  async _getOrCreateToken(config) {
    const ims = new Ims(config.env);
    return getToken(config.access_token).
        catch(() => this._fromRefreshToken(ims, config.refresh_token, config)).
        catch(reason => this._generateToken(ims, config, reason));
  }

  async _fromRefreshToken(ims, token, config) {
    return getToken(token).
      then(refreshToken => ims.getAccessToken(refreshToken, config.client_id, config.client_secret, config.scope));
  }

  async _generateToken(ims, config, reason) {
    debug("generateToken(reason=%s)", reason);
    // await(hooks)

    const imsLoginPlugins = this.config.plugins.filter(v => v.pjson.keywords.includes("ims-login")).map(v => v.root)
    debug("  > ims-login plugins: %o", imsLoginPlugins);

    for (const imsLoginPlugin of imsLoginPlugins) {
      debug("  > Trying: %s", imsLoginPlugin);
      const {supports, imsLogin } = require(imsLoginPlugin);
      if (supports(config)) {
        return imsLogin(ims, config);
      }
    }

    throw new Error("Token Creation not implemented yet")
  }

  /**
   * If the result is an object containing an access and refresh token,
   * the tokens are persisted back into the IMS context and the promise
   * resolves to the access token. If the result is a string, it is
   * assumed to be a valid access token to which the promise resolves.
   *
   * @param {string | any} result
   */
  async _persistTokens(context, contextData, result) {
    debug("persistTokens(%s, %o, %o)", context, contextData, result);
    if (typeof(result) === 'string') {
      return result;
    }

    return getToken(result.access_token)
      .then(() => contextData.access_token = result.access_token)
      .then(() => getToken(result.refresh_token))
      .then(
        () => contextData.refresh_token = result.refresh_token,
        () => true)
      .then(() => this.setContext(context, contextData))
      .then(() => result.access_token.token)
  }
}

LoginCommand.description = `Log in with a certain IMS context and returns the access token.

If the IMS context already has a valid access token set (valid meaning
at least 10 minutes before expiry), that token is returned.

Otherwise, if the IMS context has a valid refresh token set (valid
meaning at least 10 minutes before expiry) that refresh token is
exchanged for an access token before returning the access token.

Lastly, if the IMS context properties are supported by one of the
IMS login plugins, that login plugin is called to guide through
the IMS login process.

The currently supported IMS login plugins are:

* aio-cli-plugin-ims-jwt for JWT token based login supporting
  Adobe I/O Console service integrations.
* aio-cli-plugin-ims-oauth for browser based OAuth2 login. This
  plugin will launch a Chromium browser to guide through the
  login process. The plugin itself will *never* see the user's
  password but only receive the authorization token after the
  user authenticated with IMS.
`

LoginCommand.flags = {
  ...BaseImsCommand.flags
}

LoginCommand.args = [
  ...BaseImsCommand.args
]

module.exports = LoginCommand
