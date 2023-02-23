const Discord = require('discord.js');
const client = new Discord.Client({ intents: 
    [Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.Guilds
] 
});
const play = require('play-dl');
let player;
const playList = {};  

const { joinVoiceChannel,getVoiceConnection,createAudioPlayer,createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
let songLink ='https://www.youtube.com/watch?v=dQw4w9WgXcQ';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async(msg) => {

  
    if (msg.content === '!join'){
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) return msg.channel.send('You need to join a voice channel first!');
        const voiceConnection = joinVoiceChannel({
            channelId:voiceChannel.id,
            guildId:msg.guildId,
            adapterCreator:msg.guild.voiceAdapterCreator,
        });
        console.log(getVoiceConnection());
    }
    if (msg.content === '!leave'){
      if(player === undefined) return;
        const connection = getVoiceConnection(msg.guild.id);
        player.stop();
        connection.destroy();
        delete playList[msg.guildId];
        player = undefined;
        msg.reply("bot left the room <#"+msg.member.voice.channel+">");
    }
    if (msg.content === '!stop'){
      if(player === undefined) return;
      msg.reply("stopped");
      player.stop();
      delete playList[msg.guildId];
      player = undefined;
    }
    if (msg.content === '!skip'){
      if(player === undefined) return;
      msg.reply("skipped");
      player.stop();
      
      
    }
    if (msg.content === "!pause"){
      switch(player.state.status){
        case "idle":
          msg.reply("you need to !play first!");
          break;
        case "buffering":
          msg.reply("it is buffering!");
          break;
        case "playing":
          player.pause();
          msg.reply("paused");
          break;
        case "autopaused":
          msg.reply("I can't do this work because bot left the voice room or the song have ended!");
          break;
        case "paused":
          player.unpause();
          msg.reply("resumed");
          break;
        default:
          msg.reply("you need to !play first!");
          break;
      }
    }
  if (msg.content === '!play'||msg.content.startsWith("!play ")) {

    const voiceChannel = msg.member.voice.channel;
    const message = String(msg.content).replace(/!play |!play/,'');
    if (!voiceChannel) return msg.channel.send('You need to join a voice channel first!');
    
    if (message.length !== 0){
      songLink = message;
    }
    if(player === undefined){
      playList[msg.guildId] = [];
      const { stream } = await play.stream(songLink, {
        discordPlayerCompatibility: true,
      });
      const connection = getVoiceConnection(msg.guild.id);
      player = createAudioPlayer();
      const resource = createAudioResource(stream);
      player.play(resource);
      const subscription = connection.subscribe(player);
    } else if(player.state.status == "playing"||player.state.status == "paused"){
      playList[msg.guildId].push(songLink);
      msg.reply("song is added!")
    } else {
          const { stream } = await play.stream(songLink, {
            discordPlayerCompatibility: true,
          });
          const connection = getVoiceConnection(msg.guild.id);
          const resource = createAudioResource(stream);
          player.play(resource);
          const subscription = connection.subscribe(player);
          
    }

  }

   let completed = {a:false};
  if(player !== undefined){
    player.once(AudioPlayerStatus.Idle, async () => {
      if(Array.isArray(playList[msg.guildId])){
        
        if(playList[msg.guildId].length > 0){
          songLink = playList[msg.guildId][0];
          const { stream } = await play.stream(songLink, {
            discordPlayerCompatibility: true,
          });
          
          const connection = getVoiceConnection(msg.guild.id);
          const resource = createAudioResource(stream);
          player.play(resource);
          const subscription = connection.subscribe(player);
          playList[msg.guildId].shift();
          console.log(1);
          
        }
      }
    })
    player.once(AudioPlayerStatus.Playing, async () => {
      if(Array.isArray(playList[msg.guildId])){
        if(completed.a === true){
          completed.a = false;
        }
      }
    })

  }
   

  

  if(msg.content.startsWith(`${"!"}ev `)){
    if(!(msg.author.id === "457797236458258433")) return;
    message = msg.content.replace(`${"!"}ev `,'');
    try{
        let result = eval(message);
        if(result == null||result == undefined){
            msg.reply("ERROR : result is null or undefined");
        }else if(result.length === 0||result === " "){
            msg.reply("ERROR: message is empty");
        }else{
            msg.reply(String(result).substring(0,2000));
        }
    } catch(e){
        msg.reply(String(e));
    }
}
  
});

if(player !== undefined){
  player.on(AudioPlayerStatus.Idle, async () => {
    console.log("zㅋ")
  })
}

client.login("ODIxMzc5MjI3NTI1NDQ3NzIy.GXHJZu.sxvrP3sN9bGJFEa5ojFDGIRANEOGxVqhix_Vok");
