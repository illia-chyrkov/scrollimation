interface ScrollimationConfig {
    /** Animation target. */
    target: HTMLElement | NodeList | Array<HTMLElement> | string;
    /** Scroll container (default: window).*/
    scrollContainer?: HTMLElement | string;
    /** Position where animation begin. */
    from: number;
    /** Position where animation end. */
    to: number;
    direction?: "top" | "left";
    /** Easing function ('linear', 'easeInQuad', ...). */
    easing?: "linear" | "easeInQuad" | "easeOutQuad" | "easeInOutQuad" | "easeInCubic" | "easeOutCubic" | "easeInOutCubic" | "easeInQuart" | "easeOutQuart" | "easeInOutQuart" | "easeInQuint" | "easeOutQuint" | "easeInOutQuint" | Function;
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
    id: string;
    /** Animation target. */
    target: HTMLElement | Array<HTMLElement>;
    /** Scroll container (default: window).*/
    scrollContainer: Element | Window;
    /** Position where animation begin. */
    from: number;
    /** Position where animation end. */
    to: number;
    direction: "top" | "left";
    /** Easing function ('linear', 'easeInQuad', ...). */
    easing: string | Function;
    mode: "requestAnimationFrame" | "onscroll";
    /** Limits the number of animation steps per second. */
    fpsLimit?: number;
    /** Initialize animation callback. */
    init: Function;
    /** This function is executed every time you need to change the styles of an animated element. */
    step: Function;
    /** Executed every time when scroll position is config.from. */
    start: Function;
    /** Executed every time when scroll position is config.to. */
    end: Function;
    /** Executed every time when scroll position is config.from. */
    reverseStart: Function;
    /** Executed every time when scroll position is config.to. */
    reverseEnd: Function;
    startEmitted: boolean;
    endEmitted: boolean;
    scrollTop: number;
    scrollLeft: number;
    status: "play" | "pause";
    _handler: Function;
    constructor(config: ScrollimationConfig);
    /**
     * Considers the value for the parameter depending on the scroll.
     * @param valueFrom - Use String for HEX colors.
     * @param valueTo - Use String for HEX colors.
     * @param easing - Easing function ('linear', 'easeInQuad', ...).
     */
    calc(valueFrom: number | string, valueTo: number | string, easing?: string | Function): number | string;
    stop(): void;
    play(): void;
    remove(): void;
    private static get Easing();
    static Calculate(scroll?: number, scrollFrom?: number, scrollTo?: number, valueFrom?: number, valueTo?: number, easing?: (t: number) => number): number;
    private static HexToNums;
}
export {};
