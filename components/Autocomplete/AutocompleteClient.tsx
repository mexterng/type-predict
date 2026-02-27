'use client'

import { useRef, useState } from 'react'
import { useAutocomplete } from 'hooks/useAutocomplete'
import { useWhisper } from 'hooks/useWhisper'
import { useTTS } from 'hooks/useTTS'

export default function AutocompleteClient() {
  const contentEditableRef = useRef<HTMLSpanElement | null>(null)

  const [userText, setUserText] = useState('')

  const [maxTokens, setMaxTokens] = useState(1) // default 1 next token

  // Autocomplete Hook
  const {
    isModelLoaded: isAutocompleteReady,
    suggestionText,
    acceptSuggestion,
  } = useAutocomplete(maxTokens, userText)

  // --- Whisper Hook ---
  const {
    isModelLoaded: isWhisperReady,
    startRecording,
    isRecording,
    stopRecording
  } = useWhisper()

  // --- TTS Hook ---
  const {
    isModelLoaded: isTTSReady,
  } = useTTS()

  const focusInputField = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAutocompleteReady) return // exit if model not loaded

    const el = contentEditableRef.current
    if (!el) return // exit if element missing
    if (event.target === el) return // keep cursor at click position inside text

    // focus the input and move cursor to end
    el.focus()
    setCursorToEnd(el)
  }

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAutocompleteReady) return
    const newValue = event.target.innerText
    setUserText(newValue)
  }

  const setCursorToEnd = (element: HTMLSpanElement) => {
    const range = document.createRange()
    const selection = window.getSelection()
    if (!selection) return  // early exit if null
    range.selectNodeContents(element)
    range.collapse(false) // false means collapse to end rather than the start
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!isAutocompleteReady) return
    if (event.key === "Tab") {
      event.preventDefault()
      const newText = acceptSuggestion()
      setUserText(newText)
      updateContentEditable(newText)
    }
  }

  const updateContentEditable = (text: string) => {
    const cer = contentEditableRef.current
    if (!cer) return
    cer.innerText = text
    setCursorToEnd(cer)
  }

  const handleRecorder = async () => {
    if (isRecording) {
      const recordedText = await stopRecording()
      const newText = userText + recordedText
      setUserText(newText)
      updateContentEditable(newText)
    } else {
      startRecording()
    }
  }

  return (
    <div>
      {!isAutocompleteReady && (
        <div className="mt-2 text-sm text-gray-500">
          Lade KI-Modell für Autocomplete...
        </div>
      )}
      {isAutocompleteReady && (
        <div className="mb-2">
          <label className="mr-2">Max Tokens:</label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      )}

      {!isWhisperReady && (
        <div className="mt-2 text-sm text-gray-500">
          Lade KI-Modell für Spracheingabe...
        </div>
      )}
      {/* Whisper Controls */}
      {isWhisperReady && (
        <div className="mb-2">
          <button
            className="border px-3 py-1 rounded bg-gray-200"
            onClick={handleRecorder}
          >
            {isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
          </button>
        </div>
      )}

      {!isTTSReady && (
        <div className="mt-2 text-sm text-gray-500">
          Lade KI-Modell für Sprachausgabe...
        </div>
      )}
      {/* TTS Controls */}
      {isTTSReady && (
        <div className="mb-2">
          <button className="border px-3 py-1 rounded bg-gray-200"          >
            Vorlesen
          </button>
        </div>
      )}

      <div
        className="p-3 border rounded-lg cursor-text text-left w-full h-[200px] mx-auto overflow-auto"
        onClick={focusInputField}
      >
        <span
          ref={contentEditableRef}
          className="outline-none"
          contentEditable={isAutocompleteReady}
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