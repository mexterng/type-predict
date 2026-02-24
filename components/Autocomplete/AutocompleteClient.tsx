'use client'

import { useEffect, useRef } from 'react'
import { pipeline, type TextGenerationPipeline } from '@huggingface/transformers'

export default function AutocompleteClient() {
  const generatorRef = useRef<TextGenerationPipeline | null>(null)

  const contentEditableRef = useRef(null);

  // load model once on component mount
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

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.innerText
    console.log('current value:', newValue)
  }

  return (
    <div
      className="p-3 border rounded-lg cursor-text text-left w-full h-[200px] mx-auto overflow-auto"
    >
      <span
        ref={contentEditableRef}
        className="outline-none"
        contentEditable={true}
        onInput={handleInput}
      >
        {/* {userText} */}
      </span>
    </div>
  )
}