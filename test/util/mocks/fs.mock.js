const sinon = require('sinon')

module.exports = function mockFs () {
  return {
    symlinkSync: sinon.stub(),
    writeFileSync: sinon.stub(),
    openSync: sinon.stub(),
    accessSync: sinon.stub()
  }
}
