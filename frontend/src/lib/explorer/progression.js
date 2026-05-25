const STORAGE_PREFIX = 'explorer:'

/**
 * @typedef {{
 *   completedLevelIndices: number[],
 *   lastUnlocked: number,
 *   conversations: Record<string, string>,
 * }} ExplorerProgress
 */

export function progressionKey(userId, subjectId, chapterId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}:${subjectId}:${chapterId}`
}

/** @returns {ExplorerProgress} */
export function loadProgression(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultProgress()
    const data = JSON.parse(raw)
    return {
      completedLevelIndices: Array.isArray(data.completedLevelIndices)
        ? data.completedLevelIndices
        : [],
      lastUnlocked: typeof data.lastUnlocked === 'number' ? data.lastUnlocked : 0,
      conversations: data.conversations && typeof data.conversations === 'object'
        ? data.conversations
        : {},
    }
  } catch {
    return defaultProgress()
  }
}

function defaultProgress() {
  return { completedLevelIndices: [], lastUnlocked: 0, conversations: {} }
}

/** @param {ExplorerProgress} progress */
export function saveProgression(key, progress) {
  localStorage.setItem(key, JSON.stringify(progress))
}

/** @returns {'locked' | 'unlocked' | 'completed'} */
export function getLevelStatus(levelIndex, progress) {
  if (progress.completedLevelIndices.includes(levelIndex)) return 'completed'
  if (levelIndex <= progress.lastUnlocked) return 'unlocked'
  return 'locked'
}

export function markLevelCompleted(key, levelIndex) {
  const progress = loadProgression(key)
  if (!progress.completedLevelIndices.includes(levelIndex)) {
    progress.completedLevelIndices.push(levelIndex)
    progress.completedLevelIndices.sort((a, b) => a - b)
  }
  progress.lastUnlocked = Math.max(progress.lastUnlocked, levelIndex + 1)
  saveProgression(key, progress)
  return progress
}

export function setLevelConversation(key, levelIndex, conversationId) {
  const progress = loadProgression(key)
  progress.conversations[String(levelIndex)] = conversationId
  saveProgression(key, progress)
  return progress
}

export function getLevelConversationId(key, levelIndex) {
  const progress = loadProgression(key)
  return progress.conversations[String(levelIndex)] ?? null
}
