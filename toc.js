// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> Introduction</a></li><li class="chapter-item expanded "><a href="support.html"><strong aria-hidden="true">2.</strong> Support</a></li><li class="chapter-item expanded "><a href="editor-setup.html"><strong aria-hidden="true">3.</strong> Editor Setup</a></li><li class="chapter-item expanded "><a href="mypy.html"><strong aria-hidden="true">4.</strong> MyPy</a></li><li class="chapter-item expanded "><a href="addon-folders.html"><strong aria-hidden="true">5.</strong> Add-on Folders</a></li><li class="chapter-item expanded "><a href="a-basic-addon.html"><strong aria-hidden="true">6.</strong> A Basic Add-on</a></li><li class="chapter-item expanded "><a href="the-anki-module.html"><strong aria-hidden="true">7.</strong> The &#39;anki&#39; Module</a></li><li class="chapter-item expanded "><a href="command-line-use.html"><strong aria-hidden="true">8.</strong> Command-Line Use</a></li><li class="chapter-item expanded "><a href="hooks-and-filters.html"><strong aria-hidden="true">9.</strong> Hooks and Filters</a></li><li class="chapter-item expanded "><a href="console-output.html"><strong aria-hidden="true">10.</strong> Console Output</a></li><li class="chapter-item expanded "><a href="background-ops.html"><strong aria-hidden="true">11.</strong> Background Operations</a></li><li class="chapter-item expanded "><a href="qt.html"><strong aria-hidden="true">12.</strong> Qt and PyQt</a></li><li class="chapter-item expanded "><a href="python-modules.html"><strong aria-hidden="true">13.</strong> Python Modules</a></li><li class="chapter-item expanded "><a href="addon-config.html"><strong aria-hidden="true">14.</strong> Add-on Config</a></li><li class="chapter-item expanded "><a href="reviewer-javascript.html"><strong aria-hidden="true">15.</strong> Reviewer Javascript</a></li><li class="chapter-item expanded "><a href="debugging.html"><strong aria-hidden="true">16.</strong> Debugging</a></li><li class="chapter-item expanded "><a href="monkey-patching.html"><strong aria-hidden="true">17.</strong> Monkey Patching</a></li><li class="chapter-item expanded "><a href="sharing.html"><strong aria-hidden="true">18.</strong> Sharing Add-ons</a></li><li class="chapter-item expanded "><a href="porting2.1.x.html"><strong aria-hidden="true">19.</strong> Porting 2.1.x Add-ons</a></li><li class="chapter-item expanded "><a href="porting2.0.html"><strong aria-hidden="true">20.</strong> Porting 2.0 Add-ons</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
