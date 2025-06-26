import { useState, useCallback } from 'react'

/**
 * Generic form state management utilities
 */

export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
}

export interface FormState<T extends Record<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> }
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

export interface FormActions<T extends Record<string, unknown>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  setError: <K extends keyof T>(field: K, error: string) => void
  clearError: <K extends keyof T>(field: K) => void
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void
  reset: () => void
  validate: () => boolean
  submit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>
}

export type ValidationRule<T> = (value: T) => string | undefined

export interface FormConfig<T extends Record<string, unknown>> {
  initialValues: T
  validationRules?: Partial<Record<keyof T, ValidationRule<unknown>[]>>
  onSubmit?: (values: T) => Promise<void> | void
}

/**
 * Generic form hook with validation and state management
 * Simplified version to avoid complex TypeScript issues
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): [FormState<T>, FormActions<T>] {
  const { initialValues, validationRules, onSubmit } = config

  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields = {} as { [K in keyof T]: FormField<T[K]> }

    for (const key in initialValues) {
      fields[key] = {
        value: initialValues[key],
        error: undefined,
        touched: false,
      }
    }

    return {
      fields,
      isValid: true,
      isSubmitting: false,
      isDirty: false,
    }
  })

  // Validate a single field - simplified version
  const validateField = useCallback(
    (field: keyof T, value: unknown): string | undefined => {
      if (!validationRules || !validationRules[field]) return undefined
      const rules = validationRules[field] as ValidationRule<unknown>[]

      for (const rule of rules) {
        const error = rule(value)
        if (error) return error
      }
      return undefined
    },
    [validationRules]
  )

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let isValid = true
    const newFields = { ...formState.fields }

    for (const key in newFields) {
      const error = validateField(key, newFields[key].value)
      newFields[key] = { ...newFields[key], error }
      if (error) isValid = false
    }

    setFormState((prev) => ({ ...prev, fields: newFields, isValid }))
    return isValid
  }, [formState.fields, validateField])

  // Form actions
  const actions: FormActions<T> = {
    setValue: useCallback(
      <K extends keyof T>(field: K, value: T[K]) => {
        setFormState((prev) => {
          const error = validateField(field, value)
          const newFields = {
            ...prev.fields,
            [field]: {
              ...prev.fields[field],
              value,
              error,
              touched: true,
            },
          }

          const isValid = Object.values(newFields).every((f) => !f.error)
          const isDirty = Object.keys(newFields).some(
            (key) =>
              newFields[key as keyof T].value !== initialValues[key as keyof T]
          )

          return {
            ...prev,
            fields: newFields,
            isValid,
            isDirty,
          }
        })
      },
      [validateField, initialValues]
    ),

    setError: useCallback(<K extends keyof T>(field: K, error: string) => {
      setFormState((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [field]: { ...prev.fields[field], error },
        },
        isValid: false,
      }))
    }, []),

    clearError: useCallback(<K extends keyof T>(field: K) => {
      setFormState((prev) => {
        const newFields = {
          ...prev.fields,
          [field]: { ...prev.fields[field], error: undefined },
        }
        const isValid = Object.values(newFields).every((f) => !f.error)

        return {
          ...prev,
          fields: newFields,
          isValid,
        }
      })
    }, []),

    setTouched: useCallback(<K extends keyof T>(field: K, touched = true) => {
      setFormState((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [field]: { ...prev.fields[field], touched },
        },
      }))
    }, []),

    reset: useCallback(() => {
      const fields = {} as { [K in keyof T]: FormField<T[K]> }

      for (const key in initialValues) {
        fields[key] = {
          value: initialValues[key],
          error: undefined,
          touched: false,
        }
      }

      setFormState({
        fields,
        isValid: true,
        isSubmitting: false,
        isDirty: false,
      })
    }, [initialValues]),

    validate: validateAll,

    submit: useCallback(
      async (submitFn?: (values: T) => Promise<void> | void) => {
        const submitFunction = submitFn || onSubmit
        if (!submitFunction) return

        setFormState((prev) => ({ ...prev, isSubmitting: true }))

        try {
          if (validateAll()) {
            const values = {} as T
            for (const key in formState.fields) {
              values[key] = formState.fields[key].value
            }
            await submitFunction(values)
          }
        } finally {
          setFormState((prev) => ({ ...prev, isSubmitting: false }))
        }
      },
      [onSubmit, validateAll, formState.fields]
    ),
  }

  return [formState, actions]
}

/**
 * Common validation rules
 */
export const validationRules = {
  required:
    <T>(message = 'This field is required'): ValidationRule<T> =>
    (value) => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      return undefined
    },

  minLength:
    (min: number, message?: string): ValidationRule<string> =>
    (value) => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Must be at least ${min} characters`
      }
      return undefined
    },

  maxLength:
    (max: number, message?: string): ValidationRule<string> =>
    (value) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Must be no more than ${max} characters`
      }
      return undefined
    },

  email:
    (message = 'Invalid email address'): ValidationRule<string> =>
    (value) => {
      if (typeof value === 'string' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return message
        }
      }
      return undefined
    },
}
