'use client'

import { useEffect, useRef, useState } from 'react'
import { pipeline, type TextToAudioPipeline } from '@huggingface/transformers'

export function useTTS() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  const pipelineRef = useRef<TextToAudioPipeline | null>(null)

  // Load model once
  useEffect(() => {
    async function loadModel() {
      pipelineRef.current = await pipeline(
        'text-to-speech',
        'Xenova/speecht5_tts',
        { device: 'wasm' }
      ) as TextToAudioPipeline

      setIsModelLoaded(true)
    }

    loadModel()
  }, [])

  return {
    // state
    isModelLoaded,

    // actions
  }
}