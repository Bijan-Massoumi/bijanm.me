require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity\/test\/helpers)/
})
require('babel-polyfill')

// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*' // Match any network id
    },
    QA: {
      host: "95.85.46.4",
      port: 8545,
      network_id: "3",
      gas: 2900000,
      from: "0xac9fb7dd2b6b8de46f45e7293b3a41f3aa50e465"
    },
    "live": {
        network_id: 1,
        host: "127.0.0.1",
        port: 8545,
        gas: 2900000,
        gasPrice: 13000000000,
        from: "0x12f308bb7837b507b3cb8d29b6ec974c32806457"
    }

  },


  solc: {
    // Turns on the Solidity optimizer. For development the optimizer's
    // quite helpful, just remember to be careful, and potentially turn it
    // off, for live deployment and/or audit time. For more information,
    // see the Truffle 4.0.0 release notes.
    //
    // https://github.com/trufflesuite/truffle/releases/tag/v4.0.0
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
