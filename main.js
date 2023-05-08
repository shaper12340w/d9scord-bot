const { Client, Collection, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActivityType } = require('discord.js');
const { createButtonSet, createSelectMenuSet, removeKey, getToday, youtubeURI, playdlResult, youtubeAPIResult, emitter } = require('./manageFunction');
const { isUndefined } = require('util');
const { writeFile, readdirSync } = require('fs');
const fs = require('fs');
const queue = new Map();
const serverProperty = new Map();
const globalValue = new Map();
const commandList = [];
const value = {};
const numberList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
process.noDeprecation = true;
process.env.MAIN = process.argv[1];
require('dotenv').config(); 

//렌덤 기능
Array.prototype.random = function () {
    const ranint = Math.floor(Math.random() * this.length)
    return this[ranint];
}
//배열에서 특정 요소 삭제+리턴

const client = new Client({
    intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildInvites,GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const listEmbed = {
    color: 0xdbce39,
    title: "곡을 골라주세요",
    description: '',
    footer: {
        text: '번호만 입력 또는 원치 않을 경우 "취소"를 써 주세요',
    }
}

function execfile(name, method) {
    const e = commandList.find(e => e.name === name);
    if (!e) return;
    const fn = method ? require(e.path)[method] : require(e.path).execute;
    return {[method || 'execute']: (...args) => fn(...args)};
};


function reload() {
    const path = require('path');

    const rootPath = __dirname
    const deletePath = path.join(rootPath, "commands")

    const deleteCachePaths = Object.keys(require.cache).filter((cachePath) => {
        return cachePath.includes(deletePath);
    });

    const result = deleteCachePaths.map((cachePath) => {
        delete require.cache[path.join(rootPath,"manageFunction")]
        delete require.cache[cachePath];
        return (`Deleted cache for ${path.relative(rootPath, cachePath)}`);
    });
    result.push(`Deleted cache for ${path.relative(rootPath, "manageFunction")}`);
    return result.join("\n");
} 

async function playYoutube(msg, data, option) {
    const id = msg.channel.id;
    const isLink = youtubeURI(data);
    const isInteraction = option.isInteraction ?? false;
    //링크 확인 부분
    if (isLink) {
        execfile("play","playMusic").playMusic(msg, isLink, { "isInteraction" : isInteraction , "isReply" : true , "isPlaydlData" : false });
    } else {
        const result = JSON.parse(JSON.stringify(await playdlResult(data,9)))
        if (isUndefined(value[id])) value[id] = {};
        value[id].result = result; //result 저장
        value[id].isTrue = true;//flag on
        listEmbed.description = '' +result.map((e, i) => {
            return numberList[i] + " | " + e.title
        }).join('\n');//embed에 넣을 설명

       //인터랙션의 경우
        if (isInteraction) {
            await msg.deferReply();
            value[id].sendEmbed = msg.editReply({ embeds: [listEmbed] })
            setTimeout(() => msg.deleteReply(), 10000);
        } else {
            value[id].sendEmbed = msg.reply({ embeds: [listEmbed] }).then((msg) => { setTimeout(() => msg.delete(), 10000) });
        }

        value[id].timer = setTimeout(() => {
            msg.channel.send("선택하지 않아 자동으로 1번 항목이 선택되었습니다");
            value[id].isTrue = false;
            const resultJSON = result[0]
            
            execfile("play","playMusic").playMusic(msg, resultJSON, { "isInteraction" : isInteraction , "isReply" : false , "isPlaydlData" : true });
            delete value[id];
        }, 10000);
    }

}

function saveProperty(){
    if (Object.keys(serverProperty).length > 0) {

        const json = {
            player: {},
            administrator: [],
            prefix: "!",
            notice:'',
            inviteRoom:''
        };
        for (let key in serverProperty) {
            serverProperty[key] = Object.assign({}, json, serverProperty[key]);
        }
        writeFile("serverProperty.json", JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3), (e) => {
            if (e) {
                throw new Error("파일을 저장할 수 없습니다!\n\n" + e.stack);
            } else {
                console.log("property saved")
            }
        })
    }
}
//자동 저장 예약
setInterval(() => {
    console.log("Auto saved")
    saveProperty();
}, (5 * 60 * 1000))

client.commands = new Collection();
const commandsPath = "./commands";

function fileRead() {
    return new Promise((resolve, reject) => {
        const readdirp = require("readdirp");
        const fileList = [];

        readdirp(commandsPath, { fileFilter: "*.js" })
            .on("data", (entry) => {
                fileList.push(entry.fullPath);
            })
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                if (fileList.length === 0) {
                    reject(new Error("No files found"));
                } else {
                    resolve(fileList);
                }
            });
    });
}
(async function () {
    const commandFiles = await fileRead();
    for (const file of commandFiles) {
        const command = require(file);
        commandList.push({"name":command.data.name,"path":file})
        client.commands.set(command.data.name, command);
    }
})();

module.exports =  { queue, serverProperty, globalValue, playYoutube, client }

//디코 클라 이벤트 리스너(메세지)
client.on('messageCreate', async (message) => {
    if (message.webhookId||!message.member) return;
    const { addAdmin } = require('./manageProperty');
    //어드민일경우 추가
    addAdmin(message);

    //로그 부분
    console.log(message.guild.name + "[" + message.channel.name + "] " + message.member.displayName + " : " + message.content);
    console.log(message.guild.id + " " + message.channel.id);

    //보낸 이가 봇일때
    if (message.author.bot) return false;
    //prefix
    const prefix = serverProperty[message.guild.id].prefix;

    if (value[message.channel.id]) {
        if (value[message.channel.id].isTrue) {
            let getMsg = Number(message.content.substring(0, 1)) - 1;
            if (!isNaN(getMsg) && getMsg >= 0) {
                clearTimeout(value[message.channel.id].timer);
                message.delete();
                const result = value[message.channel.id].result[getMsg]
                execfile("play","playMusic").playMusic(message,result,{ isPlaydlData : true , isReply : false , isInteraction : false });
                delete value[message.channel.id];
                
            } else if (message.content === "취소") {
                message.channel.send("취소되었습니다");
                clearTimeout(value[message.channel.id].timer);
                delete value[message.channel.id];
            }
        }
    }
    //eval
    if (message.content.startsWith(`${"?"}ev `)) {
        if (message.author.id !== "457797236458258433"&&((message.guild.id !== "1047500814584926209")||!(serverProperty[message.guild.id].administrator.includes(message.author.id)))) return;
        const evalmsg = message.content.replace(`${"?"}ev `, '');
        try {
            let result = eval(evalmsg);
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
    if (message.content === "샾봇 접두사") {
        message.channel.send('```\n접두사를 바꿀때 자신이 접두사에 공백을 넣을 것인지 말 것인지 생각해주세요!\n예를 들어"샤퍼야 "라고 저장을 해야만 "샤퍼야 ㅎㅇ" 와 같은 명령어가 작동됩니다\n만약 "샤퍼야"라고만 저장할 시엔 "샤퍼야ㅎㅇ"라고 작성해야만 작동됩니다```')
        message.channel.send(`현재 접두사 : ${prefix}\n변경 방법:${prefix}접두사 "샤퍼야 "\nㄴ> 샤퍼야 ㅎㅇ\n(서버 관리자만 가능합니다)`);
        message.channel.send("`이 명령어는 접두사를 잃어버렸을 때 찾기 위해 있습니다`");
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
        const comList = require("./modules/commandList.json");
        console.log(content);

        function executeExcludedFiles(name){
            switch(name){
                case "play":
                    if (!isUndefined(value[message.channel.id])) {
                        if (value[message.channel.id].isTrue) {
                            message.reply("선택이 끝나고 다시 시도해주세요")
                        }
                    } else {
                        playYoutube(message, content,{ isPlaydlData : true , isReply : false , isInteraction : false });
                    }
                break;
                case "prefix":
                    if (content.length < 0){
                        message.channel.send(`현재 접두사 : ${prefix}\n\n변경 방법:${prefix}접두사 "샤퍼야 "\nㄴ> 샤퍼야 ㅎㅇ\n(서버 관리자만 가능합니다)`);
                        return;
                    }
                    execfile("prefix").execute(message,{ isMessage : true, data: content });
                break;
            }
        }
        if (typeof content !== undefined) {
            comList.forEach(data => {
                if (data.commands.includes(msg)) {
                    if (data.content) {
                        execfile(data.name).execute(message, content)
                    } else if (data.excludedFiles) {
                        executeExcludedFiles(data.name)
                    } else {
                        execfile(data.name).execute(message)
                    }
                }
            })
        }

    }

});
//인터렉션
client.on('interactionCreate', async interaction => {
    const command = client.commands.get(interaction.commandName);

    try {
        if (interaction.isButton()) {
            emitter.emit(interaction.customId, interaction);
        }
        if (interaction.isModalSubmit()) {
            emitter.emit(interaction.customId, interaction);
        }
        if (interaction.isChatInputCommand()) {
            if (!command) return;
            await command.execute(interaction);
        }
        if (interaction.isStringSelectMenu()) {
            emitter.emit(interaction.customId, interaction);
        }
    } catch (e) {
        console.error(e);
       
    }

});

client.on('ready', () => {
    console.log("\n------------------------------------"+getToday()+"------------------------------------")
    console.log(`Logged in as ${client.user.tag}!`);
    const { getFile } = require("./manageProperty");
    getFile.then(() => {
        console.log("getFile executed");
    });
    client.user.setActivity(">_<")
});

client.on('guildCreate', (g) => {
    const { getProperty } = require('./manageProperty');
    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('[shapbot invited]')
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("샾봇을 추가해주셔서 감사합니다!\n\n추가 서버 설정 명령어 : /settings")
    .setFooter({text:'자세한 것은 도움말을 참고해 주세요'})
    const option = channel => channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)&&channel.type === 0
    const channel = g.channels.cache.filter(option).first();
    channel.send({embeds:[embed]}).catch(console.error);
    getProperty({guild:g});
    serverProperty[g.id].notice = channel.id;
    serverProperty[g.id].inviteRoom = channel.id;
})

client.on('guildMemberAdd', async member => {
    const welcomeImage = require('./manageFunction').welcomeImage
    if(serverProperty[member.guild.id].inviteRoom.length > 0){
        const link = "https://cdn.pixabay.com/photo/2016/05/24/16/48/mountains-1412683_960_720.png";
        const memberImage = member.displayAvatarURL({ extension: 'png' , size :4096 });
        const wlimg = await welcomeImage(member.user.username,memberImage,link)
        const sendChannel = member.guild.channels.cache.get(serverProperty[member.guild.id].inviteRoom);
        if(!sendChannel){
            const option = channel => channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)&&channel.type === 0
            const channel = member.guild.channels.cache.filter(option).first();
            channel.send({ files:[{attachment:wlimg,name:"asdf.png"}]});
        } else {
            sendChannel.send({ files:[{attachment:wlimg,name:"asdf.png"}]});
        }
    }
});
client.on('voiceStateUpdate', (oldState, newState) => {
    if (Object.keys(queue).length === 0) return;
    Object.keys(queue).forEach((value) => {
        const playValue = queue[value];
        const voiceChannel = client.channels.cache.get(playValue.option.playRoom);
        if (voiceChannel.members.size === 1 && voiceChannel.members.has(client.user.id) && playValue.player._state.status === "playing") {
            // 구독자 수가 0이면서 봇이 음성 채널에 있는 경우 일시 중지 메시지를 보냄
            playValue.player.pause();
            client.channels.cache.get(playValue.option.sendRoom).send({
                embeds: [{
                    color: 0x1c7fe8,
                    title: "⏸️ | 음성방에 아무도 없어 일시정지됨",
                    footer: {text:"/pause를 통해 재생!"}
                }]
            });
            queue[value].timer = setTimeout(()=>{
                client.channels.cache.get(queue[value].option.sendRoom).send({
                    embeds: [{
                        color: 0x1c7fe8,
                        title: "⏹️ | 30분동안 아무도 재생하지 않아 자동으로 정지되었습니다",
                    }]
                });
                if(queue[value].playButton) queue[value].playButton();
                queue[value].player.stop();
                queue[value].connection.destroy();
                delete queue[value]
            },30*60*1000)
        } else if(voiceChannel.members.size > 1 && voiceChannel.members.has(client.user.id) && playValue.player._state.status === "paused" && playValue.timer){
            client.channels.cache.get(playValue.option.sendRoom).send({
                embeds: [{
                    color: 0x1c7fe8,
                    title: "▶️ | 사람이 들어와서 자동재생됨",
                    footer: {text:"나가지마요ㅠ"}
                }]
            });
            playValue.player.unpause();
            clearTimeout(playValue.timer);
            delete queue[value].timer
        }
    })
});


client.login(process.env.DISCORD_TOKEN);

process.on('uncaughtException', function (err) {
    console.log(`\n-----------------${getToday()}-----------------`)
    console.log('Caught exception: ' + err.message);
    console.log('Exception name: ' + err.name);
    console.log('stack: ' + err.stack);
    fs.appendFile("error.txt", (`\n-----------------${getToday()}-----------------`+ "\n" + String(err.stack)), (error) => {
        if (error) throw error;
        console.log('\n');
      })
    // 예외 처리 로직을 구현합니다.
});
