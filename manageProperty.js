const fs = require('fs');
const { serverProperty,globalValue,client } = require('./main');
const { setSlashCommands } = require('./deploy-command');
const { PermissionsBitField } = require('discord.js');
const { isUndefined } = require('util');

const getFile = new Promise((resolve, reject) => {
    fs.readFile('serverProperty.json', 'utf-8', (error, data) => {
        if (error) {
            console.log("property not loaded");
        } else {
            try {
                const serverList = client.guilds.cache.map(e=>e.id);
                const dataList = JSON.parse(data);
                setSlashCommands();//여기가 커멘드 설정하는 부분임.
                for (i in dataList) {
                    if (!serverList.includes(i)) {
                        console.log(i + "의 서버가 삭제됨")
                    } else {
                        serverProperty[i] = dataList[i];
                        globalValue[i] = {
                            sendSelectMenu: null,
                            sendEmbed1: null,
                            sendEmbed2: null,
                        }
                    }
                    
                };
                console.log("property loaded")
                console.log(JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3))
                resolve();
            } catch (e) {
                reject();
                throw new Error("파일을 불러올 수 없습니다!\n\n" + e.stack)
            }
        }
    });
})
const getProperty = async (message)=>{
    const json = {
        player: {},
        administrator: [],
        prefix: "!",
        notice:'',
        inviteRoom:''
    };
    if (!serverProperty[message.guild.id]) {
        //prefix(접두사) 기본은 느낌표
        serverProperty[message.guild.id] = json
        setSlashCommands(message.guild.id);
        globalValue[message.guild.id] ={
            sendSelectMenu:null,
            sendEmbed1:null,
            sendEmbed2:null,
        }
        const property = serverProperty[message.guild.id];
        property.player.volume = 80;

        fs.writeFile("serverProperty.json", JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3), (e) => {
            if (e) {
                message.channel.send({ embeds: [{ color: 0xff0000, title: "Error!(save property)", description: String(e) }] });
            } else {
                console.log("property new recorded")
                console.log("property saved")
            }
        })
    } else {
        for (let key in serverProperty) {
            serverProperty[key] = Object.assign({}, json, serverProperty[key]);
        }
    }
}


const addAdmin = async (message) => {
    const property = serverProperty[message.guild.id];
    if (!property.administrator.includes(message.author.id) && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        property.administrator.push(message.author.id);
        fs.writeFile("serverProperty.json", JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3), (e) => {
            if (e) {
                message.channel.send({ embeds: [{ color: 0xff0000, title: "Error!(save property)", description: String(e) }] });
            } else {
                console.log("Admin added!")
                console.log("property saved")
            }
        })
    }
}

module.exports = { getFile,getProperty,addAdmin }
