// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Raffle.sol";

/**
 * @title RaffleFactory
 * @notice Factory contract for creating and managing Raffle instances
 * @dev Implements Ownable for admin functions and ReentrancyGuard for secure raffle creation
 */
contract RaffleFactory is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    /// @notice Platform fee percentage (basis points: 250 = 2.5%)
    uint256 public platformFee;
    
    /// @notice Platform wallet to receive fees
    address public platformWallet;
    
    /// @notice Minimum raffle duration (1 hour)
    uint256 public constant MIN_DURATION = 1 hours;
    
    /// @notice Maximum raffle duration (30 days)
    uint256 public constant MAX_DURATION = 30 days;
    
    /// @notice All created raffles
    address[] public allRaffles;
    
    /// @notice Raffles created by each address
    mapping(address => address[]) public rafflesByCreator;
    
    /// @notice Check if address is a valid raffle
    mapping(address => bool) public isValidRaffle;
    
    /// @notice Track if factory is paused
    bool public isPaused;
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a new raffle is created
     * @param raffleAddress Address of the newly created raffle
     * @param creator Address of the raffle creator
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets available
     * @param duration Duration of the raffle in seconds
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
     * @notice Emitted when platform fee is updated
     * @param oldFee Previous platform fee
     * @param newFee New platform fee
     */
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    /**
     * @notice Emitted when platform wallet is updated
     * @param oldWallet Previous platform wallet address
     * @param newWallet New platform wallet address
     */
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    
    /**
     * @notice Emitted when factory is paused
     */
    event FactoryPaused();
    
    /**
     * @notice Emitted when factory is unpaused
     */
    event FactoryUnpaused();
    
    // ============ Custom Errors ============
    
    /// @notice Thrown when factory is paused
    error FactoryIsPaused();
    
    /// @notice Thrown when platform fee exceeds maximum (10%)
    error InvalidPlatformFee();
    
    /// @notice Thrown when platform wallet is zero address
    error InvalidPlatformWallet();
    
    /// @notice Thrown when ticket price is zero
    error InvalidTicketPrice();
    
    /// @notice Thrown when max tickets is less than or equal to 1
    error InvalidMaxTickets();
    
    /// @notice Thrown when duration is outside valid range
    error InvalidDuration();
    
    /// @notice Thrown when minimum tickets is invalid
    error InvalidMinimumTickets();
    
    /// @notice Thrown when no prize amount is sent
    error InvalidPrizeAmount();
    
    // ============ Modifiers ============
    
    /**
     * @notice Ensures factory is not paused
     */
    modifier whenNotPaused() {
        if (isPaused) revert FactoryIsPaused();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Initialize the RaffleFactory
     * @param _platformWallet Address to receive platform fees
     * @param _platformFee Platform fee in basis points (e.g., 250 = 2.5%)
     */
    constructor(address _platformWallet, uint256 _platformFee) Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert InvalidPlatformWallet();
        if (_platformFee > 1000) revert InvalidPlatformFee(); // Max 10%
        
        platformWallet = _platformWallet;
        platformFee = _platformFee;
        isPaused = false;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create a new raffle
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTickets Maximum number of tickets that can be sold
     * @param _duration Duration of the raffle in seconds
     * @param _minimumTickets Minimum tickets required for raffle to be valid
     * @return raffleAddress Address of the newly created raffle
     */
    function createRaffle(
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        uint256 _minimumTickets
    ) external payable nonReentrant whenNotPaused returns (address raffleAddress) {
        // Validations
        if (_ticketPrice == 0) revert InvalidTicketPrice();
        if (_maxTickets <= 1) revert InvalidMaxTickets();
        if (_duration < MIN_DURATION || _duration > MAX_DURATION) revert InvalidDuration();
        if (_minimumTickets == 0 || _minimumTickets > _maxTickets) revert InvalidMinimumTickets();
        if (msg.value == 0) revert InvalidPrizeAmount();
        
        // Deploy new Raffle contract
        Raffle newRaffle = new Raffle{value: msg.value}(
            msg.sender,
            _ticketPrice,
            _maxTickets,
            _duration,
            _minimumTickets,
            platformWallet
        );
        
        raffleAddress = address(newRaffle);
        
        // Track the raffle
        allRaffles.push(raffleAddress);
        rafflesByCreator[msg.sender].push(raffleAddress);
        isValidRaffle[raffleAddress] = true;
        
        emit RaffleCreated(
            raffleAddress,
            msg.sender,
            _ticketPrice,
            _maxTickets,
            _duration,
            msg.value
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get total number of raffles created
     * @return uint256 Total raffle count
     */
    function getTotalRaffles() external view returns (uint256) {
        return allRaffles.length;
    }
    
    /**
     * @notice Get all raffles created by a specific address
     * @param _creator Address of the creator
     * @return address[] Array of raffle addresses
     */
    function getRafflesByCreator(address _creator) external view returns (address[] memory) {
        return rafflesByCreator[_creator];
    }
    
    /**
     * @notice Get all raffle addresses
     * @return address[] Array of all raffle addresses
     */
    function getAllRaffles() external view returns (address[] memory) {
        return allRaffles;
    }
    
    /**
     * @notice Get paginated list of raffles
     * @param _offset Starting index
     * @param _limit Number of raffles to return
     * @return address[] Array of raffle addresses
     */
    function getRafflesPaginated(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 totalRaffles = allRaffles.length;
        if (_offset >= totalRaffles) {
            return new address[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > totalRaffles) {
            end = totalRaffles;
        }
        
        uint256 length = end - _offset;
        address[] memory result = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = allRaffles[_offset + i];
        }
        
        return result;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update platform fee (only owner)
     * @param _newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert InvalidPlatformFee(); // Max 10%
        
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice Update platform wallet (only owner)
     * @param _newWallet New platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidPlatformWallet();
        
        address oldWallet = platformWallet;
        platformWallet = _newWallet;
        
        emit PlatformWalletUpdated(oldWallet, _newWallet);
    }
    
    /**
     * @notice Pause the factory (only owner)
     */
    function pauseFactory() external onlyOwner {
        isPaused = true;
        emit FactoryPaused();
    }
    
    /**
     * @notice Unpause the factory (only owner)
     */
    function unpauseFactory() external onlyOwner {
        isPaused = false;
        emit FactoryUnpaused();
    }
}
