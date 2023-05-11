const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const numberOfUsers = document.getElementById('numberOfUsers');

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}); 

//Join Chatroom
socket.emit('joinRoom', {username, room});

//Message from Server
socket.on('message', message => {
    outputMessage(message); 

    //Scroll everytime we get a message
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Get room and users
socket.on('roomUsers', ({room , users}) => {
    outputRoomName(room);
    outputUsers(users);
    outputNumberOfUsers(users);
})


chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    //Get message from form 
    const msg = e.target.elements.msg.value; 

    //Emit message to server
    socket.emit('chatMessage', msg);

    //Clear Input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus;
})

//Output message function to DOM
function outputMessage(message){
    console.log(message);
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to 
function outputUsers(users){
        userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
        `;
}

function outputNumberOfUsers(users){
    numberOfUsers.innerText =`(${users.length})`;
}