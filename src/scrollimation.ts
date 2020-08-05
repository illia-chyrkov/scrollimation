class ScrollimationWorker {
  private static instances: Scrollimation[] = [];

  public static run() {
    ScrollimationWorker.instances.forEach((instance: Scrollimation) => {
      if (instance.mode === "requestAnimationFrame") instance._handler();
    });

    window.requestAnimationFrame(ScrollimationWorker.run);
  }

  public static addInstance(instance: Scrollimation) {
    const handler = (forcedRun: boolean = false) => {
      if (instance.status === "play" || forcedRun) {
        const scrollTop =
          instance.scrollContainer instanceof window.Element
            ? instance.scrollContainer.scrollTop
            : ScrollimationWorker.scrollTop;
        const scrollLeft =
          instance.scrollContainer instanceof window.Element
            ? instance.scrollContainer.scrollLeft
            : ScrollimationWorker.scrollLeft;

        ScrollimationWorker.animate(scrollTop, scrollLeft, instance, forcedRun);
      }
    };

    if (instance.fpsLimit) {
      instance._handler = ScrollimationWorker.Throttle(
        handler,
        1000 / instance.fpsLimit
      );
    } else instance._handler = handler;

    if (instance.mode === "onscroll") {
      instance.scrollContainer.addEventListener(
        "scroll",
        instance._handler as EventListenerOrEventListenerObject
      );
    }

    ScrollimationWorker.instances.push(instance);

    // Draw initial state
    handler(true);
  }

  public static removeInstance(instance: Scrollimation) {
    ScrollimationWorker.instances = ScrollimationWorker.instances.filter(
      (_instance: Scrollimation) => _instance.id !== instance.id
    );
  }

  public static animate(
    scrollTop: number,
    scrollLeft: number,
    state: Scrollimation,
    forcedRun: boolean = false
  ) {
    state.scrollTop = scrollTop;
    state.scrollLeft = scrollLeft;
    let scrollPosition = state.direction === "top" ? scrollTop : scrollLeft;

    if (scrollPosition >= state.from && !state.startEmitted) {
      if (state.direction === "top") {
        state.scrollTop = state.from;
      } else {
        state.scrollLeft = state.from;
      }

      state.startEmitted = true;
      state.start(state);
      state.step(state);
    } else if (scrollPosition <= state.from && state.startEmitted) {
      if (state.direction === "top") {
        state.scrollTop = state.from;
      } else {
        state.scrollLeft = state.from;
      }

      state.startEmitted = false;
      state.step(state);
      state.reverseEnd(state);
    }

    if (scrollPosition >= state.to && !state.endEmitted) {
      if (state.direction === "top") {
        state.scrollTop = state.to;
      } else {
        state.scrollLeft = state.to;
      }

      state.endEmitted = true;
      state.step(state);
      state.end(state);
    } else if (scrollPosition <= state.to && state.endEmitted) {
      if (state.direction === "top") {
        state.scrollTop = state.to;
      } else {
        state.scrollLeft = state.to;
      }

      state.endEmitted = false;
      state.reverseStart(state);
      state.step(state);
    }

    if (
      (scrollPosition > state.from && scrollPosition < state.to) ||
      forcedRun
    ) {
      state.step(state);
    }
  }

  private static Throttle(func: Function, ms: number) {
    let isThrottled = false;
    let savedArgs: IArguments;
    let savedThis: any;

    function wrapper(this: any) {
      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      func.apply(this, arguments);

      isThrottled = true;

      setTimeout(function () {
        isThrottled = false;
        if (savedArgs) {
          wrapper.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, ms);
    }

    return wrapper;
  }

  public static get scrollTop() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop
    );
  }

  public static get scrollLeft() {
    return (
      window.pageXOffset ||
      document.documentElement.scrollLeft ||
      document.body.scrollLeft
    );
  }
}

ScrollimationWorker.run();

interface ScrollimationConfig {
  /** Animation target. */
  target?: HTMLElement | NodeList | Array<HTMLElement> | string;
  /** Scroll container (default: window).*/
  scrollContainer?: HTMLElement | string;
  /** Position where animation begin. */
  from: number;
  /** Position where animation end. */
  to: number;
  direction?: "top" | "left";
  /** Easing function ('linear', 'easeInQuad', ...). */
  easing?:
    | "linear"
    | "easeInQuad"
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeInQuart"
    | "easeOutQuart"
    | "easeInOutQuart"
    | "easeInQuint"
    | "easeOutQuint"
    | "easeInOutQuint"
    | Function;
  mode?: "requestAnimationFrame" | "onscroll";
  /** Limits the number of animation steps per second. */
  fpsLimit?: number;
  /** Initialize animation callback. */
  init?: Function;
  /** This function is executed every time you need to change the styles of an animated element. */
  step?: Function;
  /** Executed every time when scroll position is config.from. */
  start?: Function;
  /** Executed every time when scroll position is config.to. */
  end?: Function;
  /** Executed every time when scroll position is config.from. */
  reverseStart?: Function;
  /** Executed every time when scroll position is config.to. */
  reverseEnd?: Function;
}

export default class Scrollimation {
  public id: string;
  /** Animation target. */
  public target: HTMLElement | Array<HTMLElement>;
  /** Scroll container (default: window).*/
  public scrollContainer: Element | Window;
  /** Position where animation begin. */
  public from: number;
  /** Position where animation end. */
  public to: number;
  public direction: "top" | "left";
  /** Easing function ('linear', 'easeInQuad', ...). */
  public easing: string | Function;
  public mode: "requestAnimationFrame" | "onscroll";
  /** Limits the number of animation steps per second. */
  public fpsLimit?: number;
  /** Initialize animation callback. */
  public init: Function;
  /** This function is executed every time you need to change the styles of an animated element. */
  public step: Function;
  /** Executed every time when scroll position is config.from. */
  public start: Function;
  /** Executed every time when scroll position is config.to. */
  public end: Function;
  /** Executed every time when scroll position is config.from. */
  public reverseStart: Function;
  /** Executed every time when scroll position is config.to. */
  public reverseEnd: Function;
  public startEmitted: boolean;
  public endEmitted: boolean;
  public scrollTop: number;
  public scrollLeft: number;
  public status: "play" | "pause";
  public _handler: Function;

  constructor(config: ScrollimationConfig) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.scrollContainer =
      typeof config.scrollContainer === "string"
        ? (document.querySelector(config.scrollContainer) as Element)
        : config.scrollContainer || window;
    this.from = config.from || 0;
    this.to = config.to || 0;
    this.direction = config.direction || "top";
    this.mode = config.mode || "requestAnimationFrame";
    this.fpsLimit = config.fpsLimit;
    this.init = config.init || (() => {});
    this.step = config.step || (() => {});
    this.start = config.start || (() => {});
    this.end = config.end || (() => {});
    this.reverseStart = config.reverseStart || (() => {});
    this.reverseEnd = config.reverseEnd || (() => {});
    this.startEmitted = false;
    this.endEmitted = false;

    if (config.target instanceof window.NodeList)
      this.target = [].slice.call(config.target);
    else if (typeof config.target === "string")
      this.target = [].slice.call(document.querySelectorAll(config.target));
    else this.target = config.target;

    this.easing = config.easing || "linear";

    this.scrollTop =
      this.scrollContainer instanceof window.Element
        ? this.scrollContainer.scrollTop
        : ScrollimationWorker.scrollTop;
    this.scrollLeft =
      this.scrollContainer instanceof window.Element
        ? this.scrollContainer.scrollLeft
        : ScrollimationWorker.scrollLeft;

    this.status = "play";

    ScrollimationWorker.addInstance(this);

    this.init(this);
  }

  /**
   * Considers the value for the parameter depending on the scroll.
   * @param valueFrom - Use String for HEX colors.
   * @param valueTo - Use String for HEX colors.
   * @param easing - Easing function ('linear', 'easeInQuad', ...).
   */
  public calc(
    valueFrom: number | string,
    valueTo: number | string,
    easing: string | Function = this.easing
  ): number | string {
    const isHex = /(^#[0-9A-F]{3}$)|(^#[0-9A-F]{4}$)|(^#[0-9A-F]{6}$)|(^#[0-9A-F]{8}$)/i;
    if (
      typeof valueFrom === "string" &&
      isHex.test(valueFrom) &&
      typeof valueTo === "string" &&
      isHex.test(valueTo)
    ) {
      let res: any = [];
      let resFrom = Scrollimation.HexToNums(valueFrom);
      let resTo = Scrollimation.HexToNums(valueTo);

      resFrom.forEach((val: any, i: any) => {
        res.push(
          Scrollimation.Calculate(
            this.direction === "top" ? this.scrollTop : this.scrollLeft,
            this.from,
            this.to,
            val,
            resTo[i],
            typeof easing === "function"
              ? easing
              : Scrollimation.Easing[easing] || Scrollimation.Easing.linear
          )
        );
      });

      return `rgba(${res[0]}, ${res[1]}, ${res[2]}, ${res[3]})`;
    }

    return Scrollimation.Calculate(
      this.direction === "top" ? this.scrollTop : this.scrollLeft,
      this.from,
      this.to,
      +valueFrom,
      +valueTo,
      typeof easing === "function"
        ? easing
        : Scrollimation.Easing[easing] || Scrollimation.Easing.linear
    );
  }

  // Stop animation
  public stop() {
    this.status = "pause";
  }

  // Play animation
  public play() {
    this.status = "play";
  }

  // Remove instance
  public remove() {
    this.status = "pause";

    if (this.mode === "onscroll") {
      this.scrollContainer.removeEventListener(
        "scroll",
        this._handler as EventListenerOrEventListenerObject
      );
    }

    ScrollimationWorker.removeInstance(this);
  }

  /*
   * Easing Functions - inspired from http://gizma.com/easing/
   * only considering the t value for the range [0, 1] => [0, 1]
   */
  private static get Easing() {
    return {
      // no easing, no acceleration
      linear: function (t: number) {
        return t;
      },
      // accelerating from zero velocity
      easeInQuad: function (t: number) {
        return t * t;
      },
      // decelerating to zero velocity
      easeOutQuad: function (t: number) {
        return t * (2 - t);
      },
      // acceleration until halfway, then deceleration
      easeInOutQuad: function (t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
      // accelerating from zero velocity
      easeInCubic: function (t: number) {
        return t * t * t;
      },
      // decelerating to zero velocity
      easeOutCubic: function (t: number) {
        return --t * t * t + 1;
      },
      // acceleration until halfway, then deceleration
      easeInOutCubic: function (t: number) {
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      // accelerating from zero velocity
      easeInQuart: function (t: number) {
        return t * t * t * t;
      },
      // decelerating to zero velocity
      easeOutQuart: function (t: number) {
        /*jshint -W006 */
        return 1 - --t * t * t * t;
      },
      // acceleration until halfway, then deceleration
      easeInOutQuart: function (t: number) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
      },
      // accelerating from zero velocity
      easeInQuint: function (t: number) {
        return t * t * t * t * t;
      },
      // decelerating to zero velocity
      easeOutQuint: function (t: number) {
        return 1 + --t * t * t * t * t;
      },
      // acceleration until halfway, then deceleration
      easeInOutQuint: function (t: number) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
      },
    };
  }

  public static Calculate(
    scroll = 0,
    scrollFrom = 0,
    scrollTo = 0,
    valueFrom = 0,
    valueTo = 0,
    easing = (t: number) => t
  ) {
    scroll = scroll < scrollFrom ? scrollFrom : scroll;
    scroll = scroll > scrollTo ? scrollTo : scroll;

    return (
      valueFrom +
      (valueTo - valueFrom) *
        easing((scroll - scrollFrom) / (scrollTo - scrollFrom))
    );
  }

  private static HexToNums(hex: string) {
    let res;

    if (hex.length === 4) {
      let r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
      res = r.slice(1, 4).map(function (x: any) {
        return 0x11 * parseInt(x, 16);
      });
    } else if (hex.length === 5) {
      let r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i);
      res = r.slice(1, 5).map(function (x: any) {
        return 0x11 * parseInt(x, 16);
      });
    } else if (hex.length === 7) {
      let r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
      res = r.slice(1, 4).map(function (x: any) {
        return parseInt(x, 16);
      });
    } else if (hex.length === 9) {
      let r = hex.match(
        /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
      );
      res = r.slice(1, 5).map(function (x: any) {
        return parseInt(x, 16);
      });
    }

    res[3] = res[3] / 255 || 1;

    return res;
  }
}
