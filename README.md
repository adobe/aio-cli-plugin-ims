aio-cli-plugin-ims
==================

The IMS plugin to aio supports managing tokens for IMS such as login, logout, and retrieving and using tokens.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/aio-cli-plugin-ims.svg)](https://npmjs.org/package/aio-cli-plugin-ims)
[![Downloads/week](https://img.shields.io/npm/dw/aio-cli-plugin-ims.svg)](https://npmjs.org/package/aio-cli-plugin-ims)
[![License](https://img.shields.io/npm/l/aio-cli-plugin-ims.svg)](https://github.com/fmeschbe/aio-cli-plugin-ims/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g aio-cli-plugin-ims
$ aio COMMAND
running command...
$ aio (-v|--version|version)
aio-cli-plugin-ims/0.0.0 darwin-x64 node-v10.15.3
$ aio --help [COMMAND]
USAGE
  $ aio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aio ims`](#aio-ims)
* [`aio ims:ctx [CTX]`](#aio-imsctx-ctx)
* [`aio ims:login [CTX]`](#aio-imslogin-ctx)
* [`aio ims:logout [CTX]`](#aio-imslogout-ctx)

## `aio ims`

IMS commands to login and logout.

```
USAGE
  $ aio ims

DESCRIPTION
  The main commands a ims:login to get or create an access token and
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

_See code: [src/commands/ims/index.js](https://github.com/fmeschbe/aio-cli-plugin-ims/blob/v0.0.0/src/commands/ims/index.js)_

## `aio ims:ctx [CTX]`

Manage IMS contexts.

```
USAGE
  $ aio ims:ctx [CTX]

ARGUMENTS
  CTX  Name of the IMS context to use. Default is the current IMS context.

OPTIONS
  -g, --global   global config
  -l, --local    local config
  -s, --set      Sets the name of the current IMS context
  -v, --val      Prints named or current IMS context data
  -v, --verbose  Verbose output
  --debug=debug  Debug level output
  --list         Names of the IMS contexts as an array

DESCRIPTION
  The following options exist for this command:

  * List the names of the configured IMS contexts
  * Print the name of the current IMS context
  * Set the name of the current IMS context
  * Print the configuration of the current or a named IMS context

  Currently it is not possible to update the IMS context configuration
  using this command. Use the "aio config" commands for this.

  Please note, that the IMS context label "$current" is reserved and
  must not be used as an IMS context name.
```

_See code: [src/commands/ims/ctx.js](https://github.com/fmeschbe/aio-cli-plugin-ims/blob/v0.0.0/src/commands/ims/ctx.js)_

## `aio ims:login [CTX]`

Log in with a certain IMS context and returns the access token.

```
USAGE
  $ aio ims:login [CTX]

ARGUMENTS
  CTX  Name of the IMS context to use. Default is the current IMS context.

OPTIONS
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

  * adobeio-cna-core-ims-jwt for JWT token based login supporting
     Adobe I/O Console service integrations.
  * adobeio-cna-core-ims-oauth for browser based OAuth2 login. This
     plugin will launch a Chromium browser to guide through the
     login process. The plugin itself will *never* see the user's
     password but only receive the authorization token after the
     user authenticated with IMS.
```

_See code: [src/commands/ims/login.js](https://github.com/fmeschbe/aio-cli-plugin-ims/blob/v0.0.0/src/commands/ims/login.js)_

## `aio ims:logout [CTX]`

Log out the current or a named IMS context.

```
USAGE
  $ aio ims:logout [CTX]

ARGUMENTS
  CTX  Name of the IMS context to use. Default is the current IMS context.

OPTIONS
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

_See code: [src/commands/ims/logout.js](https://github.com/fmeschbe/aio-cli-plugin-ims/blob/v0.0.0/src/commands/ims/logout.js)_
<!-- commandsstop -->
