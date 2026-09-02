const WebSocket = require('ws');
const http = require('http');

// 1. MANTÉM O RENDER ONLINE (SITE FALSO)
const PORT_WEB = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot AVB Web Ativo\n');
}).listen(PORT_WEB);

// 2. LIGAÇÃO WEBSOCKET AO CHAT DO BATEPAPO / VIPCHAT
// Usamos o endereço de transmissão web seguro (wss)
const WS_URL = 'wss://:irc.vipchat.com.br/webchat'; 
const BOT_NICK = 'AVB';
const CHANNEL = '#FCP';

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('Ligado ao WebSocket do Batepapo!');
    // Protocolo de entrada via Webchat
    ws.send(`NICK ${BOT_NICK}\r\n`);
    ws.send(`USER ${BOT_NICK} 0 * :Bot de Boas-Vindas\r\n`);
});

ws.on('message', (data) => {
    const response = data.toString();
    
    // Responde ao Ping da rede para não cair
    if (response.startsWith('PING')) {
        ws.send(response.replace('PING', 'PONG'));
        return;
    }

    // Entra na sala quando a ligação é aceite
    if (response.includes(' 001 ') || response.includes(' 376 ')) {
        // MUDE 'SUA_SENHA_AQUI' para a tua senha do grupo de nicks
        ws.send(`PRIVMSG NickServ :IDENTIFY 1234567890\r\n`);
        
        setTimeout(() => {
            console.log(`A entrar na sala ${CHANNEL}...`);
            ws.send(`JOIN ${CHANNEL}\r\n`);
        }, 2000);
    }

    // Dispara as boas-vindas públicas na sala
    if (response.includes(' JOIN :' + CHANNEL) || response.includes(' JOIN ' + CHANNEL)) {
        const partes = response.split('!');
        const nickEmissor = partes[0].replace(':', '').trim();
        
        if (nickEmissor !== BOT_NICK && nickEmissor !== "") {
            ws.send(`PRIVMSG ${CHANNEL} :Olá ${nickEmissor}! Bem-vindo ao #FCP - Canal oficial dos fãs!\r\n`);
        }
    }
});

ws.on('error', (err) => {
    console.log('Erro na ligação Web:', err.message);
});
