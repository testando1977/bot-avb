const net = require('net');

const SERVER = '://vipchat.com.br'; 
const PORT = 6667;                    
const BOT_NICK = 'AVB';               
const CHANNEL = '#FCP';               

const client = net.connect({ host: SERVER, port: PORT }, () => {
    console.log('Bot AVB a ligar ao Vipchat...');
    client.write(`NICK ${BOT_NICK}\r\n`);
    client.write(`USER ${BOT_NICK} 0 * :Bot de Boas-Vindas Oficial\r\n`);
});

client.on('data', (data) => {
    const response = data.toString();
    
    if (response.startsWith('PING')) {
        client.write(response.replace('PING', 'PONG'));
    }

    if (response.includes('001 ' + BOT_NICK)) {
        // Envia a palavra-passe para o NickServ para se autenticar
        // Substitua '1234567890' pela senha que definiu no comando GROUP/REGISTER
        client.write(`PRIVMSG NickServ :IDENTIFY 1234567890\r\n`);
        
        setTimeout(() => {
            client.write(`JOIN ${CHANNEL}\r\n`);
        }, 2000);
    }

    if (response.includes(' JOIN :')) {
        try {
            const partes = response.split('!');
            const nickEmissor = partes[0].substring(1);
            
            if (nickEmissor !== BOT_NICK && nickEmissor.trim() !== "") {
                client.write(`PRIVMSG ${CHANNEL} :Olá ${nickEmissor}! Bem-vindo ao #FCP - Canal oficial dos fãs!\r\n`);
            }
        } catch (e) {
            console.log('Erro ao processar entrada.');
        }
    }
});
