/** Sharing: the phone's own share sheet where there is one, otherwise the clipboard. */
export const canShareNatively = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

/** Opens the share sheet, or copies the link. Resolves to what happened. */
export async function shareLink(data: { url: string; title: string; text?: string; files?: File[] }): Promise<'shared' | 'copied' | 'cancelled'> {
  if (canShareNatively()) {
    const payload = data.files && navigator.canShare?.({ files: data.files }) ? data : { url: data.url, title: data.title, text: data.text }
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  return copyText(data.text ? `${data.text} ${data.url}` : data.url)
}

export async function copyText(text: string): Promise<'copied' | 'cancelled'> {
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    window.prompt('Copy this', text)
    return 'cancelled'
  }
}
