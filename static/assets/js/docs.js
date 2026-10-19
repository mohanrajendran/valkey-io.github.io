(function () {
  "use strict";

  function normalizePath(path) {
    var normalized = path.replace(/index\.html$/, "").replace(/\/$/, "");
    return normalized || "/";
  }

  function setActiveNavigation() {
    var currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll(".docs-navigation a[href]").forEach(function (link) {
      var linkPath;
      try {
        linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);
      } catch (error) {
        return;
      }
      if (linkPath === currentPath) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function buildTableOfContents() {
    var article = document.getElementById("docs-article");
    var toc = document.getElementById("docs-toc");
    if (!article || !toc) {
      return;
    }

    var headings = article.querySelectorAll("h2, h3");
    if (!headings.length) {
      toc.closest(".docs-on-page").hidden = true;
      return;
    }

    headings.forEach(function (heading) {
      if (!heading.id) {
        return;
      }
      var item = document.createElement("li");
      if (heading.tagName === "H3") {
        item.className = "docs-toc-subitem";
      }
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      toc.appendChild(item);
    });
  }

  function loadTopicIndex() {
    var topicList = document.getElementById("topic-list");
    if (!topicList) {
      return;
    }

    fetch("/topics-list/")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Topic index request failed");
        }
        return response.text();
      })
      .then(function (html) {
        topicList.innerHTML = html;
      })
      .catch(function () {
        topicList.innerHTML = "<li>Could not load the topic index.</li>";
      });
  }

  function addCopyButtons() {
    document.querySelectorAll(".docs-article pre").forEach(function (pre) {
      if (pre.querySelector(".docs-copy-button")) {
        return;
      }
      var button = document.createElement("button");
      button.className = "docs-copy-button";
      button.type = "button";
      button.textContent = "Copy";
      button.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.innerText : pre.innerText;
        navigator.clipboard.writeText(text).then(function () {
          button.textContent = "Copied";
          window.setTimeout(function () { button.textContent = "Copy"; }, 1400);
        });
      });
      pre.appendChild(button);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setActiveNavigation();
    buildTableOfContents();
    loadTopicIndex();
    addCopyButtons();
  });
}());
