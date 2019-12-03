
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

const { flags } = require('@oclif/command');
const ImsBaseCommand = require('./ims-base-command');

const valid_methods = [ 'get', 'post' ];

class ImsCommandCommand extends ImsBaseCommand {

    async getApi() {
        this.debug("get::api()");
        throw new Error("This function cannot be called directly");
    }

    /**
     * Returns the HTTP method to be used to call the IMS
     * API. This base implementation returns "get", extensions
     * can overwrite this getter method to use a differen
     * method such as "post".
     */
    get method() {
        return 'get';
    }

    async call(ims, method, api, token, parameterMap) {
        this.debug("call(%s, %s, %s, %o)", method, api, token, parameterMap);
        return ims[method](api, token, parameterMap);
        // return Promise.reject(new Error("This function cannot be called directly"));
    }

    async run() {
        const { args, flags } = this.parse(this.constructor);

        let data = {}
        if (flags.data) {
            for (const val of flags.data) {
                data[val[0]] = val[1];
            }
        }

        let api;
        try {
            api = await this.getApi();
        } catch (err) {
            this.error(`Failed resolving the API to call\nReason: ${err.message || err}`, { exit: 1 });
        }

        this.debug("Context: %s", flags.ctx);
        this.debug("Method : %s", args.method);
        this.debug("API    : %s", api);
        this.debug("Params : %o", data);

        const { Ims, getToken } = require('@adobe/aio-lib-core-ims');
        try {
            await getToken(flags.ctx)
                .then(token => Ims.fromToken(token))
                .then(tokenIms => this.call(tokenIms.ims, this.method, api, tokenIms.token, data))
                .then(result => this.printObject(result))
        } catch (err) {
            this.debug("error: %o", err);
            let reason;
            if (err.statusCode) {
                switch (err.statusCode) {
                    case 404: // NOT FOUND
                        reason = "API does not exist";
                        break;
                    default:
                        reason = err.error.error_description;
                        break;
                }
            } else {
                reason = (err.message || err);
            }
            this.error(`Failed calling ${api}\nReason: ${reason}`, { exit: 1 });
        }
    }
}

ImsCommandCommand.description = `
This is a raw and low level IMS API call command taking the IMS API
path as the first argument and any additional request parameters
as optional additional arguments.

The API result is printed as an object if successful. If the call
fails, the error message is returned as an error.
`

ImsCommandCommand.parameterParser = input => input.split("=");

ImsCommandCommand.flags = {
    ...ImsBaseCommand.flags,

    data: flags.string({ char: 'd', description: 'Request parameter in the form of name=value. Repeat for multiple parameters', multiple: true, parse: ImsCommandCommand.parameterParser })
}

ImsCommandCommand.args = [
    ...ImsBaseCommand.args
]

module.exports = ImsCommandCommand
