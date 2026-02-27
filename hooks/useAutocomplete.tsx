'use client'

import { useEffect, useRef, useState } from 'react'
import { pipeline, type TextGenerationPipeline } from '@huggingface/transformers'

export function useAutocomplete(maxTokens: number, userText: string) {
  const generatorRef = useRef<TextGenerationPipeline | null>(null)

  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [suggestionText, setSuggestionText] = useState('')

  // Load model once
  useEffect(() => {
    async function loadModel() {
      generatorRef.current = (await pipeline(
        'text-generation',
        'Xenova/distilgpt2',
        { device: 'wasm' }
      )) as TextGenerationPipeline

      setIsModelLoaded(true)
    }

    loadModel()
  }, [])

  // Generate suggestion
  useEffect(() => {
    if (!isModelLoaded || !userText || !generatorRef.current) {
      setSuggestionText('')
      return
    }

    async function generateSuggestion() {
      const rawResult = await generatorRef.current!(userText, {
        max_new_tokens: maxTokens,
        do_sample: false,
      })

      const firstResult = rawResult[0] as
        | { generated_text: string }
        | undefined

      if (!firstResult?.generated_text) {
        setSuggestionText('')
        return
      }

      const suggestion = firstResult.generated_text.replace(
        userText,
        ''
      )

      setSuggestionText(suggestion)
    }

    generateSuggestion()
  }, [userText, maxTokens, isModelLoaded])

  const acceptSuggestion = () => {
    if (!suggestionText) return userText
    setSuggestionText('')
    return userText + suggestionText
  }

  return {
    // state
    isModelLoaded,
    suggestionText,

    // actions
    acceptSuggestion,
  }
}