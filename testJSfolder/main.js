const java = require('java');
let jsoup = java.import("java.lang.System'")
async function rjust(a,b){
    let str = String(a);
    let num = isNaN(b) ? Math.floor(str.length/2) : (Number(b) > str.length ? Math.floor(str.length/2) : b); 
    let lt = str.length - num;
    let sl = str.slice(0,num);
    return sl+("*".repeat(lt));
}
String.prototype.rjust2 = async function(b){
    let str = String(this);
    let num = isNaN(b) ? Math.floor(str.length/2) : (Number(b) > str.length ? Math.floor(str.length/2) : b); 
    let lt = str.length - num;
    let sl = str.slice(0,num);
    return sl+("*".repeat(lt));
}
const myStr = "가나다라마바사아자"
rjust(myStr,0).then((e)=>console.log(e));
rjust(myStr,3).then((e)=>console.log(e));
rjust(myStr,5).then((e)=>console.log(e));
rjust(myStr,13).then((e)=>console.log(e));
myStr.rjust2(5).then((e)=>console.log(e));
