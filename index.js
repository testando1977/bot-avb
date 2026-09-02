const net = require('net');
const http = require('http');

// --- 1. SITE FALSO PARA O RENDER GRÁTIS ---
const PORT_WEB = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot AVB Ativo\n');
}).listen(PORT_WEB, () => {
    console.log(`Site falso ativo na porta ${PORT_WEB}`);
});

// --- 2. LIGAÇÃO REAL AO VIPCHAT ---
const SERVER = 'irc.vipchat.com.br'; 
const PORT_IRC = 6667;                    
const BOT_NICK = 'AVB';               
const CHANNEL = '#FCP';               

const client = net.connect({ host: SERVER, port: PORT_IRC }, () => {
    console.log('Bot AVB a ligar ao Vipchat...');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 8 * :Bot de Boas-Vindas Oficial\r\n`);
});

client.on('data', (data) => {
    const response = data.toString();
    console.log("Recebido do servidor:", response); // Mostra os logs reais no Render
    
    // Responde ao PING para não cair
    if (response.toUpperCase().startsWith('PING')) {
        client.write(response.toUpperCase().replace('PING', 'PONG'));
    }

    // CORRECÇÃO: Deteta qualquer confirmação de entrada na rede (código 001 ou welcome)
    if (response.includes(' 001 ') || response.includes('Welcome to the')) {
        // Substitua 'SUA_SENHA_AQUI' pela senha do seu grupo de nicks
        client.write(`PRIVMSG NickServ :IDENTIFY 1234567890\r\n`);
        
        // Entra na sala 3 segundos depois para dar tempo de autenticar
        setTimeout(() => {
            console.log(`A entrar no canal ${CHANNEL}...`);
            client.write(`JOIN ${CHANNEL}\r\n`);
        }, 3000);
    }

    // Processa a saudação quando alguém entra
    if (response.includes(' JOIN :') || response.includes(' JOIN #' + CHANNEL)) {
        try {
            const nickEmissor = response.split('!')[0].replace(':', '').trim();
            
            if (nickEmissor !== BOT_NICK && nickEmissor !== "") {
                client.write(`PRIVMSG ${CHANNEL} :Olá ${nickEmissor}! Bem-vindo ao #FCP - Canal oficial dos fãs!\r\n`);
            }
        } catch (e) {
            console.log('Erro ao saudar utilizador.');
        }
    }
});

client.on('error', (err) => {
    console.log('Erro na ligação socket:', err.message);
});
