<template>
  <label class="config-select">
    <span class="config-select_title" v-if="title">{{ title }}</span>
    <select class="select" :value="value" :aria-label="title" @change="apply">
      <option v-for="o in options" :key="o.label" :value="o.label">{{ o.label }}</option>
    </select>
  </label>
</template>

<script>
export default {
  name: "ConfigSelect",
  props: {
    title: { type: String, default: "选项" },
    options: { type: Array, required: true },
    value: { type: String, default: "" },
  },
  methods: {
    apply(e) {
      const item = this.options.find((o) => o.label === e.target.value);
      if (item) {
        this.$emit("apply", item);
      }
    },
  },
};
</script>

<style scoped>
.config-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.config-select_title {
  display: none;
}
.select {
  width: 160px;
}

@media (min-width: 768px) and (max-width: 1023.98px) {
  .select {
    width: 150px;
  }
}

@media (max-width: 767.98px) {
  .config-select {
    display: flex;
    width: auto;
    min-width: 0;
  }
  .select {
    width: 150px;
  }
}

@media (max-height: 500px) and (max-width: 900px) and (orientation: landscape) {
  .select {
    width: 140px;
  }
}
</style>
