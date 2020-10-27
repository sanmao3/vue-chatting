<template>
	<!-- 聊天主界面 -->
	<div class="panel-chat" @click="hideMenu()">
		<div class="chat-list">
			<div class="search">
				<input type="search" v-model.trim="keyword" placeholder="输入关键词进行搜索" :class="{active: keyword}" />
			</div>
			
			<ul v-if="visiblePatients.length > 0">
				<li v-for="(item, index) in visiblePatients" v-on:click="chatWith(item, index)" v-on:contextmenu.prevent="showMenu(item, index, $event)" v-bind:class="{active: item.id == person.id, 'stick-item': item.stick}">
					<img :src="item.headImage"/>
					<div class="inner">
						{{item.name}}
						<span class="stick" v-if="item.stick">置顶</span>
						<span class="datetime">{{formatMsg(item, 'datetime')}}</span>
						<p>{{formatMsg(item, 'content')}}</p>
					</div>
					<span class="unread" v-if="item.unread">{{item.unread}}</span>
				</li>
			</ul>
			
			<div class="search-empty" v-else-if="keyword">
				<span>无搜索结果！</span>
			</div>
			
			<div class="contextmenu" v-if="offsetY > 0" v-bind:style="{top: offsetY + 'px', left: offsetX + 'px'}">
				<span @click="stickTop">{{person.stick ? '取消置顶' : '置顶'}}</span>
				<span @click="removeChat">关闭聊天</span>
			</div>
		</div>
		
		<!-- 聊天区域 -->
		<chat-area :patient="person"></chat-area>
	</div>
</template>

<script>
	import Vue from "vue"
	import ChatArea from './ChatArea.vue'
	
	import Util from '../assets/ChatUtil.js'
	
	export default{
		data(){
			return {
				// 搜索关键词
				keyword: '',
				// 聊天患者
				patients: [],
				// 当前聊天对象
				person: {},
				personIndex: -1,
				offsetX: 0,
				offsetY: 0
			}
		},
		components: {
			ChatArea
		},
		created(){
			this.$eventHub.$on('new-message', (senderId, message) => {
				this.patients = Util.getChatRecords();
				if(this.personIndex >= 0){
					this.chatWith(this.patients[this.personIndex], this.personIndex);
				}
				Vue.prototype.$eventHub.$emit('chat-unread-changed')
			})
			// 医生账户信息
			console.log(ACCOUNTM.getAccountModel())
		},
		activated(){
			this.patients = Util.getChatRecords();
			let params = this.$route.params.Chat_page;
			// 指定与此人聊天
			if(params.id){
				this.visiblePatients.some((item, index) => {
					if(item.id == params.id){
						this.person = item;
						this.personIndex = index;
					}
					return item.id == params.id
				})
			}
		},
		computed: {
			visiblePatients(){
				let result = [];
				
				this.patients.forEach((item) => {
					if(item.name.indexOf(this.keyword) >= 0){
						result.push(item)
					}
				})
				
				return result;
			}
		},
		methods: {
			chatWith(item, index){
				this.person = item;
				this.personIndex = index;
				
				if(this.person.unread > 0){
					this.patients[index].unread = 0;
					// 清除未读标记
					Util.clearUnread(this.person.id);
					// 触发主页面更新聊天未读数
					Vue.prototype.$eventHub.$emit('chat-unread-changed')
				}
			},
			formatMsg(person, keyword){
				if(person.messages.length > 0){
					var msg = person.messages[person.messages.length - 1];
					if(keyword == 'datetime'){
						return Util.formatMsgDate(msg.sendTime, true);
					}else if(keyword == 'content'){
						return msg.shortWords || msg.content;
					}
				}else{
					return '';
				}
			},
			// 关闭聊天
			removeChat(){
				this.hideMenu();
				
				setTimeout(() => {
					if(confirm('您确定要删除吗？')){
						Util.deleteChatRecord(this.person.id);
						
						this.patients = Util.getChatRecords();
						
						this.personIndex = -1;
						this.person = {};
					}
				}, 200)
			},
			showMenu(item, index, e){
				this.chatWith(item, index);
				this.offsetX = e.layerX;
				this.offsetY = e.layerY + 62 + 72 * index; // 搜索框高度+前面对话框高度
			},
			hideMenu(){
				this.offsetY = 0;
			},
			// 置顶
			stickTop(){
				this.person.stick = !this.person.stick;
				this.patients[this.personIndex].stick = this.person.stick;
				// 置顶或取消置顶
				let insertIndex = Util.stickTop(this.patients, this.personIndex);
				// 更新缓存数据
				Util.setChatRecords(this.patients);
				
				this.personIndex = insertIndex;
				this.person = this.patients[insertIndex];
			}
		}
	}
</script>

<style lang="scss" scoped="scoped">
	$gradient: linear-gradient(-180deg, #3AD88F 0%, #40B9AE 100%);
	
	.panel-chat{
		position: absolute;
		top: 0;
		left: 82px;
		right: 0;
		bottom: 0;
		
		background-color: #FFFFFF;
	}
	
	.chat-list{
		width: 245px;
		height: 100%;
		position: relative;
	}
	
	.search {
		height: 62px;
		padding: 16px 10px;
		border-bottom: 1px solid #ECECEC;
		
		input{
			display: block;
			width: 100%;
			height: 30px;
			font-size: 12px;
			text-align: center;
			color: #353C47;
			border-radius: 4px;
			background-color: #F9F9F9;
			
			padding: 8px 15px 8px 26px;
			margin: 0;
			
			background-image: url(../img/icon/icon-41@1x.png);
			background-repeat: no-repeat;
			background-position: 40px 0;
			
			&.active,
			&:focus{
				box-shadow: 0 0 10px 0 rgba(76,217,100,0.4);
				background-position: 7px -1px;
				text-align: left;
				border: 1px solid rgba(76,217,100,0.4);
			}
			
			&::-webkit-input-placeholder{
				color: #AEAEB0;
			}
		}
	}
	
	.search-empty{
		height: calc(100% - 62px);
		background: url(../img/bg/bg-8@1x.png) no-repeat;
		background-position: center;
		text-align: center;
		font-size: 12px;
		color: #8A8A8F;
		
		span{
			display: block;
			position: relative;
			top: calc(50% + 46px);
		}
	}
	
	.chat-list > ul{
		height: calc(100% - 62px);
		overflow: auto;
	}
	
	li{
		height: 72px;
		padding: 15px 15px 15px 10px;
		position: relative;
		cursor: default;
		
		&.stick-item,
		&:hover,
		&.active{
			background: #F9F9F9;
		}
		
		&.active:before{
			content: '';
			display: block;
			width: 4px;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			background-image: $gradient;
		}
		
		img{
			width: 42px;
			height: 42px;
			border-radius: 50%;
		}
		
		.inner{
			margin-top: -38px;
			margin-left: 52px;
			
			color: #353C47;
		}
		
		span.stick{
			font-size: 8px;
			color: #FFCC00;
			background: #FFFFFF;
			border: 1px solid #FFCC00;
			border-radius: 2px;
			padding: 0 6px;
			margin-left: 3px;
		}
		
		span.datetime{
			font-size: 12px;
			color: #C8C7CC;
			
			float: right;
		}
		
		p{
			font-size: 12px;
			color: #AEAEB0;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			
			margin: 3px 0 0;
		}
		
		span.unread{
			position: absolute;
			bottom: 17px;
			right: 15px;
			display: inline-block;
			height: 15px;
			padding: 0 5px;
			border-radius: 20px;
			background-image: linear-gradient(-180deg, #FF5F3B 0%, #FF2A68 100%);
			color: #FFFFFF;
			font-size: 10px;
			text-align: center;
			line-height: 15px;
		}
	}
	
	.contextmenu{
		position: absolute;
		top: 0;
		left: 0;
		width: 100px;
		background: #FFFFFF;
		border: 1px solid #E5E6EA;
		box-shadow: 0 1px 2px 0 rgba(0,0,0,0.16);
		border-radius: 4px;
		overflow: hidden;
		
		span{
			display: block;
			height: 28px;
			line-height: 28px;
			color: #555555;
			padding-left: 15px;
			cursor: default;
			
			&:hover{
				background-image: linear-gradient(-180deg, #3AD88F 0%, #40B9AE 100%);
				color: #FFFFFF;
			}
		}
	}
</style>