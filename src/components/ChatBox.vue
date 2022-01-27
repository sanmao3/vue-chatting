<template>
  <!-- 聊天窗口 -->
  <div class="chat-box">
    <!-- 联系人 -->
    <div class="friends">
      <ul v-if="persons.length > 0">
        <li
          v-for="(item, index) in persons"
          :key="item.id"
          @click="chatWith(item, index)"
          @contextmenu.prevent="showMenu(item, index, $event)"
          :class="{ active: item.id == person.id, sticky: item.sticky }"
        >
          <img :src="item.avatar" />
          <div class="inner">
            <span>{{ item.name }}</span>
            <span class="datetime">{{ item.datetime }}</span>
            <p>{{ item.lastMsg }}</p>
          </div>
          <span class="unread" v-if="item.unread">{{ item.unread }}</span>
        </li>
      </ul>

      <div class="contextmenu" v-if="false">
        <span>{{ person.sticky ? "取消置顶" : "置顶" }}</span>
        <span>关闭聊天</span>
      </div>
    </div>
    <!-- 消息框 -->
    <div class="messages"></div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const persons = ref([]);
    const person = ref({});

    fetch("/persons.json")
      .then((res) => res.json())
      .then((res) => {
        persons.value = res.persons;
      });

    let chatWith = () => {};
    let showMenu = () => {};

    return {
      persons,
      person,
      chatWith,
    };
  },
};
</script>

<style lang="scss" scoped>
.chat-box {
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border: 1px solid #eee;
}
</style>
