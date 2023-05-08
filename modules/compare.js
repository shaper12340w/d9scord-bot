class CompareVideo{

    constructor(){
    }

    _leven(str1, str2) {
        const track = Array(str2.length + 1).fill(null).map(() =>
          Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
          track[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
          track[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j += 1) {
          for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
              track[j][i - 1] + 1, // deletion
              track[j - 1][i] + 1, // insertion
              track[j - 1][i - 1] + indicator, // substitution
            );
          }
        }
        return track[str2.length][str1.length];
      }

      _similarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        const longerLength = longer.length;
        if (longerLength === 0) {
          return 1.0;
        }
        const distance = this._leven(longer, shorter);
        return (1.0 - distance / longerLength).toFixed(2);
      }      
      _youtubeURI(uri) {
        const pattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([A-Za-z0-9_-]{11})/;
        const match = uri.match(pattern);
        if (match) {
            const videoId = match[1];
            return videoId;
        } else {
            return false
        }
    }
    compare(data1,data2){
        const checkData1 = Object.keys(data1) ? Object.keys(data1).includes("id") : false;
        const checkData2 = Object.keys(data2) ? Object.keys(data2).includes("id") : false;
        if(checkData1&&checkData2){
            if(data1.id === data2.id || data2.durationInSec >= 3600){
                return 1.0
            } if(data1.title.includes(data2.title)){
                return 0.8
            }else {
                return this._similarity(data1.title,data2.title)
            }

        } else {
          return 0;
        }
    }

}

module.exports = { CompareVideo };