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

const ImsBaseCommand = require('../../ims-base-command')
const debug = require('debug')('@adobe/aio-cli-plugin-ims/login');

class LoginCommand extends ImsBaseCommand {

    async run() {
        const { flags } = this.parse(LoginCommand)

        const { getToken, context } = require('@adobe/adobeio-cna-core-ims');
        try {
            const token = await getToken(flags.ctx);
            this.printObject(token);
        } catch (err) {
            const stackTrace = err.stack ? "\n" + err.stack : "";
            this.debug(`Login Failure: ${err.message || err}${stackTrace}`);
            this.error(`Cannot get token for context '${flags.ctx || context.current}': ${err.message || err}`, { exit: 1 });
        }
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

* adobeio-cna-core-ims-jwt for JWT token based login supporting
  Adobe I/O Console service integrations.
* adobeio-cna-core-ims-oauth for browser based OAuth2 login. This
  plugin will launch a Chromium browser to guide through the
  login process. The plugin itself will *never* see the user's
  password but only receive the authorization token after the
  user authenticated with IMS.
`

LoginCommand.flags = {
  ...ImsBaseCommand.flags
}

LoginCommand.args = [
  ...ImsBaseCommand.args
]

module.exports = LoginCommand
