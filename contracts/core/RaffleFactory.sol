// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Raffle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title RaffleFactory
 * @notice Factory contract for creating and managing raffles
 * @dev Implements Ownable for access control and Pausable for emergency stops
 */
contract RaffleFactory is Ownable, Pausable {
    
    // ============ State Variables ============
    
    /// @notice Raffle implementation contract for cloning
    address public immutable raffleImplementation;
    
    /// @notice Platform wallet that receives fees
    address public platformWallet;
    
    /// @notice Platform fee in basis points (250 = 2.5%)
    uint256 public platformFee;
    
    /// @notice Array of all created raffle addresses
    address[] public allRaffles;
    
    /// @notice Mapping of creator address to their raffle addresses
    mapping(address => address[]) public rafflesByCreator;
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a new raffle is created
     * @param raffleAddress Address of the newly created raffle
     * @param creator Address of the raffle creator
     * @param ticketPrice Price per ticket
     * @param maxTickets Maximum number of tickets
     * @param duration Duration in seconds
     * @param prizeAmount Prize amount in wei
     */
    event RaffleCreated(
        address indexed raffleAddress,
        address indexed creator,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 duration,
        uint256 prizeAmount
    );
    
    /**
     * @notice Emitted when platform wallet is updated
     * @param oldWallet Previous platform wallet address
     * @param newWallet New platform wallet address
     */
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);
    
    /**
     * @notice Emitted when platform fee is updated
     * @param oldFee Previous platform fee
     * @param newFee New platform fee
     */
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ============ Custom Errors ============
    
    /// @notice Thrown when platform wallet is zero address
    error InvalidPlatformWallet();
    
    /// @notice Thrown when platform fee exceeds maximum (10%)
    error InvalidPlatformFee();
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the RaffleFactory
     * @param _platformWallet Address that receives platform fees
     * @param _platformFee Platform fee in basis points (max 1000 = 10%)
     */
    constructor(address _platformWallet, uint256 _platformFee) Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert InvalidPlatformWallet();
        if (_platformFee > 1000) revert InvalidPlatformFee(); // Max 10%
        
        platformWallet = _platformWallet;
        platformFee = _platformFee;
        
        // Deploy implementation contract
        raffleImplementation = address(new Raffle());
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create a new raffle
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTickets Maximum number of tickets
     * @param _duration Duration of the raffle in seconds
     * @param _minimumTickets Minimum tickets required to be sold
     * @return raffleAddress Address of the newly created raffle
     */
    function createRaffle(
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        uint256 _minimumTickets
    ) external payable whenNotPaused returns (address raffleAddress) {
        // Clone implementation (massive gas savings!)
        raffleAddress = Clones.clone(raffleImplementation);
        
        // Initialize the clone
        Raffle(raffleAddress).initialize{value: msg.value}(
            msg.sender,
            _ticketPrice,
            _maxTickets,
            _duration,
            _minimumTickets,
            platformWallet
        );
        
        // Store raffle address
        allRaffles.push(raffleAddress);
        rafflesByCreator[msg.sender].push(raffleAddress);
        
        emit RaffleCreated(
            raffleAddress,
            msg.sender,
            _ticketPrice,
            _maxTickets,
            _duration,
            msg.value
        );
    }
    
    /**
     * @notice Update platform wallet address
     * @param _newWallet New platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidPlatformWallet();
        
        address oldWallet = platformWallet;
        platformWallet = _newWallet;
        
        emit PlatformWalletUpdated(oldWallet, _newWallet);
    }
    
    /**
     * @notice Update platform fee
     * @param _newFee New platform fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert InvalidPlatformFee();
        
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice Pause the factory (prevents new raffle creation)
     */
    function pauseFactory() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the factory
     */
    function unpauseFactory() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get all raffle addresses
     * @return Array of all raffle addresses
     */
    function getAllRaffles() external view returns (address[] memory) {
        return allRaffles;
    }
    
    /**
     * @notice Get raffles created by a specific address
     * @param _creator Address of the creator
     * @return Array of raffle addresses created by the creator
     */
    function getRafflesByCreator(address _creator) external view returns (address[] memory) {
        return rafflesByCreator[_creator];
    }
    
    /**
     * @notice Get total number of raffles created
     * @return Total number of raffles
     */
    function getTotalRaffles() external view returns (uint256) {
        return allRaffles.length;
    }
}
