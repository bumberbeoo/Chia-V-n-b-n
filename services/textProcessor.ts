
import { MAX_CHUNK_LENGTH } from '../constants';

export const splitText = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  const chunks: string[] = [];
  let remainingText = text.trim();

  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_CHUNK_LENGTH) {
      chunks.push(remainingText);
      break;
    }

    const potentialSlice = remainingText.substring(0, MAX_CHUNK_LENGTH);
    
    // Find the last period to preserve sentence integrity.
    let splitIndex = potentialSlice.lastIndexOf('.');

    // If no period is found, or it's at the beginning (not a sentence end),
    // we try to find the last space to avoid cutting a word.
    if (splitIndex <= 0) {
      splitIndex = potentialSlice.lastIndexOf(' ');
    }

    // If still no suitable split point is found (a very long single word),
    // we have to perform a hard cut at the maximum length.
    if (splitIndex <= 0) {
      splitIndex = MAX_CHUNK_LENGTH;
    } else {
      // We found a split point (period or space), so we include that character.
      splitIndex += 1;
    }

    const chunk = remainingText.substring(0, splitIndex);
    chunks.push(chunk.trim());
    remainingText = remainingText.substring(splitIndex).trim();
  }

  return chunks;
};
