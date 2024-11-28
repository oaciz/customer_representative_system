import React from 'react';
import './css/Chat.css';

const Chat = () => {
  return (
    <div className="chat-container">
      <div className="card">
        <h2 className="chat-title">Mesajlaşma</h2>
        <p className="chat-description">Bu, chat bileşenidir.</p>
        <div className="chat-box">
          {/* Will chat added? */}
          <p>Yakında mesajlaşma özelliği burada olacak!</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
