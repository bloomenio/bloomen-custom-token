var SafeMath = artifacts.require("SafeMath");
var Address = artifacts.require("Address");
var MovementHistory = artifacts.require("MovementHistory");
var BurnHistory = artifacts.require("BurnHistory");
var ERC223 = artifacts.require("ERC223");

 module.exports = function(deployer) { 
  var _erc223, _movementHistory, _burnHistory ;    
  
     deployer
     .then(() => deployer.link(SafeMath, ERC223))
     .then(() => deployer.link(Address, ERC223))
     .then(() => MovementHistory.deployed())
     .then( (instance) => {  
        _movementHistory= instance;
        return BurnHistory.deployed();
     }).then((instance) => {  
        _burnHistory= instance;      
        return deployer.deploy(ERC223,"JESCoin","JES",2,_movementHistory.address,_burnHistory.address);
     }).then((instance) => {        
        _erc223 = instance;
        return _movementHistory.addWhitelisted(_erc223.address);
      }).then(() => {        
        return _burnHistory.addWhitelisted(_erc223.address);
      });
     
 };
