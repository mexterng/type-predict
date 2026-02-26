'use client'

import { useEffect, useRef, useState } from 'react'
import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'

export function useWhisper() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  const pipelineRef = useRef<AutomaticSpeechRecognitionPipeline | null>(null)

  // Load model once
  useEffect(() => {
    async function loadModel() {
      pipelineRef.current = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        { device: 'wasm' }
      ) as AutomaticSpeechRecognitionPipeline
      console.log("loaded")
      setIsModelLoaded(true)
    }

    loadModel()
  }, [])

  return {
    // state
    isModelLoaded,

    // state setter

    // actions
  }
}