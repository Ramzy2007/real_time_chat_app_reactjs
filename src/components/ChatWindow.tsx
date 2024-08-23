import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Col, Container, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPhone, faEllipsisV, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import './ChatWindow.css'; // Assurez-vous d'ajouter ce fichier CSS

export interface Message {
    from: string;
    to: string;
    text: string;
    name: string;
    time: number;
    _id?: string;
}

interface Conversation {
    to: string;
    from: string;
    messages: Message[] | null;
}

interface Contact {
    name: string;
    phone: string;
    sent_id: string;
    unread: number; // For unread messages badge
}

interface ChatWindowProps {
    wsUrl: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ wsUrl }) => {
    const [conversations, setConversations] = useState<{ [key: string]: Conversation }>({});
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    const contacts: Contact[] = [
        { name: 'Ibrahim', phone: '+22891021160', sent_id: '1', unread: 2 },
        { name: 'John Doe', phone: '+22892011234', sent_id: '2', unread: 0 },
        { name: 'Jane Smith', phone: '+22893056789', sent_id: '3', unread: 5 },
        // Add more contacts here
    ];

    useEffect(() => {
        if (currentUserPhone) {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                ws.current?.send(JSON.stringify({ event: 'register', clientId: currentUserPhone }));
            };

            ws.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                const { event: messageEvent, to, from, data } = messageData;

                if (messageEvent === 'text' && from) {
                    updateConversation(from, [data]);
                }

                if (messageEvent === 'getMessagesBySentId') {
                    updateConversation(to, data);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            return () => {
                if (ws.current) {
                    ws.current.close();
                }
            };
        }
    }, [wsUrl, currentUserPhone]);

    const updateConversation = (phone: string, newMessages: Message[]) => {
        Array.isArray(newMessages) &&  setConversations(prevConversations => ({
            ...prevConversations,
            [phone]: {
                ...prevConversations[phone],
                messages: [...(prevConversations[phone]?.messages || []), ...newMessages]
            }
        }));
    };

    const sendMessage = (message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && selectedPhone && currentUserPhone) {
            const contact = contacts.find((contact) => contact.phone === selectedPhone);
            if (contact) {
                const messageObject = {
                    event: 'text',
                    clientId: currentUserPhone,
                    data: {
                        to: selectedPhone,
                        from: currentUserPhone,
                        name: contact.name,
                        text: message,
                        time: Date.now(),
                    },
                };

                updateConversation(selectedPhone, [messageObject.data]);
                ws.current.send(JSON.stringify(messageObject));
            }
        }
    };

    const handleSelectPhone = (phone: string) => {
        if (!phone) return;

        setSelectedPhone(phone);

        //if (conversations[phone]?.messages?.length === 0 && ws.current && currentUserPhone) {
            const requestPayload = {
                event: 'getMessagesBySentId',
                clientId: currentUserPhone,
                data: { reciver_id: phone, sent_id: currentUserPhone },
            };
            ws.current?.send(JSON.stringify(requestPayload));
        //}
    };

    const filteredContacts = contacts
        .filter((contact) => contact.phone !== currentUserPhone)
        .filter((contact) =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm)
        );

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const input = (e.target as HTMLFormElement).elements.namedItem('phone') as HTMLInputElement;
        setCurrentUserPhone(input.value);
    };

    return (
        <Container fluid className="chat-window">
            {!currentUserPhone ? (
                <div className="phone-entry">
                    <form onSubmit={handlePhoneSubmit}>
                        <label htmlFor="phone">Enter your phone number:</label>
                        <input type="text" name="phone" id="phone" required />
                        <button type="submit">Start Chat</button>
                    </form>
                </div>
            ) : (
                <Row className="chat-layout">
                    <Col md={4} className="conversation-list">
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.phone}
                                className={`conversation ${selectedPhone === contact.phone ? 'active' : ''}`}
                                onClick={() => handleSelectPhone(contact.phone)}
                            >
                                <FontAwesomeIcon icon={faUser} className="contact-icon" />
                                <div className="contact-info">
                                    <div className="contact-name">{contact.name}</div>
                                    <div className="contact-phone">{contact.phone}</div>
                                </div>
                                {contact.unread > 0 && (
                                    <div className="unread-badge">{contact.unread}</div>
                                )}
                            </div>
                        ))}
                    </Col>
                    <Col md={8} className="message-area">
                        <div className="message-list">
                            {selectedPhone && conversations[selectedPhone] ? (
                                <MessageList messages={conversations[selectedPhone].messages} phone={currentUserPhone} />
                            ) : (
                                <p>Select a conversation to view messages</p>
                            )}
                        </div>
                        {selectedPhone && <MessageInput onSend={sendMessage} />}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ChatWindow;
