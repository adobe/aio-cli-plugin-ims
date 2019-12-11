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

class PluginsCommand extends ImsBaseCommand {
  async run () {
    const { argv } = this.parse(PluginsCommand)
    const { context } = require('@adobe/aio-lib-core-ims')

    if (argv && argv.length > 0) {
      // TODO: check each plugin for whether it can be require-d
      // TODO: check each plugin for whether it implements the contract
      // TODO: have option to omit the check(s)
      context.plugins = argv
    } else {
      this.printObject(context.plugins)
    }

    const debugCore = require('debug')
    const debug = debugCore('mine')
    debug('debugCore.names: %o', debugCore.names)
    debug('debugCore.instances: %o', debugCore.instances)
  }
}

PluginsCommand.description = `Manage Create Token Plugins.

The following options exist for this command:

* Print the current list of token creation plugins
* Update the list of token creation plugins

Note: If provoding a list of plugis to configure, they are not currently
checked for existence or implementation of the correct contract.
`

PluginsCommand.flags = {
  ...ImsBaseCommand.flags,

  force: flags.boolean({ char: 'f', description: 'Force configuring the list of plugins without checking for existence or contract' })
}

// just collect all arguments not being flags into the argv array and
// assume them to be plugins -- have the 'plugin' entry just for --help
// purposes.
PluginsCommand.strict = false
PluginsCommand.args = [
  { name: 'plugin', required: false, description: 'List of plugins to configure. If not provided, prints the current list instead' }
]

module.exports = PluginsCommand
