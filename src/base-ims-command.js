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

const { Command, flags } = require('@oclif/command')
const Config = require('@adobe/aio-cli-config/src/Config')
const hjson = require('hjson')
const yaml = require('js-yaml')
const debug = require('debug')

class BaseImsCommand extends Command {

  async init () {
    const { flags } = this.parse(this.constructor)

    // See https://www.npmjs.com/package/debug for usage in commands
    if (flags.verbose) {
      // verbose just sets the debug filter to everything (*)
      debug.enable('*')
    } else if (flags.debug) {
      debug.enable(flags.debug)
    }
  }

  get cliConfig() {
    if (!this._config) {
      this._config = new Config()
      this._config.reload()
    }
    return this._config
  }

  get contexts() {
    return Object.keys(this.cliConfig.get('$ims')).filter(x => !x.startsWith('$'));
  }

  get currentContext() {
    return this.cliConfig.get('$ims.$current');
  }

  set currentContext(newContext) {
    const { flags } = this.parse(this.constructor);
    this.cliConfig.set('$ims.$current', newContext, !!flags.local);
  }

  getContext(context) {
    if (!context) {
      context = this.currentContext;
    }
    if (context) {
      return this.cliConfig.get(`$ims.${context}`);
    }

    // missing context and no current context
    return undefined;
  }

  async setContext(context, contextData) {
    if (!context) {
      context = this.currentContext;
    }
    if (context) {
      const { flags } = this.parse(this.constructor);
      return this.cliConfig.set(`$ims.${context}`, contextData, !!flags.local);
    }

    Promise.reject("Missing IMS context label to set context data for");
  }

  printObject(obj) {
    const { flags } = this.parse(this.constructor)

    let format = 'hjson'
    if (flags.yaml) format = 'yaml'
    else if (flags.json) format = 'json'

    const print = (obj) => {
      if (format === 'json') {
        this.log(JSON.stringify(obj))
      } else if (format === 'yaml') {
        this.log(yaml.safeDump(obj, { sortKeys: true, lineWidth: 1024, noCompatMode: true }))
      } else {
        if (typeof obj !== 'object') {
          this.log(obj)
        } else if (Object.keys(obj).length !== 0) {
          this.log(hjson.stringify(obj, {
            condense: true,
            emitRootBraces: true,
            separator: true,
            bracesSameLine: true,
            multiline: 'off',
            colors: false }))
        }
      }
    }

    if (obj != null) {
      print(obj)
    }
  }
}

BaseImsCommand.flags = {
  debug: flags.string({ description: 'Debug level output' }),
  verbose: flags.boolean({ char: 'v', description: 'Verbose output' }),
  local: flags.boolean({ char: 'l', description: 'local config', exclusive: ['global'] }),
  global: flags.boolean({ char: 'g', description: 'global config', exclusive: ['local'] }),
  json: flags.boolean({ char: 'j', hidden: true, exclusive: ['yaml'] }),
  yaml: flags.boolean({ char: 'y', hidden: true, exclusive: ['json'] })
}

BaseImsCommand.args = [
  { name: 'ctx', required: false, description: "Name of the IMS context to use. Default is the current IMS context." }
]

module.exports = BaseImsCommand
