// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CosmicLeaderboard
 * @notice On-chain leaderboard for Cosmic Shooter game on Base
 */
contract CosmicLeaderboard {
    struct PlayerScore {
        address player;
        uint256 score;
        uint256 timestamp;
        string nickname;
    }

    struct PlayerData {
        uint256 highScore;
        uint256 lastSubmit;
        uint256 totalGames;
        string nickname;
    }

    // State
    mapping(address => PlayerData) public players;
    PlayerScore[10] public topPlayers;
    uint256 public totalPlayers;

    // Anti-cheat
    uint256 public constant SUBMIT_COOLDOWN = 30 seconds;
    uint256 public constant MAX_SCORE_PER_SESSION = 99999;

    // Events
    event ScoreSubmitted(address indexed player, uint256 score, string nickname);
    event NewHighScore(address indexed player, uint256 score);
    event LeaderboardUpdated(uint8 position, address player, uint256 score);

    // ─── Public Functions ────────────────────────────────────────

    /**
     * @notice Submit a score from a completed game session
     * @param score The score achieved this session
     * @param nickname Display name (max 16 chars)
     */
    function submitScore(uint256 score, string calldata nickname) external {
        require(score > 0, "Score must be positive");
        require(score <= MAX_SCORE_PER_SESSION, "Score too high");
        require(bytes(nickname).length > 0 && bytes(nickname).length <= 16, "Invalid nickname");

        PlayerData storage pd = players[msg.sender];

        // Rate limit: 30s between submissions
        require(
            block.timestamp >= pd.lastSubmit + SUBMIT_COOLDOWN,
            "Please wait before submitting again"
        );

        // First time player
        if (pd.totalGames == 0) {
            totalPlayers++;
        }

        pd.lastSubmit = block.timestamp;
        pd.totalGames++;
        pd.nickname = nickname;

        emit ScoreSubmitted(msg.sender, score, nickname);

        // Update personal best
        if (score > pd.highScore) {
            pd.highScore = score;
            emit NewHighScore(msg.sender, score);
            _updateLeaderboard(msg.sender, score, nickname);
        }
    }

    /**
     * @notice Get top 10 players
     */
    function getTopPlayers() external view returns (PlayerScore[10] memory) {
        return topPlayers;
    }

    /**
     * @notice Get a specific player's data
     */
    function getPlayerData(address player) external view returns (PlayerData memory) {
        return players[player];
    }

    /**
     * @notice Get player's rank (0 = not ranked)
     */
    function getPlayerRank(address player) external view returns (uint8) {
        for (uint8 i = 0; i < 10; i++) {
            if (topPlayers[i].player == player) return i + 1;
        }
        return 0;
    }

    // ─── Internal ────────────────────────────────────────────────

    function _updateLeaderboard(address player, uint256 score, string memory nickname) internal {
        uint8 oldIdx = 10;
        uint8 insertAt = 10;

        for (uint8 i = 0; i < 10; i++) {
            if (topPlayers[i].player == player) {
                oldIdx = i;
            }
            if (insertAt == 10 && score > topPlayers[i].score) {
                insertAt = i;
            }
        }

        if (insertAt == 10) return;

        if (oldIdx != 10) {
            // Player already on board
            if (insertAt < oldIdx) {
                // Move up: shift entries between insertAt and oldIdx
                for (uint8 j = oldIdx; j > insertAt; j--) {
                    topPlayers[j] = topPlayers[j - 1];
                }
                topPlayers[insertAt] = PlayerScore(player, score, block.timestamp, nickname);
            } else {
                // Just update the existing entry (it's already their best spot)
                topPlayers[oldIdx] = PlayerScore(player, score, block.timestamp, nickname);
            }
        } else {
            // New player on board: shift down from insertAt
            for (uint8 i = 9; i > insertAt; i--) {
                topPlayers[i] = topPlayers[i - 1];
            }
            topPlayers[insertAt] = PlayerScore(player, score, block.timestamp, nickname);
        }
        emit LeaderboardUpdated(insertAt, player, score);
    }
}
