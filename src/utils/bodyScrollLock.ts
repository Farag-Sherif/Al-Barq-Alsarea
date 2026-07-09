const LOCK_COUNT_DATA_KEY = 'scrollLockCount'
const PREVIOUS_OVERFLOW_DATA_KEY = 'scrollLockPreviousOverflow'

function readLockCount(): number {
  const rawValue = document.body.dataset[LOCK_COUNT_DATA_KEY]
  const parsed = Number.parseInt(rawValue ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function lockBodyScroll() {
  const currentCount = readLockCount()

  if (currentCount === 0) {
    document.body.dataset[PREVIOUS_OVERFLOW_DATA_KEY] = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  document.body.dataset[LOCK_COUNT_DATA_KEY] = String(currentCount + 1)
}

export function unlockBodyScroll() {
  const currentCount = readLockCount()
  if (currentCount <= 1) {
    const previousOverflow = document.body.dataset[PREVIOUS_OVERFLOW_DATA_KEY] ?? ''
    document.body.style.overflow = previousOverflow
    delete document.body.dataset[LOCK_COUNT_DATA_KEY]
    delete document.body.dataset[PREVIOUS_OVERFLOW_DATA_KEY]
    return
  }

  document.body.dataset[LOCK_COUNT_DATA_KEY] = String(currentCount - 1)
}
