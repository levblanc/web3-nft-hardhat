// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import 'base64-sol/base64.sol';

error DynamicSvgNFT__TokenNotExsit();

contract DynamicSvgNFT is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImgURI;
    string private s_highImgURI;
    mapping(uint256 => int256) private s_tokenIdToHighValue;
    AggregatorV3Interface internal immutable i_priceFeed;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSVG,
        string memory highSVG
    ) ERC721('Dynamic SVG NFT', 'DSN') {
        s_tokenCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
        s_lowImgURI = svgToImgURI(lowSVG);
        s_highImgURI = svgToImgURI(highSVG);
    }

    function svgToImgURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory base64ImgPrefix = 'data:image/svb+xml;base64,';
        string memory base64EncodedSVG = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );

        return string(abi.encodePacked(base64ImgPrefix, base64EncodedSVG));
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert DynamicSvgNFT__TokenNotExsit();
        }
        string memory base64JsonPrefix = 'data:application/json;base64,';
        string memory imageURI = s_lowImgURI;

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highImgURI;
        }

        return
            string(
                abi.encodePacked(
                    base64JsonPrefix,
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function mintNFT(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter = s_tokenCounter + 1;

        _safeMint(msg.sender, s_tokenCounter);

        emit CreatedNFT(s_tokenCounter, highValue);
    }
}
