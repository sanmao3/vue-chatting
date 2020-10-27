import Util from './ChatUtil.js'

// 心跳检测超时时间
const CHAT_MSG_TIMEOUT = 10000
// WebSocket重连间隔
const RECONNECT_TIME  = 3000
// 向服务器回复消息间隔
const REPLY_TIME = 5000

class ChatSocket {
	constructor(url) {
		this.account = ACCOUNTM.getAccountModel();
		// 待回复的消息id集合
		this.msgIds = [];
		// 心跳标志
		this.isBeating = false;
		// socket被踢标志
		this.isKicked = false;
		// socket服务器地址
		this.socketUrl = url;
		// 创建socket连接
		this.createConnection();
	}
	
	// 创建连接
	createConnection(){
		var self = this;
		
		this.webSocket = new WebSocket(this.socketUrl);
		
		this.webSocket.onopen = function(event){
			self.onOpen(event);
		};

		this.webSocket.onmessage = function(event){
			self.onMessage(event);
		};

		this.webSocket.onclose = function(event){
			self.onClose(event);
		};

		this.webSocket.onerror = function(event){
			self.onError(event);
		};
	}
	
	closeConnection(){
		this.webSocket.close();
	}
	
	onOpen(event) {
		console.log("连接服务器成功");

		let message = {
			type: 1,
			sender: this.account.loginName,
			clientType: 2
		};
		this.webSocket.send(JSON.stringify(message));
	}

	onMessage(event) {
		console.log('聊天服务器反馈：', event.data);
		
		let message = JSON.parse(event.data);
		let type = message.type.toString();
		switch(type) {
			case '-1':
				console.log('socket被踢了......');
				// socket被踢则关闭连接
				this.isKicked = true;
				this.webSocket.close();
				// 退出登录
				ACCOUNTM.logoutWeb().success(()=>{
            		VIEWM.goWithoutBack(VIEW.LOGIN);
                });
				break;
			case '1':
				// 登陆回复
				this.onLogin(message);
				break;
			case '2':
				// 心跳
				console.log('socket心跳正常.......................回复时间：' + new Date().toLocaleString());
				this.isBeating = true;
				break;
			case '3':
				// 服务器回复消息接收成功
				if(message.subscribeReq) {
					break;
				}
				// 修改消息发送状态
				this.changeMsgState(message, 'success');
				break;
			default:
				// 收到消息
				this.handleMessage(message);
				break;
		}
	}

	onClose(event) {
		console.log("连接关闭");
		
		this.isBeating = false;
		
		if(this.isKicked === false){
			// 非socket被踢则重连
			setTimeout(() => this.createConnection(), RECONNECT_TIME);
		}
	}

	onError(event) {
		console.log("webSocket error: " + JSON.stringify(event));
	}

	onLogin(message) {
		console.log('socket登录成功........................回复：' + JSON.stringify(message));
		
		this.replyServer();

		this.isBeating = true;
		this.isKicked = false;

		if(message.enableHeartbeatCheck == true) {
			var heartBeatTimer = setInterval(() => {
				if(this.account == null || this.account.loginName == null || this.isBeating == false) {
					clearInterval(heartBeatTimer);
					return false;
				}

				console.log('心跳检测..................');

				this.isBeating = 'checking';

				this.webSocket.send(JSON.stringify({
					type: 2,
					sender: this.account.loginName,
					clientType: 2
				}));

				setTimeout(() => {
					if(this.isBeating == 'checking') {
						console.log('心跳停止..........关闭重连..........');
						clearInterval(heartBeatTimer);
						this.webSocket.close();
					}
				}, CHAT_MSG_TIMEOUT);
			}, message.heartBeatInternal);
		}
	}
	
	changeMsgState(message){
		console.log('消息发送成功')
	}
	
	handleMessage(message){
		console.log('你有新消息', message)
		
		Util.handleNewMessage(message);
	}

	// 发送消息
	sendMessage(message) {
		this.webSocket.send(JSON.stringify(message));

		setTimeout(() => {
			// 修改消息发送状态
		}, CHAT_MSG_TIMEOUT);
	}

	// 向服务器回复消息已接收
	replyServer() {
		if(this.msgIds.length > 0) {
			var msg = {
				id: this.msgIds.join(','),
				type: 3,
				receiver: this.account.loginName
			};
			this.webSocket.send(JSON.stringify(msg));
			this.msgIds = [];
		}

		setTimeout(() => this.replyServer(), REPLY_TIME);
	}
}

export {ChatSocket}
