// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./ShutterProof.sol";

/// @title PaternitySBT manages SBT that represents paternity rights 
/// @dev Part of ShutterProof
/// @author asaintvanne
contract PaternitySBT {

    /// @notice Contract that manage exclusive rights for this SBT
    ExclusiveRightsNFT exclusiveRightsNFT;
    /// @notice Author of photographies represented by SBT
    address public owner;
    /// @notice Number of SBT
    uint256 public balance;
    /// @notice SBT register
    mapping(uint => string) tokens;

    /// @notice Mint event is emitted when a SBT is minted
    /// @param tokenId SBT id
    event Mint(uint tokenId);


    constructor(address _owner, ExclusiveRightsNFT _exclusiveRightsNFT)
    {
        owner = _owner;
        exclusiveRightsNFT = _exclusiveRightsNFT;
    }

    /// @notice Mint a new paternity rights SBT
    /// @dev Only author can mint a SBT on contract
    /// @param _urlHash IPFS URL hash
    function mint(string calldata _urlHash) external returns(uint256)
    {
        require(owner == msg.sender, "Caller is not owner");

        uint tokenId = balance;
        tokens[tokenId] = _urlHash;
        exclusiveRightsNFT.mint(tokenId);

        balance += 1;

        emit Mint(tokenId);

        return tokenId;
    }

    /// @notice Get contract owner
    function getOwner() external view returns (address)
    {
        return owner;
    }

    /// @notice Get token
    function getToken(uint _tokenId) external view returns(string memory)
    {
        require(_tokenId < balance, "Token doesn't exist");
        
        return tokens[_tokenId];
    }
}