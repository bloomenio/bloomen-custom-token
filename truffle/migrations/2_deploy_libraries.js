var Address = artifacts.require("Address");
var SafeMath = artifacts.require("SafeMath");
var RLPReader = artifacts.require("RLPReader");
var Strings = artifacts.require("Strings");

 module.exports = function(deployer) {
    deployer.deploy([SafeMath,RLPReader,Address,Strings]);
 };
