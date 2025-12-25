import { describe, it, expect } from 'vitest'
import { cn } from './utils'
import { getParentRouteFromBreadcrumb } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})

describe('getParentRouteFromBreadcrumb', () => {
  it('should return null for root path', () => {
    expect(getParentRouteFromBreadcrumb('/')).toBeNull()
  })

  it('should return root for single segment', () => {
    expect(getParentRouteFromBreadcrumb('/he-thong')).toBe('/')
  })

  it('should remove "sua" segment', () => {
    expect(getParentRouteFromBreadcrumb('/he-thong/danh-sach-nhan-su/123/sua')).toBe(
      '/he-thong/danh-sach-nhan-su/123'
    )
  })

  it('should remove "them-moi" segment', () => {
    expect(getParentRouteFromBreadcrumb('/he-thong/danh-sach-nhan-su/them-moi')).toBe(
      '/he-thong/danh-sach-nhan-su'
    )
  })

  it('should remove numeric ID segment', () => {
    expect(getParentRouteFromBreadcrumb('/he-thong/danh-sach-nhan-su/123')).toBe(
      '/he-thong/danh-sach-nhan-su'
    )
  })

  it('should remove last segment for other cases', () => {
    expect(getParentRouteFromBreadcrumb('/he-thong/phong-ban')).toBe('/he-thong')
  })
})

