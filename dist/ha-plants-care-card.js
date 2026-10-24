//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: ee } = Object, m = globalThis, te = m.trustedTypes, ne = te ? te.emptyScript : "", re = m.reactiveElementPolyfillSupport, h = (e, t) => e, ie = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ae = (e, t) => !l(e, t), oe = {
	attribute: !0,
	type: String,
	converter: ie,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(h("elementProperties"))) return;
		let e = ee(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(h("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(h("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ie : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ie : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[h("elementProperties")] = /* @__PURE__ */ new Map(), g[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: g }), (m.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var _ = globalThis, se = (e) => e, v = _.trustedTypes, ce = v ? v.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, le = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ue = "?" + y, de = `<${ue}>`, b = document, x = () => b.createComment(""), S = (e) => e === null || typeof e != "object" && typeof e != "function", fe = Array.isArray, pe = (e) => fe(e) || typeof e?.[Symbol.iterator] == "function", C = "[ 	\n\f\r]", w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, me = /-->/g, he = />/g, T = RegExp(`>|${C}(?:([^\\s"'>=/]+)(${C}*=${C}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, _e = /"/g, ve = /^(?:script|style|textarea|title)$/i, ye = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), E = ye(1), D = ye(2), O = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), be = /* @__PURE__ */ new WeakMap(), A = b.createTreeWalker(b, 129);
function xe(e, t) {
	if (!fe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ce === void 0 ? t : ce.createHTML(t);
}
var Se = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = w;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === w ? c[1] === "!--" ? o = me : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = T) : (ve.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = T) : o = he : o === T ? c[0] === ">" ? (o = i ?? w, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? T : c[3] === "\"" ? _e : ge) : o === _e || o === ge ? o = T : o === me || o === he ? o = w : (o = T, i = void 0);
		let d = o === T && e[t + 1].startsWith("/>") ? " " : "";
		a += o === w ? n + de : l >= 0 ? (r.push(s), n.slice(0, l) + le + n.slice(l) + y + d) : n + y + (l === -2 ? t : d);
	}
	return [xe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ce = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Se(t, n);
		if (this.el = e.createElement(l, r), A.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = A.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(le)) {
					let t = u[o++], n = i.getAttribute(e).split(y), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Te : r[1] === "?" ? Ee : r[1] === "@" ? De : N
					}), i.removeAttribute(e);
				} else e.startsWith(y) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ve.test(i.tagName)) {
					let e = i.textContent.split(y), t = e.length - 1;
					if (t > 0) {
						i.textContent = v ? v.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], x()), A.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], x());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ue) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(y, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += y.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = b.createElement("template");
		return n.innerHTML = e, n;
	}
};
function j(e, t, n = e, r) {
	if (t === O) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = S(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = j(e, i._$AS(e, t.values), i, r)), t;
}
var we = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? b).importNode(t, !0);
		A.currentNode = r;
		let i = A.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new M(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Oe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = A.nextNode(), a++);
		}
		return A.currentNode = b, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, M = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = j(this, e, t), S(e) ? e === k || e == null || e === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : e !== this._$AH && e !== O && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? pe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== k && S(this._$AH) ? this._$AA.nextSibling.data = e : this.T(b.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ce.createElement(xe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new we(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = be.get(e.strings);
		return t === void 0 && be.set(e.strings, t = new Ce(e)), t;
	}
	k(t) {
		fe(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(x()), this.O(x()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = se(e).nextSibling;
			se(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, N = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = k, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = k;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = j(this, e, t, 0), a = !S(e) || e !== this._$AH && e !== O, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = j(this, r[n + o], t, o), s === O && (s = this._$AH[o]), a ||= !S(s) || s !== this._$AH[o], s === k ? e = k : e !== k && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Te = class extends N {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === k ? void 0 : e;
	}
}, Ee = class extends N {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== k);
	}
}, De = class extends N {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = j(this, e, t, 0) ?? k) === O) return;
		let n = this._$AH, r = e === k && n !== k || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== k && (n === k || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Oe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		j(this, e);
	}
}, ke = _.litHtmlPolyfillSupport;
ke?.(Ce, M), (_.litHtmlVersions ??= []).push("3.3.3");
var Ae = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new M(t.insertBefore(x(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, P = globalThis, F = class extends g {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ae(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return O;
	}
};
F._$litElement$ = !0, F.finalized = !0, P.litElementHydrateSupport?.({ LitElement: F });
var je = P.litElementPolyfillSupport;
je?.({ LitElement: F }), (P.litElementVersions ??= []).push("4.2.2");
var Me = {
	"care.water": "Water",
	"care.feed": "Feed",
	"status.ok": "OK",
	"status.soon": "Soon",
	"status.due": "Due",
	"status.overdue": "Overdue",
	"status.not_set": "Not set",
	none: "—",
	today: "Today",
	today_lower: "today",
	tomorrow: "Tomorrow",
	tomorrow_lower: "tomorrow",
	due_today: "Due today",
	in_days: {
		one: "in {n} day",
		other: "in {n} days"
	},
	days_late: {
		one: "{n} day late",
		other: "{n} days late"
	},
	was_due: "Was due {date}",
	every_days: {
		one: "every day",
		other: "every {n} days"
	},
	unit_day: {
		one: "day",
		other: "days"
	},
	unit_late: {
		one: "day late",
		other: "days late"
	},
	short_days: "{n} d",
	short_late: "{n} d late",
	plants_count: {
		one: "{n} plant",
		other: "{n} plants"
	},
	need_care_today: {
		one: "{n} needs care today",
		other: "{n} need care today"
	},
	all_on_schedule: "All on schedule",
	no_plants: "No plants in this area",
	no_plants_selected: "No plants selected",
	plants: "Plants",
	next: "Next",
	then: "Then {label}",
	next_14_days: "Next 14 days",
	photo: "Photo",
	plant_photo: "Plant photo",
	confirm_water: "Log a watering for {name}?",
	confirm_feed: "Log a feeding for {name}?",
	"log.water": "Log a watering",
	"log.feed": "Log a feeding",
	plant_not_found: "Plant not found: {name}",
	area: "Area",
	group: "Group",
	plant: "Plant",
	area_not_found: "Area not found: {name}",
	"editor.device_id": "Plant",
	"editor.area": "Area",
	"editor.title": "Title",
	"editor.plants": "Plants",
	"editor.plants_helper": "Shown along with the area's plants",
	"editor.title_helper": "Defaults to the area name",
	"editor.show_name": "Show the title",
	"editor.sort": "Order",
	"editor.layout": "Layout",
	"editor.date_format": "Dates",
	"editor.photo_style": "Photo style",
	"editor.font": "Font",
	"editor.show_interval": "Show the watering interval",
	"editor.image": "Photo URL",
	"editor.image_helper": "e.g. /local/plants/monstera.jpg",
	"editor.images_helper": "Per-plant photos (images) are set in YAML",
	"editor.tap_action": "Tap action",
	"editor.hold_action": "Hold action",
	"editor.hold_action_helper": "Default: log a watering after confirming",
	"editor.appearance": "Appearance",
	"editor.interactions": "Interactions",
	"editor.layout.header": "Photo header",
	"editor.layout.side": "Side photo",
	"editor.layout.countdown": "Countdown",
	"editor.layout.list": "List",
	"editor.layout.grid": "Grid",
	"editor.sort.urgency": "Most urgent first",
	"editor.sort.manual": "As picked",
	"editor.date_format.relative": "Relative (in 3 days)",
	"editor.date_format.absolute": "Date (Thu 15 Oct)",
	"editor.photo_style.duotone": "Duotone",
	"editor.photo_style.natural": "Natural",
	"editor.font.design": "Barlow (design)",
	"editor.font.theme": "Theme font"
}, Ne = { en: Me }, I = (e) => e.toLowerCase().split(/[-_]/)[0];
function L(e) {
	let t = Ne[I(e)] ? I(e) : "en", n = Ne[t], r = new Intl.PluralRules(t);
	return (e, t = {}) => {
		let i = n[e] ?? Me[e] ?? e;
		return (typeof i == "string" ? i : i[r.select(t.n ?? 0)] ?? i.other).replace(/\{(n|date|name|label)\}/g, (e, n) => String(t[n] ?? ""));
	};
}
function Pe(e, t, n) {
	let r = I(t) === "en" && !t.includes("-") ? "en-GB" : t;
	return new Intl.DateTimeFormat(r, {
		weekday: "short",
		day: "numeric",
		month: "short",
		timeZone: n
	}).format(e);
}
//#endregion
//#region src/cards/editor.ts
var R = (e, t, n) => ({
	name: t,
	selector: { select: {
		mode: "dropdown",
		options: n.map((n) => ({
			value: n,
			label: e(`editor.${t}.${n}`)
		}))
	} }
}), z = (e, t, n, r) => ({
	type: "expandable",
	name: "",
	title: e(`editor.${t}`),
	icon: n,
	flatten: !0,
	schema: r
}), Fe = () => [{
	name: "tap_action",
	selector: { ui_action: { default_action: "more-info" } }
}, {
	name: "hold_action",
	selector: { ui_action: {} }
}], Ie = (e, t) => JSON.stringify(e) === JSON.stringify(t), Le = class extends F {
	constructor(...e) {
		super(...e), this.helpers = {}, this._label = (e) => this._t(`editor.${e.name}`), this._helper = (e) => {
			let t = this.helpers[e.name] ?? `editor.${e.name}_helper`, n = this._t(t);
			return n === t ? void 0 : n;
		};
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	setConfig(e) {
		this._config = e;
	}
	get _t() {
		return L(this.hass?.locale.language ?? "en");
	}
	render() {
		return !this.hass || !this._config ? k : E`<ha-form
      .hass=${this.hass}
      .data=${{
			...this.defaults,
			...this._config
		}}
      .schema=${this.schema(this._t)}
      .computeLabel=${this._label}
      .computeHelper=${this._helper}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
	}
	_valueChanged(e) {
		if (e.stopPropagation(), !this._config) return;
		let t = { type: this._config.type };
		for (let [n, r] of Object.entries(e.detail.value)) n !== "type" && r !== void 0 && r !== "" && (Ie(r, this.defaults[n]) || (t[n] = r));
		this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: t },
			bubbles: !0,
			composed: !0
		}));
	}
}, Re = [
	"ok",
	"soon",
	"due",
	"overdue"
], ze = "plant_care", B = {
	water: {
		next: "next_watering",
		status: "watering_status",
		button: "water"
	},
	feed: {
		next: "next_feeding",
		status: "feeding_status",
		button: "feed"
	}
}, V = "photo", Be = [...Object.values(B).flatMap((e) => Object.values(e)), V], Ve = [...Be].sort((e, t) => t.length - e.length);
function He(e) {
	if (e.translation_key && Be.includes(e.translation_key)) return e.translation_key;
	let t = e.entity_id.split(".")[0], n = Ve.find((t) => e.entity_id.endsWith(`_${t}`));
	if (!n) return;
	let r = n === "water" || n === "feed" ? "button" : n === V ? "image" : null;
	return (r ? t === r : t !== "button") ? n : void 0;
}
function Ue(e, t) {
	let n = t ? e.states[t]?.attributes.entity_picture : void 0;
	return typeof n == "string" && n ? n : null;
}
function We(e) {
	if (!e || e === "unknown" || e === "unavailable") return null;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? null : t;
}
function Ge(e) {
	return Re.includes(e) ? e : null;
}
function Ke(e) {
	let t = typeof e == "string" ? Number(e) : e;
	return typeof t == "number" && Number.isFinite(t) && t > 0 ? t : null;
}
function qe(e, t, n) {
	let r = B[n], i = t.get(r.next), a = t.get(r.status), o = i ? e.states[i] : void 0;
	return {
		kind: n,
		nextAt: We(o?.state),
		status: Ge(a ? e.states[a]?.state : void 0),
		intervalDays: Ke(o?.attributes.interval_days),
		nextEntityId: i,
		statusEntityId: a,
		buttonEntityId: t.get(r.button)
	};
}
function H(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Object.values(e.entities)) {
		if (n.platform !== ze || !n.device_id) continue;
		let e = He(n);
		if (!e) continue;
		let r = t.get(n.device_id);
		r || t.set(n.device_id, r = /* @__PURE__ */ new Map()), r.set(e, n.entity_id);
	}
	let n = [];
	for (let [r, i] of t) {
		if (!i.has(B.water.next) && !i.has(B.feed.next)) continue;
		let t = e.devices[r], a = i.get(V);
		n.push({
			deviceId: r,
			name: t?.name_by_user || t?.name || r,
			areaId: t?.area_id ?? null,
			species: t?.model || null,
			image: Ue(e, a) ?? Ue(e, i.get(B.water.next)),
			photoEntityId: a,
			water: qe(e, i, "water"),
			feed: qe(e, i, "feed")
		});
	}
	return n;
}
var Je = (e) => [...[e.water, e.feed].flatMap((e) => [
	e.nextEntityId,
	e.statusEntityId,
	e.buttonEntityId
]), e.photoEntityId].filter((e) => !!e);
function Ye(e, t) {
	return H(e).find((e) => e.deviceId === t);
}
function Xe(e, t) {
	let n = H(e), r = [...new Set(t.plants ?? [])].map((e) => n.find((t) => t.deviceId === e)).filter((e) => !!e), i = t.area ? n.filter((e) => e.areaId === t.area) : [];
	return [...r, ...i.filter((e) => !r.includes(e))];
}
//#endregion
//#region src/styles/fonts.ts
var Ze = "plant-care-cards-fonts", Qe = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500&family=Barlow+Condensed:wght@600&display=swap";
function $e(e = document) {
	if (e.getElementById("plant-care-cards-fonts")) return;
	let t = e.createElement("link");
	t.id = Ze, t.rel = "stylesheet", t.href = Qe, e.head.append(t);
}
//#endregion
//#region src/styles/frame.ts
var et = o`
  ha-card {
    display: block;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
    border: 1px solid var(--pc-divider);
    border-radius: 0;
    box-shadow: none;
    background: var(--plant-care-card-background, transparent);
    color: var(--pc-text);
    font-family: var(--pc-font-body);
  }
  .corner {
    position: absolute;
    width: 11px;
    height: 11px;
    z-index: 1; /* above photos that fill the card edge */
    color: color-mix(in srgb, var(--pc-text) 55%, transparent);
    pointer-events: none;
  }
  .corner::before,
  .corner::after {
    content: '';
    position: absolute;
    background: currentColor;
  }
  .corner::before {
    left: 5px;
    top: 0;
    width: 1px;
    height: 100%;
  }
  .corner::after {
    top: 5px;
    left: 0;
    width: 100%;
    height: 1px;
  }
  .corner.tl {
    top: -6px;
    left: -6px;
  }
  .corner.tr {
    top: -6px;
    right: -6px;
  }
  .corner.bl {
    bottom: -6px;
    left: -6px;
  }
  .corner.br {
    bottom: -6px;
    right: -6px;
  }

  .heading {
    margin: 0;
    font-family: var(--pc-font-heading);
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
  }
  .kicker {
    font: 500 12px/1.3 var(--pc-font-body);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .label {
    font: 500 12px/1 var(--pc-font-body);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .muted {
    color: var(--pc-muted);
  }
`, U = () => E`<i class="corner tl" aria-hidden="true"></i><i class="corner tr" aria-hidden="true"></i
    ><i class="corner bl" aria-hidden="true"></i><i class="corner br" aria-hidden="true"></i>`, tt = o`
  .photo {
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    align-items: flex-end;
  }
  .photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo.hatch {
    --hatch-gap: 7px;
    --hatch-step: 8px;
    padding: 10px 12px;
    background: repeating-linear-gradient(
      135deg,
      transparent 0 var(--hatch-gap),
      var(--pc-divider) var(--hatch-gap) var(--hatch-step)
    );
  }
  .photo.hatch.sm {
    --hatch-gap: 5px;
    --hatch-step: 6px;
    padding: 6px 7px;
  }
  .photo-label {
    font: 500 10px/1 var(--pc-font-body);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--pc-text) 65%, transparent);
  }
  .photo.sm .photo-label {
    font-size: 9px;
  }
  .photo.duotone::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: var(--pc-accent);
    mix-blend-mode: color;
  }
`, W = ({ src: e, style: t, size: n = "lg", label: r }) => e ? E`<div class="photo ${n}${t === "duotone" ? " duotone" : ""}">
        <img src=${e} alt="" loading="lazy" />
      </div>` : E`<div class="photo hatch ${n}">
        ${r ? E`<span class="photo-label">${r}</span>` : k}
      </div>`, nt = o`
  .tag {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    padding: 3px 10px;
    border: 1px solid transparent;
    border-radius: 0;
    font: 400 11px/1.4 var(--pc-font-body);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .tag.chip {
    justify-content: center;
  }
  .tag.ok {
    border-color: var(--pc-divider);
    color: var(--pc-muted);
  }
  .tag.soon {
    background: var(--pc-accent-100);
    color: var(--pc-accent-800);
  }
  .tag.due {
    background: var(--pc-accent);
    border-color: var(--pc-accent);
    color: var(--pc-bg);
  }
  .tag.overdue {
    background: var(--pc-text);
    border-color: var(--pc-text);
    color: var(--pc-bg);
  }
  button.tag {
    margin: 0;
    background: transparent;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 120ms ease-out;
  }
  button.tag:hover {
    outline: 1px solid var(--pc-accent);
    outline-offset: 1px;
  }
  button.tag:focus-visible {
    outline: 2px solid var(--pc-accent);
    outline-offset: 2px;
  }
  button.tag:active {
    transform: scale(0.96);
  }
`, rt = (e) => e ?? "ok", G = (e, t = e.statusLabel, n = !1) => E`<span class="tag ${rt(e.status)}${n ? " chip" : ""}">${t}</span>`, K = (e, t = e.statusLabel, n = !1) => e.button ? E`<button
        type="button"
        class="tag ${rt(e.status)}${n ? " chip" : ""}"
        data-care=${e.kind}
        title=${e.logLabel}
        aria-label=${`${t}, ${e.logLabel}`}
      >
        ${t}
      </button>` : G(e, t, n), it = o`
  :host {
    --pc-bg: var(
      --plant-care-background,
      var(--ha-card-background, var(--card-background-color, #f2f2f3))
    );
    --pc-text: var(--plant-care-text, var(--primary-text-color, #1d1f20));
    --pc-muted: color-mix(in srgb, var(--pc-text) 68%, transparent);
    --pc-divider: var(
      --plant-care-divider,
      var(--divider-color, color-mix(in srgb, var(--pc-text) 16%, transparent))
    );
    --pc-accent: var(--plant-care-accent, var(--primary-color, #5980a6));
    --pc-accent-100: color-mix(in srgb, var(--pc-accent) 15%, transparent);
    --pc-accent-800: color-mix(in srgb, var(--pc-accent) 60%, var(--pc-text));
    --pc-font-theme: var(--ha-font-family-body, system-ui), sans-serif;
    --pc-font-heading: 'Barlow Condensed', var(--pc-font-theme);
    --pc-font-body: 'Barlow', var(--pc-font-theme);
  }
  :host([font='theme']) {
    --pc-font-heading: var(--pc-font-theme);
    --pc-font-body: var(--pc-font-theme);
  }
`, at = {
	water: D`<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>`,
	feed: D`<path d="M7 20h10"></path><path d="M10 20c5.5-2.5.8-6.4 3-10"></path><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path>`
}, ot = (e, t = 16) => D`<svg class="icon" width=${t} height=${t} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${at[e]}</svg>`, st = [
	it,
	et,
	nt,
	tt
];
function ct(e, t) {
	e.setAttribute("font", t), t === "design" && $e(e.ownerDocument);
}
//#endregion
//#region src/data/time.ts
function lt(e) {
	return e.locale.time_zone === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : e.config.time_zone;
}
var ut = /* @__PURE__ */ new Map();
function dt(e, t) {
	let n = ut.get(t);
	n || (n = new Intl.DateTimeFormat("en-US", {
		timeZone: t,
		year: "numeric",
		month: "numeric",
		day: "numeric"
	}), ut.set(t, n));
	let r = Object.fromEntries(n.formatToParts(e).map((e) => [e.type, e.value]));
	return {
		year: Number(r.year),
		month: Number(r.month),
		day: Number(r.day)
	};
}
var ft = ({ year: e, month: t, day: n }) => Date.UTC(e, t - 1, n) / 864e5;
function pt(e, t, n) {
	return ft(dt(t, n)) - ft(dt(e, n));
}
function mt(e, t, n) {
	let { year: r, month: i, day: a } = dt(e, n), o = new Date(Date.UTC(r, i - 1, a + t));
	return {
		year: o.getUTCFullYear(),
		month: o.getUTCMonth() + 1,
		day: o.getUTCDate()
	};
}
//#endregion
//#region src/data/care.ts
var ht = 864e5, gt = {
	ok: 0,
	soon: 1,
	due: 2,
	overdue: 3
};
function _t(e, t) {
	let n = e.getTime() - t.getTime();
	return n <= -864e5 ? "overdue" : n <= 0 ? "due" : n <= ht ? "soon" : "ok";
}
function q(e, t) {
	if (e.status === null || !e.nextAt) return e.status;
	let n = _t(e.nextAt, t);
	return gt[n] > gt[e.status] ? n : e.status;
}
function vt(e, t) {
	return e.nextAt ? pt(t.now, e.nextAt, t.timeZone) : null;
}
function J(e, t) {
	let { t: n } = t, r = n(e.kind === "water" ? "care.water" : "care.feed"), i = vt(e, t), a = q(e, t.now), o = e.buttonEntityId ?? null, s = n(e.kind === "water" ? "log.water" : "log.feed");
	if (i === null || a === null || !e.nextAt) {
		let t = n("none");
		return {
			kind: e.kind,
			label: r,
			days: null,
			status: null,
			statusLabel: n("status.not_set"),
			big: t,
			unit: "",
			text: t,
			textLower: t,
			short: t,
			sub: "",
			progress: null,
			button: o,
			logLabel: s
		};
	}
	let c = Math.abs(i), l = Pe(e.nextAt, t.language, t.timeZone), u = t.dateFormat === "absolute", d = i === 0 ? n("today") : i === 1 ? n("tomorrow") : n(i > 1 ? "in_days" : "days_late", { n: c }), f = u && i > 1 ? l : d, p = i === 0 ? n("today_lower") : i === 1 ? n("tomorrow_lower") : f, ee = [i < 0 ? n("was_due", { date: l }) : i === 0 ? n("due_today") : u ? n("in_days", { n: c }) : l];
	return t.showInterval && e.intervalDays && ee.push(n("every_days", { n: e.intervalDays })), {
		kind: e.kind,
		label: r,
		days: i,
		status: a,
		statusLabel: n(`status.${a}`),
		big: i === 0 ? n("today") : String(c),
		unit: i === 0 ? "" : n(i < 0 ? "unit_late" : "unit_day", { n: c }),
		text: f,
		textLower: p,
		short: i === 0 ? n("today") : n(i > 0 ? "short_days" : "short_late", { n: c }),
		sub: ee.join(" · "),
		progress: e.intervalDays ? Math.max(0, Math.min(1, (e.intervalDays - i) / e.intervalDays)) : null,
		button: o,
		logLabel: s
	};
}
var yt = (e, t) => e === t ? 0 : e === null ? 1 : t === null ? -1 : e - t;
function bt(e, t) {
	let n = J(e.water, t), r = J(e.feed, t);
	return yt(n.days, r.days) <= 0 ? [n, r] : [r, n];
}
function xt(e, t) {
	let n = (e) => {
		let n = vt(e, t);
		return n === null || e.status === null ? -1 : Math.max(0, n);
	}, r = n(e.water), i = n(e.feed);
	return Array.from({ length: 15 }, (e, n) => ({
		day: mt(t.now, n, t.timeZone).day,
		isToday: n === 0,
		water: r === n,
		feed: i === n
	}));
}
function St(e, t) {
	let n = [e.water, e.feed].filter((e) => e.status !== null).map((e) => vt(e, t)).filter((e) => e !== null);
	return n.length ? Math.min(...n) : null;
}
function Ct(e, t) {
	let n = e.map((e) => ({
		plant: e,
		urgency: St(e, t)
	}));
	return n.sort((e, n) => yt(e.urgency, n.urgency) || e.plant.name.localeCompare(n.plant.name, t.language)), n.map((e) => e.plant);
}
function wt(e, t) {
	return [e.water, e.feed].map((e) => q(e, t)).some((e) => e === "due" || e === "overdue");
}
function Tt(e, t, n) {
	let r = e.filter((e) => wt(e, n)).length;
	return {
		countText: t("plants_count", { n: e.length }),
		attentionText: r ? t("need_care_today", { n: r }) : t("all_on_schedule")
	};
}
//#endregion
//#region src/data/clock.ts
var Et = () => /* @__PURE__ */ new Date(), Y = () => Et(), Dt = { action: "none" };
function Ot(e, t, n = {}) {
	let r = e.water.nextEntityId ?? e.feed.nextEntityId, i = e.water.buttonEntityId;
	return {
		entity: r,
		tap_action: n.tap_action ?? (r ? {
			action: "more-info",
			entity: r
		} : Dt),
		hold_action: n.hold_action ?? (i ? {
			action: "perform-action",
			perform_action: "button.press",
			target: { entity_id: i },
			confirmation: { text: t("confirm_water", { name: e.name }) }
		} : Dt)
	};
}
function kt(e, t, n, r) {
	let i = e[t].buttonEntityId;
	if (!i) return null;
	let a = n !== "due" && n !== "overdue", o = r(t === "water" ? "confirm_water" : "confirm_feed", { name: e.name });
	return {
		entity: i,
		tap_action: {
			action: "perform-action",
			perform_action: "button.press",
			target: { entity_id: i },
			...a ? { confirmation: { text: o } } : {}
		},
		hold_action: Dt
	};
}
function At(e) {
	let t = e.composedPath()[0], n = (t instanceof Element ? t.closest("[data-care]") : null)?.dataset.care;
	return n === "water" || n === "feed" ? n : null;
}
var jt = (e) => !!e && e.action !== "none";
function X(e, t, n) {
	jt(n === "tap" ? t.tap_action : t.hold_action) && e.dispatchEvent(new CustomEvent("hass-action", {
		bubbles: !0,
		composed: !0,
		detail: {
			config: t,
			action: n
		}
	}));
}
var Mt = 10;
function Nt(e, t) {
	let n, r, i = !1, a = null, o = (e) => {
		let t = e.composedPath()[0];
		return t instanceof Element ? t : null;
	}, s = () => {
		clearTimeout(n), n = void 0, r = void 0;
	}, c = (e) => !!o(e)?.closest("button"), l = (e) => {
		e.button !== 0 || c(e) || (i = !1, a = o(e), r = {
			x: e.clientX,
			y: e.clientY
		}, n = setTimeout(() => {
			i = !0, n = void 0, t("hold", a);
		}, 500));
	}, u = (e) => {
		r && Math.hypot(e.clientX - r.x, e.clientY - r.y) > Mt && (s(), i = !0);
	}, d = () => {
		let e = r !== void 0;
		s(), e && !i && t("tap", a);
	}, f = (e) => {
		(e.key === "Enter" || e.key === " ") && !c(e) && (e.preventDefault(), t("tap", o(e)));
	}, p = (e) => {
		(i || n) && e.preventDefault();
	};
	return e.addEventListener("pointerdown", l), e.addEventListener("pointermove", u), e.addEventListener("pointerup", d), e.addEventListener("pointercancel", s), e.addEventListener("pointerleave", s), e.addEventListener("keydown", f), e.addEventListener("contextmenu", p), () => {
		s(), e.removeEventListener("pointerdown", l), e.removeEventListener("pointermove", u), e.removeEventListener("pointerup", d), e.removeEventListener("pointercancel", s), e.removeEventListener("pointerleave", s), e.removeEventListener("keydown", f), e.removeEventListener("contextmenu", p);
	};
}
//#endregion
//#region src/cards/group/layouts.ts
var Pt = (e) => e.plants.length ? k : E`<div class="empty muted">${e.emptyText}</div>`, Ft = (e) => E`
  <div
    class="row plant"
    data-device=${e.plant.deviceId}
    role="button"
    tabindex="0"
    aria-label=${e.name}
  >
    <div class="thumb">${W({
	...e.photo,
	size: "sm"
})}</div>
    <div class="who">
      <span class="heading row-name">${e.name}</span>
      ${e.species ? E`<span class="species">${e.species}</span>` : k}
    </div>
    ${K(e.water, e.water.short, !0)} ${K(e.feed, e.feed.short, !0)}
  </div>
`, It = (e) => E`
  <div class="area-head">
    ${e.title === null ? k : E`<div class="area-title">
            <div class="label muted">${e.label}</div>
            <h2 class="heading area-name">${e.title}</h2>
          </div>`}
    <div class="summary">${e.countText}<br />${e.attentionText}</div>
  </div>
  ${e.plants.length ? E`<div class="row columns">
            <span></span><span>${e.t("plant")}</span><span>${e.t("care.water")}</span
            ><span>${e.t("care.feed")}</span>
          </div>
          ${e.plants.map(Ft)}` : Pt(e)}
`, Lt = (e, t) => E`
  <div
    class="cell plant ${t % 2 ? "right" : ""} ${t > 1 ? "lower" : ""}"
    data-device=${e.plant.deviceId}
    role="button"
    tabindex="0"
    aria-label=${e.name}
  >
    <div class="cell-photo">${W({
	...e.photo,
	size: "sm"
})}</div>
    <div class="heading row-name">${e.name}</div>
    <div class="cell-big">
      <span class="cell-icon" title=${e.water.label}>${ot("water", 15)}</span>
      <span class="number">${e.water.big}</span>
      ${e.water.unit ? E`<span class="unit">${e.water.unit}</span>` : k}
      <span class="cell-tag">${K(e.water)}</span>
    </div>
    <div class="cell-foot">
      <span class="cell-feed">${ot("feed", 15)}${e.feed.label} ${e.feed.textLower}</span>
      ${K(e.feed)}
    </div>
  </div>
`, Z = {
	list: It,
	grid: (e) => E`
  <div class="area-head bordered">
    ${e.title === null ? k : E`<h2 class="heading area-name">${e.title}</h2>`}
    <div class="summary">${e.attentionText}</div>
  </div>
  ${e.plants.length ? E`<div class="cells">${e.plants.map(Lt)}</div>` : Pt(e)}
`
}, Rt = o`
  h2 {
    margin: 0;
  }
  .area-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px 14px;
  }
  .area-head.bordered {
    border-bottom: 1px solid var(--pc-divider);
  }
  .area-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .area-name {
    font-size: 30px;
  }
  .summary {
    margin-left: auto;
    font-size: 12px;
    line-height: 1.4;
    text-align: right;
    color: var(--pc-muted);
  }
  .empty {
    padding: 0 18px 16px;
    font-size: 13px;
  }
  .plant {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .plant:focus-visible {
    outline: 2px solid var(--pc-accent);
    outline-offset: -2px;
  }
  .row-name {
    font-size: 18px;
  }

  /* 1e */
  .row {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 74px 74px;
    column-gap: 12px;
    align-items: center;
  }
  .row.columns {
    padding: 0 18px 6px;
    font: 500 10px/1 var(--pc-font-body);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .row.plant {
    padding: 10px 18px;
    border-top: 1px solid var(--pc-divider);
  }
  .thumb .photo {
    width: 44px;
    height: 44px;
    border: 1px solid var(--pc-divider);
  }
  .thumb .photo.hatch.sm {
    padding: 0;
  }
  .who {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .species {
    font-size: 11px;
    line-height: 1.2;
    color: var(--pc-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 1f */
  .cells {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 14px 16px 16px;
  }
  .cell.right {
    border-left: 1px solid var(--pc-divider);
  }
  .cell.lower {
    border-top: 1px solid var(--pc-divider);
  }
  .cell-photo .photo {
    height: 84px;
    border: 1px solid var(--pc-divider);
  }
  .cell-big {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .cell-big .number {
    font: 600 36px/0.85 var(--pc-font-heading);
    text-transform: uppercase;
  }
  .cell-big .unit {
    font: 500 12px/1 var(--pc-font-heading);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }
  .cell-tag {
    margin-left: auto;
  }
  .cell-icon {
    align-self: center;
    display: flex;
    color: var(--pc-muted);
  }
  .cell-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--pc-muted);
  }
  .cell-feed {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`, zt = ["urgency", "manual"];
function Bt(e, t, n) {
	let r = e.filter((e) => t.includes(e.deviceId)), i = e.filter((e) => !t.includes(e.deviceId)).sort((e, t) => e.name.localeCompare(t.name, n));
	return [...r, ...i];
}
function Vt(e, t) {
	let n = t.area ? e.areas[t.area] : void 0;
	if (t.area && !n) return null;
	let r = e.locale.language, i = L(r), a = {
		now: Y(),
		timeZone: lt(e),
		language: r,
		t: i,
		dateFormat: t.date_format ?? "relative",
		showInterval: !1
	}, o = Xe(e, t), s = t.sort === "manual" ? Bt(o, t.plants ?? [], r) : Ct(o, a), { countText: c, attentionText: l } = Tt(s, i, a.now);
	return {
		label: i(n ? "area" : "group"),
		title: t.show_name === !1 ? null : t.title || n?.name || i("plants"),
		countText: c,
		attentionText: l,
		emptyText: i(n ? "no_plants" : "no_plants_selected"),
		plants: s.map((e) => ({
			plant: e,
			name: e.name,
			species: e.species,
			photo: {
				src: t.images?.[e.deviceId] || e.image,
				style: t.photo_style ?? "duotone"
			},
			water: J(e.water, a),
			feed: J(e.feed, a)
		})),
		t: i
	};
}
//#endregion
//#region src/cards/update.ts
var Ht = (e, t, n) => n.some((n) => e.states[n] !== t.states[n]), Ut = (e, t) => e.locale !== t.locale || e.config.time_zone !== t.config.time_zone, Wt = {
	layout: "list",
	sort: "urgency",
	date_format: "relative",
	photo_style: "duotone",
	font: "design",
	show_name: !0
}, Gt = 6e4, Kt = class extends F {
	constructor(...e) {
		super(...e), this._tick = 0, this._onCareClick = (e) => {
			let t = At(e), n = e.composedPath()[0], r = this._plantAt(n instanceof Element ? n : null);
			if (!t || !r || !this.hass) return;
			let i = L(this.hass.locale.language), a = kt(r, t, q(r[t], Y()), i);
			a && X(this, a, "tap");
		};
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_tick: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("plant-care-group-card-editor");
	}
	static getStubConfig(e) {
		let t = e ? H(e) : [], n = /* @__PURE__ */ new Map();
		for (let { areaId: r } of t) r && e?.areas[r] && n.set(r, (n.get(r) ?? 0) + 1);
		let r = (t) => e?.areas[t]?.name ?? t, [i] = [...n].sort(([e, t], [n, i]) => i - t || r(e).localeCompare(r(n)));
		return i ? {
			area: i[0],
			layout: "list"
		} : t.length ? {
			plants: [t[0].deviceId],
			layout: "list"
		} : { area: "" };
	}
	setConfig(e) {
		if (!e.area && !e.plants?.length) throw Error("area or plants is required");
		if (e.plants && !Array.isArray(e.plants)) throw Error("plants must be a list of device IDs");
		if (e.layout && !(e.layout in Z)) throw Error(`layout must be one of: ${Object.keys(Z).join(", ")}`);
		if (e.sort && !zt.includes(e.sort)) throw Error(`sort must be one of: ${zt.join(", ")}`);
		this._config = {
			...Wt,
			...e
		}, this._view = void 0, ct(this, this._config.font ?? "design");
	}
	getCardSize() {
		let e = this._view?.plants.length ?? 0;
		return this._config?.layout === "grid" ? 2 + 3 * Math.ceil(e / 2) : 2 + e;
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	connectedCallback() {
		super.connectedCallback(), this._timer = setInterval(() => this._tick++, Gt), this._unbind = Nt(this, (e, t) => {
			let n = this._plantAt(t);
			if (n && this.hass) {
				let t = L(this.hass.locale.language);
				X(this, Ot(n, t, this._config), e);
			}
		}), this.addEventListener("click", this._onCareClick);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), clearInterval(this._timer), this._unbind?.(), this.removeEventListener("click", this._onCareClick);
	}
	_plantAt(e) {
		let t = e?.closest("[data-device]")?.dataset.device;
		return this._view?.plants.find((e) => e.plant.deviceId === t)?.plant;
	}
	shouldUpdate(e) {
		if (!e.has("hass") || e.size > 1) return !0;
		let t = e.get("hass"), n = this.hass;
		if (!t || !n || !this._config || !this._view) return !0;
		let r = this._config.area;
		return t.entities !== n.entities || t.devices !== n.devices || !!r && t.areas[r] !== n.areas[r] || Ut(t, n) || Ht(t, n, this._view.plants.flatMap((e) => Je(e.plant)));
	}
	willUpdate() {
		this.hass && this._config && (this._tick, this._view = Vt(this.hass, this._config));
	}
	render() {
		if (!this._config || !this.hass) return k;
		let e = this._view;
		if (!e) {
			let e = L(this.hass.locale.language);
			return E`<ha-card>
        ${U()}
        <div class="warning-text">${e("area_not_found", { name: this._config.area ?? "" })}</div>
      </ha-card>`;
		}
		return E`<ha-card>
      ${U()} ${Z[this._config.layout ?? "list"](e)}
    </ha-card>`;
	}
	static {
		this.styles = [
			st,
			Rt,
			o`
      .warning-text {
        padding: 16px 18px;
        font-size: 13px;
        color: var(--error-color, var(--pc-text));
      }
    `
		];
	}
}, qt = class extends Kt {}, Jt = class extends Le {
	constructor(...e) {
		super(...e), this.defaults = Wt, this.helpers = { photo_style: "editor.images_helper" };
	}
	schema(e) {
		return [
			{
				name: "area",
				selector: { area: { device: { integration: "plant_care" } } }
			},
			{
				name: "plants",
				selector: { device: {
					multiple: !0,
					filter: { integration: "plant_care" }
				} }
			},
			{
				name: "title",
				selector: { text: {} }
			},
			{
				name: "show_name",
				selector: { boolean: {} }
			},
			{
				type: "grid",
				name: "",
				schema: [R(e, "layout", Object.keys(Z)), R(e, "sort", zt)]
			},
			R(e, "date_format", ["relative", "absolute"]),
			z(e, "appearance", "mdi:palette", [R(e, "photo_style", ["duotone", "natural"]), R(e, "font", ["design", "theme"])]),
			z(e, "interactions", "mdi:gesture-tap", Fe())
		];
	}
}, Yt = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Xt = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Zt = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, Qt = "important", $t = " !" + Qt, en = Xt(class extends Zt {
	constructor(e) {
		if (super(e), e.type !== Yt.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return Object.keys(e).reduce((t, n) => {
			let r = e[n];
			return r == null ? t : t + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
		}, "");
	}
	update(e, [t]) {
		let { style: n } = e.element;
		if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
		for (let e of this.ft) t[e] ?? (this.ft.delete(e), e.includes("-") ? n.removeProperty(e) : n[e] = null);
		for (let e in t) {
			let r = t[e];
			if (r != null) {
				this.ft.add(e);
				let t = typeof r == "string" && r.endsWith($t);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? Qt : "") : n[e] = r;
			}
		}
		return O;
	}
}), tn = (e, t = 16) => E`<span class="label care-label">${ot(e.kind, t)}${e.label}</span>`, nn = (e) => E`<div class="big">
    <span class="number">${e.big}</span>${e.unit ? E`<span class="unit">${e.unit}</span>` : k}
  </div>`, rn = (e, t) => e.kicker ? E`<div class=${t}>${e.kicker}</div>` : k, Q = {
	header: (e) => E`
  <div class="header">
    <div class="header-photo">${W({
		...e.photo,
		label: e.t("plant_photo")
	})}</div>
    <div class="header-title">
      ${rn(e, "kicker")}
      <h2 class="heading name-lg">${e.name}</h2>
    </div>
    <div class="header-cares">
      ${[e.water, e.feed].map((e) => E`<div class="header-care ${e.kind}">
            <div class="care-row">${tn(e)}${K(e)}</div>
            ${nn(e)} ${e.sub ? E`<div class="sub">${e.sub}</div>` : k}
          </div>`)}
    </div>
  </div>
`,
	side: (e) => E`
  <div class="side">
    <div class="side-photo">${W({
		...e.photo,
		size: "sm",
		label: e.t("photo")
	})}</div>
    <div class="side-body">
      <div class="title">
        <h2 class="heading name-md">${e.name}</h2>
        ${rn(e, "meta")}
      </div>
      ${[e.water, e.feed].map((e) => E`<div class="side-care ${e.kind}">
            <div class="care-row">
              ${tn(e, 15)}${K(e)}
              <span class="heading side-text">${e.text}</span>
            </div>
            ${e.progress === null ? k : E`<div class="track">
                    <div
                      class="fill ${e.status === "overdue" ? "overdue" : ""}"
                      style=${en({ width: `${Math.round(e.progress * 100)}%` })}
                    ></div>
                  </div>`}
            ${e.sub ? E`<div class="sub small">${e.sub}</div>` : k}
          </div>`)}
    </div>
  </div>
`,
	countdown: (e) => E`
  <div class="countdown">
    <div class="countdown-head">
      <div class="title">
        <h2 class="heading name-md">${e.name}</h2>
        ${rn(e, "meta")}
      </div>
      <div class="countdown-photo">
        ${W({
		...e.photo,
		size: "sm",
		label: e.t("photo")
	})}
      </div>
    </div>
    <div class="hero">
      <div class="label hero-label">${e.t("next")} · ${e.next.label}${G(e.next)}</div>
      <div class="big hero-big">
        <span class="number">${e.next.big}</span>${e.next.unit ? E`<span class="unit">${e.next.unit}</span>` : k}
      </div>
      <div class="then">
        <span class="muted">${e.t("then", { label: e.then.label })}</span>
        <span class="then-text">${e.then.textLower}</span>${G(e.then)}
      </div>
    </div>
    <div class="ruler-block">
      <div class="ruler">
        ${e.ruler.map((e) => E`<div class="day ${e.isToday ? "today" : ""}">
              <span class="day-num">${e.day}</span>
              <div class="marks">
                ${e.feed ? E`<span class="mark feed"></span>` : k}
                ${e.water ? E`<span class="mark water"></span>` : k}
              </div>
            </div>`)}
      </div>
      <div class="legend">
        <span><span class="mark water"></span>${e.water.label}</span>
        <span><span class="mark feed"></span>${e.feed.label}</span>
        <span class="legend-range">${e.t("next_14_days")}</span>
      </div>
    </div>
  </div>
`
}, an = o`
  h2 {
    margin: 0;
  }
  .name-lg {
    font-size: 30px;
    letter-spacing: 0.01em;
  }
  .name-md {
    font-size: 24px;
  }
  .meta,
  .sub {
    font-size: 12px;
    line-height: 1.3;
    color: var(--pc-muted);
  }
  .sub.small {
    font-size: 11px;
    line-height: 1.2;
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .care-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .care-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .big {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .big .number {
    font: 600 52px/0.85 var(--pc-font-heading);
    text-transform: uppercase;
  }
  .big .unit {
    font: 500 15px/1 var(--pc-font-heading);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pc-muted);
  }

  /* 1a */
  .header-photo .photo {
    height: 176px;
    border-bottom: 1px solid var(--pc-divider);
  }
  .header-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 18px 14px;
  }
  .header-cares {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--pc-divider);
  }
  .header-care {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 14px 18px 16px;
  }
  .header-care + .header-care {
    border-left: 1px solid var(--pc-divider);
  }
  .header-care .care-row {
    justify-content: space-between;
  }

  /* 1b */
  .side {
    display: flex;
  }
  .side-photo {
    flex: none;
    width: 116px;
    border-right: 1px solid var(--pc-divider);
  }
  .side-photo .photo {
    height: 100%;
  }
  .side-photo .photo.hatch.sm {
    padding: 8px 10px;
  }
  .side-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px 16px 16px;
  }
  .side-care {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .side-text {
    margin-left: auto;
    font-size: 18px;
    white-space: nowrap;
  }
  .track {
    position: relative;
    height: 4px;
    background: var(--pc-divider);
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--pc-accent);
  }
  .fill.overdue {
    background: var(--pc-text);
  }

  /* 1c */
  .countdown {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 18px 16px;
  }
  .countdown-head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .countdown-head .title {
    flex: 1;
  }
  .countdown-photo {
    flex: none;
    width: 84px;
    height: 84px;
  }
  .countdown-photo .photo {
    height: 100%;
    border: 1px solid var(--pc-divider);
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: -30px;
  }
  .hero-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-big {
    gap: 8px;
  }
  .hero-big .number {
    font-size: 88px;
    line-height: 0.82;
  }
  .hero-big .unit {
    font-size: 22px;
  }
  .then {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.3;
  }
  .then-text {
    font-weight: 600;
  }
  .ruler-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ruler {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    border: 1px solid var(--pc-divider);
  }
  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
    color: var(--pc-muted);
  }
  .day + .day {
    border-left: 1px solid var(--pc-divider);
  }
  .day.today {
    background: var(--pc-accent-100);
    color: var(--pc-accent-800);
  }
  .day-num {
    font: 500 10px/1 var(--pc-font-body);
  }
  .marks {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 3px;
    height: 22px;
  }
  .mark {
    display: inline-block;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
  }
  .mark.water {
    background: var(--pc-accent);
  }
  .mark.feed {
    border: 1.5px solid var(--pc-accent);
  }
  .legend {
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: var(--pc-muted);
  }
  .legend > span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .legend-range {
    margin-left: auto;
  }
`;
//#endregion
//#region src/cards/plant/view.ts
function on(e, t, n) {
	let r = e.locale.language, i = L(r), a = {
		now: Y(),
		timeZone: lt(e),
		language: r,
		t: i,
		dateFormat: t.date_format ?? "relative",
		showInterval: t.show_interval ?? !0
	}, o = n.areaId ? e.areas[n.areaId]?.name : void 0, [s, c] = bt(n, a);
	return {
		name: n.name,
		kicker: [o, n.species].filter(Boolean).join(" · "),
		photo: {
			src: t.image || n.image,
			style: t.photo_style ?? "duotone"
		},
		water: J(n.water, a),
		feed: J(n.feed, a),
		next: s,
		then: c,
		ruler: xt(n, a),
		t: i
	};
}
//#endregion
//#region src/cards/plant-care-card.ts
var sn = {
	layout: "header",
	date_format: "relative",
	photo_style: "duotone",
	font: "design",
	show_interval: !0
}, cn = {
	header: 7,
	side: 4,
	countdown: 7
}, ln = 6e4, un = class extends F {
	constructor(...e) {
		super(...e), this._tick = 0, this._onCareClick = (e) => {
			let t = At(e), n = this._plant;
			if (!t || !n || !this.hass) return;
			let r = L(this.hass.locale.language), i = kt(n, t, q(n[t], Y()), r);
			i && X(this, i, "tap");
		};
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_tick: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("plant-care-card-editor");
	}
	static getStubConfig(e) {
		let [t] = e ? H(e).sort((e, t) => e.name.localeCompare(t.name)) : [];
		return t ? {
			device_id: t.deviceId,
			layout: "header"
		} : { device_id: "" };
	}
	setConfig(e) {
		if (!e.device_id) throw Error("device_id is required");
		if (e.layout && !(e.layout in Q)) throw Error(`layout must be one of: ${Object.keys(Q).join(", ")}`);
		this._config = {
			...sn,
			...e
		}, this._plant = void 0, ct(this, this._config.font ?? "design");
	}
	getCardSize() {
		return cn[this._config?.layout ?? "header"];
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	connectedCallback() {
		super.connectedCallback(), this._timer = setInterval(() => this._tick++, ln), this._unbind = Nt(this, (e) => {
			this._plant && this.hass && this._config && X(this, this._actions(this._plant), e);
		}), this.addEventListener("click", this._onCareClick);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), clearInterval(this._timer), this._unbind?.(), this.removeEventListener("click", this._onCareClick);
	}
	shouldUpdate(e) {
		if (!e.has("hass") || e.size > 1) return !0;
		let t = e.get("hass"), n = this.hass;
		if (!t || !n) return !0;
		if (!this._plant) return t.entities !== n.entities || t.devices !== n.devices;
		let r = this._plant;
		return Ht(t, n, Je(r)) || t.devices[r.deviceId] !== n.devices[r.deviceId] || !!r.areaId && t.areas[r.areaId] !== n.areas[r.areaId] || Ut(t, n);
	}
	willUpdate() {
		this.hass && this._config && (this._plant = Ye(this.hass, this._config.device_id));
	}
	_actions(e) {
		return Ot(e, L(this.hass.locale.language), this._config);
	}
	render() {
		if (!this._config || !this.hass) return k;
		let e = this._plant;
		if (!e) {
			let e = L(this.hass.locale.language);
			return E`<ha-card class="warning">
        ${U()}
        <div class="warning-text">${e("plant_not_found", { name: this._config.device_id })}</div>
      </ha-card>`;
		}
		this._tick;
		let t = on(this.hass, this._config, e), n = this._actions(e), r = jt(n.tap_action) || jt(n.hold_action);
		return E`<ha-card
      class=${r ? "interactive" : ""}
      role=${r ? "button" : k}
      tabindex=${r ? "0" : k}
      aria-label=${e.name}
    >
      ${U()} ${Q[this._config.layout ?? "header"](t)}
    </ha-card>`;
	}
	static {
		this.styles = [
			st,
			an,
			o`
      ha-card.interactive {
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      ha-card.interactive:focus-visible {
        outline: 2px solid var(--pc-accent);
        outline-offset: 2px;
      }
      .warning-text {
        padding: 16px 18px;
        font-size: 13px;
        color: var(--error-color, var(--pc-text));
      }
    `
		];
	}
}, dn = class extends Le {
	constructor(...e) {
		super(...e), this.defaults = sn;
	}
	schema(e) {
		return [
			{
				name: "device_id",
				required: !0,
				selector: { device: { filter: { integration: "plant_care" } } }
			},
			{
				type: "grid",
				name: "",
				schema: [R(e, "layout", Object.keys(Q)), R(e, "date_format", ["relative", "absolute"])]
			},
			z(e, "appearance", "mdi:palette", [
				R(e, "photo_style", ["duotone", "natural"]),
				R(e, "font", ["design", "theme"]),
				{
					name: "show_interval",
					selector: { boolean: {} }
				},
				{
					name: "image",
					selector: { text: {} }
				}
			]),
			z(e, "interactions", "mdi:gesture-tap", Fe())
		];
	}
};
//#endregion
//#region src/cards/suggest.ts
function fn(e, t) {
	let n = e.entities[t];
	if (n?.platform !== "plant_care" || !n.device_id) return null;
	let r = Ye(e, n.device_id);
	return r ? { config: {
		type: "custom:plant-care-card",
		device_id: r.deviceId
	} } : null;
}
//#endregion
//#region src/index.ts
var $ = (e, t) => {
	customElements.get(e) || customElements.define(e, t);
};
$("plant-care-card", un), $("plant-care-group-card", Kt), $("plant-care-area-card", qt), $("plant-care-card-editor", dn), $("plant-care-group-card-editor", Jt);
var pn = "https://github.com/shipulinlev/ha-plants-care-card#readme";
window.customCards = window.customCards ?? [], window.customCards.push({
	type: "plant-care-card",
	name: "Plant Care",
	description: "One plant: next watering and feeding.",
	preview: !0,
	documentationURL: pn,
	getEntitySuggestion: fn
}, {
	type: "plant-care-group-card",
	name: "Plant Care Group",
	description: "Plants from an area or ones you pick, most urgent first.",
	preview: !0,
	documentationURL: pn
});
//#endregion
