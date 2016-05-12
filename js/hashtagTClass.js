if (!Array.prototype.find) {
	Array.prototype.find = function(predicate) {
		var list, length, thisArg, value;
		if (this === null) throw new TypeError('Array.prototype.find called on null or undefined');
		if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');

		list = Object(this);
		length = list.length >>> 0;
		thisArg = arguments[1];

		for (var i=0;i<length;i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) return value;
		}
		return undefined;
	};
}//end if

var hashtagT = function(id, data) {
	var buffer, e, host;
	this.id = id;
	this.Data = data;
	this.Ens = {};
	host = (typeof this.Data.wrapper == 'string') ? document.querySelector(this.Data.wrapper) : this.Data.wrapper;
	if (!this.determine() || !host) return;
	this.Ens.host = host;
	this.Ens.root = '';
	this.Ens.predicts = [];
	this.Ens.funcPredict = '';
	this.Ens.callBacks = [];
	this.Data.pool = {};
	this.Data.values = [];
	this.Data.aniCnt = 0;
	this.Data.iidBuffer = '';//blur timeer
	this.Data.default = '';
	this.Data.pattern = (typeof this.Data.pattern == 'undefined' || !Array.isArray(this.Data.pattern)) ? [] : this.Data.pattern.map(function(ele){ return new RegExp(ele); });
	this.Data.maxAmount = (typeof this.Data.maxAmount != 'undefined' && !isNaN(this.Data.maxAmount)) ? parseInt(this.Data.maxAmount, 10) : Infinity;
	this.Data.secret = '';
	if (this.Data.io && this.Data.io.uri) {
		e = this.Data.io;
		if (typeof this.Data.io.params == 'undefined') this.Data.io.params = {};
		this.Data.secret = e.uri + '?' + Object.keys(e.params).sort().map(function(key){ return key + '=' + e.params[key]; }).join('&');

		//duration
		if (!this.Data.duration) this.Data.duration = '600s';
		else if (!(/^\d+(s|ms)$/.test(this.Data.duration))) this.Data.duration += 'ms';
		this.Data.duration = (/^\d+ms$/.test(this.Data.duration)) ? Number(this.Data.duration.replace(/^(.*)ms$/,'$1')) : Number(this.Data.duration.replace(/^(.*)s$/,'$1')) * 1000;

		//withCredentials
		this.Data.withCredentials = (typeof this.Data.withCredentials == 'boolean') ? this.Data.withCredentials : false;
	}//end if

	//init
	buffer = mk();
	e = {};

	host.Data = { ClassID:this.id };
	host.value = this.Data.values;//data bind
	if (!host.id) host.id = 'hashtagT-' + this.id + getRand(1, 10000);
	buffer = this.template.cloneNode(true);
	if (this.wc.ShadowDOM) {
		e.root = host[this.wc.ShadowDOM]();
		e.root.innerHTML = '<style>' + this.cssStr + '</style>';
		this.Ens.sheet = e.root.querySelector('style');
		e.root.appendChild(buffer);

		this.Ens.root = e.root;
		empty(host, '.vanquish');
	} else {
		empty(host);
		host.appendChild(mk('', {tag:'h3', att:{innerHTML:'hash-tag-t'}}));
		host.appendChild(buffer);

		e.root = host;
	}//end if

	this.Ens.inputs = e.root.querySelector('.inputs');
	this.Ens.inputs.Data = { ClassID:this.id };
	this.Ens.inputs.setAttribute('placeholder', this.Data.placeholder);
	this.Ens.wrap = e.root.querySelector('.htag-wrap');
	this.Ens.wrap.Data = { ClassID:this.id };
	this.Ens.inputSet = this.Ens.inputs.parentNode;
	this.Ens.suggest = e.root.querySelector('.htag-suggest');
	this.Ens.suggest.classList.add('hide');

	this.Ens.vanquish = mk('vanquish');
	host.appendChild(this.Ens.vanquish);

	//data plug
	this.dataPlug();

	//evt
	e.sets = ['blur', 'focus', this.evtInput];
	if (typeof this.anis != 'undefined') {
		e.sets.push(this.anis.eventAnimationend);
		this.Ens.wrap.addEventListener(this.anis.eventTransition, this.eActG, false);
	}//end if
	for (var i=-1,l=e.sets.length;++i<l;) this.Ens.inputs.addEventListener(e.sets[i], this.eActG, false);
	e.sets = ['mouseover', 'mouseout', 'click'];
	for (var i=-1,l=e.sets.length;++i<l;) this.Ens.suggest.addEventListener(e.sets[i], this.eActG, false);
	this.Ens.wrap.addEventListener('click', this.eActG, false);
	
	// method bundle
	if (typeof this.Ens.host.set != 'function') this.Ens.host.set = hashtagT.prototype.set;
	if (typeof this.Ens.host.get != 'function') this.Ens.host.get = hashtagT.prototype.get;
	if (typeof this.Ens.host.addTag != 'function') this.Ens.host.addTag = hashtagT.prototype.addG;
	if (typeof this.Ens.host.removeTag != 'function') this.Ens.host.removeTag = hashtagT.prototype.removeG;
	if (typeof this.Ens.host.addCallback != 'function') this.Ens.host.addCallback = hashtagT.prototype.addCallback;
	if (typeof this.Ens.host.removeCallback != 'function') this.Ens.host.removeCallback = hashtagT.prototype.removeCallback;
	this.Ens.host.focus = hashtagT.prototype.focus;

	//attrChange
	if (this.observer) {
		e.config = {
			attributes: true
		};
		this.observer.observe(host, e.config);
	}//end if

	//clear
	for (var i in e) e[i] = null;
	e = null;
	
	//data init
	e = this;
	setTimeout(
		function() {
			e.set(e.Data.fieldValue);
		}
	, 100);
	if (host.hasAttribute('disabled')) host.setAttribute('disabled', true);

	//remove hidden
	host.removeAttribute('hidden');
	//isReady
	this.Data.isReady = true;
};

hashtagT.prototype = {
	dependencies: [
		'createCSSClass'
	],
	determine: function() {
		if (typeof hashtagT.prototype.isSupport == 'undefined') {
			var anis = isAniSupport(), css = [], e = {};
			hashtagT.prototype.anis = anis;
			hashtagT.prototype.wc = supportsWebComponents();
			hashtagT.prototype.evtInput = (isEventSupported('input', mk('',{tag:'input'})) && !/msie/.test(detectMSB())) ? 'input' : 'keyup';
			hashtagT.prototype.isSupport = true;
			hashtagT.prototype.userModify = '';
			hashtagT.prototype.localStorage = isAPISupport('localStorage');
			hashtagT.prototype.observer = '';

			//remove expire localStorage
			if (this.localStorage) {
				e.ct = new Date().getTime();
				e.LS = this.localStorage;
				Object.keys(this.localStorage).forEach(
					function(key) {
						var d;
						if (!/^hashtag\[(.*)\]$/.test(key)) return;
						try { d = JSON.parse(e.LS.getItem(key)); } catch (err) { d = {}; }
						if (isEmptyObject(d) || typeof d.mt == 'undefined' || e.ct > Number(d.mt)) e.LS .removeItem(key);
					}
				);

				//evt
				window.addEventListener('storage', this.sync, false);
			}//end if

			//animation
			if (typeof anis != 'undefined') {
				css.push({k:'@' + this.anis.keyframes + ' h-shake', v:'0% {' + this.anis.transform + ':translateX(0);} 25% {' + this.anis.transform + ':translateX(-3.5%);} 50% {' + this.anis.transform + ':translateX(0);} 75% {' + this.anis.transform + ':translateX(3.5%);}'});
				css.push({k:'@' + this.anis.keyframes + ' h-word', v:'0% {color:#f05763;} 70% {color:#f05763;} 100% {color:inherit;}'});
				e.aniSuggest = anis.transition + ':' + anis.transform +' 300ms cubic-bezier(.17,.67,.5,1.7),opacity 300ms cubic-bezier(.17,.67,.5,1.7);opacity:1;';
				e.aniSuggestHide = anis.transform + ':translateY(-5%);opacity:0;pointer-events:none;';
				e.aniUnit = anis.transition + ':' + anis.transform +' 250ms cubic-bezier(.17,.67,.5,1.7);' + anis.transform + ':scale(.001);';
				e.aniUnitOn = anis.transform + ':scale(1);'
			} else {
				e.aniSuggest = '';
				e.aniSuggestHide = 'display:none;';
				e.aniUnit = '';
				e.aniUnitOn = '';
			}//end if

			//css user-modify
			e.b = ['', 'webkit', 'moz', 'o', 'ms'];
			e.userModify = '';
			e.userModifyDisable = '';
			for (var i=-1,l=e.b.length;++i<l;) {
				var s = e.b[i];
				s = ((s.length) ? '-' + s + '-' : '') + 'user-modify';
				if (isCSSSupport(s)) {
					this.userModify = s;
					break;
				}//end if
			}//end for

			if (this.userModify) {
				e.userModifyValue = 'read-write-plaintext-only';
				try {
					createCSSClass('.userModifyCheck', this.userModify+':'+e.userModifyValue+';');
				} catch(err) { e.userModifyValue = 'read-write'; }
				e.userModify = this.userModify + ':' + e.userModifyValue + ';';
				e.userModifyDisable = this.userModify + ':' + 'read-only;';
			}//end if

			//css appearance
			e.b = ['', 'webkit', 'moz', 'o', 'ms'];
			e.appearance = '';
			for (var i=-1,l=e.b.length;++i<l;) {
				var s = e.b[i];
				s = ((s.length) ? '-' + s + '-' : '') + 'appearance';
				if (isCSSSupport(s)) {
					e.appearance = s + ':none;';
					break;
				}//end if
			}//end for
			if (e.appearance) e.appearance += 'border-radius:0;';

			//css
			createCSSClass('hash-tag-t', 'font-size:2vmin;line-height:1.8;display:block;padding:0;margin:0;font-family:arial,helvetica,clean,sans-serif,Microsoft JhengHei,\\5FAE\\8EDF\\6B63\\9ED1\\9AD4;');
			createCSSClass('hash-tag-t h3', 'display:none;');
			createCSSClass('hash-tag-t .vanquish', 'width:100%;height:0;visibility:hidden;overflow:hidden;');
			if (this.wc.ShadowDOM) {
				css.push({k:'h3', v:'display:none;'});
				css.push({k:'.htag-wrap', v:'display:flex;flex-flow:row wrap;'});
				css.push({k:'.htag-unit', v:'font-size:inherit;color:rgba(0,0,0,.3);height:100%;border-radius:2px;padding:0 6px;cursor:pointer;line-height:inherit;display:block;'+e.aniUnit});
				css.push({k:'.htag-unit:before', v:'content:"#";'});
				css.push({k:'.htag-unit:hover', v:'color:#529ecc;background-color:#e0eef6;'});
				css.push({k:'.htag-unit:focus', v:'color:#529ecc;background-color:#e0eef6;outline:0 none;'});
				css.push({k:'.inputs:empty:before', v:'color:rgba(0,0,0,.3);content:attr(placeholder);display:block;'});
				css.push({k:'.input-set', v:'position:relative;padding:0 14px;margin-left:-14px;'});
				css.push({k:'.inputs', v:'position:relative;display:block;cursor:text;z-index:2;'+e.userModify+e.appearance});
				if (e.userModifyDisable) {
					css.push({k:':host([disabled]) .inputs', v:e.userModifyDisable});
				}//end if
				css.push({k:'.htag-unit+.input-set', v:'margin-left:0;'});
				css.push({k:'.htag-suggest', v:'position:absolute;left:0;top:100%;width:auto;background:#fff;display:block;border-radius:4px;border:1px solid #dcdcdc;z-index:1;box-shadow:3px 3px 0px rgba(0,0,0,.2);margin-top:1vmin;white-space:nowrap;'+e.aniSuggest});
				css.push({k:'.htag-suggest.hide', v:e.aniSuggestHide});
				css.push({k:'.htag-suggest li', v:'color:#666;line-height:2.5;padding:0 14px;cursor:pointer;'});
				css.push({k:'.htag-suggest li p', v:'border-top:1px solid #f3f3f4;'});
				css.push({k:'.htag-suggest li:hover', v:'color:#999;background-color:rgba(243,243,244,.6);'});
				css.push({k:'.htag-suggest .on', v:'color:#999;background-color:rgba(243,243,244,.6);'});
				css.push({k:'.htag-suggest li:first-child p', v:'border-top:0 none;'});
				css.push({k:'.htag-suggest li:last-child', v:'border-bottom:4px solid #f05763;'});
				css.push({k:'.htag-suggest:before', v:'position:absolute;content:"";left:8px;top:-16px;border:8px solid transparent;border-bottom-color:#dcdcdc;'});
				css.push({k:'.htag-suggest:after', v:'position:absolute;content:"";left:8px;top:-15px;border:8px solid transparent;border-bottom-color:#fff;'});
				css.push({k:'.inputs:focus', v:'outline:0 none;'});
				css.push({k:'.inputs:focus~.htag-suggest:not(.hide)', v:'display:block;'});
				if (typeof anis != 'undefined') {
					css.push({k:'.warn-act', v:anis.animation + ':h-shake 200ms 3 both,h-word 500ms;'});
					css.push({k:'.htag-unit.on', v:e.aniUnitOn});
				}//end if
			} else {
				css.push({k:'hash-tag-t .htag-wrap', v:'display:flex;flex-flow:row wrap;'});
				css.push({k:'hash-tag-t .htag-unit', v:'font-size:inherit;color:rgba(0,0,0,.3);height:100%;border-radius:2px;padding:0 6px;cursor:pointer;line-height:inherit;display:block;'+e.aniUnit});
				css.push({k:'hash-tag-t .htag-unit:before', v:'content:"#";'});
				css.push({k:'hash-tag-t .htag-unit:hover', v:'color:#529ecc;background-color:#e0eef6;'});
				css.push({k:'hash-tag-t .htag-unit:focus', v:'color:#529ecc;background-color:#e0eef6;outline:0 none;'});
				css.push({k:'hash-tag-t .inputs:empty:before', v:'color:rgba(0,0,0,.3);content:attr(placeholder);display:block;'});
				css.push({k:'hash-tag-t .input-set', v:'position:relative;padding:0 14px;margin-left:-14px;'});
				css.push({k:'hash-tag-t .inputs', v:'position:relative;display:block;cursor:text;z-index:2;'+e.userModify+e.appearance});
				if (e.userModifyDisable) {
					css.push({k:'hash-tag-t[disabled] .inputs', v:e.userModifyDisable});
				}//end if
				css.push({k:'hash-tag-t .htag-unit+.input-set', v:'margin-left:0;'});
				css.push({k:'hash-tag-t .htag-suggest', v:'position:absolute;left:0;top:100%;width:auto;background:#fff;display:block;border-radius:4px;border:1px solid #dcdcdc;z-index:1;box-shadow:3px 3px 0px rgba(0,0,0,.2);margin-top:1vmin;white-space:nowrap;'+e.aniSuggest});
				css.push({k:'hash-tag-t .htag-suggest.hide', v:e.aniSuggestHide});
				css.push({k:'hash-tag-t .htag-suggest li', v:'color:#666;line-height:2.5;padding:0 14px;cursor:pointer;'});
				css.push({k:'hash-tag-t .htag-suggest li p', v:'border-top:1px solid #f3f3f4;'});
				css.push({k:'hash-tag-t .htag-suggest li:hover', v:'color:#999;background-color:rgba(243,243,244,.6);'});
				css.push({k:'hash-tag-t .htag-suggest .on', v:'color:#999;background-color:rgba(243,243,244,.6);'});
				css.push({k:'hash-tag-t .htag-suggest li:first-child p', v:'border-top:0 none;'});
				css.push({k:'hash-tag-t .htag-suggest li:last-child', v:'border-bottom:4px solid #f05763;'});
				css.push({k:'hash-tag-t .htag-suggest:before', v:'position:absolute;content:"";left:8px;top:-16px;border:8px solid transparent;border-bottom-color:#dcdcdc;'});
				css.push({k:'hash-tag-t .htag-suggest:after', v:'position:absolute;content:"";left:8px;top:-15px;border:8px solid transparent;border-bottom-color:#fff;'});
				css.push({k:'hash-tag-t .inputs:focus', v:'outline:0 none;'});
				css.push({k:'hash-tag-t .inputs:focus~.htag-suggest:not(.hide)', v:'display:block;'});
				if (typeof anis != 'undefined') {
					css.push({k:'hash-tag-t .warn-act', v:anis.animation + ':h-shake 200ms 3 both,h-word 500ms;'});
					css.push({k:'hash-tag-t .htag-unit.on', v:e.aniUnitOn});
				}//end if
			}//end if

			//template
			e.buffer = mk();
			hashtagT.prototype.template = e.buffer;
			e.htagWrap = mk('htag-wrap hashtagT');
			e.buffer.appendChild(e.htagWrap);
			e.inputSet = mk('input-set');
			e.htagWrap.appendChild(e.inputSet);
			e.inputs = mk('inputs', {tag:'span'});
			e.inputSet.appendChild(e.inputs);
			if (!/webkit/.test(this.userModify)) e.inputs.setAttribute('contenteditable', true);
			e.inputs.setAttribute('spellcheck', false);
			e.inputs.setAttribute('autocorrect', 'off');
			e.inputs.setAttribute('autocapitalize', 'off');
			e.inputs.setAttribute('autocomplete', 'off');
			e.suggest = mk('htag-suggest', {tag:'ul'});
			e.inputSet.appendChild(e.suggest);

			e.unit = mk('htag-unit', {tag:'span'});
			e.unit.setAttribute('tabindex', '1');
			hashtagT.prototype.tagUnit = e.unit;

			e.suggestLi = mk('', {tag:'li'});
			e.suggestP = mk('', {tag:'p'});
			e.suggestLi.appendChild(e.suggestP);
			hashtagT.prototype.suggestUnit = e.suggestLi;

			//evt
			window.addEventListener('keydown', this.kActG, false);
			if (!this.wc.CustomElements && typeof MutationObserver == 'function') {
				hashtagT.prototype.observer = new MutationObserver(
					function(mutations) {
						mutations.forEach(function(mutation) {
							hashtagT.prototype.mutate(mutation);
						});
					}
				);
			}//end if

			//excute css
			if (this.wc.ShadowDOM) {
				e.cssStr = 'h3,div,p,ul,li{display:block;margin:0;padding:0;}ul,li{list-style:none}';
				while (css.length) {
					var c = css.shift();
					e.cssStr += c.k + '{' + c.v + '}';
				}//end while
				hashtagT.prototype.cssStr = e.cssStr;
			} else {
				while (css.length) {
					var c = css.shift();
					createCSSClass(c.k, c.v);
				}//end while
			}//end if

			//clear
			css = null;
			for (var i in e) e[i] = null;
			e = null;

			//custom element
			this.activeCustomElement();
		}//end if
		return hashtagT.prototype.isSupport;
	},
	activeCustomElement: function() {
		if (hashtagT.prototype.activeCE) return;
		var b = ['', 'webkit', 'moz', 'o', 'ms'], api = 'registerElement', ce = '', prototype, observer;
		hashtagT.prototype.activeCE = true;
		for (var i=-1,l=b.length;++i<l;) {
			var s = b[i], cApi = api;
			cApi = (s.length) ? api.replace(/^[a-z]{1}/,function($1){return $1.toLocaleUpperCase()}) : api;
			s += cApi;
			if (document[s]) { ce = s; break; }
		}//end for

		if (typeof OhashtagT == 'undefined') OhashtagT = {};
		if (!ce) {
			//attachedCallback
			if (typeof MutationObserver == 'function') {
				observer = new MutationObserver(
					function(mutations) {
						mutations.forEach(function(mutation) {
							if (mutation.type != 'childList') return;
							[].slice.call(mutation.addedNodes).forEach(
								function(node) {
									if (/hash-tag-t/i.test(node.tagName)) hashtagT.prototype.attachedCallback(node);
								}
							);
						});
					}
				);
				observer.observe(document.body, {childList:true, subtree:true});
			}//end if

			//none custom element support
			[].slice.call(document.querySelectorAll('hash-tag-t')).forEach(
				function(node) {
					hashtagT.prototype.attachedCallback(node);
				}
			);
		} else {
			prototype = Object.create(HTMLElement.prototype);
			prototype.attachedCallback = hashtagT.prototype.attachedCallback;
			prototype.detachedCallback = function() {
				if (typeof this.id == 'undefined') return;
				OhashtagT['hashtagT'+this.mid].terminate();
			};
			prototype.attributeChangedCallback = hashtagT.prototype.attrChange;
			prototype.set = hashtagT.prototype.set;
			prototype.get = hashtagT.prototype.get;
			prototype.addTag = hashtagT.prototype.addG;
			prototype.removeTag = hashtagT.prototype.removeG;
			prototype.addCallback = hashtagT.prototype.addCallback;
			prototype.removeCallback = hashtagT.prototype.removeCallback;
			document[ce]('hash-tag-t', {prototype: prototype});
		}//end if
	},
	attachedCallback: function(node) {
		var conf, mid, tmp, target;
		if (typeof node != 'undefined') {
			//none custom element support
			if (!/hash-tag-t/i.test(node.tagName) || (typeof node.Data != 'undefined' && node.Data.isReady)) return;
			target = node;
		} else {
			target = this;
		}//end if

		mid = 'M' + getRand(1, 10000) + '-' + getRand(1, 10000);
		target.mid = mid;
		conf = {
			wrapper: target,
			fieldName: 'hashtag',
			fieldValue: '',
			placeholder: '#tag'
		};

		//input[name]
		tmp = target.querySelector('input[name]');
		if (tmp) {
			conf.fieldName = tmp.name || 'hashtag';
			conf.fieldValue = tmp.value || '';
			if (tmp.hasAttribute('placeholder')) conf.placeholder = tmp.getAttribute('placeholder');
			tmp.removeAttribute('name');
		}//end if

		if (target.hasAttribute('data-conf')) {
			try { tmp = JSON.parse(target.getAttribute('data-conf')); } catch (err) { tmp = {}; }
			for (var j in tmp) {
				conf[j] = tmp[j];
				tmp[j] = null;
			}//end ofr
			tmp = null;
			target.removeAttribute('data-conf');
		}//end if
		//hashtagT
		OhashtagT['hashtagT'+mid] = new hashtagT(mid, conf);
	},
	attrChange: function(attrName, oldVal, newVal, target) {
		var ins;

		if (['data-set', 'disabled'].indexOf(attrName) == -1) return;
		ins = getIns(target || this, 'hashtagT');
		if (!ins) return;
		switch (attrName) {
			case 'data-set':
				ins.set(newVal);
				break;
			case 'disabled':
				if (!ins.observer) return;
				if (newVal) {
					//disabled
					ins.Ens.inputs.removeAttribute('contenteditable');
				} else {
					ins.Ens.inputs.setAttribute('contenteditable', true);
				}//end if
				break;
		}//end switch
	},
	mutate: function(mutation) {
		var attrName, oldVal, newVal;
		if (mutation.type != 'attributes') return;

		attrName = mutation.attributeName;
		oldVal = mutation.oldValue;
		newVal = mutation.target.getAttribute(attrName);
		hashtagT.prototype.attrChange(attrName, oldVal, newVal, mutation.target);
	},
	focus: function() {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins) return;
		ins.Ens.inputs.focus();
	},
	kActG: function(e) {
		var ins, kc, ae;
		ins = getIns(document.activeElement, 'hashtagT');
		if (!ins) return;
		ins.kAct(e);
	},
	kAct: function(e) {
		var kc, ae, isInputs, o;
		kc = getKeyCode(e);
		ae = (this.Ens.root) ? this.Ens.root.activeElement : document.activeElement;
		isInputs = !ae.classList.contains('htag-unit');

		if ([8, 46].indexOf(kc) != -1) {
			//backspace:8, delete:46
			if (!isInputs) {
				//htag-unit
				stopEvents(e);
				this.remove(ae);
			} else if (kc == 8 && !this.Ens.inputs.textContent.length && this.Data.values.length) {
				this.remove(this.Data.values[this.Data.values.length-1]);
			}//end if
		} else if (isInputs && [38, 40, 13, 27].indexOf(kc) != -1) {
			//inputs
			switch (kc) {
				case 27:
					//esc
					this.Ens.suggest.classList.add('hide');
					this.resetPredict();
					break;
				case 13:
					//enter
					stopEvents(e);
					ae = ae.innerHTML.trim();
					if (!ae.length) return;
					this.Ens.suggest.classList.add('hide');
					this.add(ae, true);
					break;
				default:
					//↑, ↓
					if (!this.Ens.predicts.length || this.Ens.suggest.classList.contains('hide')) return;
					stopEvents(e);
					o = this.Ens.predicts.indexOf(this.Ens.funcPredict);
					o += (kc == 40) ? 1 : -1;
					if (o < -1) o = this.Ens.predicts.length - 1;
					else if (o >= this.Ens.predicts.length) o = -1;

					if (this.Ens.funcPredict) this.Ens.funcPredict.classList.remove('on');
					this.Ens.funcPredict = (o == -1) ? null : this.Ens.predicts[o];
					if (this.Ens.funcPredict) {
						this.Ens.funcPredict.classList.add('on');
						this.Ens.inputs.textContent = this.Ens.funcPredict.data;
					} else {
						this.Ens.inputs.textContent = this.Data.default;
					}//end if
			}//end switch
		}//end if
	},
	addCallback: function(fn) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins || typeof fn != 'function' || ins.Ens.callBacks.indexOf(fn) != -1) return;
		ins.Ens.callBacks.push(fn);
	},
	removeCallback: function(fn) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins || typeof fn != 'function' || ins.Ens.callBacks.indexOf(fn) == -1) return;
		ins.Ens.callBacks.splice(ins.Ens.callBacks.indexOf(fn), 1);
	},
	executeCallBack: function(action, label) {
		//addTag, removeTag, error
		this.Ens.callBacks.forEach(
			function(fn) {
				fn(action, label);
			}
		);
	},
	format: function(htag) {
		return htag.replace(/^#/, '').replace(/&nbsp;/g, ' ').trim();
	},
	prepare: function(){
		var key, data, ins;

		if (typeof this.Data.io == 'undefined' || typeof this.Data.io.uri == 'undefined') return; //no web service available

		key = this.format(this.Ens.inputs.textContent);
		if (!key.length) {
			this.Ens.suggest.classList.add('hide');
			return;
		} else if (typeof this.Data.pool[key] == 'undefined') {
			this.Data.pool[key] = [];
			this.fetch();
			this.i13n('dataFetch');
		} else {
			empty(this.Ens.suggest);
			this.Data.default = key;
			this.Ens.predicts = [];
			data = this.Data.pool[key];

			if (!data.length) {
				this.Ens.suggest.classList.add('hide');
				return;
			}//end if
			this.Ens.suggest.classList.remove('hide');
			this.i13n('suggestView');

			ins = this;
			data.forEach(
				function(value) {
					var unit;
					unit = ins.suggestUnit.cloneNode(true);
					ins.Ens.suggest.appendChild(unit);
					ins.Ens.predicts.push(unit);
					unit.data = value;
					unit.querySelector('p').textContent = value;
				}
			);
		}//end if
	},
	removeG: function(input) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins || !input) return;

		ins.remove(input);
	},
	remove: function(htag) {
		var unit, htags;
		htags = [].slice.call(this.Ens.wrap.querySelectorAll('.htag-unit'));
		if (typeof htag == 'string') {
			unit = htags.find(function(e) {
				return e.textContent == htag.trim();
			});
			if (!unit) {
				this.executeCallBack('error', 'htag missing');
				return;
			}//end if
			htag = unit;
		}//end if
		unit = htag.textContent.trim();
		if (htags.indexOf(htag) == -1 || this.Data.values.indexOf(unit) == -1) return;

		htag.blur();
		(typeof this.anis != 'undefined') ? htag.classList.remove('on') : htag.parentNode.removeChild(htag);
		this.Data.values.splice(this.Data.values.indexOf(unit), 1);

		this.i13n('removeTag', unit);
		this.executeCallBack('removeTag', unit);
		if (typeof this.anis == 'undefined') this.genData();
	},
	resetPredict: function() {
		if (this.Ens.funcPredict) {
			this.Ens.funcPredict.classList.remove('on');
			this.Ens.funcPredict = null;
		}//end if
	},
	eActG: function(e) {
		var obj, ins;
		obj = tNa(e);
		ins = getIns(obj.t, 'hashtagT');
		if (ins) ins.eAct(e);
	},
	eAct: function(e) {
		var obj = tNa(e);

		if (/animationend/i.test(obj.a)) obj.a = 'animationend';
		else clearTimeout(this.Data.iidBuffer);
		if (/transitionend/i.test(obj.a)) obj.a = 'transitionend';
		if (/keyup|input/i.test(obj.a)) obj.a = 'input';
		//focus
		if (obj.a == 'click' && obj.t.classList.contains('htag-wrap')) {
			this.Ens.inputs.focus();
			return;
		}//end if
		//Predict evt
		if (['click', 'mouseover', 'mouseout'].indexOf(obj.a) != -1) {
			obj = tNa(e, 'li');
			if (!obj.t) return;
		}//end if
		switch (obj.a) {
			case 'mouseover':
				if (this.Ens.funcPredict) this.Ens.funcPredict.classList.remove('on');
				this.Ens.funcPredict = obj.t;
				this.Ens.funcPredict.classList.add('on');
				break;
			case 'mouseout':
				this.resetPredict();
				break;
			case 'click':
				stopEvents(e);
				this.Ens.funcPredict = obj.t;
				this.i13n('suggestClick', obj.t.data);

				this.Ens.inputs.textContent = obj.t.data;
				this.Ens.suggest.classList.add('hide');
				this.add(obj.t.data, true);
				break;
			case 'input':
				if ([38, 40, 13, 27].indexOf(getKeyCode(e)) != -1) return;
				this.prepare();
				break;
			case 'focus':
				this.prepare();
				break;
			case 'blur':
				this.resetPredict();
				this.Ens.inputs.textContent = this.format(this.Ens.inputs.textContent);
				
				obj = this.Ens.suggest;
				this.Data.iidBuffer = setTimeout(
					function() {
						obj.classList.add('hide');
					}
				, 200);
				break;
			case 'transitionend':
				if (obj.t.classList.contains('htag-unit') && !obj.t.classList.contains('on')) {
					obj.t.parentNode.removeChild(obj.t);
					this.genData();
				}//end if
				break;
			case 'animationend':
				this.Data.aniCnt++;
				if (this.Data.aniCnt % 2 == 0) obj.t.classList.remove('warn-act');
				break;
		}//end switch
	},
	analysis: function(input) {
		var data = [];
		data = input.split('#').filter(function(e){return e.trim().length > 0;}).map(function(e){return e.trim();});
		return data;
	},
	validate: function(htag) {
		var msg, pass;

		htag = this.format(htag);
		if (!htag.length) {
			msg = 'empty';
		} else if (this.Data.values.indexOf(htag) != -1) {
			msg = 'deplicate';
		} else if (this.Data.values.length+1 > this.Data.maxAmount) {
			msg = 'exceed maximum amount';
		} else if (!this.Data.pattern.every(function(pattern){ return pattern.test(htag); })) {
			msg = 'pattern check fail';
		}//end if

		pass = (msg) ? false : true;
		return {pass:pass, msg:msg};
	},
	addG: function(input) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins || !input) return;

		ins.add(input);
	},
	add: function(htag, isInputEvt) {
		var unit, isInputEvt, res;

		isInputEvt = (typeof isInputEvt == 'boolean') ? isInputEvt : false;
		res = this.validate(htag);
		if (!res.pass) {
			if (isInputEvt && !this.Ens.inputs.classList.contains('warn-act')) {
				this.Data.aniCnt = 0;
				this.Ens.inputs.classList.add('warn-act');
			}//end if
			this.executeCallBack('error', res.msg);
			return;
		}//end if
		this.Data.values.push(htag);

		unit = this.tagUnit.cloneNode(true);
		unit.appendChild(document.createTextNode(htag));
		this.Ens.wrap.insertBefore(unit, this.Ens.inputSet);
		setTimeout(
			function() {
				unit.classList.add('on');
			}
		, 50);

		//clean inputs
		if (isInputEvt) empty(this.Ens.inputs);

		this.i13n('addTag', htag);
		this.executeCallBack('addTag', htag);
		this.genData();
	},
	fetch: function() {
		var xhr, fd, sets;

		xhr = new XMLHttpRequest() || new XDomainRequest();
		fd = new FormData();

		//formData
		if (this.Data.io.params) {
			for (var i in this.Data.io.params) fd.append(i, this.Data.io.params[i]);
		}//end if
		fd.append('q', this.format(this.Ens.inputs.textContent));

		sets = ['abort', 'error', 'readystatechange'];
		for (var i=-1,l=sets.length;++i<l;) xhr.addEventListener(sets[i], this.xhrHandle, false);

		xhr.withCredentials = this.Data.withCredentials;
		xhr.mid = this.id;
		xhr.open('POST', this.Data.io.uri, true);
		xhr.send(fd);
	},
	xhrHandle: function(e) {
		var obj = tNa(e);
		switch (obj.a) {
			case 'readystatechange':
				if (this.readyState == 4) {
					OhashtagT['hashtagT'+this.mid].qd(this);
				}//end if
				break;
		}//end switch
	},
	qd: function(o) {
		var ResultObj = {info:'fail'};
		if (o.status == 200) {
			try {ResultObj=JSON.parse(o.responseText.replace(/\)\]\}',\n/, ''));} catch(e) {}
		}//end if
		if (ResultObj.info == 'success') {
			this.Data.pool[ResultObj.data.q] = ResultObj.data.suggest;
			this.update();
			this.internalSync(); //internalSync
			this.prepare();
		} else {
			this.Ens.suggest.classList.add('hide');
		}//end if
	},
	getKey: function() {
		var sKey, secret, ins;

		if (this.localStorage && this.Data.secret) {
			secret = this.Data.secret;
			ins = this;
			sKey = Object.keys(this.localStorage).find(
				function(key, idx, arr) {
					var d;
					if (!/^hashtag\[(.*)\]$/.test(key)) return false;
					try { d = JSON.parse(ins.localStorage.getItem(key)); } catch (err) { d = {}; }
					if (!isEmptyObject(d) && d.secret && d.secret == ins.Data.secret) return true;
				}
			);
		}//end if
		return sKey;
	},
	update: function() {
		var sKey, data;

		if (this.localStorage && this.Data.secret) {
			sKey = this.getKey() || 'hashtag[' + getRand(1, 100000) + '-' + getRand(1, 10000) + ']';
			data = {};
			data.mt = new Date().getTime() + this.Data.duration;
			data.secret = this.Data.secret;
			data.pool = this.Data.pool;
			this.localStorage.setItem(sKey, JSON.stringify(data));
		}//end if
	},
	dataPlug: function() {
		var sKey, data;

		if (this.localStorage && this.Data.secret) {
			sKey = this.getKey();
			if (sKey) {
				try { data = JSON.parse(this.localStorage.getItem(sKey)); } catch (err) { data = {}; }
				if (!isEmptyObject(data) && typeof data.pool != 'undefined') this.Data.pool = data.pool;
			}//end if
		}//end if
	},
	internalSync: function() {
		var secret;
		secret = this.Data.secret;
		Object.keys(OhashtagT).forEach(
			function(key) {
				var ins = OhashtagT[key];
				if (ins == this || ins.Data.secret != secret) return;
				ins.dataPlug();
			}
		);
	},
	sync: function() {
		Object.keys(OhashtagT).forEach(
			function(key) {
				OhashtagT[key].dataPlug();
			}
		);
	},
	genData: function() {
		var vanquish, name;

		vanquish = this.Ens.vanquish;
		name = this.Data.fieldName + '[]';
		empty(vanquish);

		this.Data.values.forEach(
			function(value) {
				var input;
				input = mk('', {tag:'input'});
				input.type = 'hidden';
				input.name = name;
				input.value = value;
				vanquish.appendChild(input);
			}
		);
		this.Ens.host.value = this.Data.values.slice();
	},
	i13n: function(action, label) {
		var data;
		if (typeof gaExt == 'undefined') return;

		data = {
			action: action
		};
		data.label = label || 'none';
		gaExt.doEventBeacon(this.Ens.host, data);
	},
	set: function(input) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'hashtagT') : this;
		if (!ins) return;

		ins.refresh(input);
	},
	get: function() {
		var ins;
		ins = getIns(this, 'hashtagT');
		if (!ins) return;

		return ins.Data.values;
	},
	refresh: function(input) {
		var data, m;
		data = this.analysis(input);
		this.Data.values = [];
		empty(this.Ens.wrap, '.htag-unit');

		m = this;
		data.forEach(
			function(value) {
				m.add(value);
			}
		);
	},
	terminate: function() {
		var mid = this.id, sets;

		//events
		sets = ['blur', 'focus', this.evtInput];
		if (typeof this.anis != 'undefined') {
			sets.push(this.anis.eventAnimationend);
			this.Ens.wrap.addEventListener(this.anis.eventTransition, this.eActG, false);
		}//end if
		for (var i=-1,l=sets.length;++i<l;) this.Ens.inputs.removeEventListener(sets[i], this.eActG, false);
		sets = ['mouseover', 'mouseout', 'click'];
		for (var i=-1,l=sets.length;++i<l;) this.Ens.suggest.removeEventListener(sets[i], this.eActG, false);
		this.Ens.wrap.removeEventListener('click', this.eActG, false);

		setTimeout(function(){
			var c = OhashtagT['hashtagT'+mid];
			purge(c.Data);
			for (var i in c.Ens) c.Ens[i] = null;
			c.id = c.Data = c.Ens = null;
			try { delete(OhashtagT['hashtagT'+mid]); } catch(e) {}
		}, 100);
	}
};

/*auto-registration*/
(function() {
	var dependencies, c = 0, max = 10000;//10 seconds
	if (typeof navigator.oRegists == 'undefined') navigator.oRegists = {};
	dependencies = hashtagT.prototype.dependencies;
	navigator.oRegists.hashtagT = setInterval(
		function() {
			var isReady = true;
			c += 5;
			if (c >= max) {
				clearInterval(navigator.oRegists.hashtagT);
				return;
			}//end if
			for (var i=-1,l=dependencies.length;++i<l;) {
				var root = window, d = dependencies[i].split('.');
				while (d.length) {
					var prop = d.shift();
					if (!root[prop]) {
						root = null;
						break;
					} else root = root[prop];
				}//end while
				isReady &= (root != null);
			}//end for
			if (isReady && document.body) {
				clearInterval(navigator.oRegists.hashtagT);
				navigator.oRegists.hashtagT = null;
				hashtagT.prototype.determine();
			}//end if
		}
	, 5);
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/