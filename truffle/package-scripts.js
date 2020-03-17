require('dotenv').config();


module.exports = {
  scripts: {
    development: 'truffle migrate --reset ',
    export: 'copyfiles -f build/contracts/*.json ../cli/src/contracts'
  }
};