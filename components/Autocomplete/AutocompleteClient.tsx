'use client'

import { useEffect, useRef } from 'react'
import { pipeline, type TextGenerationPipeline } from '@huggingface/transformers'

export default function AutocompleteClient() {
  const generatorRef = useRef<TextGenerationPipeline | null>(null)
  useEffect(() => {
    loadModel()
  }, [])

  const loadModel = async () => {
    // initialize text-generation pipeline in the browser using WASM
    generatorRef.current = (await pipeline(
      'text-generation',
      'Xenova/distilgpt2',
      { device: 'wasm' }
    )) as TextGenerationPipeline
    console.log('model loaded')
  }

  return (
    <input
      type="text"
      className="w-full p-3 border rounded-lg"
      placeholder="Tippe etwas..."
    />
  )
}