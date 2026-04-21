import React, { useState } from 'react';
import {
  TextArea,
  Button,
  Tile,
  Stack,
} from '@carbon/react';
import { SendAlt } from '@carbon/icons-react';

const AIAssistantTab = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you write compelling marketing communications, suggest improvements, or answer questions about your content. How can I help you today?',
    },
  ]);

  const handleSend = () => {
    if (!prompt.trim()) return;

    setMessages([
      ...messages,
      { role: 'user', content: prompt },
      { role: 'assistant', content: 'This is a placeholder response. AI integration would go here.' },
    ]);
    setPrompt('');
  };

  return (
    <div className="ai-assistant-tab">
      <div className="ai-header">
        <h2>🤖 AI Assistant</h2>
        <p>Get help writing and improving your communications</p>
      </div>

      <div className="chat-container">
        <Stack gap={4}>
          {messages.map((message, index) => (
            <Tile key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'assistant' ? '🤖 AI Assistant' : '👤 You'}
              </div>
              <div className="message-content">{message.content}</div>
            </Tile>
          ))}
        </Stack>
      </div>

      <div className="chat-input">
        <TextArea
          id="ai-prompt"
          labelText=""
          placeholder="Ask me anything about your communication..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <Button
          kind="primary"
          renderIcon={SendAlt}
          onClick={handleSend}
          disabled={!prompt.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default AIAssistantTab;

// Made with Bob
