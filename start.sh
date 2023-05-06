#!/bin/bash

# 현재 디렉토리 경로를 변수에 저장
APP_DIR=$(pwd)

# 스크린 세션 종료
screen -S shapbot -X quit

# 스크린 세션 시작
screen -dmS shapbot

# 스크린 세션에 명령어 전송하여 애플리케이션 실행
screen -S shapbot -p 0 -X stuff "cd $APP_DIR\n node main.js\n"

# 스크린 표시
screen -r shapbot
