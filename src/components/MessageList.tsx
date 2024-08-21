import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Message } from './ChatWindow';

interface MessageListProps {
    messages: Message[] | null;
    phone: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, phone }) => {
    // Ensure messages is an array
    if (!Array.isArray(messages) || messages.length === 0) {
        return <p>No messages yet.</p>;
    }

    return (
        <ListGroup className="message-list">
            {messages.map((message) => (
                <ListGroupItem
                    key={message._id || message.time}
                    className={`message ${message.from === phone ? 'sent' : 'received'}`}
                >
                    <div className={`d-flex ${message.from === phone ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className="message-content">
                            <span className="message-sender">{message.from}:</span>
                            <span>{message.text}</span>
                        </div>
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default MessageList;
