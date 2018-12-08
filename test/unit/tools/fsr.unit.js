/* eslint-env mocha */

const assert = require('assert')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

// mocks
const mockPath = require('../../util/mocks/path.mock')
const mockFs = require('../../util/mocks/fs.mock')
const mockFse = require('../../util/mocks/fse.mock')

// fakes
const fakeParams = require('../../util/mocks/app/get/params.fake')

describe('lib/tools/fsr', function () {
  var mocks
  var fsr
  var fsrFactory
  var fakeGetMap
  var fakeApp

  beforeEach(function () {
    mocks = {
      fs: mockFs(),
      fse: mockFse(),
      path: mockPath()
    }

    fakeGetMap = {
      params: fakeParams().base()
    }

    fakeApp = {
      get: sinon.stub().callsFake(function (key) {
        return fakeGetMap[key]
      })
    }

    fsrFactory = proxyquire('../../../lib/tools/fsr', {
      'fs': mocks.fs,
      'fs-extra': mocks.fse,
      'path': mocks.path
    })

    fsr = fsrFactory(fakeApp)
  })

  describe('constructor', function () {
    it('should init generate as true if no app is present', function () {
      var testFsr = fsrFactory()

      assert.strictEqual(testFsr.generate, true, 'defaulted to false')
    })

    it('should init generate as false param value is false', function () {
      fakeGetMap.params.generateFolderStructure = false
      var testFsr = fsrFactory(fakeApp)

      assert.strictEqual(testFsr.generate, false, 'set to non-matching value')
    })

    it('should init generate as true if param value is true', function () {
      fakeGetMap.params.generateFolderStructure = true
      var testFsr = fsrFactory(fakeApp)

      assert.strictEqual(testFsr.generate, true, 'set to non-matching value')
    })
  })

  describe('ensureDirSync', function () {
    var returnVal

    describe('when generate is true', function () {
      beforeEach(function () {
        fsr.generate = true
        returnVal = fsr.ensureDirSync('some/dir')
      })

      it('should call fse.ensureDirSync with args', function () {
        assert(mocks.fse.ensureDirSync.called, 'fse.ensureDirSync was not called')
        assert(mocks.fse.ensureDirSync.calledWith('some/dir'), 'fse.ensureDirSync was called with unexpected args')
      })

      it('should return true', function () {
        assert.strictEqual(returnVal, true, 'returned unexpected value')
      })
    })

    describe('when generate is false', function () {
      beforeEach(function () {
        fsr.generate = false
        returnVal = fsr.ensureDirSync('some/dir')
      })

      it('should not call fse.ensureDirSync', function () {
        assert(!mocks.fse.ensureDirSync.called, 'fse.ensureDirSync was called')
      })

      it('should return nothing', function () {
        assert.strictEqual(returnVal, undefined, 'returned unexpected value')
      })
    })
  })

  describe('symlinkSync', function () {
    var returnVal

    describe('when generate is true', function () {
      beforeEach(function () {
        fsr.generate = true
        returnVal = fsr.symlinkSync('a', 'b', 3)
      })

      it('should call fs.symlinkSync with args', function () {
        assert(mocks.fs.symlinkSync.called, 'fs.symlinkSync was not called')
        assert(mocks.fs.symlinkSync.calledWith('a', 'b', 3), 'fs.symlinkSync was called with unexpected args')
      })

      it('should return true', function () {
        assert.strictEqual(returnVal, true, 'returned unexpected value')
      })
    })

    describe('when generate is false', function () {
      beforeEach(function () {
        fsr.generate = false
        returnVal = fsr.symlinkSync('a', 'b', 3)
      })

      it('should not call fs.symlinkSync', function () {
        assert(!mocks.fs.symlinkSync.called, 'fs.symlinkSync was called')
      })

      it('should return nothing', function () {
        assert.strictEqual(returnVal, undefined, 'returned unexpected value')
      })
    })
  })

  describe('writeFileSync', function () {
    var returnVal

    describe('when generate is true', function () {
      beforeEach(function () {
        fsr.generate = true
        returnVal = fsr.writeFileSync('a', 'b', 3)
      })

      it('should call fs.writeFileSync with args', function () {
        assert(mocks.fs.writeFileSync.called, 'fs.writeFileSync was not called')
        assert(mocks.fs.writeFileSync.calledWith('a', 'b', 3), 'fs.writeFileSync was called with unexpected args')
      })

      it('should return true', function () {
        assert.strictEqual(returnVal, true, 'returned unexpected value')
      })
    })

    describe('when generate is false', function () {
      beforeEach(function () {
        fsr.generate = false
        returnVal = fsr.writeFileSync('a', 'b', 3)
      })

      it('should not call fs.writeFileSync', function () {
        assert(!mocks.fs.writeFileSync.called, 'fs.writeFileSync was called')
      })

      it('should return nothing', function () {
        assert.strictEqual(returnVal, undefined, 'returned unexpected value')
      })
    })
  })

  describe('openSync', function () {
    var returnVal

    describe('when generate is true', function () {
      beforeEach(function () {
        fsr.generate = true
        returnVal = fsr.openSync('a', 'b', 3)
      })

      it('should call fs.openSync with args', function () {
        assert(mocks.fs.openSync.called, 'fs.openSync was not called')
        assert(mocks.fs.openSync.calledWith('a', 'b', 3), 'fs.openSync was called with unexpected args')
      })

      it('should return true', function () {
        assert.strictEqual(returnVal, true, 'returned unexpected value')
      })
    })

    describe('when generate is false', function () {
      beforeEach(function () {
        fsr.generate = false
        returnVal = fsr.openSync('a', 'b', 3)
      })

      it('should not call fs.openSync', function () {
        assert(!mocks.fs.openSync.called, 'fs.openSync was called')
      })

      it('should return nothing', function () {
        assert.strictEqual(returnVal, undefined, 'returned unexpected value')
      })
    })
  })

  describe('fileExists', function () {
    describe('when the file exists', function () {
      it('should return true', function () {
        var returnVal = fsr.fileExists('some/path/to/file')
        assert(mocks.fs.accessSync.called, 'fs.accessSync was not called')
        assert(mocks.fs.accessSync.calledWith('some/path/to/file'), 'fs.accessSync was called with unexpected args')
        assert.strictEqual(returnVal, true, 'returned unexpected value')
      })
    })

    describe('when the file does not exist (or other error is thrown)', function () {
      it('should return false', function () {
        mocks.fs.accessSync.throws('does not exist')
        var returnVal = fsr.fileExists('some/path/to/file')
        assert(mocks.fs.accessSync.called, 'fs.accessSync was not called')
        assert(mocks.fs.accessSync.calledWith('some/path/to/file'), 'fs.accessSync was called with unexpected args')
        assert.strictEqual(returnVal, false, 'returned unexpected value')
      })
    })
  })
})
