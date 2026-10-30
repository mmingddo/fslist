(() => {
  /* ====================
     포토카드를 가져올 활동 페이지
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
    { name: "숲별 1기", url: "./sb1.html" },
    { name: "21-22 The Royal", url: "./royal21.html" }
  ];

  const validTypes = ["personal", "unit", "group"];

  const container = document.getElementById("pc-products");
  const message = document.getElementById("pc-message");
  const buttons = document.querySelectorAll(".pc-filter");

  const selectedTypes = new Set();

  let entries = [];
  let failedCount = 0;
  let loaded = false;


  /* ====================
     이미지의 유형 읽기
  ==================== */
  function getTypes(image) {
    return (image.dataset.pcTypes || "")
      .split(/[\s,]+/)
      .filter((type) => validTypes.includes(type));
  }

  function isRegisteredPhoto(image) {
    const src = image.getAttribute("src")?.trim();

    return Boolean(src) && getTypes(image).length > 0;
  }


  /* ====================
     복사한 상품의 id와 주소 정리
  ==================== */
  function prepareCopy(copy, pageUrl, prefix) {
    const idMap = new Map();

    [copy, ...copy.querySelectorAll("[id]")].forEach((element) => {
      if (!element.id) return;

      const oldId = element.id;
      const newId = prefix + oldId;

      idMap.set(oldId, newId);
      element.id = newId;
    });

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

    copy.querySelectorAll("img[src]").forEach((image) => {
      const src = image.getAttribute("src").trim();

      if (src) {
        image.src = new URL(src, pageUrl).href;
      }
    });

    copy.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href").trim();

      if (!href) return;

      if (href.startsWith("#") && idMap.has(href.slice(1))) {
        link.setAttribute("href", `#${idMap.get(href.slice(1))}`);
      } else {
        link.href = new URL(href, pageUrl).href;
      }
    });
  }


  /* ====================
     活動 페이지에서 포토카드 상품 읽기
  ==================== */
  async function readPage(activity, activityIndex) {
    const pageUrl = new URL(activity.url, location.href);

    const response = await fetch(pageUrl.href, {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error("활동 페이지를 불러오지 못했습니다.");
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(
      html,
      "text/html"
    );

    const products = doc.querySelectorAll(
      ".goods-accordion[data-category]"
    );

    return [...products].flatMap((product, productIndex) => {
      const sections = [...product.querySelectorAll(
        "details[data-photocard]"
      )];

      const hasPhotos = sections.some((section) => {
        return [...section.querySelectorAll(
          "img.photocard-image[data-pc-types]"
        )].some(isRegisteredPhoto);
      });

      if (!hasPhotos) return [];

      const copy = document.importNode(product, true);
      const content = copy.querySelector(".goods-content");

      if (!content) return [];

      /*
        포토카드 모아보기에서는 상품 제목 아래에
        포토카드 영역만 표시합니다.
      */
      const photoSections = [...content.querySelectorAll(
        "details[data-photocard]"
      )];

      content.replaceChildren(...photoSections);

      photoSections.forEach((section) => {
        /* 미등록 이미지 제거 */
        section.querySelectorAll("img").forEach((image) => {
          if (
            !image.matches(".photocard-image[data-pc-types]") ||
            !isRegisteredPhoto(image)
          ) {
            image.remove();
          }
        });

        if (!section.querySelector("img.photocard-image")) {
          section.remove();
          return;
        }

        /* 상품을 펼치면 포토카드를 바로 표시 */
        section.open = true;
      });

      copy.removeAttribute("open");

      prepareCopy(
        copy,
        pageUrl.href,
        `pc-${activityIndex}-${productIndex}-`
      );

      return [{ card: copy }];
    });
  }


  /* ====================
     유형 필터 적용
  ==================== */
  function applyFilters() {
    if (!loaded) return;

    let visibleProducts = 0;
    let visiblePhotos = 0;

    entries.forEach(({ card }) => {
      let cardPhotoCount = 0;

      card.querySelectorAll("details[data-photocard]").forEach(
        (section) => {
          const availableTypes = new Set();
          let sectionPhotoCount = 0;

          section.querySelectorAll(
            "img.photocard-image[data-pc-types]"
          ).forEach((image) => {
            const types = getTypes(image);

            /*
              선택 없음: 전체
              여러 개 선택: 선택한 유형 중 하나라도 포함
            */
            const matches =
              selectedTypes.size === 0 ||
              types.some((type) => selectedTypes.has(type));

            image.hidden = !matches;

            if (matches) {
              sectionPhotoCount += 1;

              types.forEach((type) => {
                availableTypes.add(type);
              });
            }
          });

          section.hidden = sectionPhotoCount === 0;
          cardPhotoCount += sectionPhotoCount;

          /* 현재 표시되는 사진에 맞춰 유형 색상 적용 */
          validTypes.forEach((type) => {
            const label = section.querySelector(
              `.photocard-type.type-${type}`
            );

            if (label) {
              label.classList.toggle(
                "active",
                availableTypes.has(type)
              );
            }
          });
        }
      );

      card.hidden = cardPhotoCount === 0;

      if (cardPhotoCount > 0) {
        visibleProducts += 1;
        visiblePhotos += cardPhotoCount;

        const number = card.querySelector(
          ".goods-summary > .goods-number"
        );

        if (number) {
          number.textContent = visibleProducts;
        }
      }
    });

    message.textContent = visibleProducts > 0
      ? `상품 ${visibleProducts}개 · 이미지 ${visiblePhotos}장`
      : "해당하는 포토카드가 없어요.";

    if (failedCount > 0) {
      message.textContent +=
        " 일부 활동 페이지를 불러오지 못해 결과가 누락될 수 있어요.";
    }
  }


  /* ====================
     필터 버튼 중복 선택
  ==================== */
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;

      if (selectedTypes.has(type)) {
        selectedTypes.delete(type);
      } else {
        selectedTypes.add(type);
      }

      button.setAttribute(
        "aria-pressed",
        String(selectedTypes.has(type))
      );

      applyFilters();
    });
  });


  /* ====================
     포토카드 목록 불러오기
  ==================== */
  async function loadPhotocards() {
    if (activityPages.length === 0) {
      message.textContent = "등록된 활동 페이지가 없어요.";
      return;
    }

    const responses = await Promise.allSettled(
      activityPages.map(readPage)
    );

    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        entries.push(...response.value);
      } else {
        failedCount += 1;
      }
    });

    if (failedCount === activityPages.length) {
      message.textContent =
        "포토카드를 불러오지 못했어요. 잠시 후 새로고침해 주세요.";
      return;
    }

    const fragment = document.createDocumentFragment();

    entries.forEach(({ card }) => {
      fragment.append(card);
    });

    container.replaceChildren(fragment);

    loaded = true;
    applyFilters();
  }

  loadPhotocards();
})();