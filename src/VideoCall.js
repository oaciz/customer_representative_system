import React, { useRef, useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, setDoc, doc, getDoc, query, where, deleteDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const VideoCall = () => {
  const history = useHistory();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [pc, setPc] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [currentCallDoc, setCurrentCallDoc] = useState(null);

  // Kullanıcı doğrulama ve oturum durumu
  useEffect(() => {
    const checkAuth = async () => {
      const loggedInUser = localStorage.getItem('currentUser');
      if (!loggedInUser) {
        alert('Lütfen önce giriş yapın!');
        history.push('/login');
        return;
      }
      const user = JSON.parse(loggedInUser);
      setCurrentUser(user);

      const userStatusRef = doc(db, 'userStatus', user.email);
      await setDoc(userStatusRef, { 
        online: true,
        lastSeen: new Date().toISOString(),
        email: user.email
      });

      window.addEventListener('beforeunload', async () => {
        await setDoc(userStatusRef, { 
          online: false,
          lastSeen: new Date().toISOString(),
          email: user.email
        });
      });
    };

    checkAuth();

    return () => {
      if (currentUser?.email) {
        const userStatusRef = doc(db, 'userStatus', currentUser.email);
        setDoc(userStatusRef, {
          online: false,
          lastSeen: new Date().toISOString(),
          email: currentUser.email
        });
      }
    };
  }, [history]);

  // Çevrimiçi kullanıcılar ve gelen aramalar
  useEffect(() => {
    if (!currentUser?.email) return;

    const q = query(
      collection(db, 'userStatus'),
      where('online', '==', true),
      where('email', '!=', currentUser.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setOnlineUsers(users);
    });

    const callsQuery = query(
      collection(db, 'calls'),
      where('targetUser', '==', currentUser.email),
      where('status', '==', 'pending')
    );

    const callsUnsubscribe = onSnapshot(callsQuery, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          setIncomingCall({
            id: doc.id,
            ...doc.data(),
          });
        });
      } else {
        setIncomingCall(null);
      }
    });

    return () => {
      callsUnsubscribe();
    };
  }, [currentUser?.email]);

  // WebRTC bağlantısını kurma
  const setupWebRTC = async () => {
    try {
      const servers = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };

      const peerConnection = new RTCPeerConnection(servers);
      setPc(peerConnection);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      
      peerConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      return peerConnection;
    } catch (error) {
      console.error('WebRTC kurulumu sırasında hata:', error);
    }
  };

  // Arama başlatma
  const callUser = async (targetUser) => {
    const peerConnection = await setupWebRTC();
    setCallActive(true);

    const callDoc = doc(collection(db, 'calls'));
    setCurrentCallDoc(callDoc);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    await setDoc(callDoc, {
      offer: {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      },
      createdBy: currentUser.email,
      targetUser: targetUser.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !peerConnection.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  };

  // Gelen aramayı yanıtlama
  const answerCall = async () => {
    if (!incomingCall) return;

    const peerConnection = await setupWebRTC();
    setCallActive(true);
    const callDoc = doc(db, 'calls', incomingCall.id);
    setCurrentCallDoc(callDoc);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData.offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    await setDoc(callDoc, {
      answer: {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      },
      status: 'answered' // Durumu güncelliyoruz
    }, { merge: true });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });

    setIncomingCall(null);
  };

  // Aramayı sonlandırma
  const endCall = async () => {
    if (pc) {
      pc.close();
      setPc(null);
    }
  
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
  
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
  
    setCallActive(false);
  
    if (currentCallDoc) {
      await setDoc(currentCallDoc, { status: 'ended' }, { merge: true });
      setCurrentCallDoc(null);
    }
  };

  return (
    <div className="video-call-container">
      <h2>Video Görüşmesi</h2>
      {currentUser && <p className="user-info">Kullanıcı: {currentUser.email}</p>}
      
      <div className="online-users-section">
        <h3>Çevrimiçi Kullanıcılar ({onlineUsers.length})</h3>
        {onlineUsers.length === 0 ? (
          <p>Şu anda çevrimiçi kullanıcı bulunmuyor.</p>
        ) : (
          <ul className="users-list">
            {onlineUsers.map((user) => (
              <li key={user.email} className="user-item">
                <span>{user.email}</span>
                <button 
                  onClick={() => callUser(user)}
                  disabled={!currentUser || callActive}
                  className="call-button"
                >
                  Ara
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {incomingCall && !callActive && (
        <div className="incoming-call-alert">
          <p>{incomingCall.createdBy} arıyor...</p>
          <div className="call-actions">
            <button onClick={answerCall} className="answer-button">Cevapla</button>
            <button onClick={() => setIncomingCall(null)} className="reject-button">Reddet</button>
          </div>
        </div>
      )}

      {callActive && (
        <div className="call-action-buttons">
          <button onClick={endCall} className="end-call-button">Aramayı Sonlandır</button>
        </div>
      )}

      <div className="video-container">
        <div className="local-video">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            width="400" 
          />
          <p>Siz</p>
        </div>
        <div className="remote-video">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            width="400" 
          />
          <p>Karşı Taraf</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;