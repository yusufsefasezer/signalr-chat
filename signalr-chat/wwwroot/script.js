'use strict';

var SIGNALR_URI = '/chathub';

var buttonLogin = null,
  buttonSend = null,
  inputUsername = null,
  spanStatus = null,
  chatForm = null,
  chatBody = null,
  chatFooter = null,
  connection = null,
  onlineStatus = null,
  messageList = null,
  textareaMessage = null;

function Initialize() {
  buttonLogin = document.getElementById('buttonLogin');
  buttonSend = document.getElementById('buttonSend');
  inputUsername = document.getElementById('inputUsername');
  spanStatus = document.getElementById('spanStatus');
  chatForm = document.getElementById('chatForm');
  chatBody = document.getElementById('chatBody');
  chatFooter = document.getElementById('chatFooter');
  onlineStatus = document.getElementById('onlineStatus');
  messageList = document.getElementById('messageList');
  textareaMessage = document.getElementById('textareaMessage');
  InitializeEvent();
}

function InitializeEvent() {
  inputUsername.addEventListener('keypress', checkLogin);
  buttonLogin.addEventListener('click', connectServer);
  textareaMessage.addEventListener('keypress', checkSend);
  buttonSend.addEventListener('click', sendMessage);
}

function checkLogin(e) {
  if (e.key == 'Enter') {
    buttonLogin.click();
  }
}

function checkSend(e) {
  if (e.key == 'Enter') {
    buttonSend.click();
    e.preventDefault();
  }
}

function connectServer() {
  var isEmpty = checkValue(inputUsername.value);

  if (isEmpty) {
    setStatus('Please enter username');
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_URI)
    .build();

  connection.start()
    .then(function () {
      connection.invoke('SetUsername', inputUsername.value);
      InitializeSignalREvent();
      setConnected();
      setStatus('Connected succesfully.');

      textareaMessage.focus();
    })
    .catch(function (err) {
      setDisconnected();
      setStatus('Something went wrong: ' + err);
    });
}

function setStatus(message) {
  spanStatus.textContent = message;
  setTimeout(function () {
    spanStatus.textContent = null;
  }, 1500);
}

function InitializeSignalREvent() {
  connection.on('OnJoin', OnJoin);
  connection.on('OnLeft', OnLeft);
  connection.on('NewMessage', OnNewMessage);
  connection.onclose(OnClose);
}

function addMessage(content) {
  var messageElement = document.createElement('li');
  messageElement.textContent = content;
  messageElement.className = 'text-center';
  messageList.insertAdjacentElement('beforeend', messageElement);
}

function setOnlineCount(count) {
  onlineStatus.textContent = count + ' user online';
}

function OnJoin(date, username, count) {
  addMessage(username + ' joined.');
  setOnlineCount(count);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function OnLeft(date, username, count) {
  addMessage(username + ' left.');
  setOnlineCount(count);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function OnNewMessage(date, username, message) {
  var messageDate = new Date(date);
  var messageElement = document.createElement('li');
  messageElement.textContent = message;
  var messageInfo = document.createElement('b');
  messageInfo.textContent = '(' + messageDate.getHours() + ':' + messageDate.getMinutes() + ') ' + username + ': ';
  messageElement.insertAdjacentElement('afterbegin', messageInfo);
  messageList.insertAdjacentElement('beforeend', messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function OnClose(err) {
  setDisconnected();
  setStatus(err);
}

function setConnected() {
  onlineStatus.classList.remove('d-none');
  chatForm.classList.add('d-none');
  chatBody.classList.remove('d-none');
  chatFooter.classList.remove('d-none');
}

function setDisconnected() {
  onlineStatus.classList.add('d-none');
  chatForm.classList.remove('d-none');
  chatBody.classList.add('d-none');
  chatFooter.classList.add('d-none');
}

function checkValue(value) {
  return value == null || value.trim() == '';
}

function sendMessage() {
  var isEmpty = checkValue(textareaMessage.value);

  if (isEmpty) {
    setStatus('Please enter message');
    return;
  }

  connection.invoke('SendMessage', textareaMessage.value);
  textareaMessage.value = '';
  textareaMessage.focus();
}

document.addEventListener('DOMContentLoaded', Initialize);