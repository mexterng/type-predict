'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pipeline, type TextToAudioPipeline } from '@huggingface/transformers'

export function useTTS() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const pipelineRef = useRef<TextToAudioPipeline | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const speakerEmbeddingsRef = useRef<Float32Array | null>(null)

  // Load model once
  useEffect(() => {
    async function loadModel() {
      pipelineRef.current = await pipeline(
        'text-to-speech',
        'Xenova/speecht5_tts',
        { device: 'wasm' }
      ) as TextToAudioPipeline

      // load speaker embeddings
      try {
        const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        speakerEmbeddingsRef.current = new Float32Array(arrayBuffer)
      } catch (err) {
        console.error('Failed to load speaker embeddings:', err)
        speakerEmbeddingsRef.current = new Float32Array(512).fill(0.5) // fallback
      }

      setIsModelLoaded(true)
    }

    loadModel()
  }, [])

  const startSpeaking = useCallback(async (text: string) => {
    if (!pipelineRef.current || !text || !speakerEmbeddingsRef.current) return

    // Stop any currently playing audio
    if (audioSourceRef.current) {
      audioSourceRef.current.pause()
      audioSourceRef.current = null
    }

    setIsSpeaking(true)

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    try {
      await audioContextRef.current.resume()
    } catch (err) {
      console.error('Failed to resume AudioContext:', err)
      setIsSpeaking(false)
      return
    }

    try {
      // Run TTS model
      setIsConverting(true)

      const result = await pipelineRef.current(text, { speaker_embeddings: speakerEmbeddingsRef.current })
      const { audio, sampling_rate } = result

      // Create an AudioBuffer from the float32 data
      const audioBuffer = audioContextRef.current.createBuffer(
        1, // mono
        audio.length,
        sampling_rate
      )
      // Copy the audio data into the buffer (channel 0)
      audioBuffer.copyToChannel(audio, 0)

      // Create and configure the source node
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)

      // When playback finishes, clean up
      source.onended = () => {
        audioSourceRef.current = null
        setIsSpeaking(false)
      }

      // Start playback
      setIsConverting(false)
      source.start()
      audioSourceRef.current = source

    } catch (error) {
      console.error('TTS or playback error:', error)
      setIsConverting(false)
      setIsSpeaking(false)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (!audioSourceRef.current) return
    audioSourceRef.current.stop()
    audioSourceRef.current.disconnect()
    audioSourceRef.current = null
    setIsSpeaking(false)
  }, [])

  return {
    // state
    isSpeaking,
    isModelLoaded,
    isConverting,

    // actions
    startSpeaking,
    stopSpeaking
  }
}