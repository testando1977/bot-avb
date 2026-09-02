const tls = require('tls');
const http = require('http');

// --- 1. SITE FALSO PARA MANTER O RENDER GRÁTIS ONLINE ---
const PORT_WEB = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot AVB Web Ativo\n');
}).listen(PORT_WEB, () => {
    console.log(`Site falso ativo na porta ${PORT_WEB}`);
});

// --- 2. LIGAÇÃO NATIVAMENTE SEGURA (TLS) AO IRC DO VIPCHAT ---
const SERVER = '://vipchat.com.br'; 
const PORT_IRC = 6697; // Porta TLS/SSL segura padrão de IRC                   
const BOT_NICK = 'AVB';               
const CHANNEL = '#FCP';               

const client = tls.connect(PORT_IRC, SERVER, { rejectUnauthorized: false }, () => {
    console.log('Ligado de forma segura à rede Vipchat!');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 0 * :Bot de Boas-Vindas Oficial\r\n`);
});

client.on('data', (data) => {
    const response = data.toString();
    console.log("IRC:", response); // Mostra o progresso real nos logs do Render
    
    if (response.startsWith('PING')) {
        client.write(response.replace('PING', 'PONG'));
        return;
    }

    if (response.includes(' 001 ') || response.includes(' 376 ')) {
        // Substitua 'SUA_SENHA_AQUI' pela palavra-passe verdadeira da sua conta
        client.write(`PRIVMSG NickServ :IDENTIFY 1234567890\r\n`);
        
        setTimeout(() => {
            console.log(`A entrar no canal ${CHANNEL}...`);
            client.write(`JOIN ${CHANNEL}\r\n`);
        }, 2000);
    }

    if (response.includes(' JOIN :') || response.includes(' JOIN #' + CHANNEL)) {
        try {
            // Extrai de forma limpa o nick de quem entrou
            const partes = response.split('!');
            let nickEmissor = partes[0];
            if (nickEmissor.startsWith(':')) {
                nickEmissor = nickEmissor.substring(1);
            }
            
            if (nickEmissor !== BOT_NICK && nickEmissor.trim() !== "") {
                client.write(`PRIVMSG ${CHANNEL} :Olá ${nickEmissor}! Bem-vindo ao #FCP - Canal oficial dos fãs!\r\n`);
            }
        } catch (e) {
            console.log('Erro ao saudar.');
        }
    }
});

client.on('error', (err) => {
    console.log('Erro na ligação segura:', err.message);
});
