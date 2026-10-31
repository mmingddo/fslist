(() => {
  /* ====================
     북마크·메모 저장 설정
  ==================== */
  const storageKey = "goodslist-personal-v1";

  const icons = {
    memo: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 5 4 4"></path>
        <path d="M4 15 16 3a2.8 2.8 0 0 1 4 4L8 19l-5 2Z"></path>
      </svg>
    `,
    bookmark: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h12v18l-6-4-6 4Z"></path>
      </svg>
    `,
    trash: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h18M9 6V3h6v3"></path>
        <path d="M5 6l1 15h12l1-15M10 10v7M14 10v7"></path>
      </svg>
    `
  };

  /* ====================
     버튼·메모창 디자인
  ==================== */
  const style = document.createElement("style");

  style.textContent = `
    .personal-info {
      display: flex;
      flex-direction: column;
      align-self: stretch;
      min-width: 0;
    }

    .personal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }

    .personal-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 38px;
      height: 38px;
      padding: 0;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #fff;
      color: #555;
      cursor: pointer;
    }

    .personal-icon-button svg {
      width: 21px;
      height: 21px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .personal-bookmark[aria-pressed="true"],
    .personal-memo.has-memo {
      border-color: #3662ae;
      color: #3662ae;
    }

    .personal-bookmark[aria-pressed="true"] svg {
      fill: #3662ae;
    }

    .personal-icon-button:focus-visible,
    .personal-dialog button:focus-visible,
    .personal-dialog textarea:focus-visible {
      outline: 2px solid #3662ae;
      outline-offset: 3px;
    }

    .personal-dialog {
      box-sizing: border-box;
      width: min(440px, calc(100% - 32px));
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 16px;
      background: #fff;
      color: #333;
      font-family: inherit;
    }

    .personal-dialog::backdrop {
      background: rgb(0 0 0 / 35%);
    }

    .personal-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .personal-dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }

    .personal-dialog-product {
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }

    .personal-dialog label {
      font-size: 12px;
    }

    .personal-dialog textarea {
      box-sizing: border-box;
      width: 100%;
      margin-top: 8px;
      padding: 10px;
      border: 1px solid #aaa;
      border-radius: 8px;
      font: inherit;
      font-size: 14px;
      resize: vertical;
    }

    .personal-dialog-count {
      margin: 6px 0 16px;
      color: #555;
      font-size: 12px;
      text-align: right;
    }

    .personal-dialog-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .personal-dialog-buttons button {
      min-width: 80px;
      min-height: 38px;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #fff;
      color: #333;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }

    .personal-dialog-buttons .personal-save {
      border-color: #3662ae;
      background: #3662ae;
      color: #fff;
    }

    .personal-delete:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `;

  document.head.append(style);

  /* ====================
     저장된 정보 읽기·쓰기
  ==================== */
  function readSaved() {
    try {
      const value = JSON.parse(
        localStorage.getItem(storageKey) || "{}"
      );

      return value && typeof value === "object" &&
        !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function updateSaved(product, changes) {
    const saved = readSaved();

    const updated = {
      ...saved[product.key],
      ...product,
      ...changes,
      updatedAt: Date.now()
    };

    /* 북마크와 메모가 모두 없으면 저장 목록에서 제거 */
    if (!updated.bookmarked && !updated.note) {
      delete saved[product.key];
    } else {
      saved[product.key] = updated;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(saved)
      );
    } catch {
      alert("저장하지 못했어요. 브라우저의 저장 설정을 확인해 주세요.");
      return false;
    }

    document.dispatchEvent(
      new CustomEvent("personal-data-changed")
    );

    return true;
  }

  /* ====================
     상품별 저장 정보 만들기
  ==================== */
  function getProduct(card, index, cards) {
    /* 카테고리에서 전달한 원본 상품 정보가 있으면 사용 */
    if (card.dataset.personalMeta) {
      try {
        return JSON.parse(card.dataset.personalMeta);
      } catch {}
    }

    const url = new URL(location.href);
    url.search = "";
    url.hash = "";

    const uniqueId = card.id &&
      cards.filter((item) => item.id === card.id).length === 1;

    const identity = uniqueId
      ? card.id
      : `product-${index + 1}`;

    const key = `${url.pathname}#${identity}`;

    url.searchParams.set("product", index + 1);

    if (uniqueId) {
      url.hash = card.id;
    }

    const title = card.querySelector(
      ".goods-summary .goods-name"
    );

    const image = card.querySelector(".product-image");
    const imageSrc = image?.getAttribute("src")?.trim();

    return {
      key,
      name: (
        title?.innerText ||
        title?.textContent ||
        card.dataset.name ||
        "상품"
      ).replace(/\s+/g, " ").trim(),
      category: card.dataset.category || "",
      image: imageSrc
        ? new URL(imageSrc, location.href).href
        : "",
      url: url.href
    };
  }

  /* ====================
     메모 입력창
  ==================== */
  let dialog = null;
  let editingProduct = null;

  function createDialog() {
    if (dialog) return;

    dialog = document.createElement("dialog");
    dialog.className = "personal-dialog";
    dialog.setAttribute(
      "aria-labelledby",
      "personal-dialog-title"
    );

    dialog.innerHTML = `
      <form>
        <div class="personal-dialog-header">
          <h2 id="personal-dialog-title">상품 메모</h2>

          <button
            class="personal-icon-button personal-delete"
            type="button"
            aria-label="메모 삭제"
          >
            ${icons.trash}
          </button>
        </div>

        <p class="personal-dialog-product"></p>

        <label for="personal-note">
          메모 · 최대 100자
        </label>

        <textarea
          id="personal-note"
          maxlength="100"
          rows="5"
        ></textarea>

        <p class="personal-dialog-count" aria-live="polite">
          0 / 100
        </p>

        <div class="personal-dialog-buttons">
          <button type="button" class="personal-cancel">
            취소
          </button>

          <button type="submit" class="personal-save">
            저장
          </button>
        </div>
      </form>
    `;

    document.body.append(dialog);

    const textarea = dialog.querySelector("textarea");
    const counter = dialog.querySelector(
      ".personal-dialog-count"
    );

    textarea.addEventListener("input", () => {
      counter.textContent = `${textarea.value.length} / 100`;
    });

    dialog.querySelector(".personal-cancel").onclick = () => {
      dialog.close();
    };

    dialog.querySelector("form").onsubmit = (event) => {
      event.preventDefault();

      const success = updateSaved(editingProduct, {
        note: textarea.value.slice(0, 100).trim()
      });

      if (success) {
        dialog.close();
      }
    };

    dialog.querySelector(".personal-delete").onclick = () => {
      if (updateSaved(editingProduct, { note: "" })) {
        dialog.close();
      }
    };
  }

  function openMemo(product) {
    createDialog();

    editingProduct = product;

    const note = readSaved()[product.key]?.note || "";

    dialog.querySelector(".personal-dialog-product")
      .textContent = product.name;

    dialog.querySelector("textarea").value = note;

    dialog.querySelector(".personal-dialog-count")
      .textContent = `${note.length} / 100`;

    dialog.querySelector(".personal-delete")
      .disabled = !note;

    dialog.showModal();
    dialog.querySelector("textarea").focus();
  }

  /* ====================
     メモ·북마크 버튼 만들기
  ==================== */
  function createButtons(product) {
    const actions = document.createElement("div");
    actions.className = "personal-actions";
    actions.dataset.productKey = product.key;

    const memo = document.createElement("button");
    memo.type = "button";
    memo.className = "personal-icon-button personal-memo";
    memo.innerHTML = icons.memo;
    memo.title = "메모";
    memo.setAttribute("aria-label", `${product.name} 메모`);

    memo.onclick = () => {
      openMemo(product);
    };

    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className =
      "personal-icon-button personal-bookmark";
    bookmark.innerHTML = icons.bookmark;
    bookmark.title = "북마크";
    bookmark.setAttribute(
      "aria-label",
      `${product.name} 북마크`
    );

    bookmark.onclick = () => {
      const current = readSaved()[product.key];

      updateSaved(product, {
        bookmarked: !current?.bookmarked
      });
    };

    /* 왼쪽 메모 / 오른쪽 북마크 */
    actions.append(memo, bookmark);

    return actions;
  }

  function refreshButtons() {
    const saved = readSaved();

    document.querySelectorAll(
      ".personal-actions"
    ).forEach((actions) => {
      const item = saved[actions.dataset.productKey];

      actions.querySelector(".personal-bookmark")
        ?.setAttribute(
          "aria-pressed",
          String(Boolean(item?.bookmarked))
        );

      actions.querySelector(".personal-memo")
        ?.classList.toggle("has-memo", Boolean(item?.note));
    });
  }

  /* ====================
     상품에 버튼 연결
  ==================== */
  function enhanceProducts() {
    const cards = [
      ...document.querySelectorAll(
        ".goods-accordion[data-category]"
      )
    ];

    cards.forEach((card, index) => {
      if (card.querySelector(".personal-actions")) return;

      const header = card.querySelector(".product-header");

      if (!header) return;

      let info = header.querySelector(".product-description");

      if (!info) {
        info = document.createElement("div");
        info.className = "product-description";
        header.append(info);
      }

      info.classList.add("personal-info");

      const product = getProduct(card, index, cards);
      info.append(createButtons(product));
    });

    refreshButtons();
  }

  /* 다음에 만들 마이페이지에서도 함께 사용할 기능 */
  window.GoodsPersonal = {
    readSaved,
    updateSaved,
    openMemo,
    createButtons,
    refreshButtons,
    enhanceProducts
  };

  document.addEventListener(
    "personal-data-changed",
    refreshButtons
  );

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      document.dispatchEvent(
        new CustomEvent("personal-data-changed")
      );
    }
  });

  function start() {
    enhanceProducts();

    /* 나중에 불러온 카테고리 상품에도 버튼 연결 */
    const main = document.querySelector("main");

    if (!main) return;

    const observer = new MutationObserver((changes) => {
      const addedProduct = changes.some((change) => {
        return [...change.addedNodes].some((node) => {
          return node.nodeType === 1 && (
            node.matches(".goods-accordion") ||
            node.querySelector(".goods-accordion")
          );
        });
      });

      if (addedProduct) {
        enhanceProducts();
      }
    });

    observer.observe(main, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();