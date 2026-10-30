(() => {
  /* ====================
     상품을 가져올 활동 페이지

     새로운 활동 페이지가 생기면
     이 목록에 한 줄씩 추가하세요.
  ==================== */
const activityPages = [
  { name: "Evolution", url: "./Evolution.html" },
  { name: "Mystique", url: "./mystique.html" },
  { name: "MY YOUTH", url: "./MyYouth.html" },
  { name: "2019 빈센트 반 고흐", url: "./gogh.html" },
  { name: "NEW AGE", url: "./newage.html" },
  { name: "2020 RENT", url: "./rent.html" },
  { name: "시간여행", url: "./time.html" },
  { name: "미드나잇: 액터뮤지션", url: "./midnight.html" },
  { name: "바람", url: "./wind.html" },
  { name: "The Forestella", url: "./TheFore.html" },
  { name: "ID: PITTA", url: "./idpitta.html" },
  { name: "PARANA", url: "./parana.html" },
  { name: "숲별 1기", url: "./sb1.html" }
];

  const category = document.body.dataset.category;
  const description = document.body.dataset.description || "";
  const main = document.querySelector("main");

  if (!category || !main) return;

  /* ====================
     공통 페이지 구성
  ==================== */
  main.innerHTML = `
    <!-- 로고·사이트명 -->
    <a class="site-brand" href="./index.html#home">
      <img
        class="site-logo"
        src="https://drive.google.com/thumbnail?id=1-pbgQfZiJJAgWXwyRTvR9-FxeN2V2PbB&amp;sz=w1600"
        alt="FS LIST"
      >
      <span class="site-brand-text">굿즈리스트</span>
    </a>

    <!-- 카테고리 상품 목록 -->
    <section aria-labelledby="category-title">
      <h1 id="category-title" class="category-title"></h1>

      <p id="category-description" class="category-description"></p>

      <a class="back-link" href="./index.html#category">
        ← 카테고리로 이동하기
      </a>

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

    <!-- 제작자·도움 -->
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
  `;

  document.getElementById("category-title").textContent =
    `카테고리 → ${category}`;

  const descriptionElement = document.getElementById(
    "category-description"
  );

  descriptionElement.textContent = description;
  descriptionElement.hidden = !description;

  const container = document.getElementById("category-products");
  const message = document.getElementById("category-message");


  /* ====================
     해당 카테고리 상품 가져오기
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

    const html = await response.text();
    const doc = new DOMParser().parseFromString(
      html,
      "text/html"
    );

    const products = doc.querySelectorAll(
      ".goods-accordion[data-category]"
    );

    return [...products]
      .filter((product) => {
return product.dataset.category
  .split(",")
  .map((name) => name.trim())
  .includes(category.trim());
      })
      .map((product, productIndex) => {
        /* 상품 전체 복사 */
        const copy = document.importNode(product, true);

        /* 처음에는 모두 접어서 표시 */
        copy.removeAttribute("open");

        copy.querySelectorAll("details").forEach((details) => {
          details.removeAttribute("open");
        });

        /* 복사한 상품 사이의 id 중복 방지 */
        const prefix =
          `category-${activityIndex}-${productIndex}-`;

        const idMap = new Map();

        [copy, ...copy.querySelectorAll("[id]")].forEach((element) => {
          if (!element.id) return;

          const originalId = element.id;
          const newId = prefix + originalId;

          idMap.set(originalId, newId);
          element.id = newId;
        });

        /* id를 참조하는 속성도 함께 변경 */
        [copy, ...copy.querySelectorAll("*")].forEach((element) => {
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
        });

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

        return copy;
      });
  }


  /* ====================
     상품 목록 표시
  ==================== */
  async function loadProducts() {
    if (activityPages.length === 0) {
      message.textContent = "아직 등록된 활동 페이지가 없어요.";
      return;
    }

    const responses = await Promise.allSettled(
      activityPages.map((activity, index) => {
        return readProducts(activity, index);
      })
    );

    const products = [];
    let failedCount = 0;

    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        products.push(...response.value);
      } else {
        failedCount += 1;
      }
    });

    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    products.forEach((product, index) => {
      /* 현재 카테고리의 표시 순서대로 번호 부여 */
      const number = product.querySelector(
        ".goods-summary > .goods-number"
      );

      if (number) {
        number.textContent = index + 1;
      }

      fragment.append(product);
    });

    container.append(fragment);

    if (failedCount === activityPages.length) {
      message.textContent =
        "상품 정보를 불러오지 못했어요. 잠시 후 새로고침해 주세요.";
      return;
    }

    if (products.length === 0) {
      message.textContent = failedCount > 0
        ? `일부 활동 페이지를 불러오지 못했어요. 불러온 페이지에는 ${category} 상품이 없어요.`
        : `아직 등록된 ${category} 상품이 없어요.`;
      return;
    }

    if (failedCount > 0) {
      message.textContent =
        "일부 활동 페이지를 불러오지 못해 상품이 누락될 수 있어요.";
    } else {
      message.textContent = "";
      message.hidden = true;
    }
  }

  loadProducts();
})();