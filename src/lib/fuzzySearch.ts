// Simple fuzzy search utility for menu items
export const fuzzyMatch = (text: string, query: string): boolean => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase().trim();
  
  if (!queryLower) return true;
  
  // Exact substring match
  if (textLower.includes(queryLower)) return true;
  
  // Word-by-word matching (any word in query matches)
  const queryWords = queryLower.split(/\s+/);
  const textWords = textLower.split(/\s+/);
  
  // Check if all query words have at least a partial match
  return queryWords.every(qWord => 
    textWords.some(tWord => 
      tWord.includes(qWord) || qWord.includes(tWord) || levenshteinDistance(tWord, qWord) <= Math.max(1, Math.floor(qWord.length / 3))
    )
  );
};

// Levenshtein distance for typo tolerance
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  
  return dp[m][n];
};
