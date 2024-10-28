import { useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styled from '@emotion/styled';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

// Define a styled component for the editor and toolbar
const Component = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${({ theme }) => (theme === 'dark' ? '#333' : '#F5F5F5')};
    color: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
    height: 100vh;
    padding: 20px;

    .ql-toolbar.ql-snow {
        display: flex;
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 1;
        background: ${({ theme }) => (theme === 'dark' ? '#444' : '#F3F3F3')};
        border: 1px solid #ccc;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
        width: 100%;

        button {
            color: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
        }
        
        .ql-stroke {
            stroke: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
        }
        
        .ql-fill {
            fill: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
        }
        
        .ql-picker {
            color: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
        }
    }

    .ql-container.ql-snow {
        border: none;
        background: ${({ theme }) => (theme === 'dark' ? '#222' : 'white')};
        color: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#000')};
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
        min-height: 80vh;
        width: 80%;
        max-width: 800px;
        margin: auto;
    }

    .ql-editor::before {
        color: ${({ theme }) => (theme === 'dark' ? '#ccc' : '#888')};
        font-style: italic;
    }
`;

// Define a styled toggle button
const ToggleButton = styled.button`
    background: ${({ theme }) => (theme === 'dark' ? '#444' : '#eee')};
    color: ${({ theme }) => (theme === 'dark' ? '#FFF' : '#333')};
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 10px;
    transition: all 0.3s ease;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);

    &:hover {
        background: ${({ theme }) => (theme === 'dark' ? '#666' : '#ccc')};
    }
`;

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean']
];


const Editor = () => {
    const [theme, setTheme] = useState('light'); // Set default theme to light
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const { id } = useParams();

    // Toggle theme function
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const container = document.getElementById('container');
        if (!container) return;
        container.innerHTML = '';
        const editor = document.createElement('div');
        container.append(editor);

        const quillServer = new Quill(editor, { 
            theme: 'snow', 
            modules: { toolbar: toolbarOptions },
            placeholder: 'Start typing here...'
        });
        
        setQuill(quillServer);

        return () => {
            container.innerHTML = '';
        }
    }, []);

    useEffect(() => {
        const socketServer = io('http://localhost:9000', {
            'force new connection': true,
            reconnectionAttempts: 'Infinity',
            timeout: 10000,
            transports: ['websocket']
        });

        socketServer.on('connect', () => {
            console.log('Connected to socket server');
            if (quill) {
                quill.enable();
                quill.setText('Connected! You can start editing...');
            }
        });

        socketServer.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            console.log('Trying to connect...');
        });

        setSocket(socketServer);

        return () => {
            socketServer.disconnect();
        }
    }, [quill]);

    useEffect(() => {
        if (!socket || !quill) return;

        const handleChange = (delta, oldData, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        }

        quill.on('text-change', handleChange);

        return () => {
            quill.off('text-change', handleChange);
        }
    }, [quill, socket])

    useEffect(() => {
        if (!socket || !quill) return;

        const handleChange = (delta) => {
            quill.updateContents(delta);
        }

        socket.on('receive-changes', handleChange);

        return () => {
            socket.off('receive-changes', handleChange);
        }
    }, [quill, socket]);

    useEffect(() => {
        if (!socket || !quill || !id) return;

        socket.once('load-document', document => {
            quill.setContents(document || { ops: [] });
            quill.enable();
        });

        socket.emit('get-document', id);
    }, [quill, socket, id]);

    useEffect(() => {
        if (!socket || !quill) return;

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, 2000);

        return () => {
            clearInterval(interval);
        }
    }, [socket, quill]);

    return (
        <Component theme={theme}>
            <ToggleButton theme={theme} onClick={toggleTheme}>
                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </ToggleButton>
            <div id="container"></div>
        </Component>
    )
}

export default Editor;
