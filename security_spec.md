# Security Specification: EarForge Leaderboard

## Data Invariants
1. A score must have the correct `userId` matching the authenticated user.
2. The `score` must be between 0 and 100.
3. The `gameMode` must be one of the allowed values.
4. Entries are immutable once created.

## The Dirty Dozen Payloads (Rejections)
1. **Identity Theft**: User A tries to create a score for User B.
2. **Anonymous Spam**: Unauthenticated user tries to post a score.
3. **Score Inflation**: score = 999.
4. **Invalid Mode**: gameMode = "hacker_mode".
5. **Mutation Attack**: Try to update an existing leaderboard entry.
6. **Deletion Attack**: Try to delete an entry.
7. **Negative Accuracy**: score = -1.
8. **Shadow Field**: Adding `isVerified: true` to the score.
9. **Junk ID**: Creating a score with a 2KB document ID.
10. **Timestamp Spoofing**: Sending a client timestamp instead of server timestamp (if forced).
11. **Orphaned User**: (Not strictly applicable here as we don't have a user doc requirement yet, but we'll stick to auth uid).
12. **Mass Querying**: Attempting to list the entire collection without any constraints (though leaderboard usually is a list, we'll ensure it is constrained by gameMode).

## Test Runner (firestore.rules.test.ts)
(Implementation follow in actual file)
