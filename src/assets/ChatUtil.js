import Vue from "vue"

Vue.prototype.$eventHub = Vue.prototype.$eventHub ||  new Vue()

import defaultHeadImage from '__IMG__/icon/headImage@2x.png'
import massHeadImage from '__IMG__/icon/icon-284.png'

import chatAjax from "__ACTION__/ChatAction.js"

const CHAT_RECORDS_KEY = 'chat-records-of'

export default {
	// 图片路径
	formatImageUrl(src){
		return src.replace("fs:", URL.AVATAR).replace(',', '');
	},
	// 处理消息发送时间格式
	formatMsgDate(sendTime, simple) {
		let todayDate = new Date(),
			sendDate = new Date(sendTime);
			
		let month = sendDate.getMonth() + 1;
		let dayDate = sendDate.getDate();
		let weekDay = sendDate.getDay();
		let hour = sendDate.getHours();
		let minutes = sendDate.getMinutes().toString().replace(/^(\d)$/, '0$1');
		
		let week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			
		let period = '';
			
		if(hour < 12) {
			period = '早上';
		} else if(hour == 12) {
			period = '中午';
		} else if(hour > 12 && hour < 19) {
			period = '下午';
		} else {
			period = '晚上';
		}
		
		let isToday = false;
		let isYesterday = false;

		if(sendDate.getFullYear() == todayDate.getFullYear()) {
			if(sendDate.getMonth() == todayDate.getMonth()) {
				if(sendDate.getDate() == todayDate.getDate()) {
					isToday = true;
				} else if(sendDate.getDate() == todayDate.getDate() - 1) {
					isYesterday = true;
				}
			}
		}
		
		let str = period + ' ' + (hour - (hour > 12 ? 12 : 0)) + ':' + minutes;
		
		if(isToday){
			return str;
		}else if(isYesterday){
			if(simple === true){
				return '昨天';
			}else{
				return '昨天 ' + str;
			}
		}else{
			let md = month + '月' + dayDate + '日';
			if(simple === true){
				return md;
			}else{
				return md + ' ' + week[weekDay] + ' ' + str;
			}
		}
	},
	// 聊天存储key
	getKey(){
		return CHAT_RECORDS_KEY + ACCOUNTM.getAccountModel().loginName
	},
	// 获取聊天记录
	getChatRecords(){
		// 测试代码
		//localStorage.removeItem(this.getKey());
		
		let records = localStorage.getItem(this.getKey());
		
		return JSON.parse(records) || [];
	},
	// 存储聊天记录
	setChatRecords(records){
		localStorage.setItem(this.getKey(), JSON.stringify(records))
	},
	// 创建新聊天，[message, unread]可选参数
	createNewChat(person, message, unread){
		let records = this.getChatRecords();
		let originIndex = 0, chatItem = null;
		// 是否存在和person的聊天会话
		let isExist = records.some((item, index) => {
			if(item.id == person.id){ // 存在，记录之前的位置
				originIndex = index;
				chatItem = item;
			}
			return item.id == person.id;
		})
		// 存在，则从原始位置删除，重新更新位置
		if(isExist){
			records.splice(originIndex, 1);
		}else{
			// 不存在，初始化新聊天
			chatItem = {
				id: person.id,
				name: person.name,
				headImage: person.avatarUrl || defaultHeadImage,
				messages: [],
				unread: 0
			};
			// 非群发聊天
			if(person.id != -1){
				Object.assign(chatItem, {
					loginName: person.loginName,
					address: person.address
				})
			}
			// 如果有传消息
			if(message){
				chatItem.messages.push(message);
				chatItem.unread += 1;
			}
		}
		// 添加新聊天或更新聊天位置
		this.insertChatRecord(records, chatItem);
		// 缓存聊天记录
		this.setChatRecords(records)
	},
	// 创建群发聊天
	createMassChat(){
		this.createNewChat({
			id: -1,
			name: '群发助手',
			avatarUrl: massHeadImage
		});
		VIEWM.go(STATE.CHAT, {
			id: -1
		});
		// 若当前显示的已经是聊天界面，触发new-message事件来刷新聊天列表
		Vue.prototype.$eventHub.$emit('new-message', -1)
	},
	// 存储聊天消息
	storageChatMessage(personId, message, unread){
		let records = this.getChatRecords();
		
		let isExist = records.some(item => {
			if(item.id == personId){
				item.messages.push(message);
				
				if(unread) item.unread += 1;
			}
			return item.id == personId;
		})
		
		if(isExist) this.setChatRecords(records)
		
		// 返回是否存在该患者的聊天记录, false表示存储失败
		return isExist; 
	},
	// 清除未读
	clearUnread(personId){
		let records = this.getChatRecords();
		
		records.some(item => {
			if(item.id == personId){
				item.unread = 0; 
			}
			return item.id == personId;
		})
		
		this.setChatRecords(records)
	},
	// 所有消息未读
	getChatUnread(){
		let records = this.getChatRecords();
		
		let unread = 0;
		
		records.forEach(item => {
			if(item.unread){
				unread += item.unread;
			}
		})
		
		return unread;
	},
	// 插入聊天会话
	insertChatRecord(chatRecords, chatItem){
		// 此处分两种情况
		// 1：置顶聊天，直接将其插在index=0位置，默认
		let insertIndex = 0;
		// 2：非置顶聊天，插入在最后一个置顶会话（如果有）后面，普通会话前面
		if(!chatItem.stick){
			insertIndex = chatRecords.length; // 插入位置，默认最后
			// 记录中是否有普通会话
			chatRecords.some((p, i) => {
				if(!p.stick) insertIndex = i;
				return !p.stick;
			})
		}
		chatRecords.splice(insertIndex, 0, chatItem);
		return insertIndex;
	},
	// 关闭聊天会话
	deleteChatRecord(personId){
		let records = this.getChatRecords();
		
		records.some((item, index) => {
			if(item.id == personId){
				records.splice(index, 1);
				return true;
			}
		})
		
		this.setChatRecords(records)
	},
	// 置顶或取消置顶
	stickTop(chatRecords, index){
		let item = chatRecords[index];
		// 从原始位置删除
		chatRecords.splice(index, 1);
		// 更新聊天会话位置
		return this.insertChatRecord(chatRecords, item);
	},
	// 处理接收到的消息
	handleNewMessage(message){
		let patientId = message.senderId;
		let patientLoginName = message.sender;
		
		let msg = {
			type: Math.abs(message.type),
			content: message.content,
			shortWords: message.shortWords,
			sendTime: new Date(message.sendTime).getTime()
		}
		
		if(message.type < 0){
			// 同步移动端医生消息
			patientId = message.receiverId;
			patientLoginName = message.receiver;
			msg.self = true;
		}
		
		// PC上存储的消息格式和APP上不同，所以，这里需要过滤一下
		
		var isExist = this.storageChatMessage(patientId, msg, true);
		
		if(isExist == false){
			// 消息存储失败，创建新聊天存储
			// 获取患者详情，目前用ajax获取
			chatAjax.selectMemberInfo({
				loginName: patientLoginName
			}).success(data => {
		    	if(data && data.length > 0){
		    		let person = new PatientModel(data[0]);
		    		this.createNewChat(person, message, true);
		    		Vue.prototype.$eventHub.$emit('new-message', patientId, msg)
		    	}
			})
		}else{
			Vue.prototype.$eventHub.$emit('new-message', patientId, msg)
		}
	},
	// 处理待发送的消息
	handleSendingMessage(patient, msg){
		let account = ACCOUNTM.getAccountModel();
		
		let receiver = patient.id == -1 ? patient.receivers : patient;
		
		var message = {
			senderType: 1,
			
			senderId: account.memeberId,
			sender: account.loginName,
			senderName: account.name,
			senderUrl: account.headUrl,
			sex: account.sex,
			
			receiverId: receiver.id,
			receiver: receiver.loginName,
			receiverName: receiver.name,
			receiverUrl: receiver.headImage,
			
			clientType: 2
		};
		
		Object.assign(message, msg);
		
		// 转换图片路径fs:为真实路径
		if(msg.type == 5){
			Object.assign(message, {
				content: this.formatImageUrl(msg.content)
			})
		}
		
		// 发送消息至socket
		chatSocket.sendMessage(message);
	},
	// 发送消息，消息类型、消息内容
	sendMessage(receiver, msg){
		// 这里分两种情况：1、单独发送消息；2、群发消息
		msg.sendTime = new Date().getTime();
		let localMsg = Object.assign({}, msg)
		// 群发，chatman群发助手
		if(receiver.receivers){
			// 处理群发患者
			let receivers = receiver.receivers;
			
			Object.assign(localMsg, {
				receiverId: receivers.id,
				receiver: receivers.loginName,
				receiverName: receivers.name
			})
		}else{
			// 单独发送
			Object.assign(localMsg, {
				self: true
			})
		}
		
		if(receiver.messages) receiver.messages.push(localMsg);
		
		// 缓存消息
		var isExist = this.storageChatMessage(receiver.id, localMsg);
		// false缓存失败，表示缓存中没有该患者的聊天记录，因此，创建新聊天存储
		if(isExist == false){
		    this.createNewChat(receiver, localMsg);
		}
		
		this.handleSendingMessage(receiver, msg);
	},
	// 发送文本
	sendText(patient, content){
		this.sendMessage(patient, {
			type: 4,
			content: content
		});
	},
	// 发送图片
	sendImage(patient, file){
		var self = this;
		
		var reader = new FileReader();
        reader.onload = (e) => {
        	// 上传图片
			chatAjax.uploadImage({
				loginName: ACCOUNTM.getAccountModel().loginName,
				files: e.target.result,
				userType: 1,
				fileType: 9
			}).success(data => {
		    	self.sendMessage(patient, {
		    		type: 5,
			    	content: data,
			    	shortWords: '[图片]'
		    	});
			})
        }
        reader.readAsDataURL(file);
	}
}