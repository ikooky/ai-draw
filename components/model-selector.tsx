"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bot } from "lucide-react"

interface ModelOption {
  id: string
  name: string
  baseURL: string
}

interface ModelSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/models')

      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }

      const data = await response.json()
      setModels(data.models || [])

      // 只在首次加载且未选择模型时，自动选择模型
      if (!initialized && !value && data.models.length > 0 && onValueChange) {
        setInitialized(true)

        // 优先使用 localStorage 中保存的模型
        const savedModelId = localStorage.getItem('selectedModelId')
        const savedModelExists = savedModelId && data.models.some((m: ModelOption) => m.id === savedModelId)

        if (savedModelExists) {
          onValueChange(savedModelId)
        } else {
          // 如果没有保存的模型或保存的模型不存在，使用第一个模型
          onValueChange(data.models[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching models:', err)
      setError(err instanceof Error ? err.message : 'Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  const handleModelChange = (modelId: string) => {
    // 保存到 localStorage
    localStorage.setItem('selectedModelId', modelId)
    // 调用父组件的 onValueChange
    if (onValueChange) {
      onValueChange(modelId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bot className="h-4 w-4" />
        <span>Loading models...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <Bot className="h-4 w-4" />
        <span>Error: {error}</span>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bot className="h-4 w-4" />
        <span>No models available</span>
      </div>
    )
  }

  // If only one model, display it without dropdown
  if (models.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Bot className="h-4 w-4" />
        <span className="font-medium">{models[0].name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Bot className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={handleModelChange}>
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue placeholder="选择模型" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
