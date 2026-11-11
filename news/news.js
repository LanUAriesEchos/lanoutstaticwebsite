(function () {
    'use strict';

    var feed = document.getElementById('feed');

    function formatDate(iso) {
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
        if (!m) return iso || '';
        var d = new Date(+m[1], +m[2] - 1, +m[3]);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    var ICON = {
        play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
        vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9zM16 8a5 5 0 0 1 0 8l-1-1.5a3 3 0 0 0 0-5z"/></svg>',
        mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9zM15 9.5l5 5M20 9.5l-5 5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 9v6h4l5 4V5L7 9z"/></svg>',
        full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v2H6v4H4zM14 4h6v6h-2V6h-4zM4 14h2v4h4v2H4zM18 14h2v6h-6v-2h4z"/></svg>'
    };

    function fmtTime(s) {
        if (!isFinite(s)) return '0:00';
        s = Math.floor(s);
        var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function buildPlayer(m) {
        if (m.dataset.player) return;
        m.dataset.player = '1';
        var isVideo = m.tagName === 'VIDEO';
        m.controls = false;
        m.preload = 'metadata';
        if (isVideo) m.setAttribute('playsinline', '');

        var wrap = document.createElement('div');
        wrap.className = 'tl-player ' + (isVideo ? 'is-video' : 'is-audio');
        m.parentNode.insertBefore(wrap, m);
        wrap.appendChild(m);

        var bar = document.createElement('div');
        bar.className = 'tl-bar';
        bar.innerHTML =
            '<button type="button" class="tl-play" aria-label="Play">' + ICON.play + '</button>' +
            '<span class="tl-time tl-cur">0:00</span>' +
            '<input type="range" class="tl-seek" min="0" max="1000" value="0" step="1" aria-label="Seek">' +
            '<span class="tl-time tl-dur">0:00</span>' +
            '<button type="button" class="tl-mute" aria-label="Mute">' + ICON.vol + '</button>' +
            '<input type="range" class="tl-vol" min="0" max="1" step="0.05" value="1" aria-label="Volume">' +
            '<div class="tl-speedwrap"><button type="button" class="tl-speed" aria-haspopup="listbox" aria-expanded="false" aria-label="Playback speed">1x</button>' +
            '<ul class="tl-menu" role="listbox" aria-label="Playback speed" hidden></ul></div>' +
            (isVideo ? '<button type="button" class="tl-full" aria-label="Fullscreen">' + ICON.full + '</button>' : '');
        wrap.appendChild(bar);

        var big = null;
        if (isVideo) {
            big = document.createElement('button');
            big.type = 'button';
            big.className = 'tl-big';
            big.setAttribute('aria-label', 'Play video');
            big.innerHTML = ICON.play;
            wrap.insertBefore(big, bar);
        }

        var $ = function (c) { return bar.querySelector(c); };
        var play = $('.tl-play'), cur = $('.tl-cur'), dur = $('.tl-dur'), seek = $('.tl-seek');
        var mute = $('.tl-mute'), vol = $('.tl-vol'), speed = $('.tl-speed'), full = $('.tl-full');
        var speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2], scrubbing = false;
        var menu = $('.tl-menu');
        speeds.forEach(function (s) {
            var li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.tabIndex = -1;
            li.dataset.speed = s;
            li.textContent = s === 1 ? 'Normal' : s + 'x';
            menu.appendChild(li);
        });
        function setSpeed(s) {
            m.playbackRate = s;
            speed.textContent = s + 'x';
            Array.prototype.forEach.call(menu.children, function (li) {
                li.setAttribute('aria-selected', String(+li.dataset.speed === s));
            });
        }
        function closeMenu(refocus) {
            menu.hidden = true;
            speed.setAttribute('aria-expanded', 'false');
            if (refocus) speed.focus();
        }
        function openMenu() {
            menu.hidden = false;
            speed.setAttribute('aria-expanded', 'true');
            var sel = menu.querySelector('[aria-selected="true"]') || menu.children[0];
            sel.focus();
        }
        setSpeed(1);

        function fill(el) {
            var p = (el.value - el.min) / (el.max - el.min) * 100;
            el.style.setProperty('--fill', p + '%');
        }
        function toggle() { if (m.paused) { var r = m.play(); if (r && r.catch) r.catch(function () {}); } else { m.pause(); } }
        function sync() {
            var paused = m.paused;
            play.innerHTML = paused ? ICON.play : ICON.pause;
            play.setAttribute('aria-label', paused ? 'Play' : 'Pause');
            wrap.classList.toggle('is-playing', !paused);
        }
        function update() {
            if (!scrubbing && m.duration) { seek.value = m.currentTime / m.duration * 1000; fill(seek); }
            cur.textContent = fmtTime(m.currentTime);
        }

        play.addEventListener('click', toggle);
        if (big) big.addEventListener('click', toggle);
        if (isVideo) m.addEventListener('click', toggle);
        m.addEventListener('play', function () {
            // Only one thing plays at a time.
            document.querySelectorAll('.post-body video, .post-body audio').forEach(function (o) { if (o !== m && !o.paused) o.pause(); });
            sync();
        });
        m.addEventListener('pause', sync);
        m.addEventListener('ended', sync);
        m.addEventListener('timeupdate', update);
        m.addEventListener('loadedmetadata', function () { wrap.classList.remove('is-error'); dur.textContent = fmtTime(m.duration); update(); });
        m.addEventListener('durationchange', function () { dur.textContent = fmtTime(m.duration); });
        m.addEventListener('error', function () { wrap.classList.add('is-error'); dur.textContent = 'unavailable'; });

        seek.addEventListener('input', function () {
            scrubbing = true;
            fill(seek);
            if (m.duration) { m.currentTime = seek.value / 1000 * m.duration; cur.textContent = fmtTime(m.currentTime); }
        });
        seek.addEventListener('change', function () { scrubbing = false; });

        vol.addEventListener('input', function () { m.volume = +vol.value; m.muted = m.volume === 0; fill(vol); });
        m.addEventListener('volumechange', function () {
            var off = m.muted || m.volume === 0;
            mute.innerHTML = off ? ICON.mute : ICON.vol;
            mute.setAttribute('aria-label', off ? 'Unmute' : 'Mute');
            vol.value = off ? 0 : m.volume;
            fill(vol);
        });
        mute.addEventListener('click', function () {
            if (m.muted || m.volume === 0) { m.muted = false; if (m.volume === 0) m.volume = 0.5; } else { m.muted = true; }
        });
        speed.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
        menu.addEventListener('click', function (e) {
            var li = e.target.closest('li');
            if (!li) return;
            setSpeed(+li.dataset.speed);
            closeMenu(true);
        });
        menu.addEventListener('keydown', function (e) {
            var items = Array.prototype.slice.call(menu.children), i = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)].focus(); }
            else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
            else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
            else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); }
            else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
            else if (e.key === 'Tab') closeMenu();
        });
        document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('.tl-speedwrap')) closeMenu(); });
        if (full) {
            full.addEventListener('click', function () {
                if (document.fullscreenElement) document.exitFullscreen();
                else if (wrap.requestFullscreen) wrap.requestFullscreen();
                else if (m.webkitEnterFullscreen) m.webkitEnterFullscreen();
            });
        }
        wrap.addEventListener('keydown', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
            else if (e.key === 'ArrowRight') m.currentTime = Math.min(m.duration || 0, m.currentTime + 5);
            else if (e.key === 'ArrowLeft') m.currentTime = Math.max(0, m.currentTime - 5);
        });
        wrap.tabIndex = 0;

        fill(seek); fill(vol); sync();
    }

    function prepare(root) {
        root.querySelectorAll('time[datetime]').forEach(function (t) {
            if (!t.textContent.trim()) t.textContent = formatDate(t.getAttribute('datetime'));
        });
        root.querySelectorAll('.post-body img').forEach(function (img) {
            img.loading = 'lazy';
            img.decoding = 'async';
            img.classList.add('zoom');
        });
        root.querySelectorAll('.post-body video, .post-body audio').forEach(buildPlayer);
        root.querySelectorAll('.post-body iframe').forEach(function (f) { f.loading = 'lazy'; });
    }

    prepare(document);

    if (feed) {
        var posts = Array.prototype.slice.call(feed.querySelectorAll('.post'));
        var empty = document.getElementById('empty');
        var filters = document.getElementById('filters');
        var active = '';

        // Pinned first, then newest first.
        posts.sort(function (a, b) {
            var pa = a.hasAttribute('data-pinned') ? 1 : 0, pb = b.hasAttribute('data-pinned') ? 1 : 0;
            if (pa !== pb) return pb - pa;
            return (b.getAttribute('data-date') || '').localeCompare(a.getAttribute('data-date') || '');
        }).forEach(function (p) { feed.appendChild(p); });

        posts.forEach(function (p) {
            if (p.hasAttribute('data-pinned') && !p.querySelector('.post-pin')) {
                var meta = p.querySelector('.post-meta');
                var pin = document.createElement('span');
                pin.className = 'post-pin';
                pin.textContent = 'Pinned';
                meta.insertBefore(pin, meta.firstChild);
            }
        });

        var cats = [];
        posts.forEach(function (p) {
            var c = p.getAttribute('data-category');
            if (c && cats.indexOf(c) === -1) cats.push(c);
        });

        var render = function () {
            var shown = 0;
            posts.forEach(function (p) {
                var ok = !active || p.getAttribute('data-category') === active;
                p.hidden = !ok;
                if (ok) shown++;
            });
            if (empty) empty.style.display = shown ? 'none' : 'block';
        };

        if (filters && cats.length > 1) {
            ['All'].concat(cats).forEach(function (name, i) {
                var b = document.createElement('button');
                b.type = 'button';
                b.textContent = name;
                b.setAttribute('aria-pressed', String(i === 0));
                b.addEventListener('click', function () {
                    active = i === 0 ? '' : name;
                    Array.prototype.forEach.call(filters.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
                    render();
                });
                filters.appendChild(b);
            });
        } else if (filters) {
            filters.hidden = true;
        }
        render();
    }

    // Lightbox for images inside posts
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image preview');
    box.innerHTML = '<img alt=""><button type="button" aria-label="Close">&times;</button>';
    document.body.appendChild(box);
    var boxImg = box.querySelector('img');
    var closer = box.querySelector('button');
    var lastFocus = null;

    function closeBox() {
        box.hidden = true;
        if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
        var img = e.target.closest && e.target.closest('.post-body img.zoom');
        if (img) {
            lastFocus = document.activeElement;
            boxImg.src = img.currentSrc || img.src;
            boxImg.alt = img.alt;
            box.hidden = false;
            closer.focus();
        } else if (!box.hidden && e.target !== boxImg) {
            closeBox();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !box.hidden) closeBox();
    });

    // Template page: render each <template> with its source and a copy button.
    var host = document.getElementById('templates');
    if (host) {
        Array.prototype.forEach.call(document.querySelectorAll('template[data-template]'), function (t) {
            var src = t.innerHTML.replace(/^\n+|\s+$/g, '');
            var lines = src.split('\n');
            var indent = Math.min.apply(null, lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^\s*/)[0].length; }));
            src = lines.map(function (l) { return l.slice(indent); }).join('\n');

            var card = document.createElement('section');
            card.className = 'tpl-card';
            card.innerHTML = '<h2></h2><p></p><button type="button" class="copy">Copy HTML</button><div class="tpl-preview"></div><pre></pre>';
            card.querySelector('h2').textContent = t.getAttribute('data-template');
            card.querySelector('p').textContent = t.getAttribute('data-note') || '';
            card.querySelector('pre').textContent = src;
            var preview = card.querySelector('.tpl-preview');
            preview.appendChild(t.content.cloneNode(true));
            prepare(preview);

            var btn = card.querySelector('.copy');
            btn.addEventListener('click', function () {
                function done() {
                    btn.textContent = 'Copied!';
                    setTimeout(function () { btn.textContent = 'Copy HTML'; }, 1600);
                }
                function fallback() {
                    var ta = document.createElement('textarea');
                    ta.value = src;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = 'Copy failed'; }
                    ta.remove();
                }
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(src).then(done, fallback);
                } else { fallback(); }
            });
            host.appendChild(card);
        });
    }
})();
