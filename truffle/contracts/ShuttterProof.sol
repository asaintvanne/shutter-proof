// SPDX-License-Identifier: MIT

import "./PaternitySBT.sol";

pragma solidity >=0.4.22 <0.9.0;

contract ShutterProof {

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

    event UserRegistered(address, UserRole);

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

        if (_role == UserRole.Photographer) {
            users[msg.sender].sbt = new PaternitySBT(msg.sender);
        }
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
}
