import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { BouncyDiv } from '../styles/styled'
import InputEmoji from "react-input-emoji";
import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion"

import * as uuid from 'uuid';

import io from 'socket.io-client';

interface Message {
  id: string;
  name: string;
  text: string;
}

interface Payload {
  name: string;
  text: string;
}

const socket = io('https://warm-depths-70172.herokuapp.com/', { transports: ['websocket', 'polling', 'flashsocket'] });

const NChat: NextPage = () => {
  const [name, setName] = useState("");
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const drawerRef = useRef(null);

  function scrollToBottom() {
    drawerRef?.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    const getName = localStorage.getItem('name')
    setName(getName || '')
  }, [])

  useEffect(() => {
    function receivedMessage(message: Payload) {
      const newMessage: Message = {
        id: uuid.v4(),
        name: message.name,
        text: message.text,
      };

      setMessages([...messages, newMessage]);
      scrollToBottom()
    }

    socket.on('msgToClient', (message: Payload) => {
      receivedMessage(message);
    });
  }, [text, name, messages]);

  function validateInput() {
    return name.length > 0 && text.length > 0;
  }

  function sendMessage() {
    if (validateInput()) {
      const message: Payload = {
        name,
        text,
      };

      socket.emit('msgToServer', message);
      setText('');
    }
  }

  const variants = {
    old: { opacity: 1, x: 0 },
    closed: { opacity: [0, 1], x: "10px" },
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Se divirta, <label className={styles.hello}>{name}!</label>
        </h1>

        <BouncyDiv>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>chat &rarr;</h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 250,
                  overflowY: 'auto',
                }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    ref={drawerRef}
                    key={message.id}
                    className={name === message.name ? styles.cardMessageMe : styles.cardMessage}
                    animate={messages.length === index + 1 ? 'closed' : 'old'}
                    variants={variants}
                  >
                    <p>
                      {message.name}:
                    </p>

                    {message.text}
                  </motion.div>
                ))}
              </div>

              <InputEmoji
                value={text}
                onChange={setText}
                cleanOnEnter
                onEnter={sendMessage}
                placeholder="lança a braba ae"
              />
            </div>
          </div>
        </BouncyDiv>

      </main>
      {/* <footer className={styles.footer}>
        <h3 className={styles.powered}>
          Powered by Luís
        </h3>
      </footer> */}
    </div>
  )
}


export default NChat
