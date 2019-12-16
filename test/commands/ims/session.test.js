/*
Copyright 2019 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TheCommand = require('../../../src/commands/ims/session')
const CommandCommand = require('../../../src/ims-command-command')
const ims = require('@adobe/aio-lib-core-ims')

jest.mock('@adobe/aio-lib-core-ims')

afterEach(() => {
  jest.resetAllMocks()
})

let command

beforeEach(() => {
  command = new TheCommand([])
})

test('exports and properties', () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof CommandCommand).toBeTruthy()

  expect(typeof TheCommand.description).toEqual('string')
  expect(typeof TheCommand.flags).toEqual('object')
  expect(typeof TheCommand.args).toEqual('object')
})

test('getApi', async () => {
  const api = 'my-api'
  command._api = api

  const runResult = command.getApi()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(api)
})

test('getApi - via _getSessionLink', async () => {
  const api = 'my-api'
  command._getSessionLink = jest.fn(async () => {
    return api
  })

  const runResult = command.getApi()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(api)
})

test('_getSessionLink', async () => {
  ims.getToken.mockImplementation(async (ctx) => {
    return 'my-token'
  })

  const myPath = '/my/path'

  ims.getTokenData.mockImplementation(async (token) => {
    return {
      state: JSON.stringify({
        session: `https://foo.bar${myPath}`
      })
    }
  })

  const runResult = command._getSessionLink()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.toEqual(myPath)
})
