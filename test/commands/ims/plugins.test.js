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

const TheCommand = require('../../../src/commands/ims/plugins')
const BaseCommand = require('../../../src/ims-base-command')
const { context } = require('@adobe/aio-lib-ims')
const config = require('@adobe/aio-lib-core-config')

const myPlugins = ['foo']
const store = {
  ims: {
    plugins: myPlugins
  }
}

const IMS = 'ims.'
config.get.mockImplementation(key => {
  if (key.startsWith(IMS)) {
    return store.ims[key.substring(IMS.length)]
  }
  return store[key]
})

config.set.mockImplementation((key, value) => {
  if (key.startsWith(IMS)) {
    store.ims[key.substring(IMS.length)] = value
  } else {
    store[key] = value
  }
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

test('run (get)', async () => {
  const spy = jest.spyOn(command, 'printObject')

  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  await expect(spy).toHaveBeenCalledWith(myPlugins)
})

test('run (set)', async () => {
  command.argv = ['plugin1', 'plugin2']
  const runResult = command.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).resolves.not.toThrow()
  await expect(context.getPlugins()).resolves.toEqual(command.argv)
})
