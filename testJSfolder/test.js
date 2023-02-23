if (timer == undefined) {
  timer = new java.util.Timer();
  timerTask = new java.util.TimerTask({
    run: function () {
      try {
        if (Idnum < getLastWrittenId()) {
          Idnum = getLastWrittenId();
          let temp = api1
          let asdf = api2
          function rjust(a, b) {// ID 모자이크
          }
        } else if (asdf.articleList[0].asdf.articleList[0].articleId < temp) {
          Api.replyRoom("카카오톡 봇 커뮤니티", "삭제 글이 나타남.");
        }
        Api.replyRoom();//1
      } catch (e) {
        Api.replyRoom();//2
      }
    }
  }
  )
};