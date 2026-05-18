import { render, screen } from '@testing-library/react'
import VideoPlayer from './VideoPlayer'

describe('VideoPlayer', () => {
  it('renders nocookie iframe for youtube.com/embed URL', () => {
    render(<VideoPlayer url="https://www.youtube.com/embed/dQw4w9WgXcQ" />)
    const iframe = screen.getByTitle('Video bài học')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('renders nocookie iframe for youtu.be short URL', () => {
    render(<VideoPlayer url="https://youtu.be/dQw4w9WgXcQ" />)
    const iframe = screen.getByTitle('Video bài học')
    expect(iframe.getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('renders <video> for self-hosted URL', () => {
    render(<VideoPlayer url="https://cdn.example.com/lesson.mp4" />)
    const video = screen.getByLabelText('Video bài học')
    expect(video.tagName).toBe('VIDEO')
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/lesson.mp4')
  })

  it('renders error state for YouTube URL with unparseable ID', () => {
    render(<VideoPlayer url="https://www.youtube.com/malformed" />)
    expect(screen.getByText('Không thể tải video')).toBeInTheDocument()
  })

  it('uses custom title in iframe', () => {
    render(<VideoPlayer url="https://www.youtube.com/embed/abc12345678" title="Bài 1: Phương trình" />)
    expect(screen.getByTitle('Bài 1: Phương trình')).toBeInTheDocument()
  })
})
