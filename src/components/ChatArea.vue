<template>
	<!-- 聊天区域 -->
	<div class="chat-area" v-on:click="hideModule">
		<div class="chat-top">
			{{patient.name}}
			<span class="add" v-if="patient.id == -1" @click="addReceivers"></span>
		</div>
		
		<div class="chat-content" v-if="patient.id" :class="{filled: receivers.length > 0}">
			<keep-alive>
				<!-- 聊天消息 -->
				<chat-messages :person="patient" v-if="patient.id != -1" v-on:avaterClicked="viewProfile" v-on:messageClicked="viewMsgDetail"></chat-messages>
				<!-- 群发聊天消息 -->
				<chat-mass-messages :chatman="patient" v-if="patient.id == -1 && receivers.length == 0"></chat-mass-messages>
			</keep-alive>
			<!-- 聊天工具栏 -->
			<div class="send-controller">
				<div class="toolbar">
					<span :title="'图片'"><input type="file" accept="image/*" @change="sendImage" /></span>
				</div>
				<div class="textarea" contenteditable="plaintext-only" @keydown.enter.prevent="" @keyup.enter="sendText"></div>
				<button type="button" @click="sendText">发送</button>
			</div>
		</div>
		
		<!-- 箭头，因library需要overflow:hidden;不能使用after伪元素实现 -->
		<div class="library-arrow" v-if="arrowShown"></div>
		
		<!-- 患者简介 -->
		<div class="patient-about" v-if="moduleName == 'profile'" @click.stop="">
			<div class="profile">
				<span :class="{lady: patient.sex == 2}">{{patient.name}}</span>
				<img :src="patient.headImage" />
			</div>
			<p>{{patient.age}}岁</p>
			<p>{{patient.address}}</p>
		</div>
	</div>
</template>

<script>
	import ChatMessages from './ChatMessages.vue'
	
	import Util from '../assets/ChatUtil.js'
	
	export default{
		data(){
			return {
				account: {},
				moduleName: '',
				sheetSwitch: false,
				clickedMessage: {},
				receivers: [],
				editable: true
			}
		},
		props: ['patient'],
		components: {
			ChatMessages
		},
		watch: {
			patient(val, oldVal){
				this.closeSheet();
				this.hideModule();
				this.closeReceivers();
			}
		},
		computed: {
			arrowShown(){
				return this.moduleName.indexOf('library') >= 0;
			},
			messageRecevier(){
				if(this.patient.id == -1){
					let rid = [],
						rloginName = [],
						rname = [];
					
					this.receivers.forEach(item => {
						rid.push(item.id);
						rloginName.push(item.loginName);
						rname.push(item.name);
					})
					
					this.patient.receivers = {
						id: rid.join(','),
						loginName: rloginName.join(','),
						name: rname.join(',')
					}
				}
				
				this.closeReceivers();
				
				return this.patient;
			}
		},
		created () {
			this.account = ACCOUNTM.getAccountModel();
			// editable表示是否可编辑接收人
			this.$eventHub.$on('chat-mass-receivers', (receivers, editable) => {
				this.receivers = receivers;
				this.editable = editable === false ? false : true;
			})
		},
		methods: {
			// 查看患者简介
			viewProfile(e){
				this.showModule('profile');
			},
			closeReceivers(){
				this.receivers = [];
			},
			// 发送文本
			sendText(){
				let el = document.querySelector('.textarea');
				if(el.innerText != ''){
					Util.sendText(this.messageRecevier, el.innerText);
					el.innerHTML = '';
				}
			},
			// 发送图片
			sendImage(){
				var fileInput = document.querySelector('input[type="file"]');
				Util.sendImage(this.messageRecevier, fileInput.files[0]);
			},
			// 添加群发接收人
			addReceivers(){
				
			}
		}
	}
</script>

<style lang="scss" scoped="scoped">
	.chat-area{
		position: absolute;
		top: 0;
		left: 245px;
		right: 0;
		bottom: 0;
		
		background-color: #EFEFF4;
	}
	
	.chat-top{
		height: 62px;
		line-height: 62px;
		
		font-size: 16px;
		color: #353C47;
		
		padding: 0 30px;
		
		border-left: 1px solid #ECECEC;
		border-bottom: 1px solid #ECECEC;
		background-color: #FFFFFF;
	}
	
	.add{
		display: inline-block;
		width: 40px;
		height: 28px;
		float: right;
		position: relative;
		top: 17px;
		background: url(../img/icon/icon-169@1x.png) no-repeat;
		background-position: center;
		border: 1px solid #E5E6EA;
		border-radius: 4px;
		
		&:hover{
			background-color: #F9F9F9;
		}
	}
	
	.patient-about{
		width: 310px;
		position: absolute;
		top: 180px;
		left: 50px;
		background: #F9F9F9;
		border: 1px solid #E5E6EA;
		box-shadow: 0 1px 10px 0 rgba(0,0,0,0.16);
		border-radius: 6px;
		padding: 30px;
		
		.profile{
			line-height: 52px;
			font-size: 16px;
			font-weight: bold;
			color: #353C47;
			border-bottom: 1px solid #ECECEC;
			padding-bottom: 20px;
			margin-bottom: 30px;
		}
		
		span{
			background-image: url(../img/icon/icon-158@1x.png);
			background-repeat: no-repeat;
			background-position: right center;
			padding-right: 18px;
			
			/* 女 */
			&.lady{
				background-image: url(../img/icon/icon-157@1x.png);
			}
		}
		
		img{
			width: 52px;
			height: 52px;
			border-radius: 50%;
			float: right;
		}
		
		p{
			font-size: 13px;
			color: #666666;
			margin-bottom: 10px;
			
			background-image: url(../img/icon/icon-159@1x.png);
			background-repeat: no-repeat;
			background-position: left center;
			
			padding-left: 24px;
			
			&:last-child{
				background-image: url(../img/icon/icon-160@1x.png);
			}
		}
	}
	
	.chat-content{
		height: calc(100% - 62px);
		position: relative;
		
		&.filled{
			height: 100%;
			margin-top: -62px;
		}
	}
	
	.mass-messages{
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
	}
	
	.send-controller{
		height: 205px;
		padding: 15px 20px;
		border-top: 1px solid #D8D8D8;;
	}
	
	.toolbar span{
		display: inline-block;
		width: 26px;
		height: 26px;
		
		position: relative;
		
		margin-right: 20px;
		background-repeat: no-repeat;
		background-position: center;
		
		&:nth-child(1){
			background-image: url(icon-51@1x.png);
		}
		
		input[type="file"]{
			display: block;
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			opacity: 0;
		}
	}
	
	.textarea{
		width: 100%;
		height: 84px;
		margin: 15px 0;
		color: #353C47;
		outline: none;
		cursor: text;
		overflow-x: hidden;
		overflow-y: auto;
	}
	
	button{
		width: 104px;
		height: 30px;
		float: right;
		background: #FFFFFF;
		border: 1px solid #E5E6EA;
		border-radius: 4px;
		
		&:hover{
			background: #F9F9F9;
		}
	}
	
	.patient-info{
		position: absolute;
		top: 62px;
		right: 0;
		bottom: 0;
		z-index: 9;
		width: 410px;
		background: #F9F9F9;
		box-shadow: -4px 0 10px 0 rgba(0,0,0,0.08);
		overflow: auto;
		
		&.medicine-record{
			width: 266px;
		}
	}
	
	.chat-library{
		width: 550px;
		height: 400px;
		position: absolute;
		left: -180px;
		bottom: 208px;
		border: 1px solid #D8D8D8;
		box-shadow: 0 0 16px 0 rgba(0,0,0,0.16);
		border-radius: 4px;
		overflow: hidden;
	}
	
	.chat-library ~ .library-arrow{
		width: 24px;
		height: 24px;
		background: #F9F9F9;
		
		border-right: 1px solid #D8D8D8;
		border-bottom: 1px solid #D8D8D8;
		
		border-bottom-right-radius: 8px;
		
		-webkit-transform: rotate(35deg) skewY(15deg);
		transform: rotate(35deg) skewY(15deg);
		
		position: absolute;
		left: 70px;
		bottom: 197px;
	}
</style>