// components/search-filters.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

export interface SearchFilters {
  search: string
  category: string
  sortBy: string
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Faith", label: "Faith & Doctrine" },
  { value: "Practices", label: "Church Practices" },
  { value: "Theology", label: "Theology" },
  { value: "History", label: "Church History" },
  { value: "General", label: "General Questions" },
]

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Popular" },
]

export function SearchFilters({ onFiltersChange, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    category: "all",
    sortBy: "latest",
  })
  
  const [searchInput, setSearchInput] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setSearchInput("")
    setFilters({
      search: "",
      category: "all",
      sortBy: "latest",
    })
  }

  const hasActiveFilters = filters.search || filters.category !== "all"

  const getFilterBadges = () => {
    const badges = []
    
    if (filters.search) {
      badges.push({
        key: "search",
        label: `Search: "${filters.search}"`,
        onRemove: () => {
          setSearchInput("")
          setFilters(prev => ({ ...prev, search: "" }))
        }
      })
    }
    
    if (filters.category !== "all") {
      const categoryLabel = categories.find(c => c.value === filters.category)?.label
      badges.push({
        key: "category",
        label: `Category: ${categoryLabel}`,
        onRemove: () => updateFilter("category", "all")
      })
    }
    
    return badges
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          </div>
          
          {/* Category Filter */}
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {getFilterBadges().map((badge) => (
            <Badge
              key={badge.key}
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              {badge.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4   hover:bg-blue-200"
                onClick={badge.onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}