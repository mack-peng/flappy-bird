import Vue from "vue";
import Vuex from "vuex";

import { GET_SESSION, DEL_SESSION } from "../utils/index.js";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    alertQueue: [],
    alertId: 0,
    alertClearTimer: null,
    cartoon: {},
    birdBestScore: {
      normal: 0,
      hard: 0,
      crazy: 0,
    },
  },
  getters: {
    birdScore(state) {
      const { birdBestScore } = state;
      const arr = [];
      for (const i in birdBestScore) {
        let str = "";
        switch (i) {
          case "normal":
            str = "普通模式（Normal）";
            break;
          case "hard":
            str = "困难模式（Hard）";
            break;
          case "crazy":
            str = "疯狂模式（Crazy）";
            break;
        }
        const item = `${str}最高为${birdBestScore[i]}分`;
        arr.push(item);
      }
      return arr;
    },
  },
  mutations: {
    /**
     * 新增alert队列
     */
    handleAlert(state, data) {
      state.alertId += 1;
      if (data.clear) {
        clearTimeout(state.alertClearTimer);
        state.alertQueue = [];
        state.alertQueue.push({
          ...data,
          alertId: state.alertId,
        });
        state.alertClearTimer = setTimeout(() => {
          state.alertQueue.shift(1);
        }, 2000);
      } else {
        state.alertQueue.push({
          ...data,
          alertId: state.alertId,
        });
        setTimeout(() => {
          state.alertQueue.shift(1);
        }, 2000);
      }
    },

    /**
     * 显示暴漫图片
     */
    showCartoon(state, data) {
      state.cartoon = data;
    },

    /**
     * 公共方法设置state参数
     */
    submit(state, item) {
      for (const i in item) {
        state[i] = item[i];
      }
    },

    /**
     * 小鸟游戏记录更新
     */
    birdRecord(state, [mode, score]) {
      if (state.birdBestScore[mode] < score) {
        state.birdBestScore[mode] = score;
      }
    },
  },
  actions: {
    /**
     * 初始化store（sessionStorage 快照恢复）
     */
    initStore(state, _this) {
      if (GET_SESSION("store")) {
        _this.$store.replaceState(
          Object.assign({}, state, JSON.parse(GET_SESSION("store")))
        );
        DEL_SESSION("store");
      }
    },
  },
});
export default store;
