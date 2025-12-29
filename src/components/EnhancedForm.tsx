"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/Toast'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file'
  placeholder?: string
  validation?: ValidationRule
  options?: Array<{ value: string; label: string }>
  description?: string
  defaultValue?: any
  disabled?: boolean
  autoFocus?: boolean
}

interface EnhancedFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  submitLabel?: string
  loading?: boolean
  className?: string
  autoSave?: boolean
  autoSaveDelay?: number
  showProgress?: boolean
}

export function EnhancedForm({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  className = "",
  autoSave = false,
  autoSaveDelay = 2000,
  showProgress = true
}: EnhancedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {}
    fields.forEach(field => {
      initialData[field.name] = field.defaultValue || ''
    })
    return initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  const { toast } = useToast()

  const validateField = useCallback((name: string, value: any): string | null => {
    const field = fields.find(f => f.name === name)
    if (!field?.validation) return null

    const { validation } = field

    if (validation.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }

    if (validation.minLength && value.toString().length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`
    }

    if (validation.maxLength && value.toString().length > validation.maxLength) {
      return `${field.label} must not exceed ${validation.maxLength} characters`
    }

    if (validation.pattern && !validation.pattern.test(value.toString())) {
      return `${field.label} format is invalid`
    }

    if (validation.min && Number(value) < validation.min) {
      return `${field.label} must be at least ${validation.min}`
    }

    if (validation.max && Number(value) > validation.max) {
      return `${field.label} must not exceed ${validation.max}`
    }

    if (validation.custom) {
      return validation.custom(value)
    }

    return null
  }, [fields])

  const validateAllFields = useCallback(() => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name])
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [fields, formData, validateField])

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))

    // Real-time validation
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
  }, [validateField])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAllFields()) {
      toast.error('Validation Error', 'Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      toast.success('Success', 'Form submitted successfully')
      
      // Reset form if needed
      const resetData: Record<string, any> = {}
      fields.forEach(field => {
        resetData[field.name] = field.defaultValue || ''
      })
      setFormData(resetData)
      setTouched({})
      setErrors({})
    } catch (error) {
      toast.error('Submission Failed', error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, validateAllFields, fields, toast])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return

    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0 && Object.keys(errors).length === 0) {
        setAutoSaveStatus('saving')
        // Simulate auto-save
        setTimeout(() => {
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        }, 500)
      }
    }, autoSaveDelay)

    return () => clearTimeout(timer)
  }, [formData, touched, errors, autoSave, autoSaveDelay])

  const getCompletionPercentage = () => {
    if (!showProgress) return 0
    
    const requiredFields = fields.filter(f => f.validation?.required)
    const completedFields = requiredFields.filter(f => 
      formData[f.name] && formData[f.name].toString().trim() !== ''
    )
    
    return Math.round((completedFields.length / requiredFields.length) * 100) || 0
  }

  const completionPercentage = getCompletionPercentage()

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name]
    const isValid = touched[field.name] && !errors[field.name] && formData[field.name]

    const baseInputClass = `transition-all duration-200 ${
      hasError ? 'border-red-500 focus:border-red-500' : 
      isValid ? 'border-emerald-500 focus:border-emerald-500' : ''
    }`

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={field.disabled}
            className={baseInputClass}
            rows={4}
          />
        )

      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={field.disabled}
          >
            <SelectTrigger className={baseInputClass}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'password':
        return (
          <div className="relative">
            <Input
              id={field.name}
              type={showPassword[field.name] ? 'text' : 'password'}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={field.disabled}
              autoFocus={field.autoFocus}
              className={`${baseInputClass} pr-10`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(prev => ({
                ...prev,
                [field.name]: !prev[field.name]
              }))}
            >
              {showPassword[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        )

      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => {
              const value = field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value
              handleFieldChange(field.name, value)
            }}
            disabled={field.disabled}
            autoFocus={field.autoFocus}
            className={baseInputClass}
          />
        )
    }
  }

  return (
    <div className={className}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Form Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Auto-save Status */}
      {autoSave && autoSaveStatus !== 'idle' && (
        <div className="mb-4 text-sm text-slate-400 flex items-center gap-2">
          {autoSaveStatus === 'saving' && (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600"></div>
              Saving...
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              Auto-saved
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name} className="text-sm font-medium text-slate-200">
                {field.label}
                {field.validation?.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {touched[field.name] && !errors[field.name] && formData[field.name] && (
                <Check className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            
            {renderField(field)}
            
            {field.description && (
              <p className="text-xs text-slate-400">{field.description}</p>
            )}
            
            {touched[field.name] && errors[field.name] && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors[field.name]}
              </div>
            )}
          </div>
        ))}

        <Button 
          type="submit" 
          disabled={isSubmitting || loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {(isSubmitting || loading) && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {submitLabel}
        </Button>
      </form>
    </div>
  )
}