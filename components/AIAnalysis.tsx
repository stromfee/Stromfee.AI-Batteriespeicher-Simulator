
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AIAnalysisProps {
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ history, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const renderMessageContent = (content: string) => {
    // Basic Markdown to HTML conversion for lists and bold text
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/(\n|^)[\*|-]\s/g, '$1<li>') // List items
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col" style={{ height: '70vh', maxHeight: '800px' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        KI-Analyse
      </h3>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl ${
                msg.role === 'user' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-800'
              } ${msg.role === 'error' ? 'bg-red-100 text-red-800' : ''}`}
            >
              <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: renderMessageContent(msg.content) }}/>
            </div>
          </div>
        ))}
        {isLoading && history.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-xl flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
         {isLoading && history.length === 0 && (
            <div className="text-center p-4 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                Analysiere Ergebnisse...
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 border-t pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Warte auf Antwort..." : "Stellen Sie eine Folgefrage..."}
          className="flex-grow focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
        </button>
      </form>
    </div>
  );
};

export default AIAnalysis;
