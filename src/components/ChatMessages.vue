<template>
	<!-- 聊天消息 -->
	<div class="messages">
		<div class="message" v-for="(msg, msgIndex) in messages" :class="{self: msg.self}">
			<p class="datetime" v-if="showMsgTime(msgIndex)">{{formatMsgTime(msg.sendTime)}}</p>
			<img class="avater" :src="formatAvater(msg.self)" @click="viewProfile(msg.self, $event)" />
			<div class="msg-content">
				<!-- 文本 -->
				<div class="text" v-if="msg.type == 4">{{msg.content}}</div>
				<!-- 图片 -->
				<div class="image" v-else-if="msg.type == 5">
					<img :src="formatImageUrl(msg.content)" @click="index = indexMap['index_' + msgIndex]" />
				</div>
				<!-- 消息类型不支持 -->
				<div class="text" v-else="msg.type > 12">
					不支持该消息。
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Util from '../assets/ChatUtil.js'
	
	import defaultHeadImage from '../assets/logo.png'
	
	export default{
		data(){
			return {
				account: {},
				index: null,
				indexMap: {}
			}
		},
		props: ['messages'],
		created(){
			this.account = ACCOUNTM.getAccountModel();
		},
		computed: {
			images(){
				let ary = [];
				this.messages.forEach((item, i) => {
					if(item.type == 5){
						ary.push(this.formatImageUrl(item.content))
						this.indexMap['index_' + i] = ary.length - 1;
					}
				})
				return ary;
			}
		},
		activated(){
			this.scrollBottom();
		},
		watch: {
			'person.messages': function(){
				this.scrollBottom();
			}
		},
		methods: {
			scrollBottom(){
				let el = document.querySelector('.messages');
				
				if(el == null) return;
				
				window.setTimeout(() => {
					el.scrollTop = el.scrollHeight;
				}, 50)
			},
			// 消息发送时间
			formatMsgTime(sendTime){
				return Util.formatMsgDate(sendTime);
			},
			// 头像
			formatAvater(isSelf){
				return isSelf ? (this.account.headUrl || defaultHeadImage) : this.person.headImage
			},
			// 图片路径转换
			formatImageUrl: Util.formatImageUrl,
			formatArticle: function(content = ''){
				return content.replace(/&fxg;(r|n)?/g, '');
			},
			// 点击头像
			viewProfile(isSelf, e){
				// 点击患者头像时触发
				if(!isSelf){
					this.$emit('avaterClicked', e);
				}
			},
			clickMessage(msg, e){
				this.$emit('messageClicked', msg, e);
			},
			showMsgTime(index){
				let messages = this.person.messages;
				if(index > 0){
					// 3分钟内的消息时间不显示
					if(messages[index].sendTime - messages[index - 1].sendTime < 3 * 60 * 1000){
						return false;
					}
				}
				return true;
			}
		}
	}
</script>

<style lang="scss" scoped="scoped">
	.messages{
		height: calc(100% - 205px);
		padding: 20px 20px 0;
		overflow: auto;
	}
	
	.message{
		margin-bottom: 20px;
		position: relative;
		
		&.self{
			text-align: right;
		}
	}
	
	.datetime{
		font-size: 12px;
		color: #8A8A8F;
		text-align: center;
		margin-bottom: 18px;
	}
	
	.avater{
		width: 32px;
		height: 32px;
		border-radius: 50%;
		position: absolute;
		bottom: 0;
	}
	
	.self .avater{
		right: 0;
	}
	
	.msg-content{
		display: inline-block;
		max-width: 78%;
		margin-left: 47px;
		color: #353C47;
		text-align: left;
		
		& > div{
			border-radius: 17.5px;
		}
	}
	
	.self .msg-content{
		margin-right: 47px;
	}
	
	.text{
		line-height: 17px;
		padding: 8px 15px;
		background: #E5E6EA;
		position: relative;
		
		&:before{
			content: '';
			display: block;
			width: 12px;
			height: 17px;
			position: absolute;
			left: -4px;
			bottom: 0;
			background: url(../img/icon/chat-arrow@2x.png) no-repeat;
			background-size: 100% auto;
		}
	}
	
	.self .text{
		background-image: linear-gradient(-180deg, #3AD88F 0%, #40B9AE 100%);
		color: #fff;
		
		&:before{
			display: none;
		}
	}
	
	.image{
		overflow: hidden;
		
		img{
			max-width: 300px;
			max-height: 200px;
		}
	}
	
	.card{
		width: 300px;
		background: #FFFFFF;
		border: 1px solid #ddd;
		cursor: default;
		
		.inner{
			min-height: 80px;
			
			h3{
				font-size: 14px;
				margin-bottom: 5px;
			}
			
			padding: 10px 100px 4px 15px;
			background-image: url(../img/icon/icon-222@1x.png);
			background-repeat: no-repeat;
			background-position: 215px center;
			
			p{
				color: #8A8A8F;
			}
		}
		
		p.desc{
			display: -webkit-box;
		    -webkit-line-clamp: 3;
		    -webkit-box-orient: vertical;
		    white-space: normal;
		    text-overflow: ellipsis;
		    overflow : hidden;
		}
		
		& > p{
			height: 22px;
			line-height: 21px;
			font-size: 9px;
			color: #40B9AE;
			border-top: 1px solid #EFEFF4;
			background: url(../img/icon/icon-153@1x.png) no-repeat;
			background-position: 15px center;
			padding-left: 33px;
			padding-right: 15px;
			
			span{
				float: right;
			}
		}
	}
	
	.card.link-card{
		cursor: pointer;
		
		&:hover{
			background: #F9F9F9;
		}
	}
	
	.q-answer-msg{
		.avater{
			display: none;
		}
		
		.msg-content{
			width: 100%;
			max-width: 100%;
			margin-left: 0;
		}
	}
	
	.q-answer{
		text-align: center;
		font-size: 12px;
		color: #8A8A8F;
		
		span{
			color: #0076FF;
			cursor: pointer;
			
			&:hover{
				text-decoration: underline;
			}
		}
	}
	
	.dossier{
		width: 250px;
		
		.inner{
			background-position: 15px 35px;
			padding: 10px 15px 4px 100px;
			
			p{
				line-height: 23px;
			}
		}
		
		h3{
			margin-bottom: 5px;
			margin-left: -90px;
		}
	}
	
	.medicine{
		.inner{
			min-height: 95px;
			background-image: none;
			padding-right: 15px;
		}
		
		img{
			width: 56px;
			height: 56px;
			float: left;
			margin-right: 10px;
		}
	}
	
	.card.questionnaire .inner{
		background-image: url(../img/icon/icon-221@1x.png);
	}
	
	.card.article .inner{
		background-image: url(../img/icon/icon-224@1x.png);;
	}
	
	.card.check .inner{
		background-image: url(../img/icon/icon-223@1x.png);
	}
</style>