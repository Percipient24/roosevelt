const sinon = require('sinon')

// _log and _console are not part of the regular API
//   they are exposed here for testing purposes only
module.exports = function mockWinston () {
  return {
    _log: sinon.stub(),
    _console: null,
    createLogger: function (config) {
      this._console = config.transports[0]
      return {
        log: this._log
      }
    },
    format: {
      combine: sinon.stub(),
      printf: sinon.stub()
    },
    transports: {
      Console: sinon.stub()
    }
  }
}
