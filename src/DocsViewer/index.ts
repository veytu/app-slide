// import { sidebarSVG } from "./icons/sidebar";
import { arrowLeftSVG } from "./icons/arrow-left";
import { arrowRightSVG } from "./icons/arrow-right";
// import { playSVG } from "./icons/play";
// import { pauseSVG } from "./icons/pause";

import type { ILazyLoadInstance } from "vanilla-lazyload";
import LazyLoad from "vanilla-lazyload";
import { SideEffectManager } from "side-effect-manager";
import { type AppContext, type ReadonlyTeleBox } from "@netless/window-manager";
import type { Attributes, MagixEvents } from "../typings";
import type { AppOptions } from "..";
import type { Paragraph } from "./utils/convertToHTML";
import { convertToHTML } from "./utils/convertToHTML";
import { isAndroid, isIOS } from "./utils/environment";

export interface DocsViewerPage {
  src: string;
  height: number;
  width: number;
  thumbnail?: string;
}

export interface DocsViewerConfig {
  readonly: boolean;
  box: ReadonlyTeleBox;
  onNewPageIndex: (index: number, origin?: string) => void;
  onPlay?: () => void;
  urlInterrupter?: (url: string) => Promise<string>;
  onPagesReady?: (pages: DocsViewerPage[]) => void;
  context?: AppContext<Attributes, MagixEvents, AppOptions>;
}

export type NotesType = Record<string, Paragraph[]>;

export class DocsViewer {
  public constructor({
    readonly,
    onNewPageIndex,
    onPlay,
    onPagesReady,
    urlInterrupter,
    box,
    context,
  }: DocsViewerConfig) {
    this.readonly = readonly;
    this.onNewPageIndex = onNewPageIndex;
    this.onPlay = onPlay;
    this.onPagesReady = onPagesReady;
    this.urlInterrupter = urlInterrupter || (url => url);
    this.box = box;
    this.context = context;
    this.appReadonly = context?.getIsAppReadonly();
    this.render();
  }

  protected readonly: boolean;
  protected appReadonly?: boolean;
  protected box: ReadonlyTeleBox;
  protected onNewPageIndex: (index: number, origin?: string) => void;
  protected onPlay?: () => void;
  protected onPagesReady?: (pages: DocsViewerPage[]) => void;
  protected urlInterrupter: (url: string) => Promise<string> | string;

  private _pages: DocsViewerPage[] = [];

  public set pages(value: DocsViewerPage[]) {
    this._pages = value;
    this.refreshPreview();//.then(this.refreshBtnSidebar.bind(this));
    this.refreshTotalPage();
    if (this.onPagesReady) {
      this.onPagesReady(value);
    }
    this.loading(false);
  }

  public get pages() {
    return this._pages;
  }

  public $content!: HTMLElement;
  public $preview!: HTMLElement;
  public $previewMask!: HTMLElement;
  public $footer!: HTMLElement;
  public $pageNumberInput!: HTMLElement;
  public $totalPage!: HTMLSpanElement;
  public $btnPlay!: HTMLButtonElement;
  public $btnSidebar!: HTMLButtonElement;
  private $btnPageNext!: HTMLElement;
  private $btnPageBack!: HTMLElement;
  private $loading!: HTMLElement;

  private notes?: NotesType;
  private noteVisible = false;

  readonly context?: AppContext<Attributes, MagixEvents, AppOptions>;

  public pageIndex = 0;

  public unmount(): void {
    this.$content.remove();
    this.$footer.remove();
  }

  public setReadonly(readonly: boolean): void {
    this.readonly = readonly;
    this.$content.classList.toggle(this.wrapClassName("readonly"), readonly);
    this.$footer.classList.toggle(this.wrapClassName("readonly"), readonly);
    // this.$pageNumberInput.disabled = readonly;
  }

  public setAppReadonly(readonly: boolean): void {
    this.appReadonly = readonly;
    this.note$?.classList.toggle(this.wrapClassName("note-hide"), readonly);
  }

  public destroy(): void {
    this.previewLazyLoad?.destroy();
    this.sideEffect.flushAll();
    this.unmount();
  }

  public setPageIndex(pageIndex: number): void {
    if (!Number.isNaN(pageIndex)) {
      this.scrollPreview(pageIndex);
      this.pageIndex = pageIndex;
      this.$pageNumberInput.textContent = String(pageIndex + 1);
      this.$btnPageBack.classList.toggle(this.wrapClassName("footer-btn-disable"), pageIndex == 0);
      this.$btnPageNext.classList.toggle(
        this.wrapClassName("footer-btn-disable"),
        pageIndex == this.pages.length - 1
      );

      this.renderNoteContent();
    }
  }

  private scrollPreview(pageIndex: number) {
    const previews = this.$preview?.querySelectorAll<HTMLElement>(
      "." + this.wrapClassName("preview-page")
    );

    previews?.forEach((node, i) => {
      node
        .querySelector("img")
        ?.classList.toggle(this.wrapClassName("active"), Number(pageIndex) == i);
    });
    if (!previews) return;
    const imgNode = Array.prototype.slice
      .call(previews)
      .find(node => node.querySelector("img").className.includes(this.wrapClassName("active")));
    if (!imgNode) {
      return;
    }
    const parentRect = this.$preview.getBoundingClientRect();
    const elementRect = imgNode?.getBoundingClientRect();
    const isInView = elementRect.top >= parentRect.top && elementRect.bottom <= parentRect.bottom;

    if (!isInView) {
      this.$preview.scrollTo({
        top: imgNode.offsetTop - 16,
        behavior: this.isShowPreview ? "smooth" : "auto",
      });
    }
  }

  public refreshTotalPage(): void {
    if (this.pages.length) {
      this.$totalPage.textContent = " / " + this.pages.length;
    } else {
      this.$totalPage.textContent = "";
    }
  }

  public setSmallBox(isSmallBox: boolean): void {
    if (this.isSmallBox !== isSmallBox) {
      this.isSmallBox = isSmallBox;
      this.$footer.classList.toggle(this.wrapClassName("float-footer"), isSmallBox);
    }
  }

  public render(): HTMLElement {
    this.renderContent();
    this.renderFooter();
    this.loading(true);
    return this.$content;
  }

  public loading(active: boolean) {
    if (active) {
      this.$loading = document.createElement("div");
      this.$loading.className = this.wrapClassName("loading");
      const loader = document.createElement("div");
      loader.className = this.wrapClassName("loader");
      this.$loading.appendChild(loader);
      this.$content.appendChild(this.$loading);
      setTimeout(() => {
        this.$loading.remove();
      }, 20000);
    } else {
      this.$loading.remove();
    }
  }

  protected renderContent(): HTMLElement {
    if (!this.$content) {
      const $content = document.createElement("div");
      $content.className = this.wrapClassName("content");
      this.$content = $content;

      if (this.readonly) {
        $content.classList.add(this.wrapClassName("readonly"));
      }

      // $content.appendChild(this.renderPreviewMask());
      // $content.appendChild(this.renderPreview());
      this.renderNote();
    }
    return this.$content;
  }

  private previewLazyLoad?: ILazyLoadInstance;

  private note$?: HTMLDivElement;

  private noteHasLink?: boolean;
  private noteLink?: string;

  public getNoteHasLink() {
    return this.noteHasLink;
  }

  public getNoteLink() {
    return this.noteLink;
  }
  protected renderNote(): HTMLDivElement | undefined {
    if (this.readonly) {
      return;
    }

    if (this.appReadonly) {
      return;
    }

    if (isIOS() || isAndroid()) return;

    const note$ = document.createElement("div");

    note$.className = this.wrapClassName("note") + " tele-fancy-scrollbar";

    this.note$ = note$;
    if (this.context?.storage.state.note) {
      fetch(this.context?.storage.state.note)
        .then(data => data.json())
        .then(res => {
          this.notes = res;
          this.renderNoteContent();
        });
    }

    this.sideEffect.addEventListener(note$, "click", ev => {
      if (this.readonly) {
        return;
      }
      const target = ev.target as HTMLElement;
      if (target.tagName.toLocaleLowerCase() == "a") {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        const link = target as HTMLAnchorElement;
        const href = link.href;
        this.context?.dispatchAppEvent("open-note-link", href);
      }
    });

    return note$;
  }

  public toggleNoteVisible(visible: boolean) {
    this.noteVisible = visible;
    if (visible) {
      if (!this.note$) return;
      this.$content?.appendChild(this.note$);
    } else {
      this.note$?.remove();
    }
  }

  public getNoteVisible() {
    return this.noteVisible;
  }

  public getNotes() {
    return this.notes;
  }

  protected renderNoteContent(): void {
    if (this.readonly) {
      this.noteHasLink = false;
      this.noteLink = undefined;
      return;
    }
    const noteContent$ = document.createElement("div");

    noteContent$.className = this.wrapClassName("note-content");

    const notes = this.notes?.[this.pageIndex + 1];

    this.note$?.classList.toggle(this.wrapClassName("note-hide"), !notes);
    this.context?.dispatchAppEvent("toggleNoteVisible", !!notes);
    if (!notes) return;

    const { html, hasLink, link } = convertToHTML(notes);

    noteContent$.innerHTML = html;
    this.noteHasLink = hasLink;
    this.noteLink = link;

    this.context?.dispatchAppEvent("noteHasLink", { hasLink, link });

    if (this.note$?.firstElementChild) {
      this.note$?.replaceChild(noteContent$, this.note$.firstElementChild);
    } else {
      this.note$?.appendChild(noteContent$);
    }
  }

  protected renderPreview(): HTMLElement {
    if (!this.$preview) {
      const $preview = document.createElement("div");
      $preview.className = this.wrapClassName("preview") + " tele-fancy-scrollbar";
      this.$preview = $preview;

      this.refreshPreview();

      this.sideEffect.addEventListener($preview, "click", ev => {
        if (this.readonly) {
          return;
        }
        const pageIndex = (ev.target as HTMLElement).dataset?.pageIndex;
        if (pageIndex) {
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          this.onNewPageIndex(Number(pageIndex), "preview");
          // this.togglePreview(false);
        }
      });
    }

    return this.$preview;
  }

  private async refreshPreview() {
    const { $preview } = this;
    const pageClassName = this.wrapClassName("preview-page");
    const pageNameClassName = this.wrapClassName("preview-page-name");
    if (!$preview) return;
    while ($preview.firstChild) {
      $preview.firstChild.remove();
    }

    const previewSRCs: Record<number, Promise<string> | string> = [];
    for (let i = 0, len = this.pages.length; i < len; i++) {
      const page = this.pages[i];
      const src = page.thumbnail ?? (page.src.startsWith("ppt") ? void 0 : page.src);
      if (src) {
        previewSRCs[i] = this.urlInterrupter(src);
      }
    }
    // Promise.all(), but no closure
    for (let i = 0, len = this.pages.length; i < len; i++) {
      previewSRCs[i] = await previewSRCs[i];
    }

    this.pages.forEach((page, i) => {
      const previewSRC = previewSRCs[i] as string | undefined;
      if (!previewSRC) {
        return;
      }

      const pageIndex = String(i);

      const $page = document.createElement("a");
      $page.className = pageClassName + " " + this.wrapClassName(`preview-page-${i}`);
      $page.setAttribute("href", "#");
      $page.dataset.pageIndex = pageIndex;

      const $name = document.createElement("span");
      $name.className = pageNameClassName;
      $name.textContent = String(i + 1);
      $name.dataset.pageIndex = pageIndex;

      const $img = document.createElement("img");
      $img.width = page.width;
      $img.height = page.height;
      if (i < 10) {
        $img.src = previewSRC;
      } else {
        $img.dataset.src = previewSRC;
      }
      $img.dataset.pageIndex = pageIndex;
      $img.classList.toggle(this.wrapClassName("active"), this.pageIndex == i);

      $page.appendChild($name);
      $page.appendChild($img);
      $preview.appendChild($page);
    });

    this.previewLazyLoad?.update();
  }

  protected renderPreviewMask(): HTMLElement {
    if (!this.$previewMask) {
      this.$previewMask = document.createElement("div");
      this.$previewMask.className = this.wrapClassName("preview-mask");
      this.sideEffect.addEventListener(this.$previewMask, "click", ev => {
        if (this.readonly) {
          return;
        }
        if (ev.target === this.$previewMask) {
          this.togglePreview(false);
        }
      });
    }
    return this.$previewMask;
  }

  public setPaused = () => {
    this.$btnPlay.classList.toggle(this.wrapClassName("footer-btn-playing"), false);
  };

  public setPlaying = () => {
    this.$btnPlay.classList.toggle(this.wrapClassName("footer-btn-playing"), true);
  };

  public refreshBtnSidebar() {
    this.$btnSidebar.style.display = this.pages.length > 0 ? "" : "none";
  }

  protected renderFooter(): HTMLElement {
    if (!this.$footer) {
      const $footer = document.createElement("div");
      $footer.className = this.wrapClassName("footer");
      this.$footer = $footer;

      if (this.readonly) {
        $footer.classList.add(this.wrapClassName("readonly"));
      }

      if (this.isSmallBox) {
        $footer.classList.add(this.wrapClassName("float-footer"));
      }

      const $btnSidebar = this.renderFooterBtn("btn-sidebar", sidebarSVG(this.namespace));
      this.sideEffect.addEventListener($btnSidebar, "click", () => {
        if (this.readonly) {
          return;
        }
        this.togglePreview();
      });
      this.$btnSidebar = $btnSidebar;
      this.$btnSidebar.style.display = "none";
      this.$footer.appendChild($btnSidebar);

      const $pageJumps = document.createElement("div");
      $pageJumps.className = this.wrapClassName("page-jumps");

      const $btnPageBack = this.renderFooterBtn("btn-page-back", arrowLeftSVG(this.namespace));
      this.sideEffect.addEventListener($btnPageBack, "click", () => {
        if (this.readonly) {
          return;
        }
	//埋点统计使用
        this.context?.dispatchAppEvent("pageBtnClick");
        this.onNewPageIndex(this.pageIndex - 1, "navigation");
      });
      $pageJumps.appendChild($btnPageBack);

      // if (this.onPlay) {
      //   const $btnPlay = this.renderFooterBtn(
      //     "btn-page-play",
      //     playSVG(this.namespace),
      //     pauseSVG(this.namespace)
      //   );
      //   this.$btnPlay = $btnPlay;
      //   this.sideEffect.addEventListener($btnPlay, "click", () => {
      //     if (this.readonly) {
      //       return;
      //     }
      //     this.setPlaying();
      //     if (this.onPlay) {
      //       this.onPlay();
      //     }
      //   });

      //   $pageJumps.appendChild($btnPlay);
      // }

      // const $btnPageNext = this.renderFooterBtn("btn-page-next", arrowRightSVG(this.namespace));
      // this.sideEffect.addEventListener($btnPageNext, "click", () => {
      //   if (this.readonly) {
      //     return;
      //   }
      //   this.onNewPageIndex(this.pageIndex + 1, "navigation");
      // });
      // $pageJumps.appendChild($btnPageNext);
      
      this.$btnPageBack = $btnPageBack;
      const $pageNumber = document.createElement("div");
      $pageNumber.className = this.wrapClassName("page-number");

      const $pageNumberInput = document.createElement("span");
      $pageNumberInput.className = this.wrapClassName("page-number-input");
      $pageNumberInput.textContent = String(this.pageIndex + 1);

      this.$pageNumberInput = $pageNumberInput;

      // this.sideEffect.addEventListener($pageNumberInput, "focus", () => {
      //   $pageNumberInput.select();
      // });
      // this.sideEffect.addEventListener($pageNumberInput, "change", () => {
      //   if (this.readonly) {
      //     return;
      //   }
      //   if ($pageNumberInput.value) {
      //     this.onNewPageIndex(Number($pageNumberInput.value) - 1, "input");
      //   }
      // });

      const $totalPage = document.createElement("span");
      this.$totalPage = $totalPage;

      $pageNumber.appendChild($pageNumberInput);
      $pageNumber.appendChild($totalPage);

      $pageJumps.appendChild($pageNumber);

      const $btnPageNext = this.renderFooterBtn("btn-page-next", arrowRightSVG(this.namespace));
      this.sideEffect.addEventListener($btnPageNext, "click", () => {
        if (this.readonly) {
          return;
        }
        // this.setPlaying();
        if (this.onPlay) {
          this.onPlay();
        } else {
          this.onNewPageIndex(this.pageIndex + 1, "navigation");
        }
        this.context?.dispatchAppEvent("pageBtnClick");
      });
      $pageJumps.appendChild($btnPageNext);
      this.$btnPageNext = $btnPageNext;
      if (!isIOS() && !isAndroid()) {
        this.$footer.appendChild($pageJumps);
      }
      this.box.events.on("maximized", max => {
        this.$footer.classList.toggle(this.wrapClassName("hide"), max);
      });
    }
    return this.$footer;
  }

  protected renderFooterBtn(
    className: string,
    $icon: SVGElement,
    $iconActive?: SVGElement
  ): HTMLButtonElement {
    const $btn = document.createElement("button");
    $btn.className = this.wrapClassName("footer-btn") + " " + this.wrapClassName(className);

    $btn.appendChild($icon);

    if ($iconActive) {
      $btn.appendChild($iconActive);
    }

    return $btn;
  }

  public togglePreview(isShowPreview?: boolean): void {
    this.isShowPreview = isShowPreview ?? !this.isShowPreview;
    this.$content.classList.toggle(this.wrapClassName("preview-active"), this.isShowPreview);

    if (this.isShowPreview) {
      this.context?.extendWrapper?.appendChild(this.renderPreviewMask());
      this.context?.extendWrapper?.appendChild(this.renderPreview());
      if (this.context?.extendWrapper) {
        this.context.extendWrapper.style.display = "block";
      }
      setTimeout(() => {
        const $previewPage = this.$preview.querySelector<HTMLElement>(
          "." + this.wrapClassName(`preview-page-${this.pageIndex}`)
        );
        if ($previewPage) {
          this.previewLazyLoad ||= new LazyLoad({
            container: this.$preview,
            elements_selector: `.${this.wrapClassName("preview-page>img")}`,
          });
          this.$preview.scrollTo({
            top: $previewPage.offsetTop - 16,
          });
        }
      });
    } else {
      if (this.context?.extendWrapper) {
        this.context.extendWrapper.style.display = "none";
        this.context.extendWrapper.innerHTML = "";
      }
    }
  }

  protected wrapClassName(className: string): string {
    return `${this.namespace}-${className}`;
  }

  protected namespace = "netless-app-slide";

  protected isShowPreview = false;

  protected isSmallBox = false;

  protected sideEffect = new SideEffectManager();
}
