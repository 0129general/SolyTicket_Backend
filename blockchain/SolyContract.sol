// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract SolyContract is ERC721A, IERC2981, Ownable {

    bool isScanned = false;

    string public baseURI;
    uint256 public _totalTickets;
    uint256 public _mintPrice;
    string public _name;
    string public _tag;

    mapping(uint256 => string) public mapCidWithNftId; // nftid => cid

    address public adminForMetadata;
    uint256 public constant ROYALTY_PERCENTAGE = 1000; // 10% in basis points (1000 = 10%)

    constructor(
        uint256 totalTickets,
        uint256 mintPrice,
        string memory name,
        string memory tag
    ) ERC721A(name, tag) {
        _totalTickets = totalTickets;
        _mintPrice = mintPrice;
        _name = name;
        _tag = tag;
        baseURI = "ipfs://";
        adminForMetadata = tx.origin;
    }

    function mint() external payable {
        require(totalSupply() < _totalTickets, "Not enough tickets left");
        require(msg.value >= _mintPrice, "Not enough MATIC sent");
        _safeMint(msg.sender, 1);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token doesn't exist");
        return string(abi.encodePacked(baseURI, mapCidWithNftId[tokenId]));
    }

    function addTokenUriForNft(uint256[] memory tokenId, string[] memory _newCID) public {
        require(msg.sender == adminForMetadata, "Not authorized");
        require(tokenId.length == _newCID.length, "Both lengths should be equal");
        for (uint i = 0; i < tokenId.length; i++) {
            mapCidWithNftId[tokenId[i]] = _newCID[i];
        }
    }

    function updateTokenUriForNFT(uint256 tokenId, string memory _newCID) public {
        require(msg.sender == adminForMetadata, "Not authorized");
        mapCidWithNftId[tokenId] = _newCID;
    }

    function reclaim(uint256 tokenId) public onlyOwner {
        address owner = ownerOf(tokenId);
        transferFrom(owner, msg.sender, tokenId);
    }

    function withdraw() external payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setMintRate(uint256 _mintRate) public onlyOwner {
        _mintPrice = _mintRate;
    }

    function setScanned() public onlyOwner {
        isScanned = true;
    }

    function setActive() public onlyOwner {
        // No implementation needed
    }

    // EIP-2981: Royalty Info
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view override returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "Nonexistent token");
        uint256 amount = (salePrice * ROYALTY_PERCENTAGE) / 10000; // basis points calculation
        return (owner(), amount);
    }

    // Override supportsInterface to include IERC2981
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
