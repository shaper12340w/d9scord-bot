const { Client, Collection, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { google } = require('googleapis');
const { isUndefined } = require('util');
const fs = require('fs');
const queue = new Map();
const serverProperty = new Map();
const globalValue = new Map();
const value = {};
const numberList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
require('dotenv').config();

//렌덤 기능
Array.prototype.random = function () {
    const ranint = Math.floor(Math.random() * this.length)
    return this[ranint];
}
//배열에서 특정 요소 삭제+리턴
function removeKey(arr, find) {
    const index = arr.findIndex(e=>e === find);
    if (index < 0){ return arr; } else { return [...arr.slice(0, index), ...arr.slice(index + 1)] }
}

function getToday(){
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API,
});

const embed2 = {
    color: 0xdbce39,
    title: "곡을 골라주세요",
    description: '',
    footer: {
        text: '번호만 입력 또는 원치 않을 경우 "취소"를 써 주세요',
    }
}

async function getResult(e) {
    return await youtube.search.list({
        part: 'id,snippet',
        q: e,
        type: 'video',
        maxResults: 9,
    });
}
//노래 재생 코드
async function exec(msg,data,option) {
    const id = msg.channel.id;
    const result = await getResult(data)
    if (isUndefined(value[id])) value[id] = {};
    value[id].result = result;
    value[id].description = result.data.items.map((e, i) => {
        return numberList[i] + " | " + e.snippet.title
    })
    value[id].isTrue = true;
    embed2.description = '' + value[id].description.join('\n') + '';
    if(option){
        await msg.deferReply();
        value[id].sendEmbed = msg.editReply({ embeds: [embed2] })
        setTimeout(() => msg.deleteReply(), 10000);             
    } else {
        value[id].sendEmbed = msg.reply({ embeds: [embed2] }).then((msg) => { setTimeout(() => msg.delete(), 10000) });
    }
    value[id].timer = setTimeout(() => {
        msg.channel.send("선택하지 않아 자동으로 1번 항목이 선택되었습니다");
        value[id].isTrue = false;
        const videoId = value[id].result.data.items[0].id.videoId;
        let playing = require("./commands/play.js");
        playing.playMusic(msg,videoId,option);
        delete value[id];
    }, 10000);
}
//어드민 추가 코드
async function addAdmin(message) {
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
//자동 저장 예약
setInterval(() => {
    if (Object.keys(serverProperty).length > 0) {
        fs.writeFile("serverProperty.json", JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3), (e) => {
            if (e) {
                throw new Error("파일을 저장할 수 없습니다!\n\n" + e.stack);
            } else {
                console.log("Auto saved")
                console.log("property saved")
            }
        })
    }
}, (5 * 60 * 1000))

client.commands = new Collection();
const commandsPath = "./commands"
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = commandsPath + "/" + file
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

module.exports = { queue, serverProperty, globalValue, exec }

//디코 클라 이벤트 리스너(메세지)
client.on('messageCreate', async (message) => {
    const { getFile, getProperty } = require('./manageProperty');
    //property 설정하기
    getProperty(message);
    //어드민일경우 추가
    addAdmin(message);

    //로그 부분
    console.log(message.guild.name + "[" + message.channel.name + "] " + message.member.displayName + " : " + message.content);
    console.log(message.guild.id + " " + message.channel.id);

    //보낸 이가 봇일때
    if (message.author.bot) return false;
    //prefix
    const prefix = serverProperty[message.guild.id].prefix;

    //play 목록 확인 부분
    if (!isUndefined(value[message.channel.id])) {
        if (value[message.channel.id].isTrue) {
            let getMsg = Number(message.content.substring(0, 1)) - 1;
            if (!isNaN(getMsg) && getMsg >= 0) {
                clearTimeout(value[message.channel.id].timer);
                message.delete();
                const id = value[message.channel.id].result.data.items[getMsg].id.videoId;
                let playing = require("./commands/play.js");
                playing.playMusic(message, id);
                delete value[message.channel.id];
                
            } else if (message.content === "취소") {
                message.channel.send("취소되었습니다");
                clearTimeout(value[message.channel.id].timer);
                delete value[message.channel.id];
            }
        }
    }
    //eval
    if (message.content.startsWith(`${"!"}ev `)) {
        if (message.author.id !== "457797236458258433"||((message.guild.id === "1047500814584926209")&&(serverProperty[message.guild.id].administrator.includes(message.author.id)))) return;
        msg = message.content.replace(`${"!"}ev `, '');
        try {
            let result = eval(msg);
            if (result == null || result == undefined) {
                message.reply("ERROR : result is null or undefined");
            } else if (result.length === 0 || result === " ") {
                message.reply("ERROR: message is empty");
            } else {
                message.reply('```js\n' + String(result).substring(0, 2000) + '```');
            }
        } catch (e) {
            message.reply(String(e));
        }
    }
    //ㅎㅇ
    if (message.content === `${prefix}ㅎㅇ`) {
        const list1 = ["반갑다", "그래", "ㅎㅇ?", "안녕하세요", "왜"];
        const list2 = ["반갑습네다", "무슨 일이옵네까", "안녕하시라요", "부르셨습네까"];
        if (serverProperty[message.guild.id].administrator.includes(message.author.id)) {
            message.reply(`${list2.random()} 뤼대한 ${message.member.displayName}님`);
        } else {
            message.reply(list1.random());
        }
    }
    if (message.content.startsWith(prefix)) {
        //msg = 명령어 | content = 명령어 뒤
        const msg = message.content.replace(prefix, '').split(" ")[0];
        const con = message.content.replace(prefix, '').replace(msg, '');
        const content = con.startsWith(" ") ? con.replace(" ", '') : con;
        console.log(content);
        if (typeof content !== undefined) {
            switch (msg) {
                case "play":
                case "재생":
                case "노래":
                case "틀어줘":
                    //선택 중 꼬임 방지 코드
                    if (!isUndefined(value[message.channel.id])) {
                        if (value[message.channel.id].isTrue) {
                            message.reply("선택이 끝나고 다시 시도해주세요")
                        }
                    } else {
                        exec(message, content);
                    }
                    break;
                case "stop":
                case "정지":
                case "멈춰":
                case "나가":
                case "나가기":
                    let stop = require("./commands/stop.js");
                    stop.execute(message);
                    break;
                case "pause":
                case "일시정지":
                    let pause = require("./commands/pause.js");
                    pause.execute(message);
                    break;
                case "skip":
                case "스킵":
                case "다음곡":
                    let skip = require("./commands/skip.js");
                    skip.execute(message);
                    break;
                case "playing":
                case "큐":
                case "듣는곡":
                    let nowplaying = require("./commands/nowplaying.js");
                    nowplaying.execute(message);
                    break;
                case "list":
                case "리스트":
                case "목록":
                    let list = require("./commands/list.js");
                    list.execute(message);
                    break;
                case "volume":
                case "볼륨":
                case "음량":
                    let volume = require("./commands/volume.js");
                    volume.execute(message, content);
                    break;
                default:
                    break;
            }
        }
    }

});
//인터렉션
client.on('interactionCreate', async interaction => {
    const command = client.commands.get(interaction.commandName);

    try {
        if (interaction.isChatInputCommand()) {
            
            if (interaction.commandName === 'ping') {
            }
            if (!command) return;
            await command.execute(interaction);
        }
        if (interaction.isStringSelectMenu()) {
            const { play } = require("./manageQueue");
            if (!interaction.values.find(e => e.startsWith("list_"))) {
                interaction.reply(interaction.values.join(","))
            }
            else if (queue[interaction.guild.id]) {
                const isList = (interaction.values[0].split("_")[0] === "list");
                if (isList) {
                    const index = Number(interaction.values[0].split("_")[1]);
                    play(interaction.guild.id, index);
                    client.channels.fetch(interaction.channel.id).then(async (channel) => {
                        await channel.messages.delete(globalValue[interaction.guild.id].sendSelectMenu);
                    });
                    interaction.channel.send({ embeds: [queue[interaction.guild.id].playlist[index].embed] }).then();
                    queue[interaction.guild.id].nowPlaying = JSON.parse(JSON.stringify(queue[interaction.guild.id].playlist[index]));
                    queue[interaction.guild.id].playlist.splice(queue[interaction.guild.id].playIndex,1);
                    queue[interaction.guild.id].playIndex = index-1;
                }
            }

        }
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

});

client.on('ready', () => {
    console.log("\n------------------------------------"+getToday()+"------------------------------------")
    console.log(`Logged in as ${client.user.tag}!`);
    const { getFile } = require("./manageProperty");
    getFile.then(() => {
        console.log("getFile executed");
    });
});


client.login(process.env.DISCORD_TOKEN);