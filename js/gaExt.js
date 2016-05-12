var gaExt = gaExt || {};

gaExt = {
	conf: {
		scriptPath: '//www.google-analytics.com/analytics.js',
		legalTag: [
			'a',
			'input',
			'button',
			'select'
		],
		inputType: [
			'checkbox',
			'radio',
			'submit',
			'button',
			'image',
			'file'
		],
		localStorage: undefined,
		tracker: undefined,
		ready: undefined
	},
	data: {
		sampleRate: 100,
		plugins: ['displayfeatures'],
		signEsc: 'ga-esc',
		markId: 'gaExtMark',
		customDefinitions: {},
		trackedMods: {}
	},
	cdMap: {
		'document_group': 'contentGroup1',
		'document_name': 'dimension1',
		subtype: 'dimension2',
		cat1Name: 'dimension3',
		cat2Name: 'dimension4',
		cat3Name: 'dimension5',
		cat4Name: 'dimension6',
		cat5Name: 'dimension7',
		cat6Name: 'dimension8',
		cat1: 'dimension9',
		cat2: 'dimension10',
		cat3: 'dimension11',
		cat4: 'dimension12',
		cat5: 'dimension13',
		cat6: 'dimension14',
		itemid: 'dimension15',
		itemname: 'dimension16',
		seller: 'dimension17',
		sellerName: 'dimension18',
		'promotion_id': 'dimension19',
		'activity_id': 'dimension20',
		'checkout_step': 'dimension21',
		paytype: 'dimension22',
		delvtype: 'dimension23',
		vtestid: 'dimension24',
		spaceid: 'dimension25',
		coServerName: 'dimension26',
		coServerName2: 'dimension27',
		actCode: 'dimension28',
		bidType: 'dimension30'
	},
	trackedMods: [],
	addModule: function(mod, gaMods, sendBeacon) {
		var sendBeacon = (typeof sendBeacon == 'boolean') ? sendBeacon : true;
		if (!this.conf.ready || typeof mod.nodeType == 'undefined' || mod.nodeType != 1 || this.trackedMods.indexOf(mod) != -1) return;
		this.trackedMods.push(mod);
		mod.setAttribute('data-ga-mod', gaMods);
		mod.addEventListener('click', this.modClick, false);
		if (sendBeacon) this.doModuleViewBeacon(mod);
	},
	removeModule: function(mod) {
		if (!this.conf.ready || typeof mod.nodeType == 'undefined' || mod.nodeType != 1 || this.trackedMods.indexOf(mod) == -1) return;
		this.trackedMods.splice(this.trackedMods.indexOf(mod), 1);
		mod.removeAttribute('data-ga-mod');
		mod.removeEventListener('click', this.modClick, false);
	},
	getTarget: function(e) {
		var target;
		e = e._event || e;
		if (window.event && window.event.srcElement) target = window.event.srcElement;
		else if (e && e.target) target = e.target;
		return target;
	},
	fetchMods: function(e) {
		var target, mod;
		target = e;
		while(target != null) {
			if (target.tagName && (target.tagName.toLowerCase() == 'body' || target.hasAttribute('data-ga-mod'))) break;
			target = target.parentNode;
		}//end if
		if (target && target.tagName.toLowerCase() != 'body' && target.hasAttribute('data-ga-mod')) mod = target;
		return mod;
	},
	fetchClickAble: function(e) {
		var target;
		target = this.getTarget(e);
		while(target != null) {
			if (target.nodeType == 1 && (this.conf.legalTag.indexOf(target.tagName.toLowerCase()) != -1 || target.tagName.toLowerCase() == 'body')) break;
			target = target.parentNode;
		}//end while
		if (target && target.tagName.toLowerCase() != 'body') {
			if (target.tagName.toLowerCase() == 'input' && (target.disabled || this.conf.inputType.indexOf(target.type.toLowerCase()) == -1)) target = null;
		} else {
			target = null;
		}//end if
		return target;
	},
	modClick: function(e) {
		var target = gaExt.fetchClickAble(e);
		if (!target || target.classList.contains(gaExt.data.signEsc)) return;
		gaExt.doEventBeacon(target);
	},
	doEventBeacon: function(target, data) {
		var e, mod;
		if (!gaExt.conf.ready || !target) return;

		e = {
			category: gaExt.data.customDefinitions.document_group || 'category',
			action: 'action',
			label: 'none'
		};

		mod = gaExt.fetchMods(target);
		if (mod) {
			e = {
				category: gaExt.data.customDefinitions.document_group || 'modClick',
				action: mod.getAttribute('data-ga-mod') || 'action',
				label: target.getAttribute('data-slk') || 'none'
			};
			if (e.label == 'none' && (target.textContent || target.value)) {
				e.label = target.value || target.textContent;
				e.label = e.label.toString().replace(/^\s*|(\r\n|\n|\r)|\s*$/gm, '');
				if (!e.label.length) e.label = 'none';
			}//end if
		}//end if
		if (data) for (var i in data) e[i] = data[i];

		ga(gaExt.data.prefix+'send', 'event', e.category, e.action, e.label);
	},
	doModuleViewBeacon: function(mod) {
		var data;
		if (!gaExt.conf.ready || typeof mod.nodeType == 'undefined' || mod.nodeType != 1 || gaExt.trackedMods.indexOf(mod) == -1) return;

		data = {
			category: gaExt.data.customDefinitions.document_group || mod.getAttribute('data-ga-mod'),
			action: 'moduleView',
			label: mod.getAttribute('data-ga-mod')
		};
		gaExt.doEventBeacon(mod, data);
	},
	sendModuleView: function() {
		if (!gaExt.conf.ready || !gaExt.trackedMods.length) return;
		for (var i=-1,l=gaExt.trackedMods.length;++i<l;) gaExt.doModuleViewBeacon(gaExt.trackedMods[i]);
	},
	doPageViewBeacon: function(sendModuleView) {
		if (!gaExt.conf.ready) return;
		ga(this.data.prefix+'send', 'pageview');
		if (!this.conf.tracker) ga(this.updateStatus);
		if (sendModuleView) ga(this.sendModuleView);
	},
	get: function(key) {
		var tracker, value;
		if (this.conf.ready && this.conf.tracker) {
			tracker = this.conf.tracker;
			key = key.trim();
			value = tracker.get(key) || tracker.get(this.cdMap[key]);
		}//end if
		return value;
	},
	updateStatus: function(tracker) {
		if (!gaExt.conf.ready || gaExt.conf.tracker) return;
		gaExt.conf.tracker = ga.getByName(gaExt.data.trackerName);
		//setMark
		gaExt.setMark();
	},
	hasCookie: function(sKey) {
		if (!sKey) return false;
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	getCookie: function(sKey) {
		if (!sKey) return null;
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setCookie: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) return false;
		var sExpires = '';
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
					break;
				case String:
					sExpires = '; expires=' + vEnd;
					break;
				case Date:
					sExpires = '; expires=' + vEnd.toUTCString();
					break;
			}//end switch
		}//end if
		document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
		return true;
	},
	isEmptyObject: function(obj) {
	    for (var prop in obj) {
	        if (obj.hasOwnProperty(prop)) return false;
	    }//end for
	    return true && JSON.stringify(obj) === JSON.stringify({});
	},
	parseData: function() {
		var e, clear;

		if (typeof this.conf.ready == 'undefined') {
			clear = true;
			e = document.getElementById('gaConf');
			
			//conf
			if (!e || !e.hasAttribute('data-conf')) clear = false;
			else {
				try {
					data = JSON.parse(e.getAttribute('data-conf'));
				} catch(err) { clear = false; }
			}//end if
			if (e) e.parentNode.removeChild(e);

			if (clear && data.trackingID) {
				//data plug
				for (var i in data) this.data[i] = data[i];

				//cdMap
				if (typeof this.data.cdMap != 'undefined') {
					this.cdMap = this.data.cdMap;
					delete(this.data.cdMap);
				}//end if

				//plugins
				if (typeof this.data.plugins == 'undefined' || !Array.isArray(this.data.plugins)) this.data.plugins = ['displayfeatures'];
				if (this.data.ecommerce && this.data.plugins.indexOf('ecommerce') == -1)  this.data.plugins.push('ecommerce');
			} else clear = false;

			this.conf.ready = clear;
		}//end if

		return this.conf.ready;
	},
	setMark: function() {
		var data;
		if (!this.conf.ready || !this.conf.localStorage) return;

		data = {
			'name': this.get('cookieName'),
			'domain': this.get('cookieDomain'),
			'expires': this.get('cookieExpires')
		};
		data.value = this.getCookie(data.name);
		if (data.domain == 'none') data.domain = location.hostname;
		this.conf.localStorage.setItem(this.data.markId, JSON.stringify(data));
	},
	recoverMark: function() {
		var source, data;
		if (!this.conf.ready || !this.conf.localStorage) return;

		source = this.conf.localStorage.getItem(this.data.markId);
		if (source == null) return;

		data = {};
		try { data = JSON.parse(source); } catch (err) { data = {}; }

		if (this.isEmptyObject(data) || !data.name || this.getCookie(data.name)) return;
		this.setCookie(data.name, data.value, Number(data.expires), '/', data.domain);
	},
	register: function() {
		var m;
		if (!this.conf.ready || typeof this.data.trackerName != 'undefined') return;

		this.data.trackerName = 'gaExt_' + new Date().getTime();
		this.data.prefix = this.data.trackerName + '.';
		
		//ga
		window.ga = window.ga || function(){(ga.q=ga.q||[]).push(arguments)};
		ga.l =+ new Date;

		//recover mark
		this.recoverMark();

		//basic setting
		ga('create', this.data.trackingID, 'auto', this.data.trackerName, {sampleRate: this.data.sampleRate});
		for (var i=-1,l=this.data.plugins.length;++i<l;) ga(this.data.prefix+'require', this.data.plugins[i]);

		ga(this.data.prefix+'set', 'transport', 'beacon');
		for (var i in this.data.customDefinitions) {
			if (!this.cdMap[i]) continue;
			ga(this.data.prefix+'set', this.cdMap[i], this.data.customDefinitions[i]);
		}//end for

		//trackedMods
		m = this;
		for (var i in this.data.trackedMods) {
			var gaMods = this.data.trackedMods[i];
			// Array.prototype.slice.call(document.querySelectorAll(i)).forEach(
			[].slice.call(document.querySelectorAll(i)).forEach(
				function(node) {
					m.addModule(node, gaMods, false);
				}
			);
		}//end for

		if (this.data.ecommerce && this.data.ecommerce.transaction && this.data.ecommerce.item) {
			//Transaction
			ga(this.data.prefix+'ecommerce:addTransaction', this.data.ecommerce.transaction);
			//Item
			m = this.data.ecommerce.item;
			for (var i=-1,l=m.length;++i<l;) ga(this.data.prefix+'ecommerce:addItem', m[i]);
			ga(this.data.prefix+'ecommerce:send');
			ga(this.data.prefix+'ecommerce:clear');
		}//end if
	},
	init: function() {
		var s;
		
		//get conf
		if (!this.parseData()) return;

		//localStorage
		if (typeof localStorage != 'undefined') {
			s = true;
			try {
				localStorage.setItem('isapisupport', 'dummy');
				localStorage.removeItem('isapisupport');
			} catch(err) { s = false; }
			if (s) this.conf.localStorage = localStorage;
		}//end if

		//GA register
		this.register();

		//fetch ga script
		s = document.createElement('script');
		document.head.appendChild(s);
		s.onload = s.onreadystatechange = function() {
			this.parentNode.removeChild(this);
		};
		s.async = true;
		s.src = this.conf.scriptPath;

		this.doPageViewBeacon(true);
	}
};

/*init when DOMContentLoaded*/
(function() {
	var s, c = 0, max = 10000;//10 seconds
	if (typeof navigator.gaIID == 'undefined') navigator.gaIID = '';
	navigator.gaIID = setInterval(
		function() {
			c += 5;
			if (c >= max) {
				clearInterval(navigator.gaIID);
				return;
			}//end if
			if (document.body) {
				clearInterval(navigator.gaIID);
				navigator.gaIID = null;
				gaExt.init();
			}//end if
		}
	, 5);

	if (document.currentScript) {
		s = document.currentScript;
		try { s.parentNode.removeChild(s); } catch(err) {}
	}//end if
})();
/*
Reference:
Analytics for Web: https://developers.google.com/analytics/devguides/collection/analyticsjs/
Google Analytics Debugger: https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna

programed by mei(李維翰), http://www.facebook.com/mei.studio.li
*/