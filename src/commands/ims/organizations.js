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

class OrganizationsCommand extends ImsCommandCommand {

    async getApi() {
        this.debug("get::api()");
        return "/ims/organizations";
    }

}

OrganizationsCommand.description = `Retrieve the organizations to which the user is associated
${ImsCommandCommand.description}
`

OrganizationsCommand.flags = {
    ...ImsCommandCommand.flags
}

OrganizationsCommand.args = [
    ...ImsCommandCommand.args
]

module.exports = OrganizationsCommand
