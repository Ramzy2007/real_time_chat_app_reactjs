import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Message } from './ChatWindow';
import './MessageList.css'; // Assurez-vous de créer et d'utiliser ce fichier CSS

interface MessageListProps {
    messages: Message[] | null;
    phone: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, phone }) => {
    if (!messages || messages.length === 0) {
        return <p>No messages yet.</p>;
    }

    return (
        <ListGroup className="message-list">
            {Array.isArray(messages) && messages.map((message) => (
                <ListGroupItem
                    key={message._id || message.time}
                    className={`message-item ${message.from === phone ? 'sent' : 'received'}`}
                >
                    <div className={`message-container ${message.from === phone ? 'sent' : 'received'}`}>
                        {message.from !== phone && (
                            <div className="avatar">
                                {/* Remplacez par une image d'avatar ou des initiales */}
                                <span>{message.from.charAt(0)}</span>
                            </div>
                        )}
                        <div className="message-bubble">
                            <div className="message-content">
                                <span className="message-text">{message.text}</span>
                                <div className="message-time">
                                    {new Date(message.time).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                        {message.from === phone && (
                            <div className="message-status">
                                {/* Ajouter l'icône de statut de message ici */}
                            </div>
                        )}
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default MessageList;
