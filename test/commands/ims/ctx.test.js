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

const TheCommand = require('../../../src/commands/ims/ctx')
const BaseCommand = require('../../../src/ims-base-command')
const config = require('@adobe/aio-lib-core-config')
const { IMS, CONTEXTS, CONFIG, CURRENT } = require('@adobe/aio-lib-ims/src/context')

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

test('run', async () => {
  const spy = jest.spyOn(command, 'printObject')
  const myContext = 'my-context'
  const anotherContext = 'another-context'
  let runResult

  const store = {
    [IMS]: {
      [CONTEXTS]: {
        [myContext]: {},
        [anotherContext]: {}
      },
      [CONFIG]: {
        [CURRENT]: myContext
      }
    }
  }

  config.get.mockImplementation(key => {
    if (key.startsWith(`${IMS}.${CONTEXTS}.`)) {
      return store[IMS][CONTEXTS][key.substring(`${IMS}.${CONTEXTS}.`.length)]
    }
    if (key.startsWith(`${IMS}.${CONFIG}.`)) {
      return store[IMS][CONFIG][key.substring(`${IMS}.${CONFIG}.`.length)]
    }
    if (key === `${IMS}.${CONTEXTS}`) {
      return store[IMS][CONTEXTS]
    }
    if (key === `${IMS}.${CONFIG}`) {
      return store[IMS][CONFIG]
    }
    return store[key]
  })

  config.set.mockImplementation((key, value) => {
    if (key.startsWith(`${IMS}.${CONTEXTS}.`)) {
      store[IMS][CONTEXTS][key.substring(`${IMS}.${CONTEXTS}.`).length] = value
    } else if (key === `${IMS}.${CONFIG}.${CURRENT}`) {
      store[IMS][CONFIG][CURRENT] = value
    }
    store[key] = value
  })

  spy.mockClear()
  command.argv = []
  runResult = command.run()
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  await expect(spy).toHaveBeenCalledWith(store[IMS][CONFIG][CURRENT])

  spy.mockClear()
  command.argv = ['--ctx', myContext, '--value']
  runResult = command.run()
  await expect(runResult).resolves.not.toThrow()
  await expect(spy).toHaveBeenCalledWith({
    data: store[IMS][CONTEXTS][myContext],
    name: myContext
  })

  spy.mockClear()
  command.argv = ['--list']
  runResult = command.run()
  await expect(runResult).resolves.not.toThrow()
  await expect(spy).toHaveBeenCalledWith([myContext, anotherContext])

  spy.mockClear()
  command.argv = ['--set', anotherContext]
  runResult = command.run()
  await expect(runResult).resolves.not.toThrow()
  await expect(spy).toHaveBeenCalledWith(anotherContext)
})
