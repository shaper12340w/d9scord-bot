const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
let prefix = "!";
const serverPrefix = {};


const client = new Client({ intents: 
    [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds
] 
});
const TOKEN = "token";

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg)=> {

    if(msg.author.bot) return;
    if(msg.content === "ping"){
        msg.reply("pong")
    }
    if(msg.content.startsWith(`${prefix}eval `)){
        if(!(msg.guild.id === "1047500814584926209")) return;
        message = msg.content.replace(`${prefix}eval `,'');
        try{
            let result = eval(message);
            if(result == null||result == undefined){
                msg.reply("ERROR : result is null or undefined")
            }else{
                msg.reply("```js\n"+String(result).substring(0,1990)+"```");
            }
        } catch(e){
            msg.reply(String(e));
        }
    }
    if(msg.content === `${prefix}안전문자`||msg.content === `${prefix}안문`){
        let url = "http://mepv2.safekorea.go.kr/disasterBreaking/showList2.do?rows=2&page=1&locationCode=";
        request(url,(err,res,body)=>{
            let temp = JSON.parse(cheerio.load(body).text()).rows[0];
            msg.channel.send("이 시각 발령된 안전 문자를 알려드려요" + "\n\n발령 번호: "+temp.rnum+"\n발령 시각:" +temp.createDate+"\n\n발령 내용: "+temp.msg);
        })
    }

    console.log(msg.content);
  
});


client.login(TOKEN);