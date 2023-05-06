const { ActionRowBuilder, ButtonBuilder,StringSelectMenuBuilder,TextInputBuilder,ModalBuilder } = require('discord.js');
const { createCanvas, loadImage } = require("canvas");
const playdl = require('play-dl');
const EventEmitter = require('eventemitter3');
const emitter = new EventEmitter();
const fs = require('fs');
const { google } = require('googleapis');
const userGame = new Map();
process.noDeprecation = true;
require('dotenv').config();

function createButtonSet(customId, buttons) {
    //MADE BY AlphaDo
    function createButtonSet(buttons) {
        return new ActionRowBuilder().addComponents(
            ...buttons.map((button, index) => {
                const builder = new ButtonBuilder()
                    .setDisabled(button.disabled ?? false)
                    .setStyle(button.style ?? 1);

                if (button.emoji) builder.setEmoji(button.emoji);
                if (button.label) builder.setLabel(button.label);
                if (button.url) {
                    builder.setURL(button.url);
                    return builder;
                }
                builder.setCustomId(`${customId}#${index}`);
                return builder;
            })
        );
    }

    buttons.forEach((button, index) => {
        emitter.on(`${customId}#${index}`, (interaction) => {
            button.execute({
                interaction,
                edit(...options) {
                    buttons.forEach((button, index) => {
                        const { disabled, emoji, label, style, url } = options[index];
                        button.disabled = disabled ?? button.disabled;
                        button.emoji = emoji ?? button.emoji;
                        button.label = label ?? button.label;
                        button.style = style ?? button.style;
                        button.url = url ?? button.url;
                    });
                    return createButtonSet(buttons);
                },
                kill() {
                    buttons.forEach((_button, index) => emitter.off(`${customId}#${index}`));
                }
            })
        });
    });

    return createButtonSet(buttons);
}
async function createModal(interaction, data){
    return new Promise(async (resolve,reject)=>{
        try{
            const inputs = data.inputs.map((input, index) => {
                const builder = new TextInputBuilder()
                    .setCustomId(`${interaction.id}#${index}`)
                    .setLabel(input.label)
                    .setMaxLength(input.length?.[1] ?? 4000)
                    .setMinLength(input.length?.[0] ?? 0)
                    .setPlaceholder(input.placeholder ?? '')
                    .setRequired(input.required)
                    .setStyle(input.style);
                return (input.value ? builder.setValue(input.value) : builder);
            });
            const modal = new ModalBuilder()
            .setCustomId(interaction.id)
            .setTitle(data.title)
            .setComponents(
                inputs.map((input) =>
                    new ActionRowBuilder().addComponents(input))
            );
            await interaction.showModal(modal);
            emitter.once(interaction.id, (modalInteraction) => {
                resolve({
                    interaction: modalInteraction,
                    inputs: inputs.map((input) =>
                        modalInteraction.fields.getTextInputValue(input.toJSON().custom_id))
                });
                emitter.off(interaction.id);
            });

        } catch (e) {
            reject(String(e));
            console.error(e);
        }
    })
}
function createSelectMenu(customId, options ,lists){
    function createSelectMenu(options,lists){
        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId(`${customId}`)
            .setPlaceholder(options.name ?? "select!")
            .setMaxValues(options.maxSelect ?? 1)
            .addOptions(lists)
        )
    }
    emitter.on(`${customId}`,(interaction)=>{
        options.execute({
            interaction,
            kill() {
                emitter.off(`${customId}`)
            }
        })
    })
    return createSelectMenu(options,lists)

    //사용법
    /**
    createSelectMenu(interaction.id, {
        name: "asdf",
        maxSelect: 1,
        async execute({ interaction, kill }) {
            //실행시 코드
        }
    },
        //array {label,description,value}
        [{label:'zz',description:'토리엘?',value:"ㅎㅇ"},{label:'와',description:'센즈',value:"아시는구나"}]
        })
    )
    */
}

class removeSlash {

    constructor(slashId) {
        const { REST, Routes } = require('discord.js');
        const { CLIENT_ID, DISCORD_TOKEN } = process.env;
        this.token = DISCORD_TOKEN;
        this.rest = new REST({ version: '10' }).setToken(this.token);
        this.Routes = Routes;
        this.clientId = CLIENT_ID;
        this.slashId = slashId;
    }
    removeGuild(id) {
        const guildId = id;
        if(!guildId) return;
        if(this.slashId){
            return this.rest.delete(this.Routes.applicationGuildCommand(this.clientId, guildId, this.slashId))
            .then(() => {return 'Successfully deleted guild command'})
            .catch((e) => { return e });
        } else {
            return this.rest.put(this.Routes.applicationGuildCommand(this.clientId, guildId), { body:[] })
            .then(() => {return 'Successfully deleted All guild commands'})
            .catch((e) => { return e });
        }
        
    }
    removeAll() {
        if(this.slashId){
            this.rest.delete(this.Routes.applicationCommand(this.clientId, this.slashId))
                .then(() => {return 'Successfully deleted command'})
                .catch((e)=>{ return e });
        } else {
            this.rest.put(this.Routes.applicationCommand(this.clientId), { body:[] })
            .then(() => {return 'Successfully deleted All commands'})
            .catch((e) => { return e });
        }
    }

}

function removeKey(arr, find) {
    const index = arr.findIndex(e=>e === find);
    if (index < 0){ return arr; } else { return [...arr.slice(0, index), ...arr.slice(index + 1)] }
}
function getToday(){
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (1 + date.getMonth())).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const time = ("0" + date.getMinutes()).slice(-2);

    return year + "-" + month + "-" + day + "-" + time;
}
function youtubeURI(uri) {
    const pattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([A-Za-z0-9_-]{11})/;
    const match = uri.match(pattern);
    if (match) {
        const videoId = match[1];
        return videoId;
    } else {
        return false
    }
}
async function playdlResult(args,index){
    return playdl.search(args, {
        limit: index
    })
}
async function youtubeAPIResult(e) {
    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API,
    });
    const result = await youtube.videos.list(e);
    // const result = await youtube.search.list(e);
    return result;
}
function asciiClock(a, b, s) {
    let time = "";
    let day = new Date();
    let h = String(day.getHours());
    let m = String(day.getMinutes());
    if (h <= 9) h = "0" + h;
    if (m <= 9) m = "0" + m;
    a = String(a); b = String(b);
    s = " ".repeat(Number(s));
    let key = [a + a + a, b + b + a, a + b + b, b + a + b, a + b + a, b + b + b];
    let num = [[0, 4, 4, 4, 0], [1, 1, 1, 1, 1], [0, 1, 0, 2, 0], [0, 1, 0, 1, 0], [4, 4, 0, 1, 1], [0, 2, 0, 1, 0], [0, 2, 0, 4, 0], [0, 4, 4, 1, 1], [0, 4, 0, 4, 0], [0, 4, 0, 1, 0], [5, 3, 5, 3, 5]];
    for (let i = 0; i < num.length; i++) {
        for (let u = 0; u < num[i].length; u++) {
            num[i][u] = key[num[i][u]];
        }
    }
    for (var i = 0; i < 5; i++) {
        time += num[h[0]][i] + s + num[h[1]][i] + s + num[10][i] + s + num[m[0]][i] + s + num[m[1]][i] + "\n";
    }
    return time;
}

function addComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


async function drawDM(e) {

    const post = e ?? {
        image:'https://cdn.discordapp.com/avatars/457797236458258433/8721e17c0f6fc3e6879db74afcf20be3.png?size=4096',
        user: "rplaz",
        message: "와 센즈 아시는구나!",
        color : '#2ecc71'
    };
    const messageLength = post.message.length - 350 > 0 ? post.message.length - 350 : 0
    const width = 350;
    const height = 80;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    const circle = {
        x: 50,
        y: 40,
        radius: 28,
    }

    context.fillStyle = "#343d45";
    context.fillRect(0, 0, width, height);

    context.font = "bold 11pt 'PT Sans'";
    context.fillStyle = post.color;

    const text = post.user
    context.fillText(text, 100, 28);

    context.font = "bolt 10t 'PT Sans'";
    context.fillStyle = "#ffffff";

    const text2 = post.message
    context.fillText(text2, 100, 50);

    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    const avatar = await loadImage(post.image);
    console.log(avatar.height, avatar.width);
    const aspect = avatar.height / avatar.width;
    const hsx = circle.radius * Math.max(1.0 / aspect, 1.0);
    const hsy = circle.radius * Math.max(aspect, 1.0);
    context.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2);
    const buffer = canvas.toBuffer("image/png");
    console.log(buffer)
    return buffer;
}


/**
 * return welcome image
 * @param {string} username - username in welcome image
 * @param {string} image - image link
 * @param {string | undefined} backgroud - background image
 * @returns {Buffer} - image 
 */

async function welcomeImage(username,image,background) {

    const width = 350;
    const height = 160;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    const circle = {
        x: Math.round(width/4),
        y: (height/2),
        radius: 37,
    }
    //배경화면 채우기(배경/검정 가까운 네모판)
    if(background){
        try{
            const backImage = await loadImage(background);
            context.drawImage(backImage,0, 0, width, height);
            
        } catch(e) {reload
            throw new Error("링크가 잘못되었습니다")
        }
    } else {
        context.fillStyle = "#343d45";
        context.fillRect(0, 0, width, height);
    }
    context.fillStyle = hexToRgba("#000000",0.3);
    context.fillRect(10, 10, width-20, height-20);

    context.font = '15pt PT Sans';
    context.fillStyle = "#FFFFFF";

    const welcome = "Welcome!";
    context.fillText(welcome, width/2-10, (height/2)-10);

    // 선 스타일 설정
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 5;

    // 시작점과 끝점 설정
    const startX = (width/2)-10;
    const startY = (height/2)+5;
    const endX = width-35;
    const endY = (height/2)+6;

    // 선 그리기
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();

    context.font = '11pt sans-serif';
    context.fillStyle = "#FFFFFF";

    const text = `${username} join this server!`
    context.fillText(text, width/2-10, (height/2)+30);

    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    const avatar = await loadImage(image);
    console.log(avatar.height, avatar.width);
    const aspect = avatar.height / avatar.width;
    const hsx = circle.radius * Math.max(1.0 / aspect, 1.0);
    const hsy = circle.radius * Math.max(aspect, 1.0);
    context.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2);
    const buffer = canvas.toBuffer("image/png");
    return buffer;
}


async function drawImage(link,msg){

    const probe = require('probe-image-size');
    const result = await probe(link);
    
    const canvas = createCanvas(result.width, result.height);
    const context = canvas.getContext("2d");

    const promise = await loadImage(link);
    context.drawImage(promise, 0, 0, result.width, result.height)

    context.font = "bold 30pt 'PT Sans'";
    context.textAlign = "center";
    context.fillStyle = "#fff";

    context.fillText(msg, result.width/2, result.height/2);

    return canvas.toBuffer("image/png");
}



class _2048 {
    constructor() {
        this.colors = {
            '2': '#EEE4DA',
            '4': '#EDE0C8',
            '8': '#F2B179',
            '16': '#F59563',
            '32': '#F67C5F',
            '64': '#F65E3B',
            '128': '#EDCF72',
            '256': '#EDCC61',
            '512': '#EDC850',
            '1024': '#EDC53F',
            '2048': '#EDC22E'
        };
        this.canvas = createCanvas(400, 400);
        this.ctx = this.canvas.getContext("2d");
        this.board = Array.from({ length: this.size }, () => new Array(this.size).fill(0));
        this.flag = -1;
        this.score = 0;
        this.size = 4;
        this.message;
    }
    makeCanvas(num){
        this.board = Array(num).fill(0).map(() => Array(num).fill(0));
        return createCanvas(num*100,num*100);
    }
    start(size) {
        if (this.flag < 0) {
            const getCanvas = this.makeCanvas(size);
            this.flag = 0;
            this.canvas = getCanvas;
            this.ctx = getCanvas.getContext('2d');
            this.drawBoard();
            this.addTile();
            this.addTile();
            this.drawBoard();
            return {status:"start",score:this.score,image:this.saveImage()}
        } else {
            return {status:"already"}
        }
    }
    drawBoard() {
        this.ctx.fillStyle = '#BBADA0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = this.board[row][col];
                const x = col * 100 + 50;
                const y = row * 100 + 50;
                this.ctx.fillStyle = this.colors[String(value)] || '#CFC2B6';
                this.ctx.fillRect(x - 45, y - 45, 90, 90);
                if (value) {
                    this.ctx.fillStyle = value > 4 ? '#FFFFFF' : '#776E65';
                    this.ctx.font = 'bold 40px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(String(value), x, y + 15);
                }
            }
        }
    }
    addTile() {
        const emptyTiles = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyTiles.push({ row, col });
                }
            }
        }
        if (emptyTiles.length) {
            const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    move(direction) {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const tiles = [];
            for (let j = 0; j < this.size; j++) {
                const row = direction === 'up' ? j : direction === 'down' ? this.size - j - 1 : i;
                const col = direction === 'left' ? j : direction === 'right' ? this.size - j - 1 : i;
                tiles.push(this.board[row][col]);
            }
            const merged = this.mergeTiles(tiles);
            for (let j = 0; j < this.size; j++) {
                const row = direction === 'up' ? j : direction === 'down' ? this.size - j - 1 : i;
                const col = direction === 'left' ? j : direction === 'right' ? this.size - j - 1 : i;
                const value = merged[j];
                const current = this.board[row][col];
                if (value !== current) {
                    moved = true;
                }
                this.board[row][col] = value;
            }
        }
        if (moved) {
            this.flag = 0;
            this.addTile();
            this.drawBoard();
            return {status:"proceeding",score:this.score,image:this.saveImage()};
        }
        else if (this.isWin()) {
            console.log("You Win!");
            this.drawWin();
            this.flag = 1;
            return {status:"win",score:this.score,image:this.saveImage()};
        }
        else if (this.isGameOver()) {
            console.log("Game over!");
            this.drawGameOver();
            this.flag = 2;
            return {status:"lose",score:this.score,image:this.saveImage()};
        }
        else {
            return false
        }
    }
    mergeTiles(tiles) {
        const merged = [];
        let i = 0;
        while (i < this.size) {
            if (tiles[i]) {
                const currentValue = tiles[i];
                let j = i + 1;
                while (j < this.size && !tiles[j]) {
                    j++;
                }
                if (j < this.size && tiles[j] === currentValue) {
                    merged.push(currentValue * 2);
                    this.score += currentValue
                    i = j + 1;
                } else {
                    merged.push(currentValue);
                    i = j;
                }
            } else {
                i++;
            }
        }
        while (merged.length < this.size) {
            merged.push(0);
        }

        return merged;
    }
    isGameOver() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
                if (col > 0 && this.board[row][col] === this.board[row][col - 1]) {
                    return false;
                }
                if (col < this.size - 1 && this.board[row][col] === this.board[row][col + 1]) {
                    return false;
                }
                if (row > 0 && this.board[row][col] === this.board[row - 1][col]) {
                    return false;
                }
                if (row < this.size - 1 && this.board[row][col] === this.board[row + 1][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    isWin() {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].includes(2048)) return true;
        }
        return false;
    }

    drawGameOver() {
        this.ctx.fillStyle = hexToRgba('#776E65',0.5);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 60px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
    }

    drawWin() {
        this.ctx.fillStyle = hexToRgba('#776E65',0.5);
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 60px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('You Win!', this.canvas.width / 2, this.canvas.height / 2);
    }

    saveImage() {
        return this.canvas.toBuffer("image/png");
    }


}

module.exports = { 

    //함수 부분
    createButtonSet,
    createSelectMenu,
    createModal,
    removeSlash,
    removeKey,
    getToday,
    youtubeURI,
    playdlResult,
    youtubeAPIResult,
    addComma,
    asciiClock,
    drawDM,
    welcomeImage,
    drawImage,
    _2048,

    //변수 부분
    emitter,
    userGame
}
