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
const { Ims, ACCESS_TOKEN, REFRESH_TOKEN } = require('@adobe/aio-cli-ims')
const debug = require('debug')('@adobe/aio-cli-plugin-ims/logout');

class LogoutCommand extends BaseImsCommand {
  async run() {
    const { args, flags } = this.parse(LogoutCommand)

    const contextData = this.getContext(args.ctx);
    debug("LogoutCommand:contextData - %O", contextData);

    if (!contextData) {
      this.error(`IMS context '${args.ctx || this.currentContext}' is not configured`, { exit: 1 });
    }

    try {
      const ims = new Ims(contextData.env);
      const tokenLabel = flags.force ? REFRESH_TOKEN : ACCESS_TOKEN;
      await getToken(contextData[tokenLabel])
        .catch(err => {
          if (flags.force) {
            return getToken(contextData[ACCESS_TOKEN]);
          } else {
            this.log(err);
            return Promise.reject(err);
          }
        })
        .then(token => ims.invalidateToken(token, contextData.client_id, contextData.client_secret))
        .then(() => {
          delete contextData[tokenLabel];
          if (flags.force) {
            delete contextData[ACCESS_TOKEN];
          }
          this.setContext(args.ctx, contextData)
        },
          err => debug(err))
    } catch (err) {
      this.error(`Cannot get token for the context: ${err.message}`, { exit: 1 });
    }
  }
}

LogoutCommand.description = `Log out the current or a named IMS context.

This command can be called multiple times on the same IMS context with
out causing any errors. The assumption is that after calling this command
without an error, the IMS context's access and refresh tokens have been
invalidated and removed from persistence storage. Repeatedly calling this
command will just do nothing.
`

LogoutCommand.flags = {
  ...BaseImsCommand.flags,
  force: flags.boolean({
    char: 'f', description: `Invalidate the refresh token as well as all access tokens.
Otherwise only the access token is invalidated. For IMS
contexts not supporting refresh tokens, this flag has no
effect.` })
}

LogoutCommand.args = [
  ...BaseImsCommand.args
]

module.exports = LogoutCommand
