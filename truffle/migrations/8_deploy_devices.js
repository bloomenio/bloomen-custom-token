
var Devices = artifacts.require("Devices");
var Assets = artifacts.require("Assets");
var Strings = artifacts.require("Strings");

module.exports = function(deployer) {
    var _assets;
     deployer
     .then(() => deployer.link(Strings, Devices))
     .then(() => Assets.deployed())
     .then((instance) => {
        _assets = instance;   
        return deployer.deploy(Devices,_assets.address);
      });    
 };
