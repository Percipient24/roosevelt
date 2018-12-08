module.exports = function fakeParams () {
  const defaultLogging = {
    http: true,
    appStatus: true,
    warnings: true,
    verbose: false
  }
  return {
    base: function () {
      return {
        generateFolderStructure: true,
        logging: defaultLogging,
        js: {
          bundler: {
            bundles: [],
            expose: {}
          }
        }
      }
    },
    emptyJsBundle: function () {
      return {
        generateFolderStructure: true,
        logging: defaultLogging,
        js: {
          bundler: {
            bundles: [],
            expose: {}
          }
        }
      }
    },
    multiJsBundle: function () {
      return {
        generateFolderStructure: true,
        logging: defaultLogging,
        js: {
          bundler: {
            bundles: [
              {
                env: 'dev',
                files: [],
                params: {
                  paths: []
                },
                outputFile: 'b1.js'
              },
              {
                files: [],
                params: {
                  paths: []
                },
                outputFile: 'b2.js'
              }
            ],
            expose: false
          }
        }
      }
    }
  }
}
