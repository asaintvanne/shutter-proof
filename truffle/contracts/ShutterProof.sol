// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "./PaternitySBT.sol";
import "./ExclusiveRightsNFT.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ShutterProof is ReentrancyGuard {

    using Address for address;

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

    mapping(address => User) users;
    ExclusiveRightsNFT exclusiveRightsNFT;

    event UserRegistered(address, UserRole);

    constructor() {
        exclusiveRightsNFT = new ExclusiveRightsNFT(this);
    }

    function register(string calldata _name, bytes14 _siret, UserRole _role) external
    {
        require(!msg.sender.isContract(), "Contract cannot be registered");

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

        if (_role == UserRole.Photographer) {
            users[msg.sender].sbt = new PaternitySBT(msg.sender, exclusiveRightsNFT);
        }
    }

    function getUser() view external returns (User memory)
    {
        return users[msg.sender];
    }

    function getUser(address _address) view external returns (User memory)
    {
        return users[_address];
    }

    function isRegistered() view external returns (bool)
    {
        return users[msg.sender].registered;
    }

    function getRole() view external returns (UserRole)
    {
        require(users[msg.sender].registered, "User is not registered");

        return users[msg.sender].role;
    }

    function getPaternitySBT(address _user) view external returns(PaternitySBT)
    {
        require(address(users[_user].sbt) != address(0), "Use has no SBT contract");

        return users[_user].sbt;
    }

    function buyExclusiveRights(uint256 tokenId) nonReentrant payable external
    {
        uint price = exclusiveRightsNFT.getPrice(tokenId);
        require(price > 0, "Photography is not for sale");
        require(msg.value >= price, "Insufficient payment");

        address seller = exclusiveRightsNFT.ownerOf(tokenId);
        exclusiveRightsNFT.safeTransferFrom(seller, msg.sender, tokenId);

        (bool success1, ) = seller.call{value: msg.value}("");
        require(success1, "Transfer to seller failed");

        uint256 refund = msg.value - price;
        if (refund > 0) {
            (bool success2, ) = msg.sender.call{value: refund}("");
            require(success2, "Refund to buyer failed");
        }
    }

    function getExclusiveRightsNFT() view external returns(ExclusiveRightsNFT)
    {
        return exclusiveRightsNFT;
    }
}
