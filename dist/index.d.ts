import { ReadonlyTeleBox, RegisterParams, AppContext, View, NetlessApp } from '@netless/window-manager';
import { Slide, SLIDE_EVENTS, SyncEvent, ISlideConfig } from '@netless/slide';
export { Slide } from '@netless/slide';

declare type SlideState = Slide["slideState"];
interface Attributes {
    /** convert task id */
    taskId: string;
    /** base url of converted resources */
    url: string;
    /** internal state of slide, do not change */
    state: SlideState | null;
    resourceList: string[];
    previewList: string[];
    note?: string;
}
declare type MagixPayload = {
    type: typeof SLIDE_EVENTS.syncDispatch;
    payload: SyncEvent;
};
declare type MagixEvents = {
    [SLIDE_EVENTS.syncDispatch]: MagixPayload;
};

interface FreezableSlide {
    freeze: () => void;
    unfreeze: () => void;
}
declare let FreezerLength: number;
declare function getFreezerLength(): number;
/** @param length - must be >= 1, default is 2 */
declare function setFreezerLength(length: number): void;
declare const apps: {
    map: Map<string, FreezableSlide>;
    boxes: Map<string, ReadonlyTeleBox>;
    queue: string[];
    validateQueue(): void;
    set(appId: string, slide: FreezableSlide, box: ReadonlyTeleBox): void;
    delete(appId: string): void;
    focus(appId: string): void;
};
declare function onCreated(callback: (appId: string) => void): () => boolean;
declare function onDestroyed(callback: (appId: string) => void): () => boolean;
declare type AddHooks = NonNullable<RegisterParams["addHooks"]>;
/**
 * Put this function in your register code:
 * `WindowManager.register({ kind: 'Slide', src: SlideApp, addHooks })`
 * So that it will automatically freeze the app when it is not in focus.
 */
declare const addHooks: AddHooks;

declare type SideEffectDisposer = () => any;
declare class SideEffectManager {
    /**
     * Add a disposer directly.
     * @param disposer a disposer or a list of disposers
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    addDisposer(disposer: SideEffectDisposer | SideEffectDisposer[], disposerID?: string): string;
    /**
     * @alias addDisposer
     * Add a disposer directly.
     * @param disposer a disposer or a list of disposers
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    push: (disposer: SideEffectDisposer | SideEffectDisposer[], disposerID?: string) => string;
    /**
     * Add a side effect.
     * @param executor Executes side effect. Return a disposer or a list of disposers. Returns null or false to ignore.
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    add(executor: () => SideEffectDisposer | SideEffectDisposer[] | null | false, disposerID?: string): string;
    /**
     * Sugar for addEventListener.
     * @param el
     * @param type
     * @param listener
     * @param options
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    addEventListener<K extends keyof WindowEventMap>(el: Window, type: K, listener: (this: Window, ev: WindowEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    addEventListener<K extends keyof DocumentEventMap>(el: Document, type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    addEventListener<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    addEventListener<K extends keyof MediaQueryListEventMap>(el: MediaQueryList, type: K, listener: (this: HTMLElement, ev: MediaQueryListEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    /**
     * Sugar for setTimeout.
     * @param handler
     * @param timeout
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    setTimeout(handler: () => void, timeout: number, disposerID?: string): string;
    /**
     * Sugar for setInterval.
     * @param handler
     * @param timeout
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    setInterval(handler: () => void, timeout: number, disposerID?: string): string;
    /**
     * Remove but not run the disposer. Do nothing if not found.
     * @param disposerID
     */
    remove(disposerID: string): SideEffectDisposer | undefined;
    /**
     * Remove and run the disposer. Do nothing if not found.
     * @param disposerID
     */
    flush(disposerID: string): void;
    /**
     * Remove and run all of the disposers.
     */
    flushAll(): void;
    /**
     * All disposers. Use this only when you know what you are doing.
     */
    readonly disposers: Map<string, SideEffectDisposer>;
    genUID(): string;
}

interface DocsViewerPage {
    src: string;
    height: number;
    width: number;
    thumbnail?: string;
}
interface DocsViewerConfig {
    readonly: boolean;
    box: ReadonlyTeleBox;
    onNewPageIndex: (index: number, origin?: string) => void;
    onPlay?: () => void;
    urlInterrupter?: (url: string) => Promise<string>;
    onPagesReady?: (pages: DocsViewerPage[]) => void;
    context?: AppContext<Attributes, MagixEvents, AppOptions>;
}
declare class DocsViewer {
    constructor({ readonly, onNewPageIndex, onPlay, onPagesReady, urlInterrupter, box, context, }: DocsViewerConfig);
    protected readonly: boolean;
    protected appReadonly?: boolean;
    protected box: ReadonlyTeleBox;
    protected onNewPageIndex: (index: number, origin?: string) => void;
    protected onPlay?: () => void;
    protected onPagesReady?: (pages: DocsViewerPage[]) => void;
    protected urlInterrupter: (url: string) => Promise<string> | string;
    private _pages;
    set pages(value: DocsViewerPage[]);
    get pages(): DocsViewerPage[];
    $content: HTMLElement;
    $preview: HTMLElement;
    $previewMask: HTMLElement;
    $footer: HTMLElement;
    $pageNumberInput: HTMLElement;
    $totalPage: HTMLSpanElement;
    $btnPlay: HTMLButtonElement;
    $btnSidebar: HTMLButtonElement;
    private $btnPageNext;
    private $btnPageBack;
    private notes?;
    readonly context?: AppContext<Attributes, MagixEvents, AppOptions>;
    pageIndex: number;
    unmount(): void;
    setReadonly(readonly: boolean): void;
    setAppReadonly(readonly: boolean): void;
    destroy(): void;
    setPageIndex(pageIndex: number): void;
    private scrollPreview;
    refreshTotalPage(): void;
    setSmallBox(isSmallBox: boolean): void;
    render(): HTMLElement;
    protected renderContent(): HTMLElement;
    private previewLazyLoad?;
    private note$?;
    private noteHasLink?;
    private noteLink?;
    getNoteHasLink(): boolean | undefined;
    getNoteLink(): string | undefined;
    protected renderNote(): HTMLDivElement | undefined;
    protected renderNoteContent(): void;
    protected renderPreview(): HTMLElement;
    private refreshPreview;
    protected renderPreviewMask(): HTMLElement;
    setPaused: () => void;
    setPlaying: () => void;
    refreshBtnSidebar(): void;
    protected renderFooter(): HTMLElement;
    protected renderFooterBtn(className: string, $icon: SVGElement, $iconActive?: SVGElement): HTMLButtonElement;
    togglePreview(isShowPreview?: boolean): void;
    protected wrapClassName(className: string): string;
    protected namespace: string;
    protected isShowPreview: boolean;
    protected isSmallBox: boolean;
    protected sideEffect: SideEffectManager;
}

declare const DefaultUrl = "https://convertcdn.netless.link/dynamicConvert";
interface SlideControllerOptions {
    context: AppContext<Attributes, MagixEvents, AppOptions>;
    anchor: HTMLDivElement;
    onRenderStart: () => void;
    onRenderEnd: () => void;
    onPageChanged: (page: number) => void;
    onTransitionStart: () => void;
    onTransitionEnd: () => void;
    onError: (args: {
        error: Error;
        index: number;
    }) => void;
    onRenderError?: (error: Error, pageIndex: number) => void;
    onNavigate?: (index: number, origin?: string) => void;
    showRenderError?: boolean;
    invisibleBehavior?: "frozen" | "pause";
}
declare class SlideController {
    readonly context: SlideControllerOptions["context"];
    readonly slide: Slide;
    readonly showRenderError: boolean;
    readonly onRenderError?: (error: Error, pageIndex: number) => void;
    readonly onNavigate: (index: number, origin?: string) => void;
    private readonly room?;
    private readonly player?;
    private readonly sideEffect;
    private readonly onRenderStart;
    private readonly onPageChanged;
    private readonly onTransitionStart;
    private readonly onTransitionEnd;
    private readonly onError;
    private syncStateOnceFlag;
    private visible;
    private savedIsFrozen;
    private invisibleBehavior;
    previewList: string[];
    constructor({ context, anchor, onRenderStart, onPageChanged, onTransitionStart, onTransitionEnd, onNavigate, onError, onRenderError, showRenderError, invisibleBehavior, }: SlideControllerOptions);
    ready: boolean;
    private resolveReady;
    readonly readyPromise: Promise<void>;
    jumpToPage(page: number, origin?: string): void;
    private initialize;
    private kickStart;
    private registerEventListeners;
    private onSyncDispatch;
    private magixEventListener;
    private syncStateOnce;
    private onStateChange;
    private pollCount;
    private pollReadyState;
    private _pageCount;
    get pageCount(): number;
    get page(): number;
    private createSlide;
    private destroyed;
    destroy(): void;
    timestamp: () => number;
    isFrozen: boolean;
    private _toFreeze;
    freeze: () => void;
    unfreeze: () => Promise<void>;
    private onVisibilityChange;
}

declare type MountSlideOptions = Omit<SlideControllerOptions, "context" | "onPageChanged"> & {
    onReady: () => void;
};
interface SlideDocsViewerConfig {
    context: AppContext<Attributes, MagixEvents, AppOptions>;
    box: ReadonlyTeleBox;
    view: View;
    mountSlideController: (options: MountSlideOptions) => SlideController;
    mountWhiteboard: (dom: HTMLDivElement) => void;
    baseScenePath: string;
    appId: string;
    urlInterrupter?: (url: string) => Promise<string>;
    onPagesReady?: (pages: DocsViewerPage[]) => void;
    onNavigate?: (index: number, origin?: string) => void;
}
declare class SlideDocsViewer {
    readonly context: AppContext<Attributes, MagixEvents, AppOptions>;
    viewer: DocsViewer;
    slideController: SlideController | null;
    protected readonly box: ReadonlyTeleBox;
    protected readonly whiteboardView: SlideDocsViewerConfig["view"];
    protected readonly mountSlideController: SlideDocsViewerConfig["mountSlideController"];
    protected readonly mountWhiteboard: SlideDocsViewerConfig["mountWhiteboard"];
    protected readonly onNavigate: (index: number, origin?: string) => void;
    private readonly baseScenePath;
    private readonly appId;
    private isViewMounted;
    constructor({ context, box, view, mountSlideController, mountWhiteboard, baseScenePath, appId, urlInterrupter, onPagesReady, onNavigate, }: SlideDocsViewerConfig);
    $slide: HTMLDivElement;
    $whiteboardView: HTMLDivElement;
    $overlay: HTMLDivElement;
    getNoteHasLink(): boolean | undefined;
    getNoteLink(): string | undefined;
    render(): void;
    protected renderOverlay(): HTMLDivElement;
    protected renderSlideContainer(): HTMLDivElement;
    protected renderWhiteboardView(): HTMLDivElement;
    mount(): this;
    protected onError: ({ error, index }: {
        error: Error;
        index: number;
    }) => void;
    protected onRenderStart: () => void;
    protected onRenderEnd: () => void;
    onPageChanged: () => void;
    private _onPageChangedTimer;
    private _onPageChanged;
    protected refreshPages: () => void;
    protected getPageIndex(page: number): number;
    unmount(): this;
    setReadonly(readonly: boolean): void;
    destroy(): void;
    toggleClickThrough(tool?: string): void;
    protected scaleDocsToFit: () => void;
    protected onPlay: () => void;
    protected onNewPageIndex: (index: number, origin?: string) => void;
    protected sideEffect: SideEffectManager;
    protected wrapClassName(className: string): string;
    protected namespace: string;
    private getWhiteSnapshot;
    private reportProgress;
    private toPdf;
}

interface PreviewParams {
    container: HTMLElement;
    taskId: string;
    url?: string;
    debug?: boolean;
    resourceList?: string[];
    box: ReadonlyTeleBox;
}
declare function previewSlide({ container, taskId, resourceList, url, debug, box, }: PreviewParams): SlidePreviewer;
declare class SlidePreviewer {
    readonly viewer: DocsViewer;
    readonly bgColor: string;
    readonly target: HTMLElement;
    slide: Slide | null;
    debug: boolean;
    $slide: HTMLDivElement;
    private previewList;
    private readonly sideEffect;
    ready: boolean;
    private resolveReady;
    readonly readyPromise: Promise<void>;
    constructor(config: {
        target: HTMLElement;
        box: ReadonlyTeleBox;
    });
    render(): void;
    /**
     * In case you have a different window -- for example, in electron.
     * Use this method to re-register hotkeys.
     *
     * @example
     * previewer.registerHotKeys(windowLike)
     */
    registerHotKeys(windowLike: Window): void;
    private hotkeyListener;
    mount(taskId: string, url: string, resourceList: string[], previewList?: string[]): void;
    protected renderStyle(): HTMLElement;
    protected registerEventListeners(): void;
    protected onPageChanged: (page: number) => void;
    protected onTransitionStart: () => void;
    protected onTransitionEnd: () => void;
    protected onError: ({ error }: {
        error: Error;
    }) => void;
    private destroyed;
    destroy(): void;
    protected refreshPages: () => void;
    protected getPageIndex(page: number): number;
    protected renderSlideContainer(): HTMLDivElement;
    protected onPlay: () => void;
    protected onNewPageIndex: (index: number) => void;
    protected wrapClassName(className: string): string;
    protected namespace: string;
}

declare const usePlugin: (plugin: any) => any;
declare const version: string;

interface AppOptions extends Pick<ISlideConfig, "rtcAudio" | "useLocalCache" | "resourceTimeout" | "loaderDelegate" | "urlInterrupter" | "navigatorDelegate" | "fixedFrameSize" | "logger" | "enableGlobalClick"> {
    /** show debug controller */
    debug?: boolean;
    /** scale */
    resolution?: number;
    /** background color for slide animations */
    bgColor?: string;
    /** minimal fps @default 25 */
    minFPS?: number;
    /** maximal fps @default 30 */
    maxFPS?: number;
    /** automatically decrease fps @default true */
    autoFPS?: boolean;
    /** whether to re-scale automatically @default true */
    autoResolution?: boolean;
    /** 0~4, default: 3 */
    maxResolutionLevel?: number;
    /** use canvas2d mode, downside: some 3d effects are lost */
    forceCanvas?: boolean;
    /** fix windows 11 nvidia rendering bug, downside: render next page slows down */
    enableNvidiaDetect?: boolean;
    /** custom error handler */
    onRenderError?: (error: Error, pageIndex: number) => void;
    /** whether to show an overlay of error message @default: true */
    showRenderError?: boolean;
    /** Specify the behavior after hiding the slide; Freeze will destroy the slide and replace it with a snapshot, while Pause simply pauses the slide @default: 'frozen' */
    invisibleBehavior?: "frozen" | "pause";
}
interface ILogger {
    info?(msg: string): void;
    error?(msg: string): void;
    warn?(msg: string): void;
}
interface AppResult {
    viewer: () => SlideDocsViewer | null;
    controller: () => SlideController | null | undefined;
    slide: () => Slide | undefined;
    position: () => [page: number, pageCount: number] | undefined;
    nextStep: () => boolean;
    prevStep: () => boolean;
    nextPage: () => boolean;
    prevPage: () => boolean;
    jumpToPage: (page: number) => boolean;
    togglePreview: (visible?: boolean) => void;
    getNoteHasLink: () => boolean;
    getNoteLink: () => string | undefined;
}
declare const SlideApp: NetlessApp<Attributes, MagixEvents, AppOptions, AppResult>;

export { type AddHooks, type AppOptions, type AppResult, type Attributes, DefaultUrl, type FreezableSlide, FreezerLength, type ILogger, type PreviewParams, SlidePreviewer, addHooks, apps, SlideApp as default, getFreezerLength, onCreated, onDestroyed, previewSlide, setFreezerLength, usePlugin, version };
