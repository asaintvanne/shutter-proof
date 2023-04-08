// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./PaternitySBT.sol";
import "./ShutterProof.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title ExclusiveRightsNFT manages NTF that represents exclusive rights 
/// @dev Part of ShutterProof
/// @author asaintvanne
contract ExclusiveRightsNFT is ERC721 {

    /// @notice SBT is a PaternitySBT contract address and SBT id
    struct SBT {
        address sbtAddress;
        uint256 tokenId;
    }

    /// @notice ShutterProof contract
    ShutterProof _shutterProof;
    /// @notice Token index
    uint256 public _balance;
    /// @notice Sale price for each NTF
    mapping(uint256 => uint) salePrice;
    /// @notice PaternitySBT for each NTF
    mapping(uint256 => SBT) sbt;

    constructor(ShutterProof shutterProof) ERC721("ShutterProof Exclusive Rights", "SPER")
    {
        _shutterProof = shutterProof;
    }

    modifier onlyOwner(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Caller is not token owner");
        _;
    }

    /// @notice Put in sale a NFT
    /// @param tokenId NFT id
    /// @param price NFT price
    function saleExclusiveRights(uint tokenId, uint price) external onlyOwner(tokenId)
    {
        require(price > 0, "Price must be greater than 0");

        salePrice[tokenId] = price;
        
    }

    /// @notice Remove from sale a NFT
    /// @param tokenId NFT id
    function unsaleExclusiveRights(uint tokenId) external onlyOwner(tokenId)
    {
        salePrice[tokenId] = 0;
    }

    /// @notice Mint a new exclusive rights NFT
    /// @dev Only a ParternitySBT contract can mint a NFT
    /// @param idPaternitySBT PaternitySBT token id
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

    /// @notice Check before transfer
    /// @dev Overrride OpenZeppelin ERC721 _beforeTokenTransfer
    /// @param to Token recipient (others params unused)
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal view override
    {
        require(to == address(0) || _shutterProof.getUser(to).registered, "Receiver must be a Shutterproof user");
    }

    /// @notice Operations after transfer
    /// @dev Overrride OpenZeppelin ERC721 _afterTokenTransfer
    /// @param tokenId NFT id (others params unused)
    function _afterTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override
    {
        salePrice[tokenId] = 0;
    }

    /// @notice Get NFT Price
    /// @dev If price = 0, NFT is not in sale
    /// @param tokenId NFT id
    function getPrice(uint256 tokenId) external view returns(uint256)
    {
        return salePrice[tokenId];
    }

    /// @notice Get NFT PaternitySBT informations
    /// @param tokenId NFT id
    function getSBT(uint tokenId) external view returns(SBT memory)
    {
        return sbt[tokenId];
    }
}