const imgs = import.meta.glob("../assets/img/winOrFail/*.jpg", {
  eager: true,
  import: "default",
});

const pickCartoon = (type = "fail") => {
  const pool = Object.keys(imgs).filter((key) => key.includes(`/${type}_`));
  if (!pool.length) return "";
  return imgs[pool[Math.floor(Math.random() * pool.length)]];
};

export default pickCartoon;
