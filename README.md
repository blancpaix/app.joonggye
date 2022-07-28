# 🔥 중계 
<br />

<div align=center>
  <img src="https://user-images.githubusercontent.com/54240763/181059586-a4a5ab88-dd1f-4e81-a5a1-ebd14d0314f9.png" width="50%" >
</div>

    "중계" 모바일 어플리케이션 개발
      인원 : 1 명
      기간 : 2020.12. ~ 2021.10.
      목적 : 실시간 방송 프로그램 시청자를 위한 채팅 서비스 구현

      테스트 전화번호 : 010-2020-2021
      테스트 인증번호 : 202110
      
[Playstore에서 다운로드](https://play.google.com/store/apps/details?id=com.joonggye.live)

<br />

<p align="center">
  <img src="https://user-images.githubusercontent.com/54240763/181058616-dec89ccf-dee6-43cf-bbd2-c9963239dca2.png" width="33%" align="left" alt="main_screen">
  <img src="https://user-images.githubusercontent.com/54240763/181058610-43070a42-951e-4938-ae6f-5563b22c3119.png" width="33%" align="center" alt="tv_guid_screen">
  <img src="https://user-images.githubusercontent.com/54240763/181058605-ee70517f-d80e-4991-b994-c674fca50c42.png" width="33%"  align="right" alt ="chat_room_list">

  <br />

  그림1. 메인 화면

  그림2. 방송 편성표 보기

  그림3. 채팅방 목록 보기
</p>

<br />

<p align="center">
  
  <img src="https://user-images.githubusercontent.com/54240763/181058614-51101815-02b1-4486-9a47-b122016c6fbe.png" width="33%" align="left" alt ="on_chat" >
  <img src="https://user-images.githubusercontent.com/54240763/181058597-1e2208dc-349a-41bf-8e45-f1d08751d47d.png" width="33%" align="center" alt="on_chat_drawer">
  <img src="https://user-images.githubusercontent.com/54240763/181058608-36f2773f-6638-4f44-9b31-c6a63e04d8c5.png" width="33%" align="right" 
  alt="on_chat_aggro_feature">

  <br />

  그림4. 채팅 화면

  그림5. 채팅 참가자 목록

  그림6. 활성화 된 "어그로" 기능
</p>

<br />
<br />

---
## **목차**
<br />

- [소개](#소개)

- [서비스 구성](#서비스-구성)

  - [Client](#client)
  - [Chat Server](#chat-server)
  - [Serverless Computing Platform](#serverless-computing-platform)
  - [Web Crawler](#web-crawler)

- [비고](#비고)

<br />
<br />

--- 
## **소개**
<br />

현대의 웹 서비스들은 사용자의 편의성 증대를 위해 챗봇, 실시간 상담 기능을 구현하고 있으며 이러한 기능은 웹 소켓 기술을 기반으로 만들어집니다.
저는 웹 소켓에 대해 심층적으로 학습하기 위해 클론 프로젝트가 아니라 실제 서비스 단계의 웹 소켓 기능을 구현하고 싶었습니다.

인터넷 방송 프로그램과 달리 TV 방송 프로그램은 시청자간 의사소통이 불가능합니다.
이 문제를 해결하기 위해 웹 소켓을 사용한 채팅 서비스 개발에 방향을 잡았고,
인터넷 방송의 도네이션 기능에서 모티브를 따온 "어그로"기능으로 사용자간 채팅에 피드백 할 수 있어 일반적인 채팅보다 재미있는 경험을 제공합니다.

이번 프로젝트는 서비스 운영에 비용을 최소화하는데 집중하였습니다.<br/>
첫째, 서버리스 컴퓨팅 플랫폼을 도입하여 웹 크롤러가 특정 시간에만 자원을 사용하도록 구성하였습니다.
<br/>
둘째, 서버에서 발생하는 정적파일과 같은 부차적인 트래픽 발생을 방지하기위해 서버리스 컴퓨팅 플랫폼과 채팅 서버를 분리하였고 클라이언트를 모바일 앱으로 서비스를 구한하였습니다.  <br />
셋째, 채팅 및 어그로 기능에서 발생하는 잦은 이벤트는 서버에서 이벤트들를 모아 전송하여 서버의 부하를 줄였습니다.<br />
위의 설계 과정을 거쳐 중계 서비스를 운영하고 있습니다.

<br />
<br />

----
## **서비스 구성**
<br />

![joonggye2](https://user-images.githubusercontent.com/54240763/181175408-1730a294-7572-4bd4-875a-c3174127a1e8.png)

## **Client**

### **React-Native**
TV의 방송 프로그램을 시청하며 사용하기때문에 React-Native 라이브러리를 기반으로 한 모바일 어플리케이션으로 개발하였습니다.
이는 웹 페이지와 달리 일부 정적 파일들은 .apk 파일에 내장하여 서버에서 부담하는 정적 파일 트래픽 부담을 덜었습니다.

<br />

> react-native-firebase

클라이언트는 파이어베이스와 직접적으로 연결되어 데이터를 비동기적으로 주고받습니다. 이를 통해 Firebase에 연결된 클라이언트에서 현재 방송중인 프로그램을 일괄적으로 업데이트하고 있습니다.

<br />

> redux-saga

보다 편리한 상태관리를 위해 Redux-saga를 도입하였습니다.
절대적인 코드의 양은 늘어나는 단점은 있으나 디버깅이 굉장히 편해졌던 점과 데이터를 주고 받을 때의 비동기 호출, Websocket에서 발생하는 잦은 이벤트를 처리하는데 강점이 있었습니다.

<br />

**Client에서 사용하는 함수 보러가기**
👉 [Function List](https://raw.githubusercontent.com/blancpaix/app.joonggye/main/Docs/Client.txt "Function List")

<br />
<br />

## **Chat Server**

### **Node.js ( Express )**
<br />

>socket.io

클라이언트에서의 원활한 서버 통신을 위해 Serverless computing platform이 아닌 별도의 소켓 서버를 운영하고있습니다.
소켓 서버는 차후 확장성을 고려해 현재 방송중인 프로그램에 부여된 UID에 따라 socket.io의 namespace를 달리 두어 서버를 확장할 수 있도록 구성하였습니다. 또한 사용자의 보안성을 위해 서버와 클라이언트간 이뤄지는 모든 소켓 통신은 SSL 프로토콜을 통해 암호화됩니다.

소켓 서버는 클라이언트에서 전달되는 데이터를 기반으로 미들웨어를 통해 일련의 과정을 거쳐 유저를 확인하여 연결됩니다. 연결이 되면 해당 프로그램의 채팅방 목록 데이터를 주고받는 특정 room에 자동으로 접속되어 정상적인 서비스를 이용할 수 있습니다.

잦은 데이터 교환이 이뤄지는 소켓 통신 특성상 트래픽을 줄이기 위해 특정 이벤트에는 데이터를 모아 일정 시간이 지난 후 메시지를 전달하도록 하였습니다.

<br />

**Chat server의 이벤트 목록 보러가기**
👉 [Socket Event List](https://raw.githubusercontent.com/blancpaix/app.joonggye/main/Docs/Socket%20server.txt "Socket Event List")

<br />
<br />

## **Serverless Computing Platform**

### **Firebase**
<br />

>Authentication

중계 서비스는 사용자 인증 시 전화번호를 사용하고 있습니다.
>Firestore database

Realtime database 보다는 향상된 쿼리 능력을 갖춘 Nosql 데이터베이스로 사용자들의 각종 기록과 크롤링으로 얻어온 데이터들이 저장됩니다.

>Realtime database

잦은 CRUD에 적합한 Nosql 데이터베이스로 현재 채팅방 상태기록 및 채팅서버와의 동기화에 사용됩니다.

>Storage

방송 프로그램의 썸네일 이미지와 사용자의 프로필 이미지들이 업로드되는 저장소입니다.

>Functions

현재 방송중인 프로그램 목록을 5분마다 업데이트하고 있으며, 정해진 시간에 웹 크롤러를 동작시켜 서비스에 필요한 데이터를 받아오고 있습니다.

<br />

**Firebase 모델링 바로가기**
👉 [Firebase Modeling](https://raw.githubusercontent.com/blancpaix/app.joonggye/main/Docs/Serverless%20structure.txt "Firebase Modeling")

<br />
<br />

## **Web Crawler**

### **Node.js**
<br />

> puppeteer.js

"중계"서비스는 실시간으로 방송중인 프로그램 데이터를 기반으로 운영되고 있습니다. 현재 방송 편성 데이터는 별도의 API로 제공되고 있지 않아 부득이하게 웹 크롤러를 활용하여 데이터를 가공하여 사용하고 있으며, LG U플러스 홈페이지("https://www.lguplus.com/iptv/channel-guide")에서 제공되는 방송 편성표를 활용합니다.

크롤링을 통해 얻는 데이터는 각 방송사 별 방송 편성표와 방송 프로그램에 대한 정보입니다. 클라우드 컴퓨팅 환경에서 위에서 얻은 데이터의 가공과정을 거쳐 아래 형식의 데이터들을 수집하며 최종적으로 각 목적에 알맞게 저장됩니다.

웹 크롤러는 Google Cloud Functions을 활용하여 특정시간에 동작하고 중지되도록 이벤트 스케줄러을 통해 컴퓨팅 비용을 줄였으며, Puppeteer.js 라이브러리를 활용하여 구현되었습니다.

<br />

**Web Crawler에서 얻는 데이터 형식 바로가기**
👉 [Web Crawler Data Form](https://raw.githubusercontent.com/blancpaix/app.joonggye/main/Docs/Crawler.txt "Web Crawler Data Form")

<br />
<br />

---
## **비고**
<br />

현재 이 Repository에는 Firebase에서 제공하는 keychain 파일 및 andoid의 keystore 파일, Node.js의 env 파일이 제공되고 있지 않아 로컬 환경에서 프로젝트를 실행할 수 없습니다. 다만 제공된 문서와 같이 동일한 환경을 만든다면 정상적으로 실행이 가능합니다. <br />

Redux-saga을 이용한 web-socket 서비스를 개발하는 분들에게 큰 도움이 되었으면 좋겠습니다.

