(() => {
  function initializeGoodsSort() {
    document.querySelectorAll(".goods-sort-buttons").forEach(
      (controls) => {
        const list = controls.nextElementSibling;

        if (!list?.matches(".goods-list")) return;

        const originalProducts = [...list.children].filter(
          (element) => element.matches(".goods-accordion")
        );

        const buttons = controls.querySelectorAll(
          "button[data-goods-sort]"
        );

        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            const reverse =
              button.dataset.goodsSort === "reverse";

            const products = reverse
              ? [...originalProducts].reverse()
              : [...originalProducts];

            /* 同じ商品要素を移動して並べ替え */
            const fragment = document.createDocumentFragment();

            products.forEach((product) => {
              fragment.append(product);
            });

            list.append(fragment);

            buttons.forEach((item) => {
              item.setAttribute(
                "aria-pressed",
                String(item === button)
              );
            });
          });
        });
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeGoodsSort,
      { once: true }
    );
  } else {
    initializeGoodsSort();
  }
})();