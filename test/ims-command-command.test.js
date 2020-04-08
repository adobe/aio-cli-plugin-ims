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

const TheCommand = require('../src/ims-command-command')
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

test('getApi', async () => {
  const runResult = command.getApi()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('This function cannot be called directly'))
})

test('method', () => {
  const method = command.method
  expect(method).toEqual('get')
})

test('call', async () => {
  const method = 'get'
  const api = 'my-api'
  const token = 'my-token'
  const parameterMap = { foo: 'bar' }
  const expectedResult = 'my-result'

  expect.assertions(4)

  const ims = {
    [method]: (_api, _token, _parameterMap) => {
      expect(_api).toEqual(api)
      expect(_token).toEqual(token)
      expect(_parameterMap).toEqual(parameterMap)
      return expectedResult
    }
  }

  const callResult = command.call(ims, method, api, token, parameterMap)
  await expect(callResult).resolves.toEqual(expectedResult)
})

test('run - success', async () => {
  const result = 'my-result'
  const imsToken = { ims: {} }

  const spy = jest.spyOn(command, 'printObject')

  command.getApi = jest.fn(() => '/ims/foo')
  command.call = jest.fn(() => result)
  ims.getToken.mockImplementation(async (ctx, force) => 'token')
  ims.Ims.fromToken = jest.fn(() => imsToken)

  command.argv = ['--data', 'foo=bar']
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

  command.getApi = jest.fn(() => api)

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

  // getApi failure (Error object, coverage)
  const getApiErrorMessage = 'getApi failure'
  command.getApi = jest.fn(() => {
    throw new Error(getApiErrorMessage)
  })
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Failed resolving the API to call\nReason: ${getApiErrorMessage}`))

  // getApi failure (error string, coverage)
  command.getApi = jest.fn(() => {
    throw getApiErrorMessage
  })
  runResult = command.run()
  await expect(runResult).rejects.toEqual(new Error(`Failed resolving the API to call\nReason: ${getApiErrorMessage}`))
})
