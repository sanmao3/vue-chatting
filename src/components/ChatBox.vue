<template>
	<!-- 聊天窗口 -->
	<div class="chat-box">
		<!-- 联系人 -->
		<div class="friends">
			<!--<ul v-if="visiblePatients.length > 0">
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
			
			<div class="contextmenu" v-if="offsetY > 0" v-bind:style="{top: offsetY + 'px', left: offsetX + 'px'}">
				<span @click="stickTop">{{person.stick ? '取消置顶' : '置顶'}}</span>
				<span @click="removeChat">关闭聊天</span>
			</div>-->
		</div>
		<!-- 消息框 -->
		<div class="messages">{{count}}</div>
	</div>
</template>

<script>
	import { ref } from 'vue'
	
	export default {
		setup() {
			const count = ref(2)
			return {
				count
			}
		}
	}
</script>

<style lang="scss" scoped="scoped">
	.chat-box {
		width: 800px;
		height: 600px;
		margin: 0 auto;
		border: 1px solid #eee;
	}
</style>
