document.addEventListener('DOMContentLoaded', function () {
    const filterSelect = document.getElementById('filter-diameter');
    const clearBtn = document.getElementById('clear-filter');
    const productCards = Array.from(document.querySelectorAll('[data-diameters]'));
    const noResultsId = 'discos-no-results';
    const firstRow = productCards.length ? productCards[0].closest('.row') : null;

    function parseDiameters(attr) {
        if (!attr) return [];
        const tokens = attr.split(/[\s,|\/]+/).map(t => t.trim()).filter(Boolean);
        const values = new Set();

        tokens.forEach(token => {
            const normalized = token
                .replace(/["“”']/g, '')
                .replace(/,/g, '.')
                .replace(/[^\d\.\-–—]/g, '');

            if (!normalized) return;
            const rangeMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*[\-–—]\s*(\d+(?:\.\d+)?)$/);
            if (rangeMatch) {
                const a = parseFloat(rangeMatch[1]);
                const b = parseFloat(rangeMatch[2]);
                if (!isNaN(a) && !isNaN(b)) {
                    const start = Math.min(Math.round(a), Math.round(b));
                    const end = Math.max(Math.round(a), Math.round(b));
                    for (let n = start; n <= end; n++) {
                        values.add(String(n));
                    }
                    return;
                }
            }

            const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
            if (numberMatch) {
                const num = parseFloat(numberMatch[1]);
                if (!isNaN(num)) {
                    values.add(String(Math.round(num)));
                }
            }
        });

        return Array.from(values);
    }

    function getCardDiameters(card) {
        return parseDiameters(card.getAttribute('data-diameters') || '');
    }

    function ensureNoResults() {
        let el = document.getElementById(noResultsId);
        if (!el) {
            el = document.createElement('div');
            el.id = noResultsId;
            el.className = 'col-12 text-center py-4';
            el.innerHTML = '<p class="text-muted mb-0">No se encontraron productos para la categoría seleccionada.</p>';
            if (firstRow && firstRow.parentElement) {
                firstRow.parentElement.appendChild(el);
            } else {
                document.body.appendChild(el);
            }
        }
        return el;
    }

    function filterProducts(value) {
        const showAll = value === 'all' || !value;
        let visibleCount = 0;

        productCards.forEach(card => {
            const diameters = getCardDiameters(card);
            const matches = showAll || diameters.includes(String(value));
            card.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        const noRes = ensureNoResults();
        noRes.style.display = visibleCount === 0 ? '' : 'none';
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function () {
            filterProducts(this.value);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (filterSelect) filterSelect.value = 'all';
            filterProducts('all');
        });
    }

    filterProducts(filterSelect ? filterSelect.value : 'all');

    const items = document.querySelectorAll('.product-item[data-images]');
    items.forEach(item => {
        const images = item.getAttribute('data-images').split('|').map(s => s.trim()).filter(Boolean);
        const imgEl = item.querySelector('.product-main');
        const counter = item.querySelector('.image-counter');
        const leftArrow = item.querySelector('.gallery-arrow.left');
        const rightArrow = item.querySelector('.gallery-arrow.right');

        if (!images.length || !imgEl) return;
        let idx = 0;

        images.forEach(src => { const i = new Image(); i.src = src; });

        function show(index) {
            idx = (index + images.length) % images.length;
            imgEl.src = images[idx];
            if (counter) counter.textContent = (idx + 1) + '/' + images.length;
        }

        if (leftArrow) leftArrow.addEventListener('click', function (e) {
            e.stopPropagation();
            show(idx - 1);
        });
        if (rightArrow) rightArrow.addEventListener('click', function (e) {
            e.stopPropagation();
            show(idx + 1);
        });

        function openImageModal() {
            if (!images.length) return;
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:11000;overflow:hidden;padding:4px;';
            modal.addEventListener('click', function () { document.body.removeChild(modal); });

            const content = document.createElement('div');
            content.style.cssText = 'position:relative;max-width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;gap:8px;';
            content.addEventListener('click', function (e) { e.stopPropagation(); });

            let modalIdx = idx;
            const modalImg = document.createElement('img');
            modalImg.src = images[modalIdx];
            modalImg.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;cursor:default;';

            const createNavButton = function (symbol, direction) {
                const btn = document.createElement('button');
                btn.innerHTML = symbol;
                btn.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.85);border:none;color:#000;font-size:32px;line-height:1;width:48px;height:48px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);';
                btn.addEventListener('click', function (event) {
                    event.stopPropagation();
                    modalIdx = direction === 'left'
                        ? (modalIdx - 1 + images.length) % images.length
                        : (modalIdx + 1) % images.length;
                    modalImg.src = images[modalIdx];
                });
                return btn;
            };

            const leftControl = createNavButton('&#8249;', 'left');
            const rightControl = createNavButton('&#8250;', 'right');
            leftControl.style.left = '10px';
            rightControl.style.right = '10px';

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = 'position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.9);border:none;color:#000;font-size:24px;line-height:1;width:40px;height:40px;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25);';
            closeBtn.addEventListener('click', function (event) { event.stopPropagation(); document.body.removeChild(modal); });

            content.appendChild(leftControl);
            content.appendChild(modalImg);
            content.appendChild(rightControl);
            modal.appendChild(content);
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);
        }

        const trigger = item.querySelector('.product-gallery') || imgEl;
        if (trigger) {
            trigger.style.cursor = 'pointer';
            trigger.addEventListener('click', function (e) {
                if (e.target.closest('a') || e.target.closest('button')) return;
                openImageModal();
            });
            let startX = null;
            trigger.addEventListener('touchstart', function (e) { startX = e.touches && e.touches[0] && e.touches[0].clientX; }, { passive: true });
            trigger.addEventListener('touchend', function (e) {
                if (startX === null) return;
                const endX = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 30) show(diff > 0 ? idx + 1 : idx - 1);
                startX = null;
            }, { passive: true });
        }

        show(0);
    });
});
