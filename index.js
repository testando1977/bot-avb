const net = require('net');
const http = require('http');

// --- 1. SITE FALSO PARA MANTER O RENDER ONLINE ---
const PORT_WEB = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot AVB Ativo\n');
}).listen(PORT_WEB, () => {
    console.log(`Site falso ativo na porta ${PORT_WEB}`);
});

// --- 2. LIGAÇÃO AO VIPCHAT ---
const SERVER = 'irc.vipchat.com.br'; 
const PORT_IRC = 6667;                    
const BOT_NICK = 'AVB';               
const CHANNEL = '#FCP';               

const client = net.connect({ host: SERVER, port: PORT_IRC }, () => {
    console.log('A ligar à rede Vipchat...');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 8 * :Bot de Boas-Vindas\r\n`);
});

client.on('data', (data) => {
    const response = data.toString();
    console.log("IRC:", response); // Isto vai mostrar tudo na aba LOGS do Render
    
    // Responde ao PING do servidor para não ir abaixo
    if (response.startsWith('PING')) {
        const pingId = response.split(' ')[1];
        client.write(`PONG ${pingId}\r\n`);
        return;
    }

    // Entra no canal assim que a rede aceita o bot (código 001, 004, 251 ou 376)
    if (response.includes(' 001 ') || response.includes(' 376 ')) {
        // MUDE 'SUA_SENHA_AQUI' para a tua senha verdadeira do grupo de nicks
        client.write(`PRIVMSG NickServ :IDENTIFY SUA_SENHA_AQUI\r\n`);
        
        setTimeout(() => {
            console.log(`A forçar entrada no canal ${CHANNEL}`);
            client.write(`JOIN ${CHANNEL}\r\n`);
        }, 2000);
    }

    // GATILHO DE SAUDAÇÃO CORRIGIDO
    if (response.includes(' JOIN :#FCP') || response.includes(' JOIN #FCP')) {
        try {
            // Extrai o nick limpo de quem acabou de entrar
            const nickEmissor = response.split('!')[0].replace(':', '').trim();
            
            // Se não for o próprio bot, envia a mensagem na sala
            if (nickEmissor !== BOT_NICK && nickEmissor !== "") {
                client.write(`PRIVMSG ${CHANNEL} :Olá ${nickEmissor}! Bem-vindo ao #FCP - Canal oficial dos fãs!\r\n`);
            }
        } catch (e) {
            console.log('Erro ao processar o nick de entrada.');
        }
    }
});

client.on('error', (err) => {
    console.log('Erro de Socket:', err.message);
});
