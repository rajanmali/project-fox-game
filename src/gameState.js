import { modFox, modScene, togglePoopBag, writeModal } from "./ui";
import {
  SCENES,
  RAIN_CHANCE,
  DAY_LENGTH,
  NIGHT_LENGTH,
  getNextHungerTime,
  getNextPoopTime,
  getNextDieTime,
} from "./constants";

const gameState = {
  current: "INIT",
  clock: 1,
  wakeTime: -1,
  sleepTime: -1,
  hungryTime: -1,
  poopTime: -1,
  dieTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  tick() {
    this.clock++;
    if (this.clock === this.wakeTime) {
      this.wake();
    } else if (this.clock === this.sleepTime) {
      this.sleep();
    } else if (this.clock === this.hungryTime) {
      this.getHungry();
    } else if (this.clock === this.dieTime) {
      this.die();
    } else if (this.clock === this.timeToStartCelebrating) {
      this.startCelebrating();
    } else if (this.clock === this.timeToEndCelebrating) {
      this.endCelebrating();
    } else if (this.clock === this.poopTime) {
      this.poop();
    }
    return this.clock;
  },
  handleUserAction(icon) {
    if (
      ["SLEEP", "FEEDING", "CELEBRATING", "HATCHING"].includes(this.current)
    ) {
      return;
    }

    if (this.current === "INIT" || this.current === "DEAD") {
      this.startGame();
      return;
    }

    switch (icon) {
      case "weather":
        this.changeWeather();
        break;
      case "poop":
        this.cleanUpPoop();
        break;
      case "fish":
        this.feed();
        break;
    }
  },
  changeWeather() {
    this.scene = (this.scene + 1) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
  },
  poop() {
    this.current = "POOPING";
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox("pooping");
  },
  cleanUpPoop() {
    if (this.current !== "POOPING") {
      return;
    } else {
      this.dieTime = -1;
      togglePoopBag(true);
      this.startCelebrating();
      this.hungryTime = getNextHungerTime(this.clock);
    }
  },
  feed() {
    if (this.current !== "HUNGRY") {
      return;
    } else {
      this.current = "FEEDING";
      this.dieTime = -1;
      this.poopTime = getNextPoopTime(this.clock);
      this.timeToStartCelebrating = this.clock + 2;
      modFox("eating");
    }
  },
  startCelebrating() {
    this.current = "CELEBRATING";
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
    modFox("celebrate");
  },
  endCelebrating() {
    this.current = "IDLING";
    this.timeToEndCelebrating = -1;
    this.determineFoxState();
    togglePoopBag(false);
  },
  determineFoxState() {
    if (this.current === "IDLING") {
      if (SCENES[this.scene] === "rain") {
        modFox("rain");
      } else {
        modFox("idling");
      }
    }
  },
  startGame() {
    this.current = "HATCHING";
    this.wakeTime = this.clock + 3;
    modFox("egg");
    modScene("day");
    writeModal();
  },
  wake() {
    this.current = "IDLING";
    this.wakeTime = -1;
    this.sleepTime = this.clock + DAY_LENGTH;
    this.hungryTime = getNextHungerTime(this.clock);
    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
    this.determineFoxState();
    modScene(SCENES[this.scene]);
  },
  sleep() {
    this.current = "SLEEP";
    this.clearTimes();
    this.wakeTime = this.clock + NIGHT_LENGTH;
    modFox("sleep");
    modScene("night");
  },
  getHungry() {
    this.current = "HUNGRY";
    this.dieTime = getNextDieTime(this.clock);
    this.hungryTime = -1;
    modFox("hungry");
  },
  clearTimes() {
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungryTime = -1;
    this.poopTime = -1;
    this.dieTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
  },
  die() {
    this.current = "DEAD";
    this.clearTimes();
    modScene("dead");
    modFox("dead");
    writeModal(
      "The Fox died :( <br/> Press the middle button to restart the game."
    );
  },
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);
export default gameState;
