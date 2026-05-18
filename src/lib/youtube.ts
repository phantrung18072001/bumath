/**
 * Extracts a YouTube video ID from various YouTube URL formats.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtu.be/dQw4w9WgXcQ
 *   https://www.youtube.com/embed/dQw4w9WgXcQ
 *   https://www.youtube.com/shorts/dQw4w9WgXcQ
 *   https://www.youtube.com/live/aU5Vd6k0LXs
 *   https://m.youtube.com/watch?v=dQw4w9WgXcQ
 *
 * Returns the video ID string, or null if the URL is not a valid YouTube URL.
 */
export function extractYouTubeID(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()

  // Matches:
  //   youtu.be/<id>
  //   youtube.com/watch?v=<id> (with optional &... params)
  //   youtube.com/embed/<id>
  //   youtube.com/shorts/<id>
  //   youtube.com/v/<id>
  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:be\.com\/watch\?(?:.*&)?v=|\.be\/)([\w-]{11})/,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(?:embed|shorts|v|live)\/([\w-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }

  return null
}
