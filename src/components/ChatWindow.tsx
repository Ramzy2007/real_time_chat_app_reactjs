import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Col, Container, Row } from 'react-bootstrap';

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
}

interface ChatWindowProps {
    wsUrl: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ wsUrl }) => {
    const [conversations, setConversations] = useState<Conversation | null>(null);
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    const contacts: Contact[] = [
        { name: 'Ibrahim', phone: '+22891021160', sent_id: '1' },
        { name: 'John Doe', phone: '+22892011234', sent_id: '2' },
        { name: 'Jane Smith', phone: '+22893056789', sent_id: '3' },
        // Add more contacts here
    ];

    useEffect(() => {
        if (currentUserPhone) {
            ws.current = new WebSocket(wsUrl);

            ws.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                console.log('Received from WebSocket:', messageData);

                const { event: messageEvent, to, from, data } = messageData;

                if (messageEvent === 'text') {
                    setConversations((prevConversations) => {
                        if (!prevConversations) {
                            return null;
                        }
                        
                        return {
                            ...prevConversations,
                            messages: prevConversations.messages ? [...prevConversations.messages, data] : [data],
                        };
                    });
                }
                else if (messageEvent === 'getMessagesBySentId') {
                    setConversations({
                        to,
                        from,
                        messages: data,
                    });
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

    const sendMessage = (message: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && selectedPhone && currentUserPhone) {
            const contact = contacts.find((contact) => contact.phone === selectedPhone);
            if (contact) {
                const messageObject = {
                    event: 'text',
                    data: {
                        to: selectedPhone,
                        from: currentUserPhone,
                        name: contact.name,
                        text: message,
                    },
                };

                ws.current.send(JSON.stringify(messageObject));
            }
        }
    };

    const handleSelectPhone = (phone: string) => {
        if (!phone) return; // Verify that phone is not null

        setSelectedPhone(phone);
        const contact = contacts.find((contact) => contact.phone === phone);
        if (contact && ws.current && currentUserPhone) {
            const requestPayload = {
                event: 'getMessagesBySentId',
                data: { reciver_id: phone, sent_id: currentUserPhone }, // Request messages involving both IDs
            };
            ws.current.send(JSON.stringify(requestPayload));
        }
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
                <Row>
                    <Col md={4} className="conversation-list">
                        {/* Search bar and list of conversations */}
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
                                {contact.name} ({contact.phone})
                            </div>
                        ))}
                    </Col>
                    <Col md={8} >
                    <div className="message-list">
                        {selectedPhone && conversations ? (
                            <MessageList messages={conversations.messages} phone={currentUserPhone} />
                        ) : (
                            <p>Select a conversation to view messages</p>
                        )}
                        </div>
                        {selectedPhone && (
                            <MessageInput onSend={sendMessage} />
                        )}
                    </Col>
                </Row>
            )}
        </Container>
    );

    
};

export default ChatWindow;