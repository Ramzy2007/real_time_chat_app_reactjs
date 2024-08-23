import React, { useState, KeyboardEvent } from 'react';
import './MessageInput.css'; // Assurez-vous d'avoir ce fichier CSS pour les styles

interface MessageInputProps {
    onSend: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche l'action par défaut du Enter (soumettre un formulaire)
            handleSend();
        }
    };

    return (
        <div className="message-input">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                onKeyDown={handleKeyDown}
                className="message-input-field"
            />
            <button onClick={handleSend} className="message-send-button">
                Send
            </button>
        </div>
    );
};

export default MessageInput;
