// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

contract PaternitySBT {

    struct Photography {
        string title;
        string description;
        string ipfsHash;
    }

    address public owner;
    uint256 public balance;
    mapping(uint => Photography) tokens;

    constructor(address _owner) {
        owner = _owner;
    }

    function mint(string calldata _title, string calldata _description, string calldata _urlHash) external returns(uint256) {
        require(owner == msg.sender, "Not allowed to mint");

        Photography memory photography = Photography(_title, _description, _urlHash);

        uint tokenId = balance;
        tokens[tokenId] = photography;
        balance += 1;

        return tokenId;
    }

    function getPhotography(uint _tokenId) external view returns(Photography memory)
    {
        require(_tokenId < balance, "Token doesn't exist");
        
        return tokens[_tokenId];
    }
}