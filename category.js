(() => {
  /* ====================
     상품을 가져올 활동 페이지

     새 활동 페이지가 생기면
     이 목록에 추가하세요.
  ==================== */
  const activityPages = [
    { name: "Evolution", url: "./Evolution.html" },
    { name: "Mystique", url: "./mystique.html" },
    { name: "MY YOUTH", url: "./MyYouth.html" },
    { name: "2019 빈센트 반 고흐", url: "./gogh19.html" },
    { name: "NEW AGE", url: "./newage.html" },
    { name: "2020 RENT", url: "./rent20.html" },
    { name: "시간여행", url: "./time.html" },
    { name: "미드나잇: 액터뮤지션", url: "./midnight20.html" },
    { name: "바람", url: "./wind.html" },
    { name: "The Forestella", url: "./TheFore.html" },
    { name: "ID: PITTA", url: "./idpitta.html" },
    { name: "PARANA", url: "./parana.html" },
    { name: "숲별 1기", url: "./sb1.html" },
    { name: "21-22 The Royal", url: "./royal21.html" }
  ];

  /* ====================
     현재 페이지 설정
  ==================== */
  const category = document.body.dataset.category?.trim();
  const description = document.body.dataset.description || "";
  const main = document.querySelector("main");

  if (!category || !main) return;

  /* ====================
     공통 페이지 구성
  ==================== */
  main.innerHTML = `
    <!-- 로고·사이트명 시작 -->
    <a class="site-brand" href="./index.html#home">
      <img
        class="site-logo"
        src="https://drive.google.com/thumbnail?id=1-pbgQfZiJJAgWXwyRTvR9-FxeN2V2PbB&amp;sz=w1600"
        alt="FS LIST"
      >
      <span class="site-brand-text">굿즈리스트</span>
    </a>
    <!-- 로고·사이트명 끝 -->

    <!-- 카테고리 영역 시작 -->
    <section aria-labelledby="category-title">
      <h1 id="category-title" class="category-title"></h1>

      <p
        id="category-description"
        class="category-description"
      ></p>

      <a class="back-link" href="./index.html#list">
        ← 리스트로 돌아가기
      </a>

      <!-- 정렬순 변경 -->
      <div class="category-sort">
        <h2 class="category-sort-title">정렬순 변경</h2>

        <div
          class="category-sort-buttons"
          role="group"
          aria-label="상품 정렬"
        >
          <button
            type="button"
            data-category-sort="original"
            aria-pressed="true"
            aria-controls="category-products"
          >
            오래된순
          </button>

          <button
            type="button"
            data-category-sort="reverse"
            aria-pressed="false"
            aria-controls="category-products"
          >
            최신순
          </button>
        </div>
      </div>

      <!-- 개인 카테고리에서만 표시 -->
      <div
        id="member-filters"
        class="member-filters"
        role="group"
        aria-label="멤버별 상품 필터"
        hidden
      ></div>

      <p
        id="category-message"
        class="category-description"
        role="status"
      >
        상품을 불러오고 있어요.
      </p>

      <div
        id="category-products"
        class="category-products"
      ></div>
    </section>
    <!-- 카테고리 영역 끝 -->

    <!-- 제작자 표기 시작 -->
    <footer class="site-credit">
      제작<br>

      <a
        href="https://x.com/ing_ddo_11"
        target="_blank"
        rel="noopener noreferrer"
      >@ing_ddo_11</a>

      <hr class="credit-divider">

      도움<br>

      <a
        href="https://x.com/hhhh_7989"
        target="_blank"
        rel="noopener noreferrer"
      >@hhhh_7989</a><br>

      <a
        href="https://x.com/UrimThummim0505"
        target="_blank"
        rel="noopener noreferrer"
      >@UrimThummim0505</a><br>

      <a
        href="https://x.com/forkkeu"
        target="_blank"
        rel="noopener noreferrer"
      >@forkkeu</a>
    </footer>
    <!-- 제작자 표기 끝 -->
  `;

  document.getElementById("category-title").textContent =
    `카테고리 → ${category}`;

  const descriptionElement = document.getElementById(
    "category-description"
  );

  descriptionElement.textContent = description;
  descriptionElement.hidden = !description.trim();

  const container = document.getElementById("category-products");
  const message = document.getElementById("category-message");
  const memberBox = document.getElementById("member-filters");

  const sortButtons = main.querySelectorAll(
    "[data-category-sort]"
  );

  /* ====================
     정렬·필터 상태
  ==================== */
  const selectedMembers = new Set();

  let productCards = [];
  let failedActivities = [];
  let categorySort = "original";
  let loaded = false;

  /* ====================
     정렬·멤버 필터·번호 통합 처리
  ==================== */
  function renderProducts() {
    if (!loaded) return;

    const orderedCards = categorySort === "reverse"
      ? [...productCards].reverse()
      : productCards;

    const fragment = document.createDocumentFragment();

    let visibleCount = 0;

    orderedCards.forEach((card) => {
      const members = (card.dataset.members || "")
        .split(/[,，\s]+/)
        .filter(Boolean);

      const matches =
        selectedMembers.size === 0 ||
        members.some((name) => selectedMembers.has(name));

      card.hidden = !matches;

      if (matches) {
        visibleCount += 1;

        const number = card.querySelector(
          ".goods-summary > .goods-number"
        );

        if (number) {
          number.textContent = visibleCount;
        }
      }

      /*
        기존 상품 요소를 이동하므로
        펼침 상태와 연결된 버튼을 유지합니다.
      */
      fragment.append(card);
    });

    container.replaceChildren(fragment);

    /* 안내 문구 */
    const messages = [];

    if (activityPages.length === 0) {
      messages.push("아직 등록된 활동 페이지가 없어요.");
    } else if (
      failedActivities.length === activityPages.length
    ) {
      messages.push(
        "상품 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요."
      );
    } else {
      if (visibleCount === 0) {
        messages.push(
          selectedMembers.size > 0
            ? "선택한 멤버의 상품이 없어요."
            : `아직 등록된 ${category} 상품이 없어요.`
        );
      }

      if (failedActivities.length > 0) {
        messages.push(
          "일부 활동을 불러오지 못해 상품이 누락될 수 있어요. " +
          `(${failedActivities.join(", ")})`
        );
      }
    }

    message.textContent = messages.join(" ");
    message.hidden = messages.length === 0;

    /* personal.js가 연결되어 있으면 상품 버튼 추가 */
    window.GoodsPersonal?.enhanceProducts?.();
  }

  /* ====================
     정렬 버튼
  ==================== */
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      categorySort = button.dataset.categorySort;

      sortButtons.forEach((item) => {
        item.setAttribute(
          "aria-pressed",
          String(item === button)
        );
      });

      renderProducts();
    });
  });

  /* ====================
     개인 카테고리의 멤버 필터
  ==================== */
  if (category === "개인") {
    memberBox.hidden = false;

    ["두훈", "형호", "민규", "우림"].forEach((name) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "member-filter-button";
      button.dataset.member = name;   
      button.textContent = name;

      button.setAttribute("aria-pressed", "false");
      button.setAttribute(
        "aria-controls",
        "category-products"
      );

      button.addEventListener("click", () => {
        if (selectedMembers.has(name)) {
          selectedMembers.delete(name);
        } else {
          selectedMembers.add(name);
        }

        button.setAttribute(
          "aria-pressed",
          String(selectedMembers.has(name))
        );

        renderProducts();
      });

      memberBox.append(button);
    });
  }

  /* ====================
     원래 상품의 북마크·메모 정보

     personal.js와 같은 저장 키 사용
  ==================== */
  function createPersonalMeta(
    product,
    originalIndex,
    idCounts,
    pageUrl
  ) {
    const uniqueId =
      product.id &&
      idCounts.get(product.id) === 1;

    const identity = uniqueId
      ? product.id
      : `product-${originalIndex + 1}`;

    const originalUrl = new URL(pageUrl.href);

    originalUrl.search = "";
    originalUrl.hash = "";

    const key = `${originalUrl.pathname}#${identity}`;

    originalUrl.searchParams.set(
      "product",
      originalIndex + 1
    );

    if (uniqueId) {
      originalUrl.hash = product.id;
    }

    /* 제목의 줄바꿈을 공백으로 변환 */
    const title = product.querySelector(
      ".goods-summary .goods-name"
    )?.cloneNode(true);

    title?.querySelectorAll("br").forEach((br) => {
      br.replaceWith(" ");
    });

    const name = (
      title?.textContent ||
      product.dataset.name ||
      "상품"
    ).replace(/\s+/g, " ").trim();

    const imageSrc = product.querySelector(".product-image")
      ?.getAttribute("src")
      ?.trim();

    return {
      key,
      name,
      category: product.dataset.category || "",
      image: imageSrc
        ? new URL(imageSrc, pageUrl.href).href
        : "",
      url: originalUrl.href
    };
  }

  /* ====================
     복사한 상품의 id·주소 정리
  ==================== */
  function prepareCopy(copy, pageUrl, prefix) {
    /* 처음에는 상품과 포토카드 모두 접기 */
    copy.removeAttribute("open");
    copy.removeAttribute("hidden");

    copy.querySelectorAll("details").forEach((details) => {
      details.removeAttribute("open");
    });

    /* 여러 활동 사이의 id 중복 방지 */
    const idMap = new Map();

    [copy, ...copy.querySelectorAll("[id]")].forEach(
      (element) => {
        if (!element.id) return;

        const oldId = element.id;

        element.id = prefix + oldId;
        idMap.set(oldId, element.id);
      }
    );

    /* id를 참조하는 속성도 함께 변경 */
    [copy, ...copy.querySelectorAll("*")].forEach(
      (element) => {
        [
          "aria-labelledby",
          "aria-describedby",
          "aria-controls",
          "for"
        ].forEach((attribute) => {
          const value = element.getAttribute(attribute);

          if (!value) return;

          element.setAttribute(
            attribute,
            value
              .split(/\s+/)
              .map((id) => idMap.get(id) || id)
              .join(" ")
          );
        });
      }
    );

    /* 이미지 상대 주소 보정 */
    copy.querySelectorAll("img[src]").forEach((image) => {
      const src = image.getAttribute("src")?.trim();

      if (src) {
        image.src = new URL(src, pageUrl.href).href;
      }
    });

    /* 상품 내부 링크 상대 주소 보정 */
    copy.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href")?.trim();

      if (!href) return;

      if (
        href.startsWith("#") &&
        idMap.has(href.slice(1))
      ) {
        link.setAttribute(
          "href",
          `#${idMap.get(href.slice(1))}`
        );
      } else {
        link.href = new URL(href, pageUrl.href).href;
      }
    });
  }

  /* ====================
     활동 페이지에서 상품 가져오기
  ==================== */
  async function readProducts(activity, activityIndex) {
    const pageUrl = new URL(activity.url, location.href);

    const response = await fetch(pageUrl.href, {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(
        `${activity.name} 페이지를 불러오지 못했습니다.`
      );
    }

    const doc = new DOMParser().parseFromString(
      await response.text(),
      "text/html"
    );

    const products = [
      ...doc.querySelectorAll(
        ".goods-accordion[data-category]"
      )
    ];

    /* 상품 id별 사용 횟수를 한 번만 계산 */
    const idCounts = new Map();

    products.forEach((product) => {
      if (!product.id) return;

      idCounts.set(
        product.id,
        (idCounts.get(product.id) || 0) + 1
      );
    });

    return products.flatMap((product, originalIndex) => {
      /* MD, 개인처럼 여러 카테고리 지원 */
      const categories = product.dataset.category
        .split(/[,，]/)
        .map((name) => name.trim());

      if (!categories.includes(category)) {
        return [];
      }

      const copy = document.importNode(product, true);

      /* id를 변경하기 전에 원본 저장 정보 기록 */
      copy.dataset.personalMeta = JSON.stringify(
        createPersonalMeta(
          product,
          originalIndex,
          idCounts,
          pageUrl
        )
      );

      /*
        상품에 적힌 멤버를 우선 사용.
        없으면 활동 페이지 body의 멤버 설정 사용.
      */
      copy.dataset.members =
        product.dataset.members ??
        doc.body.dataset.members ??
        "";

      prepareCopy(
        copy,
        pageUrl,
        `category-${activityIndex}-${originalIndex}-`
      );

      return [copy];
    });
  }

  /* ====================
     전체 활동 불러오기
  ==================== */
  async function loadProducts() {
    const responses = await Promise.allSettled(
      activityPages.map(readProducts)
    );

    productCards = [];
    failedActivities = [];

    responses.forEach((response, index) => {
      if (response.status === "fulfilled") {
        productCards.push(...response.value);
      } else {
        failedActivities.push(activityPages[index].name);
      }
    });

    loaded = true;
    renderProducts();
  }

  loadProducts();
})();