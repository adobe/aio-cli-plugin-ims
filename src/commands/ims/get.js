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

const ImsCallCommand = require('../../ims-call-command')

class GetCommand extends ImsCallCommand {

    async call(ims, api, token, parameterMap) {
        this.debug("call(%s, %s, %o)", api, token, parameterMap);
        return ims.get(api, token, parameterMap);
    }

}

GetCommand.description = `Call an IMS API using a GET request
${ImsCallCommand.description}
`

GetCommand.flags = {
    ...ImsCallCommand.flags
}

GetCommand.args = [
    ...ImsCallCommand.args
]

module.exports = GetCommand
