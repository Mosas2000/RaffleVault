// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Raffle
 * @notice A decentralized raffle contract where users can purchase tickets for a chance to win ETH prizes
 * @dev Implements ReentrancyGuard for secure fund transfers, Pausable for emergency stops, and Ownable for access control
 */
contract Raffle is ReentrancyGuard, Pausable, Ownable {
    
    // ============ State Variables ============
    
    /// @notice Address of the raffle creator
    address public creator;
    
    /// @notice Price per ticket in wei
    uint256 public ticketPrice;
    
    /// @notice Maximum number of tickets available for this raffle
    uint256 public maxTickets;
    
    /// @notice Unix timestamp when the raffle ends
    uint256 public endTime;
    
    /// @notice Total prize amount in wei
    uint256 public prizeAmount;
    
    /// @notice Minimum tickets required to be sold for raffle to proceed
    uint256 public minimumTickets;
    
    /// @notice Total number of tickets sold
    uint256 public totalTicketsSold;
    
    /// @notice Array of all participant addresses
    address[] public participants;
    
    /// @notice Mapping of user address to number of tickets they own
    mapping(address => uint256) public ticketCount;
    
    /// @notice Address of the winner (zero address if not yet selected)
    address public winner;
    
    /// @notice Whether the prize has been claimed by the winner
    bool public prizeClaimed;
    
    /// @notice Platform fee in basis points (250 = 2.5%)
    uint256 public constant PLATFORM_FEE = 250;
    
    /// @notice Address that receives platform fees
    address public immutable platformWallet;
    
    /// @notice Current state of the raffle
    RaffleState public state;
    
    // ============ Enums ============
    
    /**
     * @notice Possible states of a raffle
     * @dev Active: Raffle is accepting ticket purchases
     * @dev Drawing: Raffle has ended and winner is being selected
     * @dev Completed: Winner has been selected and prize claimed
     * @dev Cancelled: Raffle was cancelled and refunds are available
     */
    enum RaffleState { Active, Drawing, Completed, Cancelled }
    
    // ============ Events ============
    
    /**
     * @notice Emitted when a new raffle is created
     * @param creator Address of the raffle creator
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets available
     * @param endTime Unix timestamp when raffle ends
     */
    event RaffleCreated(address indexed creator, uint256 ticketPrice, uint256 maxTickets, uint256 endTime);
    
    /**
     * @notice Emitted when tickets are purchased
     * @param buyer Address of the ticket buyer
     * @param amount Number of tickets purchased
     * @param totalTickets Total tickets this buyer now owns
     */
    event TicketPurchased(address indexed buyer, uint256 amount, uint256 totalTickets);
    
    /**
     * @notice Emitted when a winner is selected
     * @param winner Address of the winner
     * @param prizeAmount Amount of prize in wei
     */
    event WinnerSelected(address indexed winner, uint256 prizeAmount);
    
    /**
     * @notice Emitted when the prize is claimed
     * @param winner Address of the winner claiming the prize
     * @param amount Amount claimed in wei
     */
    event PrizeClaimed(address indexed winner, uint256 amount);
    
    /**
     * @notice Emitted when a raffle is cancelled
     * @param creator Address of the raffle creator
     */
    event RaffleCancelled(address indexed creator);
    
    // ============ Custom Errors ============
    
    /// @notice Thrown when ticket price is zero or invalid
    error InvalidTicketPrice();
    
    /// @notice Thrown when max tickets is less than or equal to 1
    error InvalidMaxTickets();
    
    /// @notice Thrown when duration is less than 1 hour or more than 30 days
    error InvalidDuration();
    
    /// @notice Thrown when minimum tickets is zero or exceeds max tickets
    error InvalidMinimumTickets();
    
    /// @notice Thrown when raffle is not in Active state
    error RaffleNotActive();
    
    /// @notice Thrown when raffle end time has passed
    error RaffleEnded();
    
    /// @notice Thrown when ticket amount is invalid (zero or negative)
    error InvalidTicketAmount();
    
    /// @notice Thrown when payment amount doesn't match required amount
    error InvalidPayment();
    
    /// @notice Thrown when ticket purchase would exceed max tickets
    error ExceedsMaxTickets();
    
    /// @notice Thrown when caller is not the raffle creator
    error OnlyCreator();
    
    /// @notice Thrown when caller is not the winner
    error OnlyWinner();
    
    /// @notice Thrown when prize has already been claimed
    error PrizeAlreadyClaimed();
    
    // ============ Modifiers ============
    
    /**
     * @notice Restricts function access to only the raffle creator
     */
    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }
    
    /**
     * @notice Restricts function access to only the raffle winner
     */
    modifier onlyWinner() {
        if (msg.sender != winner) revert OnlyWinner();
        _;
    }
    
    /**
     * @notice Ensures raffle is active and hasn't ended
     */
    modifier raffleActive() {
        if (state != RaffleState.Active) revert RaffleNotActive();
        if (block.timestamp >= endTime) revert RaffleEnded();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @notice Creates a new raffle
     * @param _creator Address of the raffle creator
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTickets Maximum number of tickets available
     * @param _duration Duration of the raffle in seconds
     * @param _minimumTickets Minimum tickets required to be sold
     * @param _platformWallet Address that receives platform fees
     * @dev Requires ETH to be sent as the prize amount
     */
    constructor(
        address _creator,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration,
        uint256 _minimumTickets,
        address _platformWallet
    ) Ownable(_creator) payable {
        // Validations
        if (_ticketPrice == 0) revert InvalidTicketPrice();
        if (_maxTickets <= 1) revert InvalidMaxTickets();
        if (_duration < 1 hours || _duration > 30 days) revert InvalidDuration();
        if (_minimumTickets == 0 || _minimumTickets > _maxTickets) revert InvalidMinimumTickets();
        if (msg.value == 0) revert InvalidPayment();
        
        creator = _creator;
        ticketPrice = _ticketPrice;
        maxTickets = _maxTickets;
        endTime = block.timestamp + _duration;
        minimumTickets = _minimumTickets;
        prizeAmount = msg.value;
        platformWallet = _platformWallet;
        state = RaffleState.Active;
        
        emit RaffleCreated(_creator, _ticketPrice, _maxTickets, endTime);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Check if an address is already a participant
     * @param _user Address to check
     * @return bool True if user has purchased at least one ticket
     */
    function _isParticipant(address _user) internal view returns (bool) {
        return ticketCount[_user] > 0;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Purchase raffle tickets
     * @dev Adds buyer to participants array on first purchase, updates ticket counts
     * @param _amount Number of tickets to purchase
     */
    function buyTickets(uint256 _amount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        raffleActive 
    {
        // Validations
        if (_amount == 0) revert InvalidTicketAmount();
        if (msg.value != ticketPrice * _amount) revert InvalidPayment();
        if (totalTicketsSold + _amount > maxTickets) revert ExceedsMaxTickets();
        
        // Add to participants if new buyer
        if (!_isParticipant(msg.sender)) {
            participants.push(msg.sender);
        }
        
        // Update ticket counts
        ticketCount[msg.sender] += _amount;
        totalTicketsSold += _amount;
        
        emit TicketPurchased(msg.sender, _amount, totalTicketsSold);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Returns comprehensive information about the raffle
     * @return _creator Address of the raffle creator
     * @return _ticketPrice Price per ticket in wei
     * @return _maxTickets Maximum number of tickets
     * @return _endTime Unix timestamp when raffle ends
     * @return _prizeAmount Total prize amount in wei
     * @return _minimumTickets Minimum tickets required
     * @return _totalTicketsSold Number of tickets sold so far
     * @return _state Current raffle state
     * @return _winner Address of winner (zero address if not selected)
     */
    function getRaffleInfo() external view returns (
        address _creator,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _endTime,
        uint256 _prizeAmount,
        uint256 _minimumTickets,
        uint256 _totalTicketsSold,
        RaffleState _state,
        address _winner
    ) {
        return (
            creator,
            ticketPrice,
            maxTickets,
            endTime,
            prizeAmount,
            minimumTickets,
            totalTicketsSold,
            state,
            winner
        );
    }
    
    /**
     * @notice Returns array of all participant addresses
     * @return Array of participant addresses
     */
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    /**
     * @notice Returns number of tickets owned by a specific user
     * @param _user Address of the user to query
     * @return Number of tickets owned by the user
     */
    function getTicketCount(address _user) external view returns (uint256) {
        return ticketCount[_user];
    }
    
    /**
     * @notice Checks if the raffle is currently active
     * @return True if raffle is active and hasn't ended, false otherwise
     */
    function isActive() external view returns (bool) {
        return state == RaffleState.Active && block.timestamp < endTime;
    }
    
    /**
     * @notice Returns time remaining until raffle ends
     * @return Seconds remaining (0 if raffle has ended)
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }
    
    /**
     * @notice Returns total number of unique participants
     * @return Number of unique participants
     */
    function getTotalParticipants() external view returns (uint256) {
        return participants.length;
    }
}
