<template>
  <div class="bird_bg">
    <div class="w1440 noScroll">
      <div class="row site">
        <div
          class="sm-12 md-3 col sidebar"
          v-first="{
            name: 'translateLeft',
            duration: '0.5s',
            delay: '0.5s',
            offset: '0',
          }"
        >
          <div class="paper">
            <h3
              class="sidebar-title sidebar_h3"
              v-first="{
                name: 'translateTop',
                duration: '0.5s',
                delay: '0.8s',
                offset: '0',
              }"
            >
              管道小鸟 Flappy Bird
            </h3>
            <div class="row">
              <div
                class="collapsible full-width"
                v-for="(item, idx) in sidebar"
                :key="idx"
                v-first="{
                  name: 'translateTop',
                  duration: '0.5s',
                  delay: `${1 + idx * 0.2}s`,
                  offset: '0',
                }"
              >
                <input
                  :id="`collapsible-${item.title}`"
                  type="radio"
                  name="collapsible"
                />
                <label :for="`collapsible-${item.title}`">{{
                  item.title
                }}</label>
                <div class="collapsible-body">
                  <ul>
                    <li
                      class="paper_li"
                      v-for="(child, cIdx) in item.children"
                      :key="cIdx"
                      @click="sideBarMethod(child)"
                    >
                      {{ child.label }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="sm-12 md-9 col">
          <div
            class="paper"
            v-first="{
              name: 'translateRight',
              duration: '0.4s',
              delay: '0.5s',
              offset: '0',
            }"
          >
            <div class="config-select-bar">
              <ConfigSelect
                title="难度"
                :options="difficultyOptions"
                @apply="sideBarMethod"
              />
            </div>
            <div
              class="spaceTip"
              v-first="{
                name: 'translateRight',
                duration: '0.4s',
                delay: '0.7s',
                offset: '0',
              }"
            >
              {{
                `空格键或点击屏幕开始（Space / Tap） 当前得分（Count）：${successCount}分`
              }}
            </div>
            <div
              class="scoreTip"
              v-first="{
                name: 'translateRight',
                duration: '0.4s',
                delay: '0.8s',
                offset: '0',
              }"
            >
              <span
                class="birdScoreSpan"
                v-for="(item, idx) in birdScore"
                :key="idx"
                v-first="{
                  name: 'translateRight',
                  duration: '0.5s',
                  delay: `${0.9 + idx * 0.2}s`,
                  offset: '0',
                }"
                >{{ item }}</span
              >
            </div>
            <div
              class="game_layout"
              ref="birdLayout"
              v-first="{
                name: 'translateRight',
                duration: '0.4s',
                delay: '0.9s',
                offset: '0',
              }"
            >
              <div class="scaler" ref="scaler">
                <div
                  class="bird_box"
                  ref="birdBox"
                  @mousedown="onStageTap"
                  @touchstart.prevent="onStageTap"
                >
                  <transition name="alanAlert">
                    <div class="bird_h3" v-if="!isStart">
                      <span
                        v-first="{
                          name: 'translateTop',
                          duration: '0.5s',
                          delay: '1.4s',
                          offset: '0',
                        }"
                        >Game Start!!!</span
                      >
                      <br />
                      <span
                        v-first="{
                          name: 'translateTop',
                          duration: '0.5s',
                          delay: '1.6s',
                          offset: '0',
                        }"
                        >Just do it!Foolish guys!</span
                      >
                    </div>
                  </transition>
                  <transition name="alanAlert">
                    <img
                      v-show="successTip.isShow"
                      :style="successAttr"
                      class="success_img"
                      src="../../assets/img/bird/success.png"
                      alt
                    />
                  </transition>
                  <div
                    :class="{
                      birdRoate: birdData.sports == 'fall',
                      birdJump: birdData.sports == 'jump',
                    }"
                    class="bird"
                    ref="bird"
                    :style="birdAttr"
                  >
                    <div class="birdWing"></div>
                  </div>
                  <div
                    class="pipFar"
                    v-for="(item, idx) in pipeArr"
                    :key="idx"
                    :style="{ right: item.right + 'px' }"
                  >
                    <img
                      class="pipe"
                      :src="item.topPipeSrc"
                      :style="{ top: item.topPipeTop + 'px' }"
                      alt
                    />
                    <img
                      class="pipe"
                      :src="item.bottomPipeSrc"
                      :style="{ top: item.bottomPipeTop + 'px' }"
                      alt
                    />
                  </div>
                </div>
                <div
                  class="land"
                  v-first="{
                    name: 'alanAlertIn',
                    duration: '0.5s',
                    delay: '1.1s',
                    offset: '0',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pipeTopImg from "@image/bird/pipeTop.png";
import pipeBottomImg from "@image/bird/pipeBottom.png";
import { BIRD } from "@constants";
import { mapState, mapGetters } from "vuex";
import { $animate } from "../../mixins/index.js";
import { COMMIT } from "../../utils/index.js";
import ConfigSelect from "../../components/ConfigSelect.vue";
export default {
  name: "BirdGame",
  components: { ConfigSelect },
  mixins: [$animate],
  data() {
    return {
      sidebar: BIRD.sidebar,
      difficultyOptions: BIRD.sidebar[0].children,
      currentMode: "normal",
      birdData: {
        top: 50,
        right: 700,
        sports: undefined,
      },
      AS: 500,
      TS: 0,
      jumpPower: 1,
      downTime: 0,
      isStart: false,
      timerNum: 20,
      moveTimer: null,
      pipeArr: [],
      pipeMoveDistance: 2,
      pipeDist: 100,
      pipeTimer: null,
      pipeDistance: 200,
      successTip: {
        top: 210,
        right: 500,
        isShow: false,
      },
      successCount: 0,
    };
  },
  mounted() {
    this.bindSpaceKey();
    this.$nextTick(this.updateScale);
    window.addEventListener("resize", this.updateScale);
  },
  unmounted() {
    document.onkeydown = null;
    clearInterval(this.pipeTimer);
    clearInterval(this.moveTimer);
    window.removeEventListener("resize", this.updateScale);
  },
  computed: {
    birdAttr() {
      return {
        top: this.birdData.top + "px",
        right: this.birdData.right + "px",
      };
    },
    successAttr() {
      return {
        top: this.successTip.top + "px",
        right: this.successTip.right + "px",
      };
    },
    ...mapState(["birdBestScore"]),
    ...mapGetters(["birdScore"]),
  },
  methods: {
    /**
     * 侧边栏事件
     */
    sideBarMethod(item) {
      const { type } = item;
      switch (type) {
        case "difficulty":
          this.chooseDifficulty(item);
          break;
      }
    },

    /**
     * 选择难度
     */
    chooseDifficulty({ speed, label }) {
      let type = "";
      this.currentMode = speed;
      switch (speed) {
        case "normal":
          this.jumpPower = 1;
          this.pipeMoveDistance = 2;
          this.pipeDistance = 200;
          type = "primary";
          break;
        case "hard":
          this.jumpPower = 1.1;
          this.pipeMoveDistance = 3;
          this.pipeDistance = 150;
          type = "warning";
          break;
        case "crazy":
          this.jumpPower = 1.2;
          this.pipeMoveDistance = 3;
          this.pipeDistance = 100;
          type = "danger";
          break;
      }
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
      this.isStart = false;
      this.downTime = 0;
      this.pipeArr = [];
      this.HiAlert({
        type,
        content: `难度已切换为${label}`,
      });
    },

    /**
     * 绑定空格键
     */
    bindSpaceKey() {
      document.onkeydown = ({ keyCode }) => {
        if (keyCode == 32) {
          this.onStageTap();
        }
      };
    },

    /**
     * 舞台点击/触控 与 空格键共用入口
     */
    onStageTap() {
      if (!this.isStart) {
        this.gameRestart();
      } else {
        this.birdJump();
      }
    },

    /**
     * 响应式缩放：JS 逻辑坐标固定 1000x530，视觉等比缩放
     */
    updateScale() {
      const { birdLayout, scaler } = this.$refs;
      if (!birdLayout || !scaler) return;
      scaler.style.setProperty(
        "--k",
        (birdLayout.clientWidth / 1000).toFixed(4)
      );
    },

    /**
     * 开始运动
     */
    birdMove() {
      let { timerNum, birdData, TS, AS } = this;
      clearInterval(this.moveTimer);
      const lastTop = birdData.top;
      this.moveTimer = setInterval(() => {
        this.downTime += timerNum / 1000;
        const { downTime } = this;
        const currentTop = 0.5 * AS * downTime * downTime - TS * downTime;
        const AH = lastTop + currentTop;
        if (AH > lastTop) {
          if (birdData.sports != "fall") birdData.sports = "fall";
        } else {
          if (birdData.sports != "jump") birdData.sports = "jump";
        }
        const { birdBox, bird } = this.$refs;
        const bottomBorder = birdBox.offsetHeight;
        const birdHeight = bird.offsetHeight;
        if (AH > bottomBorder) {
          birdData.top = bottomBorder - birdHeight;
          clearInterval(this.moveTimer);
        } else {
          birdData.top = AH;
        }
      }, timerNum);
    },

    /**
     * 跳跃
     */
    birdJump() {
      const { jumpPower } = this;
      this.downTime = 0;
      this.TS = 200 * jumpPower;
      this.birdMove();
    },

    /**
     * 管道移动
     */
    pipeMove() {
      const { birdBox } = this.$refs;
      const { pipeArr, pipeDistance, pipeMoveDistance } = this;
      const birdWidth = birdBox.offsetWidth;
      clearInterval(this.pipeTimer);
      this.pipeTimer = setInterval(() => {
        if (pipeArr[0].right > birdWidth) {
          pipeArr.shift();
        }
        const lastPipe = pipeArr[pipeArr.length - 1];
        if (lastPipe.right > pipeDistance) {
          this.createPipe();
        }
        for (let i = 0; i < pipeArr.length; i++) {
          const item = pipeArr[i];
          item.right += pipeMoveDistance;
        }
        for (let i = 0; i < pipeArr.length; i++) {
          const item = pipeArr[i];
          if (item.isCross == "no") {
            const res = this.judgeIsPassPipe(item);
            switch (res) {
              case "isSuccess":
                this.passPipe();
                item.isCross = "is";
                break;
              case "isFail":
                this.gameOver();
                break;
              case "isFlying":
                break;
            }
            break;
          }
        }
      }, 30);
    },

    /**
     * 判断小鸟是否通过管道
     */
    judgeIsPassPipe({ right, topPipeTop, bottomPipeTop }) {
      const { birdData } = this;
      const { top: birdtop, right: birdRight } = birdData;
      const pipeWidth = 52,
        pipeHeight = 420,
        birdHeight = 30,
        errorAllow = 5;
      if (birdRight <= right) {
        return "isSuccess";
      }
      if (birdRight <= right + pipeWidth && birdRight > right) {
        if (
          birdtop + errorAllow <= topPipeTop + pipeHeight ||
          birdtop + birdHeight - errorAllow >= bottomPipeTop
        ) {
          return "isFail";
        }
      }
      return "isFlying";
    },

    /**
     * 通过管道
     */
    passPipe() {
      const { birdData } = this;
      this.successCount++;
      this.successTip = {
        top: birdData.top,
        right: birdData.right - 120,
        isShow: true,
      };
      setTimeout(() => {
        this.successTip.isShow = false;
      }, 500);
    },

    /**
     * 游戏结束
     */
    gameOver() {
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
      const { successCount, currentMode } = this;
      this.isStart = false;
      this.downTime = 0;
      this.pipeArr = [];
      if (successCount > this.birdBestScore[currentMode]) {
        COMMIT({ birdRecord: [currentMode, successCount] });
        this.HiAlert({
          type: "success",
          content: "恭喜你打破了记录！！！",
        });
        this.HiImg({ type: "win" });
      } else {
        this.HiAlert({
          type: "danger",
          content: "你挂了",
        });
        this.HiImg({ type: "fail" });
      }
    },

    /**
     * 游戏重新开始
     */
    gameRestart() {
      this.HiImg({ isShow: "hide" });
      this.createPipe();
      this.pipeMove();
      this.birdMove();
      this.successCount = 0;
      this.isStart = true;
    },

    /**
     * 创造管道
     */
    createPipe() {
      const { pipeDist, pipeArr } = this;
      const { birdBox } = this.$refs;
      const birdHeight = birdBox.offsetHeight;
      const topH = ~~(Math.random() * (birdHeight - pipeDist - 50));
      const initRight = 300;
      const pipeW = 52;
      const pipeH = 420;
      const pipe = {
        right: -pipeW,
        topPipeTop: topH - pipeH,
        topPipeSrc: pipeTopImg,
        bottomPipeTop: topH + pipeDist,
        bottomPipeSrc: pipeBottomImg,
        isCross: "no",
      };
      pipeArr.push(pipe);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@style/bird.scss";
</style>
