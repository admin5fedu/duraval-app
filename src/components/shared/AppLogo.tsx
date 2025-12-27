/**
 * AppLogo Component
 * 
 * Professional logo component with:
 * - Lazy loading for better performance
 * - Error handling with fallback
 * - Loading state
 * - Optimized for sidebar use
 */

import React from 'react'
import { LOGO_URL, LOGO_FALLBACK, APP_NAME } from '@/lib/app-config'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Custom className
   */
  className?: string
  /**
   * Show text label
   */
  showLabel?: boolean
  /**
   * Logo URL override
   */
  logoUrl?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
}

const containerSizeClasses = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
}

export function AppLogo({ 
  size = 'md', 
  className,
  showLabel = false,
  logoUrl = LOGO_URL 
}: AppLogoProps) {
  const [imgSrc, setImgSrc] = React.useState(logoUrl)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setImgSrc(logoUrl)
    setIsLoading(true)
    setHasError(false)
  }, [logoUrl])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    // Try fallback if main URL fails
    if (imgSrc !== LOGO_FALLBACK) {
      setImgSrc(LOGO_FALLBACK)
      setIsLoading(true)
    }
  }

  return (
    <div 
      className={cn(
        'flex aspect-square items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0',
        containerSizeClasses[size],
        className
      )}
    >
      {isLoading && !hasError && (
        <div className={cn('animate-pulse bg-primary-foreground/20 rounded', sizeClasses[size])} />
      )}
      {!isLoading && hasError && (
        <span className={cn('font-bold text-primary-foreground', size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base')}>
          {APP_NAME.substring(0, 2).toUpperCase()}
        </span>
      )}
      {!hasError && (
        <img
          src={imgSrc}
          alt={`${APP_NAME} Logo`}
          className={cn(
            'object-contain brightness-0 invert',
            sizeClasses[size],
            isLoading && 'opacity-0 absolute'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
      {showLabel && (
        <span className="ml-2 font-semibold">{APP_NAME}</span>
      )}
    </div>
  )
}

