<template>
  <div class="bird_bg page-shell">
    <header class="hud">
      <div class="hud_title">管道小鸟 Flappy Bird</div>
      <span class="chip chip--score">得分 {{ successCount }}</span>
      <span class="chip chip--best">
        最高 <span class="chip-mode">{{ currentModeLabel }} </span>{{ birdBestScore[currentMode] }}分
      </span>
      <div class="hud_spacer"></div>
      <ConfigSelect
        title="难度"
        :options="difficultyOptions"
        :value="selectedDifficultyLabel"
        @apply="onDifficultyApply"
      />
    </header>
    <main class="game_layout stage-panel" ref="birdLayout">
      <div class="scaler" ref="scaler">
        <div
          class="bird_box"
          @mousedown="onStageTap"
          @touchstart.prevent="onStageTap"
        >
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
            <div
              class="pipe pipe--top"
              :style="{ height: item.topPipeHeight + 'px' }"
            ></div>
            <div
              class="pipe pipe--bottom"
              :style="{
                top: item.bottomPipeTop + 'px',
                height: item.bottomPipeHeight + 'px',
              }"
            ></div>
          </div>
        </div>
        <div class="land"></div>
      </div>
      <transition name="fade">
        <div class="start-overlay" v-if="!isStart && !result.isShow">
          <button class="btn btn--accent start-btn" @click.stop="onStageTap">
            开 始 游 戏
          </button>
          <p class="start-hint">
            <span class="start-hint_desktop">空格键 / 点击跳跃</span>
            <span class="start-hint_touch">点击屏幕开始 / 点击跳跃</span>
          </p>
        </div>
      </transition>
      <transition name="fade">
        <div class="result-overlay" v-if="result.isShow" @click.self="closeResult">
          <div class="result-card" role="dialog" aria-modal="true" aria-label="对局结果">
            <div class="result-media">
              <img class="result-media_bg" :src="result.image" alt />
              <img class="result-image" :src="result.image" alt />
            </div>
            <div class="result-body">
              <div class="result-score">
                <span class="result-label">本局得分</span>
                <span class="result-value">{{ result.score }}</span>
              </div>
              <div class="result-best">
                <span>最高 {{ currentModeLabel }} {{ birdBestScore[currentMode] }}分</span>
                <span class="result-badge" v-if="result.isNewBest">NEW BEST</span>
              </div>
              <button class="btn btn--accent result-btn" @click.stop="gameRestart">
                重新开始
              </button>
              <span class="result-dismiss">点击遮罩关闭</span>
            </div>
          </div>
        </div>
      </transition>
    </main>
    <transition name="fade">
      <div class="confirm-overlay" v-if="confirm.isShow" @click.self="cancelDifficulty">
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-label="切换难度确认">
          <p class="confirm-text">将重置当前对局，确认切换？</p>
          <div class="confirm-actions">
            <button class="btn confirm-cancel" @click="cancelDifficulty">取消</button>
            <button class="btn confirm-ok" @click="confirmDifficulty">确认切换</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { BIRD } from "@constants";
import { mapState } from "vuex";
import { $animate } from "../../mixins/index.js";
import { COMMIT } from "../../utils/index.js";
import pickCartoon from "../../utils/cartoon.js";
import ConfigSelect from "../../components/ConfigSelect.vue";

const WORLD_WIDTH = 1000;
const SKY_HEIGHT = 480;
const LAND_HEIGHT = 50;
const BIRD_SIZE = 30;
const BIRD_START_TOP = 50;
const PIPE_WIDTH = 52;
const PIPE_CAP = 26;
const PIPE_BOTTOM_MARGIN = 50;

export default {
  name: "BirdGame",
  components: { ConfigSelect },
  mixins: [$animate],
  data() {
    return {
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
      worldWidth: WORLD_WIDTH,
      worldHeight: SKY_HEIGHT,
      bandTop: 0,
      resizeRaf: 0,
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
      pendingDifficulty: null,
      wasRunning: false,
      resumeTS: 0,
      confirm: {
        isShow: false,
      },
      result: {
        isShow: false,
        isNewBest: false,
        score: 0,
        image: "",
      },
    };
  },
  mounted() {
    this.bindSpaceKey();
    this.$nextTick(this.updateScale);
    window.addEventListener("resize", this.handleResize);
  },
  unmounted() {
    document.onkeydown = null;
    clearInterval(this.pipeTimer);
    clearInterval(this.moveTimer);
    cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener("resize", this.handleResize);
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
    currentModeLabel() {
      const mode = this.difficultyOptions.find(
        (item) => item.speed === this.currentMode
      );
      return mode ? mode.label : this.currentMode;
    },
    selectedDifficultyLabel() {
      return this.pendingDifficulty
        ? this.pendingDifficulty.label
        : this.currentModeLabel;
    },
    ...mapState(["birdBestScore"]),
  },
  methods: {
    /**
     * 选择难度
     */
    onDifficultyApply(item) {
      if (item.speed === this.currentMode) {
        this.pendingDifficulty = null;
        this.confirm.isShow = false;
        return;
      }
      if (!this.isStart) {
        this.chooseDifficulty(item);
        return;
      }
      this.pauseGame();
      this.pendingDifficulty = item;
      this.confirm.isShow = true;
    },

    cancelDifficulty() {
      this.confirm.isShow = false;
      this.pendingDifficulty = null;
      this.resumeGame();
    },

    pauseGame() {
      if (!this.isStart) return;
      this.wasRunning = true;
      this.resumeTS = this.TS - this.AS * this.downTime;
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
    },

    resumeGame() {
      if (!this.wasRunning) return;
      this.wasRunning = false;
      this.downTime = 0;
      this.TS = this.resumeTS;
      this.birdMove();
      this.pipeMove();
    },

    confirmDifficulty() {
      const item = this.pendingDifficulty;
      this.confirm.isShow = false;
      this.pendingDifficulty = null;
      if (item) {
        this.chooseDifficulty(item);
      }
    },

    chooseDifficulty({ speed }) {
      this.currentMode = speed;
      switch (speed) {
        case "normal":
          this.jumpPower = 1;
          this.pipeMoveDistance = 2;
          this.pipeDistance = 200;
          break;
        case "hard":
          this.jumpPower = 1.1;
          this.pipeMoveDistance = 3;
          this.pipeDistance = 150;
          break;
        case "crazy":
          this.jumpPower = 1.2;
          this.pipeMoveDistance = 3;
          this.pipeDistance = 100;
          break;
      }
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
      this.isStart = false;
      this.wasRunning = false;
      this.downTime = 0;
      this.TS = 0;
      this.pipeArr = [];
      this.successCount = 0;
      this.successTip.isShow = false;
      this.result.isShow = false;
      this.resetBird();
    },

    /**
     * 绑定空格键
     */
    bindSpaceKey() {
      document.onkeydown = (e) => {
        if (e.keyCode === 27) {
          if (this.confirm.isShow) {
            this.cancelDifficulty();
          } else if (this.result.isShow) {
            this.closeResult();
          }
          return;
        }
        if (e.keyCode !== 32) return;
        const tag = e.target && e.target.tagName;
        if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        if (this.confirm.isShow) return;
        this.onStageTap();
      };
    },

    /**
     * 舞台点击/触控 与 空格键共用入口
     */
    onStageTap() {
      if (this.confirm.isShow) return;
      if (!this.isStart) {
        this.gameRestart();
      } else {
        this.birdJump();
      }
    },

    closeResult() {
      this.result.isShow = false;
    },

    /**
     * 响应式缩放：JS 逻辑坐标固定 1000 宽，视觉等比缩放。
     * 高舞台上多出的逻辑高度作为装饰天空，玩法带固定 SKY_HEIGHT 并在垂直方向居中，
     * 物理参数保持常数，保证各端跳跃手感一致。
     */
    handleResize() {
      if (this.resizeRaf) return;
      this.resizeRaf = requestAnimationFrame(() => {
        this.resizeRaf = 0;
        this.updateScale();
      });
    },

    updateScale() {
      const { birdLayout, scaler } = this.$refs;
      if (!birdLayout || !scaler) return;
      const stageWidth = birdLayout.clientWidth;
      const stageHeight = birdLayout.clientHeight;
      if (!stageWidth) return;
      // 小屏放大取景：可见逻辑宽小于 1000，画面裁掉世界右侧（管道从右侧外进入），
      // 保证手机端小鸟/管道不是按 1000 宽缩放后的迷你尺寸
      let viewWidth;
      if (stageWidth <= 420) {
        viewWidth = 480;
      } else if (stageWidth <= 768) {
        viewWidth = 480 + (stageWidth - 420) * (280 / 348);
      } else if (stageWidth <= 1040) {
        viewWidth = 760 + (stageWidth - 768) * (240 / 272);
      } else {
        viewWidth = WORLD_WIDTH;
      }
      const k = stageWidth / viewWidth;
      const birdCenter =
        WORLD_WIDTH - this.birdData.right - BIRD_SIZE / 2;
      const cameraX = Math.max(0, birdCenter - viewWidth * 0.32);
      scaler.style.setProperty("--k", k.toFixed(4));
      scaler.style.setProperty("--cam", (-cameraX * k).toFixed(2) + "px");
      this.worldWidth = WORLD_WIDTH;
      this.worldHeight = stageHeight / k - LAND_HEIGHT;
      this.bandTop = Math.max(0, (this.worldHeight - SKY_HEIGHT) / 2);
      if (!this.isStart) {
        this.resetBird();
      }
    },

    resetBird() {
      Object.assign(this.birdData, {
        top: Math.round(this.bandTop + BIRD_START_TOP),
        right: 700,
        sports: undefined,
      });
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
        const bottomBorder = this.worldHeight;
        if (AH + BIRD_SIZE >= bottomBorder) {
          birdData.top = bottomBorder - BIRD_SIZE;
          clearInterval(this.moveTimer);
          this.gameOver();
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
      const { pipeArr, pipeDistance, pipeMoveDistance } = this;
      const birdWidth = this.worldWidth;
      clearInterval(this.pipeTimer);
      this.pipeTimer = setInterval(() => {
        if (pipeArr.length && pipeArr[0].right > birdWidth) {
          pipeArr.shift();
        }
        const lastPipe = pipeArr[pipeArr.length - 1];
        if (!lastPipe || lastPipe.right > pipeDistance) {
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
    judgeIsPassPipe({ right, gapTop, gapBottom }) {
      const { birdData } = this;
      const { top: birdtop, right: birdRight } = birdData;
      const errorAllow = 5;
      if (birdRight <= right) {
        return "isSuccess";
      }
      if (birdRight <= right + PIPE_WIDTH && birdRight > right) {
        if (
          birdtop + errorAllow <= gapTop ||
          birdtop + BIRD_SIZE - errorAllow >= gapBottom
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
      if (!this.isStart) return;
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
      const { successCount, currentMode } = this;
      this.isStart = false;
      this.wasRunning = false;
      this.downTime = 0;
      this.pipeArr = [];
      this.successTip.isShow = false;
      const isNewBest = successCount > this.birdBestScore[currentMode];
      if (isNewBest) {
        COMMIT({ birdRecord: [currentMode, successCount] });
      }
      this.result = {
        isShow: true,
        isNewBest,
        score: successCount,
        image: pickCartoon(isNewBest ? "win" : "fail"),
      };
    },

    /**
     * 游戏重新开始
     */
    gameRestart() {
      clearInterval(this.pipeTimer);
      clearInterval(this.moveTimer);
      this.result.isShow = false;
      this.successTip.isShow = false;
      this.successCount = 0;
      this.downTime = 0;
      this.TS = 0;
      this.resetBird();
      this.createPipe(452);
      this.createPipe(200);
      this.pipeMove();
      this.birdMove();
      this.isStart = true;
    },

    /**
     * 创造管道
     */
    createPipe(right = -PIPE_WIDTH) {
      const { pipeDist, pipeArr, worldHeight, bandTop } = this;
      const bandBottom = Math.min(bandTop + SKY_HEIGHT, worldHeight);
      const minGapTop = bandTop + PIPE_CAP;
      const maxGapTop = bandBottom - pipeDist - PIPE_BOTTOM_MARGIN;
      const topH =
        minGapTop +
        ~~(Math.random() * Math.max(0, maxGapTop - minGapTop));
      const pipe = {
        right,
        gapTop: topH,
        gapBottom: topH + pipeDist,
        topPipeHeight: topH,
        bottomPipeTop: topH + pipeDist,
        bottomPipeHeight: worldHeight - (topH + pipeDist),
        isCross: "no",
      };
      pipeArr.push(pipe);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@style/bird.scss";
</style>
