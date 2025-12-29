/**
 * Utility function to get color class for cơm trưa badge
 * Maps boolean values to different colors for easy distinction
 */

export function getComTruaBadgeClass(comTrua: boolean | null | undefined): string {
    if (comTrua === null || comTrua === undefined) {
        return "bg-muted text-muted-foreground border-transparent"
    }

    // Color mapping for cơm trưa
    if (comTrua === true) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
    } else {
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
}

