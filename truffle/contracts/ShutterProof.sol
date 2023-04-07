// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./PaternitySBT.sol";
import "./ExclusiveRightsNFT.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title ShutterProof 
/// @notice ShutterProof helps photographers and photo user to manage authencity and rights
/// @dev main contract
/// @author asaintvanne
contract ShutterProof is ReentrancyGuard {

    enum UserRole {
        Photographer,
        Client
    }

    struct User {
        PaternitySBT sbt;
        string name;
        UserRole role;
        bytes14 siret;
        bool registered;
    }

    /// @notice ShutterProof users informations
    mapping(address => User) users;

    /// @notice Contract that manage photo exclusive rights
    ExclusiveRightsNFT exclusiveRightsNFT;

    /// @notice UserRegistered event is emitted when a user is registered
    /// @param userAdress New user address
    /// @param role User role
    event UserRegistered(address userAdress, UserRole role);

    /// @dev Deploy exclusiveRightsNFT
    constructor() {
        exclusiveRightsNFT = new ExclusiveRightsNFT(this);
    }

    /// @notice Register sender to be a app user
    /// @param _name User name
    /// @param _siret User SIRET
    /// @param _role User role
    function register(string calldata _name, bytes14 _siret, UserRole _role) external
    {
        User memory user = users[msg.sender];

        require(!user.registered, 'User is already registered');
        require(keccak256(bytes(_name)) != keccak256(bytes("")), "Name cannot be empty");
        require(_siret.length > 0, "SIRET cannot be empty");
        for(uint i = 0; i < 14; i++) {
            require(_siret[i] >= '0' && _siret[i] <= '9', "SIRET is not well formed");
        }

        users[msg.sender].name = _name;
        users[msg.sender].siret = _siret;
        users[msg.sender].role = _role;
        users[msg.sender].registered = true;

        //SBT contract is only created if user is a photographer
        if (_role == UserRole.Photographer) {
            users[msg.sender].sbt = new PaternitySBT(msg.sender, exclusiveRightsNFT);
        }
    }

    /// @notice Get user informations
    /// @param _address User address
    function getUser(address _address) view external returns (User memory)
    {
        return users[_address];
    }

    /// @notice Get user informations
    /// @param _address User address
    function getPaternitySBT(address _address) view external returns(PaternitySBT)
    {
        require(address(users[_address].sbt) != address(0), "User has no PaternitySBT contract");

        return users[_address].sbt;
    }

    /// @notice Buy a NFT that represents exclusive rights
    /// @param tokenId NFT id (in exclusiveRightsNFT contract)
    function buyExclusiveRights(uint256 tokenId) nonReentrant payable external
    {
        require(users[msg.sender].registered, "Call is not registered");

        uint price = exclusiveRightsNFT.getPrice(tokenId);
        require(price > 0, "Photography is not for sale");
        require(msg.value >= price, "Insufficient payment");

        address seller = exclusiveRightsNFT.ownerOf(tokenId);
        exclusiveRightsNFT.safeTransferFrom(seller, msg.sender, tokenId);

        (bool success1, ) = seller.call{value: price}("");
        require(success1, "Transfer to seller failed");

        uint256 refund = msg.value - price;
        if (refund > 0) {
            (bool success2, ) = msg.sender.call{value: refund}("");
            require(success2, "Refund to buyer failed");
        }
    }

    /// @notice Get the contract that manage exclusive rights
    function getExclusiveRightsNFT() view external returns(ExclusiveRightsNFT)
    {
        return exclusiveRightsNFT;
    }
}
