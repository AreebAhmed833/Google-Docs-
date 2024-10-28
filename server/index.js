import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => {
    console.log('Connected to client');

    socket.on('get-document', documentId => {
        const data = ''  // Get your document data here
        socket.join(documentId);
        socket.emit('load-document', data);
    });

    socket.on('send-changes', delta => {
        socket.broadcast.emit('receive-changes', delta);
    });

    socket.on('save-document', async data => {
        // Save your document data here
    });
});