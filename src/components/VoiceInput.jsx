import { useState, useEffect, useRef } from 'react';
import { useLanguage, speechLanguageCodes } from '../hooks/useLanguage';
import { parseVoiceInput } from '../utils/parseVoiceInput';
import { playSuccess, playError } from '../utils/soundUtils';

/**
 * VoiceInput component — manages Web Speech API recognition.
 * Accepts speech in Tamil, Malayalam, and English.
 * Parses transcript into { itemName, quantity, rate, total }.
 * 
 * Props:
 *   onItemAdd(item) - callback when a valid item is parsed from speech
 */
export default function VoiceInput({ onItemAdd }) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      // When we get a final result, parse it
      if (finalTranscript) {
        setTranscript(finalTranscript);
        const parsed = parseVoiceInput(finalTranscript, language);
        if (parsed) {
          playSuccess();
          onItemAdd(parsed);
          setTranscript('');
        } else {
          playError();
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      playError();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onItemAdd]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Set the language for recognition
      recognitionRef.current.lang = speechLanguageCodes[language] || 'en-IN';
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!supported) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="text-red-500 dark:text-red-400 text-sm text-center">
          ⚠️ Voice input is not supported in this browser. Please use Chrome or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Microphone Button */}
      <button
        onClick={toggleListening}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl
          transition-all duration-300 shadow-lg active:scale-95
          ${isListening
            ? 'bg-red-500 animate-recording shadow-red-500/50'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'
          }`}
        aria-label={isListening ? t('listening') : t('tapToSpeak')}
      >
        {/* Pulsing ring when recording */}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring opacity-75" />
        )}
        <span className="relative z-10">
          {isListening ? (
            // Stop icon
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Microphone icon
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11v-1h-2z"/>
            </svg>
          )}
        </span>
      </button>

      {/* Status label */}
      <span className={`text-sm font-medium ${isListening ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {isListening ? t('listening') : t('tapToSpeak')}
      </span>

      {/* Live transcript display */}
      {transcript && (
        <div className="w-full max-w-sm px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-center text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
