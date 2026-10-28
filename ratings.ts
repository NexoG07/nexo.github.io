import { useState, useEffect, useCallback } from 'react';

interface RatingRecord {
  upvotes: number;
  downvotes: number;
}

interface UserVoteRecord {
  [gameId: string]: 'up' | 'down';
}

const DEFAULT_LOCAL_RATINGS: Record<string, RatingRecord> = {
  'ultra-chess': { upvotes: 384, downvotes: 12 },
  'space-waves': { upvotes: 295, downvotes: 8 },
  'minecraft': { upvotes: 420, downvotes: 14 },
  'level-devil': { upvotes: 310, downvotes: 18 },
  'drift-hunters': { upvotes: 275, downvotes: 11 },
  'drive-mad': { upvotes: 260, downvotes: 9 },
  'retro-bowl': { upvotes: 240, downvotes: 15 },
  'golf-hit': { upvotes: 210, downvotes: 9 },
  'granny': { upvotes: 345, downvotes: 16 },
  'smashkart': { upvotes: 198, downvotes: 12 },
  'subwaysurfers-city': { upvotes: 215, downvotes: 14 },
  'tunnel-rush': { upvotes: 190, downvotes: 10 },
  'ovo': { upvotes: 185, downvotes: 7 },
  'hole-io': { upvotes: 192, downvotes: 13 },
  'basketball-bros': { upvotes: 168, downvotes: 9 },
  'football-bros': { upvotes: 154, downvotes: 8 },
  'super-liquid-soccer': { upvotes: 142, downvotes: 11 },
  'rocketgoal-io': { upvotes: 178, downvotes: 12 },
  'traffic-rally': { upvotes: 135, downvotes: 9 },
  'dash-masters': { upvotes: 128, downvotes: 7 },
  'wacky-flip': { upvotes: 146, downvotes: 8 },
  'hill-sprint': { upvotes: 132, downvotes: 6 },
  'bike-xtreme': { upvotes: 150, downvotes: 9 },
  'airborne-bmx': { upvotes: 124, downvotes: 7 },
  'bloxity': { upvotes: 184, downvotes: 9 },
  'veck-io': { upvotes: 142, downvotes: 11 },
  'escaperoad': { upvotes: 134, downvotes: 10 },
  'stickman-hook': { upvotes: 122, downvotes: 8 },
  'geometry-dash': { upvotes: 175, downvotes: 18 },
  'slowroads': { upvotes: 118, downvotes: 7 },
};

export function useRatings() {
  const [ratings, setRatings] = useState<Record<string, RatingRecord>>(() => {
    try {
      const stored = localStorage.getItem('nexo_ratings');
      return stored ? { ...DEFAULT_LOCAL_RATINGS, ...JSON.parse(stored) } : DEFAULT_LOCAL_RATINGS;
    } catch {
      return DEFAULT_LOCAL_RATINGS;
    }
  });

  const [userVotes, setUserVotes] = useState<UserVoteRecord>(() => {
    try {
      const stored = localStorage.getItem('nexo_user_votes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Fetch latest ratings from server
  useEffect(() => {
    fetch('/api/ratings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRatings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const getRating = useCallback(
    (gameId: string) => {
      const record = ratings[gameId] || { upvotes: 15, downvotes: 1 };
      const total = record.upvotes + record.downvotes;
      const percentage = total > 0 ? Math.round((record.upvotes / total) * 100) : 95;
      return {
        upvotes: record.upvotes,
        downvotes: record.downvotes,
        total,
        percentage,
        userVote: userVotes[gameId] || null,
      };
    },
    [ratings, userVotes]
  );

  const vote = useCallback(
    async (gameId: string, type: 'up' | 'down') => {
      const currentVote = userVotes[gameId];
      let newVote: 'up' | 'down' | null = type;
      let actionType: string = type;

      if (currentVote === type) {
        // Toggle off
        newVote = null;
        actionType = `un-${type}`;
      }

      // Optimistic update
      setUserVotes((prev) => {
        const next = { ...prev };
        if (newVote) {
          next[gameId] = newVote;
        } else {
          delete next[gameId];
        }
        try {
          localStorage.setItem('nexo_user_votes', JSON.stringify(next));
        } catch {}
        return next;
      });

      setRatings((prev) => {
        const current = prev[gameId] || { upvotes: 10, downvotes: 1 };
        let { upvotes, downvotes } = current;

        if (actionType === 'up') {
          upvotes += 1;
          if (currentVote === 'down') downvotes = Math.max(0, downvotes - 1);
        } else if (actionType === 'down') {
          downvotes += 1;
          if (currentVote === 'up') upvotes = Math.max(0, upvotes - 1);
        } else if (actionType === 'un-up') {
          upvotes = Math.max(0, upvotes - 1);
        } else if (actionType === 'un-down') {
          downvotes = Math.max(0, downvotes - 1);
        }

        const next = { ...prev, [gameId]: { upvotes, downvotes } };
        try {
          localStorage.setItem('nexo_ratings', JSON.stringify(next));
        } catch {}
        return next;
      });

      // Sync with server
      try {
        await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, type: actionType }),
        });
      } catch {}
    },
    [userVotes]
  );

  return { getRating, vote };
}
