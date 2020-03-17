pragma solidity ^0.5.2;

import "solidity-rlp/contracts/RLPReader.sol";
import "bloomen-wallet/bloomen-wallet-truffle/contracts/bloomen/dapp/lib/Strings.sol";

import "bloomen-token/contracts/MovementHistory.sol";
import "bloomen-token/contracts/BurnHistory.sol";

import "bloomen-token/contracts/ERC223.sol";

import "bloomen-wallet/bloomen-wallet-truffle/contracts/bloomen/PrepaidCardManager.sol";

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
