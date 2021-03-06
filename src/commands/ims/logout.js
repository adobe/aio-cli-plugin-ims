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
const ImsBaseCommand = require('../../ims-base-command')

class LogoutCommand extends ImsBaseCommand {
  async run () {
    const { flags } = this.parse(LogoutCommand)

    const { invalidateToken, context } = require('@adobe/aio-lib-ims')
    try {
      await invalidateToken(flags.ctx, flags.force)
    } catch (err) {
      const stackTrace = err.stack ? '\n' + err.stack : ''
      this.debug(`Logout Failure: ${err.message || err}${stackTrace}`)
      this.error(`Cannot logout context '${flags.ctx || context.getCurrent()}': ${err.message || err}`, { exit: 1 })
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
  ...ImsBaseCommand.flags,
  force: flags.boolean({
    char: 'f', description: `Invalidate the refresh token as well as all access tokens.
Otherwise only the access token is invalidated. For IMS
contexts not supporting refresh tokens, this flag has no
effect.`
  })
}

LogoutCommand.args = [
  ...ImsBaseCommand.args
]

module.exports = LogoutCommand
