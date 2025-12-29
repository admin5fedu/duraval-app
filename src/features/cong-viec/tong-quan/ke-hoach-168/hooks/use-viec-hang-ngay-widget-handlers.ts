import * as React from "react"
import type { CongViec, ViecHangNgayWidgetState, ViecHangNgayWidgetRefs } from "../types/viec-hang-ngay-widget.types"
import { isValidUrl } from "../utils/viec-hang-ngay-widget.utils"
import { MAX_LINKS_PER_ITEM } from "../constants/viec-hang-ngay-widget.constants"

interface UseViecHangNgayWidgetHandlersParams {
    state: ViecHangNgayWidgetState
    refs: ViecHangNgayWidgetRefs
    setCongViecList: React.Dispatch<React.SetStateAction<CongViec[]>>
    setLinkErrors: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
    setTypingFlags: () => void
}

/**
 * Hook quản lý các handlers cho widget Việc hàng ngày
 */
export function useViecHangNgayWidgetHandlers({
    state,
    refs: _refs,
    setCongViecList,
    setLinkErrors,
    setTypingFlags
}: UseViecHangNgayWidgetHandlersParams) {
    const { congViecList } = state

    // Update item
    const updateItem = React.useCallback((index: number, updates: Partial<CongViec>) => {
        setTypingFlags()
        
        setCongViecList(prev => {
            if (index < 0 || index >= prev.length) {
                console.warn(`Invalid index: ${index}, list length: ${prev.length}`)
                return prev
            }
            
            const newList = [...prev]
            newList[index] = { ...newList[index], ...updates }
            return newList
        })
    }, [setCongViecList, setTypingFlags])

    // Update link
    const updateLink = React.useCallback((itemIndex: number, linkIndex: number, newLink: string) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = [...links]
        newLinks[linkIndex] = newLink
        updateItem(itemIndex, { links: newLinks })
        
        const linkKey = `${itemIndex}-${linkIndex}`
        if (newLink.trim()) {
            const isValid = isValidUrl(newLink)
            setLinkErrors(prev => {
                const newMap = new Map(prev)
                if (!isValid) {
                    newMap.set(linkKey, true)
                } else {
                    newMap.delete(linkKey)
                }
                return newMap
            })
        } else {
            setLinkErrors(prev => {
                const newMap = new Map(prev)
                newMap.delete(linkKey)
                return newMap
            })
        }
    }, [congViecList, updateItem, setLinkErrors])

    // Add link
    const addLink = React.useCallback((itemIndex: number) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        if (links.length >= MAX_LINKS_PER_ITEM) return
        
        const newLinks = [...links, '']
        updateItem(itemIndex, { links: newLinks })
    }, [congViecList, updateItem])

    // Remove link
    const removeLink = React.useCallback((itemIndex: number, linkIndex: number) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = links.filter((_, idx) => idx !== linkIndex)
        updateItem(itemIndex, { links: newLinks })
        
        setLinkErrors(prev => {
            const newMap = new Map(prev)
            newMap.delete(`${itemIndex}-${linkIndex}`)
            const keysToUpdate: string[] = []
            newMap.forEach((_, key) => {
                const [itemIdx, linkIdx] = key.split('-').map(Number)
                if (itemIdx === itemIndex && linkIdx > linkIndex) {
                    keysToUpdate.push(key)
                }
            })
            keysToUpdate.forEach(oldKey => {
                const [itemIdx, linkIdx] = oldKey.split('-').map(Number)
                const newKey = `${itemIdx}-${linkIdx - 1}`
                const value = newMap.get(oldKey)
                if (value !== undefined) {
                    newMap.set(newKey, value)
                    newMap.delete(oldKey)
                }
            })
            return newMap
        })
    }, [congViecList, updateItem, setLinkErrors])

    // Toggle item expand
    const toggleItemExpand = React.useCallback((itemId: number, currentExpandedId: number | null, setExpandedItemId: (id: number | null) => void) => {
        setExpandedItemId(currentExpandedId === itemId ? null : itemId)
    }, [])

    // Toggle global expand
    const toggleGlobalExpand = React.useCallback((
        currentGlobalExpandAll: boolean,
        _currentExpandedId: number | null,
        setGlobalExpandAll: (value: boolean) => void,
        setExpandedItemId: (id: number | null) => void
    ) => {
        if (currentGlobalExpandAll) {
            setExpandedItemId(null)
        } else {
            const firstItemWithPlan = congViecList.find(item => item.ke_hoach?.trim())
            if (firstItemWithPlan) {
                setExpandedItemId(firstItemWithPlan.id)
            }
        }
        setGlobalExpandAll(!currentGlobalExpandAll)
    }, [congViecList])

    // Navigate date
    const navigateDate = React.useCallback((
        direction: 'prev' | 'next',
        currentDate: string,
        setSelectedDate: (date: string) => void
    ) => {
        const date = new Date(currentDate + "T00:00:00")
        const newDate = new Date(date)
        newDate.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
        setSelectedDate(newDate.toISOString().split('T')[0])
    }, [])

    // Go to today
    const goToToday = React.useCallback((setSelectedDate: (date: string) => void) => {
        setSelectedDate(new Date().toISOString().split('T')[0])
    }, [])

    return {
        updateItem,
        updateLink,
        addLink,
        removeLink,
        toggleItemExpand,
        toggleGlobalExpand,
        navigateDate,
        goToToday
    }
}

