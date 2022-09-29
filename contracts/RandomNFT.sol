// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

error RandomNFT__RangeOutOfBounds();
error RandomNFT__MintFeeNotEnough();
error RandomNFT__WithdrawFailed();

contract RandomNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // When we mint an NFT
    // we will trigger a Chainlink VRF call to get us a random number
    // Using that random number, we will get a random NFT
    // Pug: super rare
    // Shiba: sort of rare
    // St. Bernard: common

    // Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane; // keyHash
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint16 private constant NUM_OF_WORDS = 1;

    // VRF Helper
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    Breed internal s_dogBreed;
    string[] internal s_dogTokenURIs;
    uint256 internal immutable i_mintFee;

    // Events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[3] memory dogTokenURIs,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721('Random IPFS NFT', 'RIN') {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenURIs = dogTokenURIs;
        i_mintFee = mintFee;
    }

    // Users have to pay to mint an NFT
    // function requestNFT() public payable returns (uint256 requestId) {
    function requestNFT() public payable {
        if (msg.value < i_mintFee) {
            revert RandomNFT__MintFeeNotEnough();
        }

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // keyHash
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_OF_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;

        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        s_dogBreed = getBreedFromModdedRng(moddedRng);
        // Update token counter
        s_tokenCounter += s_tokenCounter; // => s_tokenCounter + 1

        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURIs[uint256(s_dogBreed)]);

        emit NFTMinted(s_dogBreed, dogOwner);
    }

    // The owner of the contract can withdraw the ETH
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}('');

        if (!success) {
            revert RandomNFT__WithdrawFailed();
        }
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getBreedFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Breed)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }

        revert RandomNFT__RangeOutOfBounds();
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getOwner(uint256 requestId) public view returns (address) {
        return s_requestIdToSender[requestId];
    }

    function getDogBreed() public view returns (uint256) {
        return uint256(s_dogBreed);
    }

    function getDogTokenURI(uint256 index) public view returns (string memory) {
        return s_dogTokenURIs[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
