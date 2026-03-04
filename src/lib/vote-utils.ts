/**
 * Returns true if voting is currently open for the given week.
 */
export function isVotingOpen(votingCloseAt: string | null | undefined): boolean {
  if (!votingCloseAt) return false;
  return new Date(votingCloseAt) > new Date();
}

/**
 * Masks vote_count to 0 if voting is still open, preventing result inference.
 */
export function maskVoteCount(voteCount: number, votingCloseAt: string | null | undefined): number {
  return isVotingOpen(votingCloseAt) ? 0 : voteCount;
}
