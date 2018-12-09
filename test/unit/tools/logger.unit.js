/* eslint-env mocha */

const assert = require('assert')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

// mocks
const mockWinston = require('../../util/mocks/winston.mock')

describe('lib/tools/logger', function () {
  var mocks
  var logger
  var loggerFactory
  var params

  beforeEach(function () {
    mocks = {
      // node-emoji - purposely left unmocked to allow normal operation
      // util - purposely left unmocked to allow normal operation
      winston: mockWinston()
    }

    params = {
      logging: {
        http: true,
        appStatus: true,
        warnings: true,
        verbose: false
      }
    }

    loggerFactory = proxyquire('../../../lib/tools/logger', {
      'winston': mocks.winston
    })

    logger = loggerFactory(params.logging)
  })

  describe('setFlags', function () {
    beforeEach(function () {
      sinon.stub(logger, 'setFlagFromParams')
      sinon.stub(logger, 'disableByEnv')
      sinon.stub(logger, 'createCustomLogLevel')
      sinon.stub(logger, 'useDefaultFlags')
    })

    describe('when logging params are provided', function () {
      var testParams
      beforeEach(function () {
        testParams = {
          http: true,
          appStatus: true,
          warnings: true,
          verbose: false,
          disable: [],
          customLevel: true
        }
        logger.setFlags(testParams)
      })

      it('should set flags from params', function () {
        assert(logger.setFlagFromParams.calledWith('http', testParams), 'not called with http')
        assert(logger.setFlagFromParams.calledWith('appStatus', testParams), 'not called with appStatus')
        assert(logger.setFlagFromParams.calledWith('warnings', testParams), 'not called with warnings')
        assert(logger.setFlagFromParams.calledWith('verbose', testParams), 'not called with verbose')
        assert(!logger.setFlagFromParams.calledWith('disable', testParams), 'called with disable')
        assert(!logger.setFlagFromParams.calledWith('customLevel', testParams), 'called with customLevel')
      })

      it('should disable based on env', function () {
        assert(logger.disableByEnv.calledWith(testParams.disable), 'not called with disable')
      })

      it('should define custom log levels', function () {
        assert(logger.createCustomLogLevel.calledWith('customLevel', testParams.customLevel), 'not called with customLevel')
      })
    })

    describe('when logging params are not provided', function () {
      it('should only use default flags', function () {
        logger.setFlags(undefined)
        assert(!logger.setFlagFromParams.called, 'logger.setFlagFromParams was called')
        assert(!logger.disableByEnv.called, 'logger.disableByEnv was called')
        assert(!logger.createCustomLogLevel.called, 'logger.createCustomLogLevel was called')
        assert(logger.useDefaultFlags.called, 'logger.useDefaultFlags was called')
      })
    })
  })

  describe('setFlagFromParams', function () {
    beforeEach(function () {
      logger.enableAppStatus = false
      logger.enableWarnings = false
      logger.enableVerbose = false

      params = {
        logging: {
          http: false,
          appStatus: false,
          warnings: false,
          verbose: false
        }
      }
    })

    it('should affect appStatus', function () {
      params.logging.appStatus = true
      logger.setFlagFromParams('appStatus', params.logging)
      assert(logger.enableAppStatus, 'enableAppStatus was false')
      assert(!logger.enableWarnings, 'enableWarnings was true')
      assert(!logger.enableVerbose, 'enableVerbose was true')
    })

    it('should affect warnings', function () {
      params.logging.warnings = true
      logger.setFlagFromParams('warnings', params.logging)
      assert(!logger.enableAppStatus, 'enableAppStatus was true')
      assert(logger.enableWarnings, 'enableWarnings was false')
      assert(!logger.enableVerbose, 'enableVerbose was true')
    })

    it('should affect verbose', function () {
      params.logging.verbose = true
      logger.setFlagFromParams('verbose', params.logging)
      assert(!logger.enableAppStatus, 'enableAppStatus was true')
      assert(!logger.enableWarnings, 'enableWarnings was true')
      assert(logger.enableVerbose, 'enableVerbose was false')
    })

    it('should ignore a non-matching key', function () {
      params.logging.http = true
      logger.setFlagFromParams('http', params.logging)
      assert(!logger.enableAppStatus, 'enableAppStatus was true')
      assert(!logger.enableWarnings, 'enableWarnings was true')
      assert(!logger.enableVerbose, 'enableVerbose was true')
    })
  })

  describe('disableByEnv', function () {
    let sandbox
    beforeEach(function () {
      sandbox = sinon.createSandbox()
      sandbox.stub(process, 'env').value({
        NODE_ENV: 'prod',
        true1: true,
        true2: 'true',
        false1: false,
        false2: 'false'
      })
      mocks.winston._console.silent = false
    })
    afterEach(function () {
      sandbox.restore()
    })

    it('should disable logging if the NODE_ENV is present', function () {
      logger.disableByEnv(['prod'])
      assert(mocks.winston._console.silent, 'console is not silent')
    })

    it('should disable logging if the env value is true', function () {
      logger.disableByEnv(['true1'])
      assert(mocks.winston._console.silent, 'console is not silent')
    })

    it('should disable logging if the env value is \'true\'', function () {
      logger.disableByEnv(['true2'])
      assert(mocks.winston._console.silent, 'console is not silent')
    })

    it('should disable logging if the env value is false', function () {
      logger.disableByEnv(['false1'])
      assert(!mocks.winston._console.silent, 'console is not silent')
    })

    it('should disable logging if the env value is \'false\'', function () {
      logger.disableByEnv(['false2'])
      assert(!mocks.winston._console.silent, 'console is not silent')
    })
  })

  describe('createCustomLogLevel', function () {
    describe('config is {}', function () {
      beforeEach(function () {
        params.logging.customLevel = {}
        logger.createCustomLogLevel('customLevel', params.logging.customLevel)
      })

      it('should default to enable log at info level', function () {
        logger.customLevel('hello')
        assert(mocks.winston._log.calledWith({
          level: 'info',
          message: 'hello'
        }), 'logger.log was called with unexpected args')
      })
    })

    describe('config is { enable: \'false\', type: \'warning\'}', function () {
      beforeEach(function () {
        params.logging.customLevel = { enable: 'false', type: 'warning' }
        logger.createCustomLogLevel('customLevel', params.logging.customLevel)
      })

      it('should not log', function () {
        logger.customLevel('hello')
        assert(!mocks.winston._log.called, 'logger.log was called')
      })
    })

    describe('config is { enable: true, type: \'warning\'}', function () {
      beforeEach(function () {
        params.logging.customLevel = { enable: true, type: 'warning' }
        logger.createCustomLogLevel('customLevel', params.logging.customLevel)
      })

      it('should log at warning level', function () {
        logger.customLevel('hello')
        assert(mocks.winston._log.calledWith({
          level: 'warning',
          message: 'hello'
        }), 'logger.log was called with unexpected args')
      })
    })

    describe('config is true', function () {
      beforeEach(function () {
        params.logging.customLevel = true
        logger.createCustomLogLevel('customLevel', params.logging.customLevel)
      })

      it('should default to enable log at info level', function () {
        logger.customLevel('hello')
        assert(mocks.winston._log.calledWith({
          level: 'info',
          message: 'hello'
        }), 'logger.log was called with unexpected args')
      })
    })

    describe('config is \'false\'', function () {
      beforeEach(function () {
        params.logging.customLevel = 'false'
        logger.createCustomLogLevel('customLevel', params.logging.customLevel)
      })

      it('should not log', function () {
        logger.customLevel('hello')
        assert(!mocks.winston._log.called, 'logger.log was called')
      })
    })
  })

  describe('useDefaultFlags', function () {
    beforeEach(function () {
      // set each flag to the inverse of the defaults
      logger.enableAppStatus = false
      logger.enableWarnings = false
      logger.enableVerbose = true
      logger.useDefaultFlags()
    })

    it('should default enableAppStatus to true', function () {
      assert.strictEqual(logger.enableAppStatus, true, 'set to incorrect default')
    })

    it('should default enableWarnings to true', function () {
      assert.strictEqual(logger.enableWarnings, true, 'set to incorrect default')
    })

    it('should default enableVerbose to false', function () {
      assert.strictEqual(logger.enableVerbose, false, 'set to incorrect default')
    })
  })

  describe('log formats', function () {
    it('should accept a string', function () {
      logger.log('test')
      assert(mocks.winston._log.called, 'logger.log was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: 'test'
      }), 'logger.log was called with unexpected args')
    })

    it('should accept a emoji and string', function () {
      logger.log('⚠️', 'test')
      assert(mocks.winston._log.called, 'logger.log was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: '⚠️  test'
      }), 'logger.log was called with unexpected args')
    })

    it('should accept multiple strings', function () {
      logger.log('test 1', 'test 2', 'test 3')
      assert(mocks.winston._log.called, 'logger.log was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: 'test 1 test 2 test 3'
      }), 'logger.log was called with unexpected args')
    })

    it('should accept a mix of strings and objects', function () {
      // using empty objects because I couldn't figure out how
      // to properly declare the resulting message with colors
      logger.log('test 1', {}, 'test 3', {})
      assert(mocks.winston._log.called, 'logger.log was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: 'test 1 {} test 3 {}'
      }), 'logger.log was called with unexpected args')
    })
  })

  describe('log', function () {
    it('should log a message', function () {
      logger.log('test')
      assert(mocks.winston._log.called, 'logger.log was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: 'test'
      }), 'logger.log was called with unexpected args')
    })

    it('should not log when enableAppStatus is \'false\'', function () {
      logger.enableAppStatus = 'false'
      logger.log('test')
      assert(!mocks.winston._log.called, 'logger.log was called')
    })

    it('should not log when enableAppStatus is false', function () {
      logger.enableAppStatus = false
      logger.log('test')
      assert(!mocks.winston._log.called, 'logger.log was called')
    })
  })

  describe('warn', function () {
    it('should log a message', function () {
      logger.warn('test')
      assert(mocks.winston._log.called, 'logger.warn was not called')
      assert(mocks.winston._log.calledWith({
        level: 'warn',
        message: '⚠️   test'
      }), 'logger.warn was called with unexpected args')
    })

    it('should not prepend ⚠️ if an emoji is provided', function () {
      logger.warn('⚠️', 'test')
      assert(mocks.winston._log.called, 'logger.warn was not called')
      assert(mocks.winston._log.calledWith({
        level: 'warn',
        message: '⚠️  test'
      }), 'logger.warn was called with unexpected args')
    })

    it('should not log when enableWarnings is \'false\'', function () {
      logger.enableWarnings = 'false'
      logger.warn('test')
      assert(!mocks.winston._log.called, 'logger.warn was called')
    })

    it('should not log when enableWarnings is false', function () {
      logger.enableWarnings = false
      logger.warn('test')
      assert(!mocks.winston._log.called, 'logger.warn was called')
    })
  })

  describe('verbose', function () {
    it('should log a message', function () {
      logger.enableVerbose = true
      logger.verbose('test')
      assert(mocks.winston._log.called, 'logger.verbose was not called')
      assert(mocks.winston._log.calledWith({
        level: 'info',
        message: 'test'
      }), 'logger.verbose was called with unexpected args')
    })

    it('should not log when enableVerbose is \'false\'', function () {
      logger.enableVerbose = 'false'
      logger.verbose('test')
      assert(!mocks.winston._log.called, 'logger.verbose was called')
    })

    it('should not log when enableVerbose is false', function () {
      logger.enableVerbose = false
      logger.verbose('test')
      assert(!mocks.winston._log.called, 'logger.verbose was called')
    })
  })

  describe('error', function () {
    it('should log a message', function () {
      logger.error('test')
      assert(mocks.winston._log.called, 'logger.error was not called')
      assert(mocks.winston._log.calledWith({
        level: 'error',
        message: '❌  test'
      }), 'logger.error was called with unexpected args')
    })

    it('should not prepend ❌ if an emoji is provided', function () {
      logger.error('❌', 'test')
      assert(mocks.winston._log.called, 'logger.error was not called')
      assert(mocks.winston._log.calledWith({
        level: 'error',
        message: '❌  test'
      }), 'logger.error was called with unexpected args')
    })
  })
})
