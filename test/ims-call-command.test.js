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

const TheCommand = require('../src/ims-call-command')
const BaseCommand = require('../src/ims-base-command')
const ims = require('@adobe/aio-lib-ims')

jest.mock('@adobe/aio-lib-ims')

afterEach(() => {
  jest.resetAllMocks()
})

let command

beforeEach(() => {
  command = new TheCommand([])
})

test('exports and properties', () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof BaseCommand).toBeTruthy()

  expect(typeof TheCommand.description).toEqual('string')
  expect(typeof TheCommand.flags).toEqual('object')
  expect(typeof TheCommand.args).toEqual('object')
})

test('call', async () => {
  const runResult = command.call([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('This function cannot be called directly'))
})

test('run - no args/bad args', async () => {
  let runResult
  const api = '/some/api'

  // no api, error
  command.argv = []
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(
`Missing 1 required arg:
api  The IMS API to call, for example: /ims/profile/v1
See more help with --help`
  ))

  // bad api, error
  command.argv = [api]
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Invalid IMS API '${api}' - must start with '/ims/'`))
})

test('run - success', async () => {
  const result = 'my-result'
  const api = '/ims/foo'
  const imsToken = { ims: {} }

  const spy = jest.spyOn(command, 'printObject')

  ims.getToken.mockImplementation(async (ctx, force) => 'token')
  ims.Ims.fromToken = jest.fn(() => imsToken)

  command.call = jest.fn(() => {
    return result
  })

  command.argv = [api, '--data', 'foo=bar']
  const runResult = command.run()
  await expect(runResult).resolves.not.toThrow()
  expect(spy).toHaveBeenCalledWith(result)
})

test('run - errors', async () => {
  let runResult
  const errorMessage = 'my-error'
  const errorDescription = 'my-error-description'
  const api = '/ims/foo'
  const imsToken = { ims: {} }

  command.argv = [api]

  // getToken error (Error object)
  ims.getToken.mockImplementation(async (ctx, force) => {
    throw new Error(errorMessage)
  })
  runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error(`Failed calling ${api}\nReason: ${errorMessage}`))

  // getToken error (error string, for coverage)
  ims.getToken.mockImplementation(async (ctx, force) => {
    throw errorMessage
  })
  runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error(`Failed calling ${api}\nReason: ${errorMessage}`))

  // mock, testing call coverage
  ims.getToken.mockImplementation(async (ctx, force) => 'token')
  ims.Ims.fromToken = jest.fn(() => imsToken)

  // error 500 from call()
  command.call = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      statusCode: 500,
      error: {
        error_description: errorDescription
      }
    }
  })
  command.argv = [api]
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Failed calling ${api}\nReason: ${errorDescription}`))

  // error 404 from call()
  command.call = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      statusCode: 404
    }
  })
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Failed calling ${api}\nReason: API does not exist`))
})
