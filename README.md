aio-cli-plugin-ims
==================

The IMS plugin to aio supports managing tokens for IMS such as login, logout, and retrieving and using tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/aio-cli-plugin-ims.svg)](https://npmjs.org/package/aio-cli-plugin-ims)
[![Downloads/week](https://img.shields.io/npm/dw/aio-cli-plugin-ims.svg)](https://npmjs.org/package/aio-cli-plugin-ims)
[![License](https://img.shields.io/npm/l/aio-cli-plugin-ims.svg)](https://github.com/adobe/aio-cli-plugin-ims/blob/master/package.json)

<!-- toc -->
* [Motivation](#motivation)
* [Goals](#goals)
* [The JavaScript Packages](#the-javascript-packages)
* [How it works](#how-it-works)
* [PS](#ps)
* [Usage](#usage)
* [Commands](#commands)
* [Contributing](#contributing)
* [Licensing](#licensing)
<!-- tocstop -->

# Motivation

IMS integration for authentication and subsequent use of the CLI for service access is critical to the success of the CLI. To that avail, this functionality needs to be as complete as to support anything the browser UI supports as well. In the end, this means support for logging in not only with JWT tokens for technical accounts but also leveraging the SUSI flow for three-legged user based authentication and even, at least for Adobe internal teams, with service tokens.

The current [JWT Auth Plugin for the Adobe I/O CLI](https://github.com/adobe/aio-cli-plugin-jwt-auth) does a decent job supporting JWT based flows with some limitations, though:

* Only a single configuration is supported, thus not allowing to switch for different configurations and thus different setups depending on the actual CLI task at hand. Even with the new local configuration support we are still limited to one configuration per local environment.
* The configuration contains a lot of boiler plate data, which is the same for many configurations. This also makes the configuration hard to manage.
* Only JWT tokens are supported. So we are missing real user tokens created using the SUSI UI based flow as well as service tokens, which are sometimes used by Adobe internal teams.
* The actual JWT signing and token exchange are not easily re-usable outside of the CLI plugin.

# Goals

So the goal of this project along with the companion repositories is to provide more complete support:

* Have a separate module implementing a JavaScript interface to the IMS API, so that this IMS API can be leveraged from multiple places, inside of the Adobe I/O CLI IMS Plugins or outside.
* Store as little information in the configuration data as possible. This boils down to the absolutely needed fields, such as `client_id`, `client_secret`, `private_key` etc. The boilerplate, such as the bulk of the JWT token should be provided dynamically.
* The plugins should support all three of the login mechanism: SUSI/UI based for user token, JWT based (technical/utility) user tokens, as well as Adobe-internal service tokens.

# The JavaScript Packages

Without much further ado, here is the collection of IMS supporting plugins:

* The [Adobe I/O Lib Core IMS Support Library](https://github.com/adobe/aio-lib-core-ims) is the reusable base library providing JavaScript level API to the IMS APIs as well as getting access to tokens. All the functionality of this library is available by simply requiring this library.
* This [Adobe I/O CLI IMS Plugin](https://github.com/adobe/aio-cli-plugin-ims) is the main CLI plugin to the Adobe IO CLI. See #plugin for more details below.
* Three extension to the _Adobe IO IMS Support Library_ supporting creation of IMS tokens for different use cases. They all come as node packages. They are used by the _Adobe IO IMS Support Library_ to implement the access token creation. The plugins are:
    * The [Adobe I/O Lib Core IMS Library JWT Support](https://github.com/adobe/aio-lib-core-ims-jwt) supporting the generation and exchange for an access token of JWT Tokens.
    * The [Adobe I/O Lib Core IMS Library OAuth2 Support](https://github.com/adobe/aio-lib-core-ims-oauth) supporting the creation of tokens using the normal browser-based SUSI flow. To that avail the SUSI flow part is implemented as an embedded [Electron app](https://electronjs.org) driving the browser based interaction and capturing the callback from IMS.

# How it works

This _Adobe IO CLI IMS Plugin_ offers four commands:

* [`login`](#aio-imslogin) to create and return IMS access tokens. Since tokens are cached in the Adobe IO CLI configuration, an actual token is only created if the currently cached token has already expired (or is about to expire within 10 minutes).
* [`logout`](#aio-imslogout) invalidate cached tokens and remove them from the cache. Besides the access token, this can also be used to invalidate any refresh token that may be cached.
* [`ctx`](#aio-imsctx) to manage configuration contexts.
* [`plugins`](#aio-imsplugins-plugin) to manage configuration contexts.
* [`profile`](#aio-imsprofile), [`organizations`](#aio-imsorganizations), and [`session`](#aio-imssession) to retrieve respective IMS information
* Low level [`get`](#aio-imsget-api) and [`post`](#aio-imspost-api) to directly call IMS API using raw HTTP `GET` and `POST` requests.

# PS

Oh, and yes, docs and tests are a bit lacking this time ... I want to just get this out ASAP for anyone to have a look.

# Usage
<!-- usage -->
```sh-session
$ npm install -g @adobe/aio-cli-plugin-ims
$ aio COMMAND
running command...
$ aio (-v|--version|version)
@adobe/aio-cli-plugin-ims/1.0.0 darwin-x64 node-v10.16.0
$ aio --help [COMMAND]
USAGE
  $ aio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aio ims`](#aio-ims)
* [`aio ims:ctx`](#aio-imsctx)
* [`aio ims:get API`](#aio-imsget-api)
* [`aio ims:login`](#aio-imslogin)
* [`aio ims:logout`](#aio-imslogout)
* [`aio ims:organizations`](#aio-imsorganizations)
* [`aio ims:plugins [PLUGIN]`](#aio-imsplugins-plugin)
* [`aio ims:post API`](#aio-imspost-api)
* [`aio ims:profile`](#aio-imsprofile)
* [`aio ims:session`](#aio-imssession)

## `aio ims`

IMS commands to login and logout.

```
USAGE
  $ aio ims

DESCRIPTION
  The main commands are ims:login to get or create an access token and
  ims:logout to invalidate an access token and thus log out from IMS.

  Logging in and out is based on configuration of which there may be
  multiple. Each set of configuration properties, called an IMS context,
  can be individually addressed by a label.

  Configuration for the IMS commands is stored in the "$ims"
  configuration property. The special property "$current" contains the
  label of the current configuration which can be set using the
  "aio ims ctx -s <label>" command.

  Each set of properties in labeled IMS context configurations has
  configuration properties depending on the kind of access that is
  supported. The below example shows the configuration for OAuth2
  based (graphical SUSI) login.

  The "env" property is mandatory and designates the IMS environment
  used for authentication. Possible values are "stage" and "prod".
  If the property is missing or any other value, it defaults to "stage".

  All commands allow their normal output to be formatted in either
  HJSON (default), JSON, or YAML.

EXAMPLE
  {
       $ims: {
         postman: {
           env: "stage",
           callback_url: "https://callback.example.com",
           client_id: "example.com-client-id",
           client_secret: "XXXXXXXX",
           scope: "openid AdobeID additional_info.projectedProductContext read_organizations",
           state: ""
         },
         $current: "postman"
       }
     }
```

_See code: [src/commands/ims/index.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/index.js)_

## `aio ims:ctx`

Manage IMS contexts.

```
USAGE
  $ aio ims:ctx

OPTIONS
  -c, --ctx=ctx  Name of the IMS context to use. Default is the current IMS context
  -g, --global   global config
  -l, --local    local config
  -s, --set=set  Sets the name of the current IMS context
  -v, --verbose  Verbose output
  --debug=debug  Debug level output
  --list         Names of the IMS contexts as an array
  --value        Prints named or current IMS context data

DESCRIPTION
  The following options exist for this command:

  * List the names of the configured IMS contexts
  * Print the name of the current IMS context
  * Set the name of the current IMS context
  * Print the configuration of the current or a named IMS context

  Currently it is not possible to update the IMS context configuration
  using this command. Use the "aio config" commands for this.

  Please note, that the IMS context labels starting with "$" are reserved
  and cannot be used as an IMS context name.
```

_See code: [src/commands/ims/ctx.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/ctx.js)_

## `aio ims:get API`

Call an IMS API using a GET request

```
USAGE
  $ aio ims:get API

ARGUMENTS
  API  The IMS API to call, for example: /ims/profile/v1

OPTIONS
  -c, --ctx=ctx    Name of the IMS context to use. Default is the current IMS context
  -d, --data=data  Request parameter in the form of name=value. Repeat for multiple parameters
  -g, --global     global config
  -l, --local      local config
  -v, --verbose    Verbose output
  --debug=debug    Debug level output

DESCRIPTION
  This is a raw and low level IMS API call command taking the IMS API
  path as the first argument and any additional request parameters
  as optional additional arguments.

  The API result is printed as an object if successful. If the call
  fails, the error message is returned as an error.
```

_See code: [src/commands/ims/get.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/get.js)_

## `aio ims:login`

Log in with a certain IMS context and returns the access token.

```
USAGE
  $ aio ims:login

OPTIONS
  -c, --ctx=ctx  Name of the IMS context to use. Default is the current IMS context
  -d, --decode   Decode and display access token data
  -f, --force    Force logging in. This causes a forced logout on the context first and makes sure to not use any cached
                 data when calling the plugin.
  -g, --global   global config
  -l, --local    local config
  -v, --verbose  Verbose output
  --debug=debug  Debug level output

DESCRIPTION
  If the IMS context already has a valid access token set (valid meaning
  at least 10 minutes before expiry), that token is returned.

  Otherwise, if the IMS context has a valid refresh token set (valid
  meaning at least 10 minutes before expiry) that refresh token is
  exchanged for an access token before returning the access token.

  Lastly, if the IMS context properties are supported by one of the
  IMS login plugins, that login plugin is called to guide through
  the IMS login process.

  The currently supported IMS login plugins are:

  * aio-lib-core-ims-jwt for JWT token based login supporting
     Adobe I/O Console service integrations.
  * aio-lib-core-ims-oauth for browser based OAuth2 login. This
     plugin will launch a Chromium browser to guide through the
     login process. The plugin itself will *never* see the user's
     password but only receive the authorization token after the
     user authenticated with IMS.
```

_See code: [src/commands/ims/login.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/login.js)_

## `aio ims:logout`

Log out the current or a named IMS context.

```
USAGE
  $ aio ims:logout

OPTIONS
  -c, --ctx=ctx  Name of the IMS context to use. Default is the current IMS context
  -f, --force    Invalidate the refresh token as well as all access tokens.
                 Otherwise only the access token is invalidated. For IMS
                 contexts not supporting refresh tokens, this flag has no
                 effect.
  -g, --global   global config
  -l, --local    local config
  -v, --verbose  Verbose output
  --debug=debug  Debug level output

DESCRIPTION
  This command can be called multiple times on the same IMS context with
  out causing any errors. The assumption is that after calling this command
  without an error, the IMS context's access and refresh tokens have been
  invalidated and removed from persistence storage. Repeatedly calling this
  command will just do nothing.
```

_See code: [src/commands/ims/logout.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/logout.js)_

## `aio ims:organizations`

Retrieve the organizations to which the user is associated

```
USAGE
  $ aio ims:organizations

OPTIONS
  -c, --ctx=ctx    Name of the IMS context to use. Default is the current IMS context
  -d, --data=data  Request parameter in the form of name=value. Repeat for multiple parameters
  -g, --global     global config
  -l, --local      local config
  -v, --verbose    Verbose output
  --debug=debug    Debug level output

DESCRIPTION
  This is a raw and low level IMS API call command taking the IMS API
  path as the first argument and any additional request parameters
  as optional additional arguments.

  The API result is printed as an object if successful. If the call
  fails, the error message is returned as an error.
```

_See code: [src/commands/ims/organizations.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/organizations.js)_

## `aio ims:plugins [PLUGIN]`

Manage Create Token Plugins.

```
USAGE
  $ aio ims:plugins [PLUGIN]

ARGUMENTS
  PLUGIN  List of plugins to configure. If not provided, prints the current list instead

OPTIONS
  -c, --ctx=ctx  Name of the IMS context to use. Default is the current IMS context
  -f, --force    Force configuring the list of plugins without checking for existence or contract
  -g, --global   global config
  -l, --local    local config
  -v, --verbose  Verbose output
  --debug=debug  Debug level output

DESCRIPTION
  The following options exist for this command:

  * Print the current list of token creation plugins
  * Update the list of token creation plugins

  Note: If provoding a list of plugis to configure, they are not currently
  checked for existence or implementation of the correct contract.
```

_See code: [src/commands/ims/plugins.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/plugins.js)_

## `aio ims:post API`

Call an IMS API using a POST request

```
USAGE
  $ aio ims:post API

ARGUMENTS
  API  The IMS API to call, for example: /ims/profile/v1

OPTIONS
  -c, --ctx=ctx    Name of the IMS context to use. Default is the current IMS context
  -d, --data=data  Request parameter in the form of name=value. Repeat for multiple parameters
  -g, --global     global config
  -l, --local      local config
  -v, --verbose    Verbose output
  --debug=debug    Debug level output

DESCRIPTION
  This is a raw and low level IMS API call command taking the IMS API
  path as the first argument and any additional request parameters
  as optional additional arguments.

  The API result is printed as an object if successful. If the call
  fails, the error message is returned as an error.
```

_See code: [src/commands/ims/post.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/post.js)_

## `aio ims:profile`

Retrieve the IMS Profile (for a user token)

```
USAGE
  $ aio ims:profile

OPTIONS
  -c, --ctx=ctx    Name of the IMS context to use. Default is the current IMS context
  -d, --data=data  Request parameter in the form of name=value. Repeat for multiple parameters
  -g, --global     global config
  -l, --local      local config
  -v, --verbose    Verbose output
  --debug=debug    Debug level output

DESCRIPTION
  This is a raw and low level IMS API call command taking the IMS API
  path as the first argument and any additional request parameters
  as optional additional arguments.

  The API result is printed as an object if successful. If the call
  fails, the error message is returned as an error.
```

_See code: [src/commands/ims/profile.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/profile.js)_

## `aio ims:session`

Retrieve the IMS Profile (for a user token)

```
USAGE
  $ aio ims:session

OPTIONS
  -c, --ctx=ctx    Name of the IMS context to use. Default is the current IMS context
  -d, --data=data  Request parameter in the form of name=value. Repeat for multiple parameters
  -g, --global     global config
  -l, --local      local config
  -v, --verbose    Verbose output
  --debug=debug    Debug level output

DESCRIPTION
  This is a raw and low level IMS API call command taking the IMS API
  path as the first argument and any additional request parameters
  as optional additional arguments.

  The API result is printed as an object if successful. If the call
  fails, the error message is returned as an error.
```

_See code: [src/commands/ims/session.js](https://github.com/adobe/aio-cli-plugin-ims/blob/v1.0.0/src/commands/ims/session.js)_
<!-- commandsstop -->


# Contributing
Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.


# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
