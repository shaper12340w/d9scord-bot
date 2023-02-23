const { Client,Collection,GatewayIntentBits,PermissionsBitField } = require('discord.js');
const { google } = require('googleapis');
const { isUndefined } = require('util');
const fs = require('fs');
const queue = new Map();
const serverProperty = new Map();
const globalValue = new Map();
const value = {};
const numberList = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
require('dotenv').config();


Array.prototype.random = function (){
    const ranint = Math.floor(Math.random()*this.length)
    return this[ranint];
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API,
});

const embed2 = {
    color : 0xdbce39,
    title : "곡을 골라주세요",
    description : '',
    footer: {
		text: '번호만 입력 또는 원치 않을 경우 "취소"를 써 주세요',
    }
}

async function getResult(e){
    return await youtube.search.list({
        part: 'id,snippet',
        q: e,
        type: 'video',
        maxResults: 9,
    });
}
//노래 재생 코드
async function exec(msg,data){
    const id = msg.guild.id;
    const result = await getResult(data)
    if(isUndefined(value[id])) value[id] = {};
    value[id].result = result;
    value[id].description = result.data.items.map((e, i) => {
        return numberList[i] + " | " + e.snippet.title
    })
    value[id].isTrue = true;
    embed2.description = ''+value[id].description.join('\n')+'';
    value[id].sendEmbed = msg.channel.send({ embeds: [embed2] }).then((msg)=>{setTimeout(()=>msg.delete(),10000)});
    value[id].timer = setTimeout(()=>{
        msg.channel.send("선택하지 않아 자동으로 1번 항목이 선택되었습니다");
        value[id].isTrue = false;
        const videoId = value[id].result.data.items[0].id.videoId;
        let playing = require("./commands/play.js");
        playing.execute(msg, videoId);
        delete value[msg.guild.id];
    },10000);
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
setInterval(()=>{
    if (Object.keys(serverProperty).length > 0) {
        fs.writeFile("serverProperty.json", JSON.stringify(Object.fromEntries(Object.entries(serverProperty)), null, 3), (e) => {
            if (e) {
                throw new Error("파일을 저장할 수 없습니다!\n\n"+e.stack);
            } else {
                console.log("type1")
                console.log("property saved")
            }
        })
    }
},(5*60*1000))

client.commands = new Collection();
const commandsPath = "./slash"
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = commandsPath+"/"+file
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

module.exports = { queue,serverProperty,globalValue }

//디코 클라 이벤트 리스너(메세지)
client.on('messageCreate', async (message) => {
    const { getFile,getProperty } = require('./manageProperty');
    //로그 부분
    console.log(message.guild.name+"["+message.channel.name+"] "+message.member.displayName+" : "+message.content);
    console.log(message.guild.id+" "+message.channel.id);
    //보낸 이가 봇일때
    if (message.author.bot) return false;
    if(!serverProperty[message.guild.id]){
        //serverProperty 불러오기
        getFile.then(()=>{
            //property 설정하기
            getProperty(message);
            console.log("getFile executed");
        });
    } else {
        const prefix = serverProperty[message.guild.id].prefix;
        addAdmin(message);
        //play 목록 확인 부분
        if (!isUndefined(value[message.guild.id])) {
            if (value[message.guild.id].isTrue) {
                let getMsg = Number(message.content.substring(0, 1)) - 1;
                if (!isNaN(getMsg) && getMsg >= 0) {
                    clearTimeout(value[message.guild.id].timer);
                    message.delete();
                    const id = value[message.guild.id].result.data.items[getMsg].id.videoId;
                    let playing = require("./commands/play.js");
                    playing.execute(message, id);
                    delete value[message.guild.id];
                } else if (message.content === "취소") {
                    message.channel.send("취소되었습니다");
                    clearTimeout(value[message.guild.id].timer);
                    delete value[message.guild.id];
                }
            }
        }
        //eval
        if (message.content.startsWith(`${"!"}ev `)) {
            if (!(message.author.id === "457797236458258433")) return;
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
        if (message.content.startsWith(prefix)){
            //msg = 명령어 | content = 명령어 뒤
            const msg = message.content.replace(prefix,'').split(" ")[0];
            const con = message.content.replace(prefix,'').replace(msg,'');
            const content = con.startsWith(" ") ? con.replace(" ",'') : con;
            console.log(content);
            if(typeof content !== undefined){
            switch(msg){
                case "play":
                case "재생":
                case "노래":
                case "틀어줘":
                    //선택 중 꼬임 방지 코드
                    if(!isUndefined(value[message.guild.id])){
                        if(value[message.guild.id].isTrue){
                            message.reply("선택이 끝나고 다시 시도해주세요")
                        }
                    }else{
                        exec(message,content);
                    }
                    break;
                case "stop":
                case "정지":
                case "멈춰":
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
                case "queue":
                case "쿼리":
                case "듣는곡":
                    let queue = require("./commands/queue.js");
                    queue.execute(message);
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
                    volume.execute(message,content);
                    break;
                case "leave":
                case "나가기":
                case "종료":
                    let leave =require("./commands/leave.js");
                    leave.execute(message);
                    break;
                default:
                    break;
            }
        }
        }
    }
});
//인터렉션
client.on('interactionCreate', async interaction => {
    const command = client.commands.get(interaction.commandName);
    
    try {
        if (interaction.isChatInputCommand()) {
            if (!command) return;
            await command.execute(interaction);
        } 
        if (interaction.isStringSelectMenu()) {
            const { play } = require("./manageQueue");
            if (queue[interaction.guild.id]) {
                interaction.values.forEach((e)=>{
                    const isList = (e.split("_")[0] === "list");
                    if(isList){
                        const index = Number(e.split("_")[1]); //0번부터 시작 지금 재생중인 곡 재외
                        queue[interaction.guild.id].playlist.shift();//큐에서 재생중인곡 빼기
                        play(interaction.guild.id,index);//한곡 뺏으니 순서는 맞음
                        client.channels.fetch(interaction.channel.id).then(async (channel) => {
                            await channel.messages.delete(globalValue[interaction.guild.id].sendSelectMenu); //promise이므로 아마 작동될거임
                            await interaction.channel.send({embeds:[queue[interaction.guild.id].playlist[index].embed]});//0을 골랐을때 0이 나와야함로 
                            queue[interaction.guild.id].playlist.splice(index,1);//0부터 시작해 index번에 있는 배열 항목 제거
                        });
                        //interaction.value는 현재 재생중인 것이 삭제되있음 고로 +1 필요 (0번이 다음곡)
                        //queue 확인 후 / playlist 불러와서 foreach로 돌려서 e.name이 playlist의 i번째 name과 같을 경우 splice(i,1)로 제거
                    } 
                    
                })
            }
            if(interaction.values[0] !== "list_0"){
                interaction.reply(interaction.values.join(","))
            }
        }
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  
client.login(process.env.DISCORD_TOKEN);