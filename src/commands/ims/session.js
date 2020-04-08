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

const ImsCommandCommand = require('../../ims-command-command')
const { URL } = require('url')

class SessionCommand extends ImsCommandCommand {
  async _getSessionLink () {
    const { getTokenData, getToken } = require('@adobe/aio-lib-ims')
    const { flags } = this.parse(this.constructor)

    return getToken(flags.ctx)
      .then(token => getTokenData(token))
      .then(tokenData => JSON.parse(tokenData.state))
    //            .then(state => { this.log("state: %s", state); return JSON.parse(state.session) } )
      .then(state => { this.log('state: %o', state); return new URL(state.session) })
      .then(sessionUrl => { this.log('sessionUrl: %o', sessionUrl); return sessionUrl.pathname })
  }

  async getApi () {
    this.debug('get::api()')
    if (!this._api) {
      this._api = await this._getSessionLink()
    }

    this.log('api: %s', this._api)
    return this._api
  }
}

SessionCommand.description = `Retrieve the IMS Profile (for a user token)
${ImsCommandCommand.description}
`

SessionCommand.flags = {
  ...ImsCommandCommand.flags
}

SessionCommand.args = [
  ...ImsCommandCommand.args
]

module.exports = SessionCommand
