
var RLPReader = artifacts.require("RLPReader");
var Schemas = artifacts.require("Schemas");

module.exports = function(deployer,network) {
    deployer
    .then(() => deployer.link(RLPReader, Schemas))
    .then(() => {
        return deployer.deploy(Schemas);
    })
    .then((schemas) => {
        return schemas.addWhitelisted(deployer.networks[network].from);    
    });
    
 };
