(function () {
    var KEY = 'tl-theme';
    var NOTICE_KEY = 'tl-cookie-notice';
    var THEMES = [
        { id: 'light', label: 'Light', hint: 'Bright' },
        { id: 'dark', label: 'Dark', hint: 'Default' },
        { id: 'night', label: 'Nighttime', hint: 'Very dark' }
    ];
    var meta = { dark: '#182622', light: '#f1f6f3', night: '#050807' };
    var base = document.currentScript ? document.currentScript.src.replace(/theme\.js(\?.*)?$/, '') : '/';
    var listeners = [];

    function read(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
    }
    function valid(id) {
        return THEMES.some(function (t) { return t.id === id; });
    }

    var current = read(KEY);
    if (!valid(current)) current = 'dark';
    document.documentElement.setAttribute('data-theme', current);

    function apply(id) {
        current = id;
        document.documentElement.setAttribute('data-theme', id);
        var tc = document.querySelector('meta[name="theme-color"]');
        if (tc) tc.setAttribute('content', meta[id]);
        listeners.forEach(function (fn) { fn(id); });
    }

    window.TLTheme = {
        get: function () { return current; },
        set: function (id) { if (valid(id)) { write(KEY, id); apply(id); } },
        onChange: function (fn) { listeners.push(fn); }
    };

    function buildSwitch() {
        var header = document.querySelector('header');
        if (!header) return;

        var wrap = document.createElement('div');
        wrap.className = 'theme-switch';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-switch-btn alt';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Change theme');
        btn.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>' +
            '<span class="label">Theme</span><span class="caret" aria-hidden="true">&#9662;</span>';

        var menu = document.createElement('div');
        menu.className = 'theme-menu';
        menu.setAttribute('role', 'menu');

        THEMES.forEach(function (t) {
            var opt = document.createElement('button');
            opt.type = 'button';
            opt.className = 'theme-option';
            opt.setAttribute('role', 'menuitemradio');
            opt.dataset.theme = t.id;
            opt.innerHTML = '<span>' + t.label + '</span><small>' + t.hint + '</small>';
            opt.addEventListener('click', function () {
                window.TLTheme.set(t.id);
                close();
                btn.focus();
            });
            menu.appendChild(opt);
        });

        function mark() {
            Array.prototype.forEach.call(menu.children, function (o) {
                o.setAttribute('aria-checked', String(o.dataset.theme === current));
            });
        }
        function place() {
            var r = btn.getBoundingClientRect();
            var vw = document.documentElement.clientWidth;
            menu.style.top = (r.bottom + 6) + 'px';
            menu.style.right = Math.max(8, vw - r.right) + 'px';
        }
        function open() {
            mark();
            place();
            menu.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
        function close() {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (menu.classList.contains('open')) close(); else open();
        });
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target)) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) { close(); btn.focus(); }
        });
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, { passive: true });
        window.TLTheme.onChange(mark);

        wrap.appendChild(btn);
        document.body.appendChild(menu);

        // Pages with their own action area (CPU checker) keep the switch there.
        var actions = header.querySelector('.topbar-actions');
        (actions || header).appendChild(wrap);
    }

    function buildNotice() {
        if (read(NOTICE_KEY)) return;
        var box = document.createElement('div');
        box.className = 'cookie-notice';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-label', 'Cookie notice');
        box.innerHTML =
            '<p><strong>Cookies &amp; storage.</strong> We don\'t use tracking or advertising cookies, and we never share your data. ' +
            'Your browser keeps a few small settings (like your theme) on your device only. ' +
            '<a href="' + base + 'privacy/">Read our Privacy Policy</a>.</p>' +
            '<button type="button">Got it</button>';
        box.querySelector('button').addEventListener('click', function () {
            write(NOTICE_KEY, '1');
            box.remove();
        });
        document.body.appendChild(box);
        // Reserve room under the page so the notice never covers the footer.
        function reserve() {
            document.body.style.paddingBottom = (box.offsetHeight + 56) + 'px';
        }
        reserve();
        window.addEventListener('resize', reserve);
        box.querySelector('button').addEventListener('click', function () {
            document.body.style.paddingBottom = '';
            window.removeEventListener('resize', reserve);
        });
    }

    function buildSkipLink() {
        var target = document.querySelector('main') || document.querySelector('.wrap') || document.querySelector('[role="main"]');
        if (!target) return;
        if (!target.id) target.id = 'main-content';
        target.setAttribute('tabindex', '-1');
        var a = document.createElement('a');
        a.className = 'tl-skip';
        a.href = '#' + target.id;
        a.textContent = 'Skip to content';
        document.body.insertBefore(a, document.body.firstChild);
    }

    function buildTopButton() {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tl-top';
        b.setAttribute('aria-label', 'Back to top');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
        b.addEventListener('click', function () {
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        document.body.appendChild(b);
        function toggle() {
            var tall = document.documentElement.scrollHeight > window.innerHeight * 2.2;
            b.classList.toggle('show', tall && window.scrollY > 600);
        }
        window.addEventListener('scroll', toggle, { passive: true });
        window.addEventListener('resize', toggle);
        toggle();
    }

    function init() {
        buildSkipLink();
        buildSwitch();
        buildNotice();
        buildTopButton();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
