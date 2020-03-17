var MovementHistory = artifacts.require("MovementHistory");
var BurnHistory = artifacts.require("BurnHistory");

 module.exports = function(deployer) {
   deployer.deploy([MovementHistory,BurnHistory]);
 };
