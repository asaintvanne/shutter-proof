// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

contract PaternitySBT {

    address public owner;
    uint256 public balance;
    mapping(uint => string) tokens;

    event Mint(uint);

    constructor(address _owner)
    {
        owner = _owner;
    }

    function mint(string calldata _urlHash) external returns(uint256)
    {
        require(owner == msg.sender, "Not allowed to mint");

        uint tokenId = balance;
        tokens[tokenId] = _urlHash;
        balance += 1;

        emit Mint(tokenId);

        return tokenId;
    }

    function getToken(uint _tokenId) external view returns(string memory)
    {
        require(_tokenId < balance, "Token doesn't exist");
        
        return tokens[_tokenId];
    }
}