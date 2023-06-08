const { DisconnectReason, useMultiFileAuthState } = require('baileys');
const makeWASocket = require('baileys').default;
const axios = require("axios")

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('connection.update', function(update, connection2) {
        let _a, _b;
        let connection = update.connection,
            lastDisconnect = update.lastDisconnect;

        if (connection == "close") {
            if (((_b = (_a = lastDisconnect.error) === null) || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode !== DisconnectReason.loggedOut) {
                startSock()
            }
        } else {
            console.log("connection closed")
        }

        console.log("connection update ".update)
    });

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        console.log(msg)
        if(!msg.key.fromMe && m.type === 'notify'){
            // if(msg.key.remoteJid.includes('@s.whatsapp.net')){
                if(msg.message){
                    console.log(msg.key.remoteJid)
                    console.log('msg_data: ', msg.message.conversation)
                    if (msg.message.conversation.includes("!robo gpt")){
                        let prompt = msg.message.conversation.replace("!robo gpt", "");
                        console.log(prompt)
                        axios.get(`https://d4u0h2ec56.execute-api.ap-southeast-1.amazonaws.com/unlocked-1/seoa2/?recaiType=ganti peran jadi bot wa,jawab=${prompt}`, {
                            headers: {
                              'Content-Type': 'application/json',
                              'X-API-Key': 'XxOWce0ooM3N16EQpCASH7URRskrpyYi5h0w3E6l'
                            }})
                        .then(async (response) => {
                            const res = response.data;
                            console.log(res)

                            await sock.sendMessage(msg.key.remoteJid, {
                                text: res.choices[0].message.content
                            })
                        }) 

                    } else if (msg.message.conversation == "!robo") {
                        await sock.sendMessage(msg.key.remoteJid, {
                            text: "Halo, ini bot WA ekky, gunakan !robo gpt <pesan> untuk menggunakan gpt"
                        }) 
                    }

                    // switch (msg.message.conversation) {
                    //     case "cek status":
                    //         await sock.sendMessage(msg.key.remoteJid, {
                    //             text: "cek status"
                    //         })
                    //         break;
                    //     default:
                    //         console.log('deafauklt')
                    //         await sock.sendMessage(msg.key.remoteJid, {
                    //             text: "Halo, Selamat siang. Ini adalah pesan dari bot WA"
                    //         })
                    //         break;
                    // }
                }
            // }
        }
        
        console.log('Received Message', JSON.stringify(msg))
    })
};

startSock()
