'use client'

import { useEffect, useRef, useState } from 'react'
import { pipeline, type TextGenerationPipeline } from '@huggingface/transformers'

export default function AutocompleteClient() {
  const generatorRef = useRef<TextGenerationPipeline | null>(null)

  const contentEditableRef = useRef<HTMLSpanElement | null>(null)

  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [userText, setUserText] = useState("")
  const [suggestionText, setSuggestionText] = useState("")

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
    setIsModelLoaded(true)
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isModelLoaded) return
    const newValue = event.target.innerText
    setUserText(newValue)
    if (newValue != "") {
      updateSuggestion(newValue)
    } else {
      setSuggestionText("") // reset suggestion on empty input
    }
  }

  const updateSuggestion = (text: string) => {
    getSuggestion(text)
      .then((suggestion) => {
        setSuggestionText(suggestion)
      })
      .catch((err) => console.error(err))
  }

  const getSuggestion = async (text: string): Promise<string> => {
    if (!generatorRef.current || !text) return ''  // early exit if no model or empty text

    const rawResult = await generatorRef.current(text, {
      max_new_tokens: 1,
      do_sample: false,
    })

    // type correction: Treat result as an array
    const firstResult = rawResult[0] as { generated_text: string } | undefined;

    if (!firstResult?.generated_text) {
      return "";
    }

    // extract generated text
    const suggestion = firstResult.generated_text

    // remove the already typed text
    return suggestion.replace(text, '')
  }

  const setCursorToEnd = (element : HTMLSpanElement) => {
    const range = document.createRange()
    const selection = window.getSelection()
    if (!selection) return  // early exit if null
    range.selectNodeContents(element)
    range.collapse(false) // false means collapse to end rather than the start
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const acceptSuggestion = () => {
    const contentEditableElement = contentEditableRef.current
    if (!contentEditableElement) return  // early exit if null
    if (suggestionText) {
      setUserText(userText + suggestionText)
      contentEditableElement.innerText = userText + suggestionText
      setSuggestionText("")
      setCursorToEnd(contentEditableElement)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!isModelLoaded) return
    if (event.key === "Tab") {
      event.preventDefault()
      acceptSuggestion()
    }
  }

  return (
    <div>
      {!isModelLoaded && (
        <div className="mt-2 text-sm text-gray-500">
          Lade KI-Modell für Autocomplete...
        </div>
      )}
      <div
        className="p-3 border rounded-lg cursor-text text-left w-full h-[200px] mx-auto overflow-auto"
        onClick={() => {
          if (!isModelLoaded) return
          contentEditableRef.current?.focus()
        }}
      >
        <span
          ref={contentEditableRef}
          className="outline-none"
          contentEditable={isModelLoaded}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        >
          {/* {userText} */}
        </span>

        <span
          className="text-gray-600"
          contentEditable={false}
        >
          {suggestionText}
        </span>
      </div>
    </div>
  )
}