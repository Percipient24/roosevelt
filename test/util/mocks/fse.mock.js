const sinon = require('sinon')

module.exports = function mockFse () {
  return {
    ensureDirSync: sinon.stub()
  }
}
