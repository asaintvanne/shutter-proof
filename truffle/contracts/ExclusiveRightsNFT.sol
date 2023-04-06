// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./PaternitySBT.sol";
import "./ShutterProof.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ExclusiveRightsNFT is ERC721 {

    ShutterProof _shutterProof;
    uint256 private _balance;

    struct SBT {
        address sbtAddress;
        uint256 tokenId;
    }

    mapping(uint256 => uint) salePrice;
    mapping(uint256 => SBT) sbt;

    constructor(ShutterProof shutterProof) ERC721("ShutterProof Exclusive Rights", "SPER")
    {
        _shutterProof = shutterProof;
    }

    modifier onlyOwner(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Caller is not owner");
        _;
    }

    function saleExclusiveRights(uint tokenId, uint price) external onlyOwner(tokenId)
    {
        require(price > 0, "Price must be greater than 0");

        salePrice[tokenId] = price;
        
    }

    function unsaleExclusiveRights(uint tokenId) external onlyOwner(tokenId)
    {
        require(ownerOf(tokenId) == msg.sender, "Caller is not owner");

        salePrice[tokenId] = 0;
    }

    function mint(uint idPaternitySBT) external 
    {
        PaternitySBT paternitySBT = PaternitySBT(msg.sender);
        address owner = paternitySBT.getOwner();

        require(msg.sender == address(_shutterProof.getUser(owner).sbt), "Caller is not allowed to mint");

        _mint(owner, _balance);
        
        sbt[_balance].tokenId = idPaternitySBT;
        sbt[_balance].sbtAddress = msg.sender;

        _balance += 1;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal view override
    {
        require(to == address(0) || _shutterProof.getUser(to).registered, "Receiver must be a Shutterproof user");
    }

    function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override
    {
        salePrice[tokenId] = 0;
    }

    function getPrice(uint256 tokenId) external view returns(uint256)
    {
        return salePrice[tokenId];
    }

    function getSBT(uint tokenId) external view returns(SBT memory)
    {
        return sbt[tokenId];
    }
}