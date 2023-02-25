let username = prompt("닉네임을 입력해주세요.😀");
let roomNum = prompt("채팅방 번호를 입력해주세요.😀");

document.querySelector("#username").innerHTML=username;

// 몽고DB 연결서버에서 데이터 가져오기 (SSE 연결)
const eventSource = new EventSource(`http://localhost:8080/chat/roomNum/${roomNum}`);
eventSource.onmessage=(event)=>{
    const data = JSON.parse(event.data);
    // 로그인한 유저가 보낸 메시지
    if(data.sender == username){
        initMyMessage(data);
    }else{
        initYourMessage(data);
    }
}

// 몽고 DB에 저장되어있는 나의 이전 메시지 출력하는 기능을 함수로 지정
function initMyMessage(data){
    let chatBox=document.querySelector("#chat-box");
    let chatOutgoingBox=document.createElement("div");

    chatOutgoingBox.className="outgoing_msg";

    chatOutgoingBox.innerHTML=getSendMsg(data);
    chatBox.append(chatOutgoingBox);

    // 상대방의 메시지가 입력되면 chat-box, body의 스크롤 가장 하단으로 이동
    let scrollChat = document.getElementById("chat-box");
    scrollChat.scrollTop=scrollChat.scrollHeight;
    document.documentElement.scrollTop=document.body.scrollHeight;
}

// 몽고 DB에 저장되어있는 상대방의 이전 메시지 출력하는 기능을 함수로 지정
function initYourMessage(data){
    let chatBox=document.querySelector("#chat-box");
    let chatInCommingBox=document.createElement("div");

    chatInCommingBox.className="received_msg";

    chatInCommingBox.innerHTML=getReceiveMsg(data);
    chatBox.append(chatInCommingBox);

    // 상대방의 메시지가 입력되면 chat-box, body의 스크롤 가장 하단으로 이동
    let scrollChat = document.getElementById("chat-box");
    scrollChat.scrollTop=scrollChat.scrollHeight;
    document.documentElement.scrollTop=document.body.scrollHeight;
}

// 입력된 메시지를 채팅화면에 출력하는 기능을 함수로 지정 (AJAX로 메시지 전송)
async function addMessage(){
    // 채팅창 보낸 메시지 내용을 msgInput 변수로 지정
    let msgInput=document.querySelector("#chat-outgoing-msg");
    // 입력한 메시지를 몽고 DB가 연결된 서버로 데이터를 전송하기 위한 변수
    let chat ={
        sender:username,
        roomNum:roomNum,
        msg:msgInput.value
    };
    // 서버에 데이터를 전송하면 리턴받는 데이터를 변수에 저장하기 위해서는
    // 응답을 받을 때 JS는 순차적 실행을 하기때문에 응답받는데 시간이 걸린다면 null값을 리턴해주기 때문에
    // 이를 방지하기 위해 통신이 끝날때까지 기다려주는 await를 사용하여 올바른 데이터를 받는다.
    // 오랜시간동안 기다림이 발생할 수 있기 때문에 함수에 async를 함수앞에 선언하여 비동기 함수로 사용하여 이를 방지한다.
    // let response = await fetch ~
    fetch("http://localhost:8080/chat",{
        method:"post", // http Method 사용
        body:JSON.stringify(chat), // JS -> JSON
        headers:{
            "Content-Type":"application/json; charset=utf-8"
        }
    });
    // 응답데이터를 JSON 데이터로 변환
    // let parseResponse = await response.json();

    // 채팅창에 보낸 메시지가 추가되면 메시지 입력 박스를 비워준다.
    msgInput.value="";
}

// 보낸 형태를 함수로 지정
function getSendMsg(data){
    let md = data.createdAt.substring(5,7) + "/" +  data.createdAt.substring(8,10);
    let tm = data.createdAt.substring(11,16);
    convertTime = tm + " | " + md;

    return `
        <div class="sent_msg">
        <p><b>${data.sender}</b> : ${data.msg}</p>
        <span class="time_date">${convertTime}</span>
        </div>
    `;
}

// 받는 메시지 형태를 함수로 지정
function getReceiveMsg(data){
    let md = data.createdAt.substring(5,7) + "/" +  data.createdAt.substring(8,10);
    let tm = data.createdAt.substring(11,16);
    convertTime = tm + " | " + md;

    return `
        <div class="received_withd_msg">
        <p><b>${data.sender}</b> : ${data.msg}</p>
        <span class="time_date">${convertTime}</b></span>
        </div>
    `;
}

// 보내기 버튼 클릭하면 작동
document.querySelector("#chat-send").addEventListener("click", ()=> {
    addMessage();
});

// 엔터치면 클릭하면 작동
document.querySelector("#chat-outgoing-msg").addEventListener("keydown", (e)=> {
    // Enter keycode 확인
    // console.log(e.keyCode)
    if(e.keyCode == 13){
        addMessage();
    }

    
});

