document.addEventListener('DOMContentLoaded', function () {
    var elCargando = document.getElementById('buscador-cargando');
    var elTablaWrapper = document.getElementById('tabla-wrapper');
    var elTablaBody = document.getElementById('tabla-body');
    var elSinResultados = document.getElementById('buscador-sin-resultados');
    var elContador = document.getElementById('contador-resultados');
    var elTexto = document.getElementById('buscador-texto');
    var elLimpiar = document.getElementById('limpiar-filtros');
    var elFiltrosBadge = document.getElementById('filtros-badge');
    var elFiltrosPrimarios = document.getElementById('filtros-primarios');
    var elFiltrosAvanzados = document.getElementById('filtros-avanzados');
    var elPaginacion = document.getElementById('paginacion');
    var elPagInfo = document.getElementById('pag-info');
    var elPagAnterior = document.getElementById('pag-anterior');
    var elPagSiguiente = document.getElementById('pag-siguiente');

    if (!elTablaBody) return;

    var PAGE_SIZE = 15;
    var pagina = 1;
    var datos = [];
    var filtrados = [];
    var fichaOffcanvasInstancia = null;

    // El botón flotante de WhatsApp del sitio queda tapando los botones del panel; se oculta mientras está abierto.
    var elFichaOffcanvas = document.getElementById('fichaOffcanvas');
    var elWhatsappFlotante = document.querySelector('.whatsapp-btn');
    if (elFichaOffcanvas && elWhatsappFlotante) {
        elFichaOffcanvas.addEventListener('show.bs.offcanvas', function () { elWhatsappFlotante.style.display = 'none'; });
        elFichaOffcanvas.addEventListener('hidden.bs.offcanvas', function () { elWhatsappFlotante.style.display = ''; });
    }

    // Definición de filtros: coinciden 1 a 1 con las columnas del Excel de origen.
    var FILTER_FIELDS = [
        { key: 'tipo', label: 'Tipo', group: 'primary' },
        { key: 'diametroPulg', label: 'Diámetro en pulgadas', group: 'primary', suffix: '"' },
        { key: 'espesor', label: 'Espesor', group: 'primary' },
        { key: 'codCentro', label: 'Código de centro', group: 'primary' },
        { key: 'formaCentral', label: 'Forma del centro', group: 'primary' },
        { key: 'medidaCentro', label: 'Medida del centro', group: 'primary' },
        { key: 'cantL1', label: 'Cant. de agujeros laterales', group: 'primary' },
        { key: 'concavidad', label: 'Concavidad', group: 'advanced' },
        { key: 'acorazado', label: 'Acorazado', group: 'advanced' },
        { key: 'medidaL1', label: 'Medida de laterales (L1)', group: 'advanced' },
        { key: 'fresadoL1', label: 'Fresado de laterales (L1)', group: 'advanced' },
        { key: 'diamL1', label: 'Diámetro de laterales (L1)', group: 'advanced' },
        { key: 'cantL2', label: 'Cant. de exteriores (L2)', group: 'advanced' },
        { key: 'formaL2', label: 'Forma de exteriores (L2)', group: 'advanced' },
        { key: 'medidaL2', label: 'Medida de exteriores (L2)', group: 'advanced' },
        { key: 'fresadoL2', label: 'Fresado de exteriores (L2)', group: 'advanced' },
        { key: 'diamL2', label: 'Diámetro de exteriores (L2)', group: 'advanced' },
        { key: 'cantMuescas', label: 'Muescas', group: 'advanced' },
        { key: 'filo', label: 'Filo', group: 'advanced' },
        { key: 'anchoLabor', label: 'Ancho de labor', group: 'advanced' }
    ];

    var filtroState = {};
    FILTER_FIELDS.forEach(function (f) { filtroState[f.key] = ''; });

    function normalizar(texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function valorCampo(item, key) {
        var v = item[key];
        return (v === null || v === undefined) ? '' : String(v);
    }

    function celda(valor) {
        var texto = (valor === null || valor === undefined) ? '' : String(valor).trim();
        return texto === '' ? '<span class="celda-vacia">-</span>' : escapeHtml(texto);
    }

    function marcarActivo(select) {
        var wrap = select.closest('.filter-field');
        if (!wrap) return;
        wrap.classList.toggle('filtro-activo', !!select.value);
    }

    function actualizarContadorFiltros() {
        var activos = FILTER_FIELDS.filter(function (f) { return !!filtroState[f.key]; }).length;
        if (elFiltrosBadge) {
            elFiltrosBadge.textContent = activos;
            elFiltrosBadge.style.display = activos > 0 ? '' : 'none';
        }
        elLimpiar.disabled = activos === 0 && !elTexto.value.trim();
    }

    function construirFiltros() {
        FILTER_FIELDS.forEach(function (f) {
            var contenedor = f.group === 'primary' ? elFiltrosPrimarios : elFiltrosAvanzados;
            var wrap = document.createElement('div');
            wrap.className = 'filter-field';

            var label = document.createElement('label');
            label.setAttribute('for', 'filtro-' + f.key);
            label.textContent = f.label;

            var select = document.createElement('select');
            select.className = 'form-select form-select-sm';
            select.id = 'filtro-' + f.key;

            var placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Cualquiera';
            select.appendChild(placeholder);

            select.addEventListener('change', function () {
                filtroState[f.key] = select.value;
                marcarActivo(select);
                pagina = 1;
                actualizarTodo();
            });

            wrap.appendChild(label);
            wrap.appendChild(select);
            contenedor.appendChild(wrap);
        });
    }

    function coincideExcepto(item, exceptKey, texto) {
        for (var i = 0; i < FILTER_FIELDS.length; i++) {
            var key = FILTER_FIELDS[i].key;
            if (key === exceptKey) continue;
            var valor = filtroState[key];
            if (valor && valorCampo(item, key) !== valor) return false;
        }
        if (texto) {
            var haystack = normalizar(item.codigo + ' ' + item.descripcion + ' ' + item.maquina);
            if (haystack.indexOf(texto) === -1) return false;
        }
        return true;
    }

    function ordenarValores(valores) {
        var todosNumericos = valores.every(function (v) { return v !== '' && !isNaN(parseFloat(v)) && isFinite(v); });
        if (todosNumericos) {
            return valores.sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
        }
        return valores.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    }

    function actualizarSelects(texto) {
        FILTER_FIELDS.forEach(function (f) {
            var select = document.getElementById('filtro-' + f.key);
            if (!select) return;

            var subset = datos.filter(function (item) { return coincideExcepto(item, f.key, texto); });
            var valoresUnicos = Array.from(new Set(subset.map(function (item) { return valorCampo(item, f.key); }).filter(Boolean)));
            valoresUnicos = ordenarValores(valoresUnicos);

            var valorActual = filtroState[f.key];
            if (valorActual && valoresUnicos.indexOf(valorActual) === -1) {
                valorActual = '';
                filtroState[f.key] = '';
            }

            select.innerHTML = '';
            var placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Cualquiera';
            select.appendChild(placeholder);

            valoresUnicos.forEach(function (v) {
                var opt = document.createElement('option');
                opt.value = v;
                opt.textContent = f.suffix ? (v + f.suffix) : v;
                select.appendChild(opt);
            });

            select.value = valorActual;
            marcarActivo(select);
        });
        actualizarContadorFiltros();
    }

    function aplicarFiltros() {
        var texto = normalizar(elTexto.value.trim());
        filtrados = datos.filter(function (item) { return coincideExcepto(item, null, texto); });
    }

    function actualizarTodo() {
        var texto = normalizar(elTexto.value.trim());
        actualizarSelects(texto);
        aplicarFiltros();
        renderTabla();
    }

    function fila(item) {
        var diametroTxt = (item.diametroPulg !== null && item.diametroPulg !== undefined) ? (item.diametroPulg + '"') : '';
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td class="fw-semi-bold text-primary">' + escapeHtml(item.codigo) + '</td>' +
            '<td class="text-muted">' + celda(item.descripcion) + '</td>' +
            '<td>' + celda(item.tipo) + '</td>' +
            '<td>' + celda(diametroTxt) + '</td>' +
            '<td>' + celda(item.espesor) + '</td>' +
            '<td>' + celda(item.codCentro) + '</td>' +
            '<td>' + celda(item.formaCentral) + '</td>' +
            '<td>' + celda(item.medidaCentro) + '</td>' +
            '<td>' + celda(item.cantL1) + '</td>' +
            '<td>' + celda(item.formaL1) + '</td>' +
            '<td>' + celda(item.medidaL1) + '</td>' +
            '<td><button type="button" class="btn btn-sm btn-warning">Ver ficha</button></td>';
        tr.addEventListener('click', function () { mostrarFicha(item); });
        return tr;
    }

    function renderTabla() {
        elTablaBody.innerHTML = '';
        var total = filtrados.length;
        var totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (pagina > totalPaginas) pagina = totalPaginas;

        var inicio = (pagina - 1) * PAGE_SIZE;
        var fin = Math.min(inicio + PAGE_SIZE, total);

        for (var i = inicio; i < fin; i++) {
            elTablaBody.appendChild(fila(filtrados[i]));
        }

        var hayResultados = total > 0;
        elTablaWrapper.style.display = hayResultados ? '' : 'none';
        elSinResultados.style.display = hayResultados ? 'none' : '';
        elPaginacion.style.display = hayResultados ? 'flex' : 'none';

        elContador.textContent = hayResultados
            ? ('Mostrando ' + (inicio + 1) + '–' + fin + ' de ' + total + ' códigos')
            : '';

        if (hayResultados) {
            elPagInfo.textContent = 'Página ' + pagina + ' de ' + totalPaginas;
            elPagAnterior.disabled = pagina <= 1;
            elPagSiguiente.disabled = pagina >= totalPaginas;
        }
    }

    function fichaFila(etiqueta, valor) {
        if (!valor) return '';
        return '<div class="col-6 col-md-4 mb-3">' +
            '<div class="text-muted small">' + escapeHtml(etiqueta) + '</div>' +
            '<div class="fw-semi-bold">' + escapeHtml(valor) + '</div>' +
            '</div>';
    }

    function fichaGrupo(titulo, filasHtml) {
        if (!filasHtml) return '';
        return '<div class="ficha-grupo-titulo">' + escapeHtml(titulo) + '</div>' +
            '<div class="row">' + filasHtml + '</div>';
    }

    function mostrarFicha(item) {
        var body = document.getElementById('fichaModalBody');
        var diametroTxt = (item.diametroPulg !== null && item.diametroPulg !== undefined) ? (item.diametroPulg + '"') : '';

        var html = '<div id="fichaEsquema" class="ficha-esquema"><i class="fas fa-image"></i><span>Esquema no disponible</span></div>';

        html += '<div class="mb-2"><span class="fw-bold text-primary fs-5">' + escapeHtml(item.codigo) + '</span></div>';
        if (item.descripcion) html += '<p class="text-muted">' + escapeHtml(item.descripcion) + '</p>';

        html += fichaGrupo('Características',
            fichaFila('Tipo', item.tipo) +
            fichaFila('Diámetro', diametroTxt) +
            fichaFila('Espesor', item.espesor) +
            fichaFila('Concavidad', item.concavidad) +
            fichaFila('Acorazado', item.acorazado) +
            fichaFila('Planos', item.planos) +
            fichaFila('Aplicado a máquina', item.maquina)
        );

        var esquemaCentroHtml = item.imagenCentro
            ? '<div class="col-12 mb-3"><img id="fichaEsquemaCentroImg" alt="Esquema de centro ' + escapeHtml(item.codCentro) +
              '" class="img-fluid rounded" style="max-height:200px;object-fit:contain;" data-src="img/redondos/' + escapeHtml(item.imagenCentro) + '"></div>'
            : '';
        html += fichaGrupo('Código de centro', esquemaCentroHtml + fichaFila('Código', item.codCentro));

        html += fichaGrupo('Centro',
            fichaFila('Descripción', item.descCentro) +
            fichaFila('Forma central', item.formaCentral) +
            fichaFila('Medida centro', item.medidaCentro)
        );

        html += fichaGrupo('Punzonado / agujeros laterales (L1)',
            fichaFila('Cantidad', item.cantL1) +
            fichaFila('Forma', item.formaL1) +
            fichaFila('Medida', item.medidaL1) +
            fichaFila('Fresado', item.fresadoL1) +
            fichaFila('Diámetro', item.diamL1)
        );

        html += fichaGrupo('Punzonado / agujeros exteriores (L2)',
            fichaFila('Cantidad', item.cantL2) +
            fichaFila('Forma', item.formaL2) +
            fichaFila('Medida', item.medidaL2) +
            fichaFila('Fresado', item.fresadoL2) +
            fichaFila('Diámetro', item.diamL2)
        );

        html += fichaGrupo('Muescas', fichaFila('Cantidad', item.cantMuescas));
        html += fichaGrupo('Filo', fichaFila('Filo', item.filo));
        html += fichaGrupo('Ancho de labor', fichaFila('Ancho de labor', item.anchoLabor));

        if (item.observaciones) {
            html += '<div class="ficha-grupo-titulo">Observaciones</div><p>' + escapeHtml(item.observaciones) + '</p>';
        }

        body.innerHTML = html;
        document.getElementById('fichaModalLabel').textContent = 'Ficha técnica - ' + item.codigo;

        if (item.imagen) {
            var esquema = document.getElementById('fichaEsquema');
            var img = new Image();
            img.className = 'img-fluid rounded mb-2 w-100';
            img.style.maxHeight = '260px';
            img.style.objectFit = 'contain';
            img.alt = item.codigo;
            img.onload = function () { if (esquema && esquema.parentNode) esquema.replaceWith(img); };
            img.src = 'img/redondos/' + item.imagen;
        }

        var imgCentro = document.getElementById('fichaEsquemaCentroImg');
        if (imgCentro) {
            imgCentro.onerror = function () {
                var wrap = imgCentro.closest('.col-12');
                if (wrap) wrap.remove();
            };
            imgCentro.src = imgCentro.getAttribute('data-src');
        }

        var partesMensaje = ['Hola! Quiero consultar disponibilidad del código *' + item.codigo + '*'];
        if (item.descripcion) partesMensaje.push('(' + item.descripcion + ')');
        var datos = [];
        if (item.tipo) datos.push('Tipo: ' + item.tipo);
        if (diametroTxt) datos.push('Diámetro: ' + diametroTxt);
        if (item.espesor) datos.push('Espesor: ' + item.espesor);
        if (datos.length) partesMensaje.push('- ' + datos.join(', '));
        var mensaje = partesMensaje.join(' ');

        var elWhatsapp = document.getElementById('fichaWhatsappBtn');
        elWhatsapp.href = 'https://wa.me/3572532031?text=' + encodeURIComponent(mensaje);

        if (!fichaOffcanvasInstancia) fichaOffcanvasInstancia = new bootstrap.Offcanvas(document.getElementById('fichaOffcanvas'));
        fichaOffcanvasInstancia.show();
    }

    var debounceTimer = null;
    elTexto.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            pagina = 1;
            actualizarTodo();
        }, 150);
    });

    elLimpiar.addEventListener('click', function () {
        elTexto.value = '';
        FILTER_FIELDS.forEach(function (f) { filtroState[f.key] = ''; });
        pagina = 1;
        actualizarTodo();
    });

    elPagAnterior.addEventListener('click', function () {
        if (pagina > 1) { pagina--; renderTabla(); window.scrollTo({ top: elTablaWrapper.offsetTop - 100, behavior: 'smooth' }); }
    });

    elPagSiguiente.addEventListener('click', function () {
        pagina++; renderTabla();
        window.scrollTo({ top: elTablaWrapper.offsetTop - 100, behavior: 'smooth' });
    });

    construirFiltros();

    function cargarCatalogo(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error('No se pudo cargar ' + url);
            return res.json();
        });
    }

    // Fuente principal: base de datos (vía panel de administración).
    // Si falla (mantenimiento, sin conexión al servidor, etc.) se usa el
    // último catálogo generado como respaldo para que el buscador no quede vacío.
    cargarCatalogo('api/productos.php')
        .catch(function () {
            return cargarCatalogo('data/redondos.json');
        })
        .then(function (json) {
            datos = json;
            elCargando.style.display = 'none';
            actualizarTodo();
        })
        .catch(function (err) {
            elCargando.innerHTML = '<p class="text-danger">No se pudo cargar el catálogo de códigos. Intentá recargar la página.</p>';
            console.error(err);
        });
});
