/* Tag filter on the blog index. Progressive enhancement: with JS off every post stays
   visible, because the chips are buttons inside a list that is hidden from the noscript
   case and the cards are only ever hidden here. */
(function () {
  var bar = document.querySelector("[data-filter]");
  if (!bar) return;

  var chips = bar.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".post-card[data-tags]");
  var status = document.querySelector("[data-filter-status]");

  function apply(tag) {
    var shown = 0;

    for (var i = 0; i < cards.length; i++) {
      var tags = (cards[i].getAttribute("data-tags") || "").split(/\s+/);
      var match = tag === "all" || tags.indexOf(tag) !== -1;
      cards[i].hidden = !match;
      if (match) shown++;
    }

    for (var j = 0; j < chips.length; j++) {
      var on = chips[j].getAttribute("data-tag") === tag;
      chips[j].classList.toggle("is-active", on);
      chips[j].setAttribute("aria-pressed", on ? "true" : "false");
    }

    if (status) {
      status.textContent = shown === 1
        ? "Showing 1 post."
        : "Showing " + shown + " posts.";
    }
  }

  bar.addEventListener("click", function (event) {
    var chip = event.target.closest(".chip");
    if (chip && bar.contains(chip)) apply(chip.getAttribute("data-tag"));
  });

  apply("all");
})();