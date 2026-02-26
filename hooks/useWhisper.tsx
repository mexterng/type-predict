'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers'

export function useWhisper() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const pipelineRef = useRef<AutomaticSpeechRecognitionPipeline | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Load model once
  useEffect(() => {
    async function loadModel() {
      pipelineRef.current = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        { device: 'wasm' }
      ) as AutomaticSpeechRecognitionPipeline
      setIsModelLoaded(true)
    }

    loadModel()
  }, [])

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunksRef.current = []

    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start()
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) return resolve('')

      recorder.onstop = async () => {
        const stream = recorder.stream
        stream.getTracks().forEach(t => t.stop())

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const arrayBuffer = await blob.arrayBuffer()

        const audioCtx = new AudioContext({ sampleRate: 16000 })
        const decoded = await audioCtx.decodeAudioData(arrayBuffer)
        const float32 = decoded.getChannelData(0)

        const result = await pipelineRef.current!(float32, { language: 'english' })
        const text = (result as { text: string }).text?.trim() ?? ''

        setIsRecording(false)
        resolve(text)
      }

      recorder.stop()
    })
  }, [pipelineRef])

  return {
    // state
    isRecording,
    isModelLoaded,

    // state setter

    // actions
    startRecording,
    stopRecording
  }
}