import React from 'react';
import ChatWindow from './components/ChatWindow';
import 'bootstrap/dist/css/bootstrap.min.css';

const App: React.FC = () => {
    
    const wsUrl = 'ws://2wayscom-api-test.ktwasvr01.co/api/messages'; 

    return (
        <div className="app">
            <h1 className='text-center'>Chat</h1>
            <ChatWindow wsUrl={wsUrl} />
        </div>
    );
};

export default App;
