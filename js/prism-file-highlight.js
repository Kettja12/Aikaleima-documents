(function () {
	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	var PRISM_LIVE_RELOAD_INTERVAL = 5000;

	var HIGHLIGHTED_CLASS = 'prism-highlighted';

	/**
	 * @param {Element} pre
	 * @returns {string | null}
	 */
	function getFile(pre) {
		var src = pre.getAttribute('data-src');
		if (!src) {
			return null;
		}

		var link = document.createElement('a');
		link.href = src;
		return link.href;
	}

	/**
	 * @param {Element} pre
	 * @param {string} text
	 */
	function success(pre, text) {
		// Create a temporary code element to ensure proper HTML escaping
		var code = document.createElement('code');
		code.textContent = text;
		pre.innerHTML = code.innerHTML;
		Prism.highlightElement(pre);
		pre.classList.add(HIGHLIGHTED_CLASS);
	}

	/**
	 * @param {Element} pre
	 * @param {string} reason
	 */
	function fail(pre, reason) {
		var code = pre.querySelector('code') || pre;
		code.textContent = reason;
		pre.classList.add(HIGHLIGHTED_CLASS);
	}

	var update = function (pre, text) {
		var src = getFile(pre);
		if (!src) {
			return;
		}

		// load current file
		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				if (xhr.status < 400 && xhr.responseText) {
					if (text !== xhr.responseText) {
						success(pre, xhr.responseText);
					}
				} else {
					if (xhr.status >= 400) {
						fail(pre, '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText);
					} else {
						fail(pre, '✖ Error: File does not exist or is empty');
					}
				}
			}
		};
		xhr.send(null);
	};

	var init = function () {
		// get all elements that have a data-src attribute
		Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
			// check if element is already highlighted
			if (pre.classList.contains(HIGHLIGHTED_CLASS)) {
				return;
			}

			var src = getFile(pre);
			if (!src) {
				return;
			}

			var code = document.createElement('code');
			pre.textContent = '';
			code.textContent = 'Loading…';
			pre.appendChild(code);

			// load current file
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status < 400 && xhr.responseText) {
						success(pre, xhr.responseText);

						if (pre.hasAttribute('data-reload')) {
							setInterval(function () {
								update(pre, xhr.responseText);
							}, PRISM_LIVE_RELOAD_INTERVAL);
						}
					} else {
						if (xhr.status >= 400) {
							fail(pre, '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText);
						} else {
							fail(pre, '✖ Error: File does not exist or is empty');
						}
					}
				}
			};
			xhr.send(null);
		});
	};

	// If the dynamic-highlight plugin is present, use its hook.
	// Otherwise, use load so that the plugin can be loaded asynchronously.
	if (Prism.plugins.autoloader) {
		Prism.plugins.autoloader.addInit(init);
	} else {
		addEventListener('load', init);
	}

	Prism.plugins.fileHighlight = {
		/**
		 * @deprecated Use `Prism.plugins.fileHighlight.highlight` instead.
		 */
		highlight: function highlight(container) {
			console.warn('Prism.plugins.fileHighlight.highlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
			Prism.plugins.fileHighlight.highlight(container);
		}
	};

}());