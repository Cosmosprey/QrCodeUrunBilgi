/* easyqrcodejs 4.6.2 (MIT, see LICENSE-easyqrcodejs.txt), wrapped as an ES module with esbuild. See README.md in this folder. */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/easyqrcodejs/dist/easy.qrcode.min.js
var require_easy_qrcode_min = __commonJS({
  "node_modules/easyqrcodejs/dist/easy.qrcode.min.js"(exports, module) {
    !(function() {
      "use strict";
      function a(a2, b2) {
        var c2, d2 = Object.keys(b2);
        for (c2 = 0; c2 < d2.length; c2++) a2 = a2.replace(new RegExp("\\{" + d2[c2] + "\\}", "gi"), b2[d2[c2]]);
        return a2;
      }
      function b(a2) {
        var b2, c2, d2;
        if (!a2) throw new Error("cannot create a random attribute name for an undefined object");
        b2 = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", c2 = "";
        do {
          for (c2 = "", d2 = 0; d2 < 12; d2++) c2 += b2[Math.floor(Math.random() * b2.length)];
        } while (a2[c2]);
        return c2;
      }
      function c(a2) {
        var b2 = { left: "start", right: "end", center: "middle", start: "start", end: "end" };
        return b2[a2] || b2.start;
      }
      function d(a2) {
        var b2 = { alphabetic: "alphabetic", hanging: "hanging", top: "text-before-edge", bottom: "text-after-edge", middle: "central" };
        return b2[a2] || b2.alphabetic;
      }
      var e, f, g, h, i;
      i = (function(a2, b2) {
        var c2, d2, e2, f2 = {};
        for (a2 = a2.split(","), b2 = b2 || 10, c2 = 0; c2 < a2.length; c2 += 2) d2 = "&" + a2[c2 + 1] + ";", e2 = parseInt(a2[c2], b2), f2[d2] = "&#" + e2 + ";";
        return f2["\\xa0"] = "&#160;", f2;
      })("50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro", 32), e = { strokeStyle: { svgAttr: "stroke", canvas: "#000000", svg: "none", apply: "stroke" }, fillStyle: { svgAttr: "fill", canvas: "#000000", svg: null, apply: "fill" }, lineCap: { svgAttr: "stroke-linecap", canvas: "butt", svg: "butt", apply: "stroke" }, lineJoin: { svgAttr: "stroke-linejoin", canvas: "miter", svg: "miter", apply: "stroke" }, miterLimit: { svgAttr: "stroke-miterlimit", canvas: 10, svg: 4, apply: "stroke" }, lineWidth: { svgAttr: "stroke-width", canvas: 1, svg: 1, apply: "stroke" }, globalAlpha: { svgAttr: "opacity", canvas: 1, svg: 1, apply: "fill stroke" }, font: { canvas: "10px sans-serif" }, shadowColor: { canvas: "#000000" }, shadowOffsetX: { canvas: 0 }, shadowOffsetY: { canvas: 0 }, shadowBlur: { canvas: 0 }, textAlign: { canvas: "start" }, textBaseline: { canvas: "alphabetic" }, lineDash: { svgAttr: "stroke-dasharray", canvas: [], svg: null, apply: "stroke" } }, g = function(a2, b2) {
        this.__root = a2, this.__ctx = b2;
      }, g.prototype.addColorStop = function(b2, c2) {
        var d2, e2, f2 = this.__ctx.__createElement("stop");
        f2.setAttribute("offset", b2), -1 !== c2.indexOf("rgba") ? (d2 = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi, e2 = d2.exec(c2), f2.setAttribute("stop-color", a("rgb({r},{g},{b})", { r: e2[1], g: e2[2], b: e2[3] })), f2.setAttribute("stop-opacity", e2[4])) : f2.setAttribute("stop-color", c2), this.__root.appendChild(f2);
      }, h = function(a2, b2) {
        this.__root = a2, this.__ctx = b2;
      }, f = function(a2) {
        var b2, c2 = { width: 500, height: 500, veiwBoxWidth: 500, veiwBoxHeight: 500, enableMirroring: false };
        if (arguments.length > 1 ? (b2 = c2, b2.width = arguments[0], b2.height = arguments[1], b2.veiwBoxWidth = arguments[2], b2.veiwBoxHeight = arguments[3]) : b2 = a2 || c2, !(this instanceof f)) return new f(b2);
        this.width = b2.width || c2.width, this.height = b2.height || c2.height, this.veiwBoxWidth = b2.veiwBoxWidth || this.width, this.veiwBoxHeight = b2.veiwBoxHeight || this.height, this.enableMirroring = void 0 !== b2.enableMirroring ? b2.enableMirroring : c2.enableMirroring, this.canvas = this, this.__document = b2.document || document, b2.ctx ? this.__ctx = b2.ctx : (this.__canvas = this.__document.createElement("canvas"), this.__ctx = this.__canvas.getContext("2d")), this.__setDefaultStyles(), this.__stack = [this.__getStyleState()], this.__groupStack = [], this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.__root.setAttribute("version", 1.1), this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink"), this.__root.setAttribute("width", this.width), this.__root.setAttribute("height", this.height), this.__root.setAttribute("viewBox", "0 0 " + this.veiwBoxWidth + " " + this.veiwBoxHeight), this.__ids = {}, this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs"), this.__root.appendChild(this.__defs), this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g"), this.__root.appendChild(this.__currentElement);
      }, f.prototype.__createElement = function(a2, b2, c2) {
        void 0 === b2 && (b2 = {});
        var d2, e2, f2 = this.__document.createElementNS("http://www.w3.org/2000/svg", a2), g2 = Object.keys(b2);
        for (c2 && (f2.setAttribute("fill", "none"), f2.setAttribute("stroke", "none")), d2 = 0; d2 < g2.length; d2++) e2 = g2[d2], f2.setAttribute(e2, b2[e2]);
        return f2;
      }, f.prototype.__setDefaultStyles = function() {
        var a2, b2, c2 = Object.keys(e);
        for (a2 = 0; a2 < c2.length; a2++) b2 = c2[a2], this[b2] = e[b2].canvas;
      }, f.prototype.__applyStyleState = function(a2) {
        var b2, c2, d2 = Object.keys(a2);
        for (b2 = 0; b2 < d2.length; b2++) c2 = d2[b2], this[c2] = a2[c2];
      }, f.prototype.__getStyleState = function() {
        var a2, b2, c2 = {}, d2 = Object.keys(e);
        for (a2 = 0; a2 < d2.length; a2++) b2 = d2[a2], c2[b2] = this[b2];
        return c2;
      }, f.prototype.__applyStyleToCurrentElement = function(b2) {
        var c2 = this.__currentElement, d2 = this.__currentElementsToStyle;
        d2 && (c2.setAttribute(b2, ""), c2 = d2.element, d2.children.forEach(function(a2) {
          a2.setAttribute(b2, "");
        }));
        var f2, i2, j2, k, l, m, n = Object.keys(e);
        for (f2 = 0; f2 < n.length; f2++) if (i2 = e[n[f2]], j2 = this[n[f2]], i2.apply) {
          if (j2 instanceof h) {
            if (j2.__ctx) for (; j2.__ctx.__defs.childNodes.length; ) k = j2.__ctx.__defs.childNodes[0].getAttribute("id"), this.__ids[k] = k, this.__defs.appendChild(j2.__ctx.__defs.childNodes[0]);
            c2.setAttribute(i2.apply, a("url(#{id})", { id: j2.__root.getAttribute("id") }));
          } else if (j2 instanceof g) c2.setAttribute(i2.apply, a("url(#{id})", { id: j2.__root.getAttribute("id") }));
          else if (-1 !== i2.apply.indexOf(b2) && i2.svg !== j2) if ("stroke" !== i2.svgAttr && "fill" !== i2.svgAttr || -1 === j2.indexOf("rgba")) {
            var o = i2.svgAttr;
            if ("globalAlpha" === n[f2] && (o = b2 + "-" + i2.svgAttr, c2.getAttribute(o))) continue;
            c2.setAttribute(o, j2);
          } else {
            l = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi, m = l.exec(j2), c2.setAttribute(i2.svgAttr, a("rgb({r},{g},{b})", { r: m[1], g: m[2], b: m[3] }));
            var p = m[4], q = this.globalAlpha;
            null != q && (p *= q), c2.setAttribute(i2.svgAttr + "-opacity", p);
          }
        }
      }, f.prototype.__closestGroupOrSvg = function(a2) {
        return a2 = a2 || this.__currentElement, "g" === a2.nodeName || "svg" === a2.nodeName ? a2 : this.__closestGroupOrSvg(a2.parentNode);
      }, f.prototype.getSerializedSvg = function(a2) {
        var b2, c2, d2, e2, f2, g2, h2 = new XMLSerializer().serializeToString(this.__root);
        if (g2 = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi, g2.test(h2) && (h2 = h2.replace('xmlns="http://www.w3.org/2000/svg', 'xmlns:xlink="http://www.w3.org/1999/xlink')), a2) for (b2 = Object.keys(i), c2 = 0; c2 < b2.length; c2++) d2 = b2[c2], e2 = i[d2], f2 = new RegExp(d2, "gi"), f2.test(h2) && (h2 = h2.replace(f2, e2));
        return h2;
      }, f.prototype.getSvg = function() {
        return this.__root;
      }, f.prototype.save = function() {
        var a2 = this.__createElement("g"), b2 = this.__closestGroupOrSvg();
        this.__groupStack.push(b2), b2.appendChild(a2), this.__currentElement = a2, this.__stack.push(this.__getStyleState());
      }, f.prototype.restore = function() {
        this.__currentElement = this.__groupStack.pop(), this.__currentElementsToStyle = null, this.__currentElement || (this.__currentElement = this.__root.childNodes[1]);
        var a2 = this.__stack.pop();
        this.__applyStyleState(a2);
      }, f.prototype.__addTransform = function(a2) {
        var b2 = this.__closestGroupOrSvg();
        if (b2.childNodes.length > 0) {
          "path" === this.__currentElement.nodeName && (this.__currentElementsToStyle || (this.__currentElementsToStyle = { element: b2, children: [] }), this.__currentElementsToStyle.children.push(this.__currentElement), this.__applyCurrentDefaultPath());
          var c2 = this.__createElement("g");
          b2.appendChild(c2), this.__currentElement = c2;
        }
        var d2 = this.__currentElement.getAttribute("transform");
        d2 ? d2 += " " : d2 = "", d2 += a2, this.__currentElement.setAttribute("transform", d2);
      }, f.prototype.scale = function(b2, c2) {
        void 0 === c2 && (c2 = b2), this.__addTransform(a("scale({x},{y})", { x: b2, y: c2 }));
      }, f.prototype.rotate = function(b2) {
        var c2 = 180 * b2 / Math.PI;
        this.__addTransform(a("rotate({angle},{cx},{cy})", { angle: c2, cx: 0, cy: 0 }));
      }, f.prototype.translate = function(b2, c2) {
        this.__addTransform(a("translate({x},{y})", { x: b2, y: c2 }));
      }, f.prototype.transform = function(b2, c2, d2, e2, f2, g2) {
        this.__addTransform(a("matrix({a},{b},{c},{d},{e},{f})", { a: b2, b: c2, c: d2, d: e2, e: f2, f: g2 }));
      }, f.prototype.beginPath = function() {
        var a2, b2;
        this.__currentDefaultPath = "", this.__currentPosition = {}, a2 = this.__createElement("path", {}, true), b2 = this.__closestGroupOrSvg(), b2.appendChild(a2), this.__currentElement = a2;
      }, f.prototype.__applyCurrentDefaultPath = function() {
        var a2 = this.__currentElement;
        "path" === a2.nodeName ? a2.setAttribute("d", this.__currentDefaultPath) : console.error("Attempted to apply path command to node", a2.nodeName);
      }, f.prototype.__addPathCommand = function(a2) {
        this.__currentDefaultPath += " ", this.__currentDefaultPath += a2;
      }, f.prototype.moveTo = function(b2, c2) {
        "path" !== this.__currentElement.nodeName && this.beginPath(), this.__currentPosition = { x: b2, y: c2 }, this.__addPathCommand(a("M {x} {y}", { x: b2, y: c2 }));
      }, f.prototype.closePath = function() {
        this.__currentDefaultPath && this.__addPathCommand("Z");
      }, f.prototype.lineTo = function(b2, c2) {
        this.__currentPosition = { x: b2, y: c2 }, this.__currentDefaultPath.indexOf("M") > -1 ? this.__addPathCommand(a("L {x} {y}", { x: b2, y: c2 })) : this.__addPathCommand(a("M {x} {y}", { x: b2, y: c2 }));
      }, f.prototype.bezierCurveTo = function(b2, c2, d2, e2, f2, g2) {
        this.__currentPosition = { x: f2, y: g2 }, this.__addPathCommand(a("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}", { cp1x: b2, cp1y: c2, cp2x: d2, cp2y: e2, x: f2, y: g2 }));
      }, f.prototype.quadraticCurveTo = function(b2, c2, d2, e2) {
        this.__currentPosition = { x: d2, y: e2 }, this.__addPathCommand(a("Q {cpx} {cpy} {x} {y}", { cpx: b2, cpy: c2, x: d2, y: e2 }));
      };
      var j = function(a2) {
        var b2 = Math.sqrt(a2[0] * a2[0] + a2[1] * a2[1]);
        return [a2[0] / b2, a2[1] / b2];
      };
      f.prototype.arcTo = function(a2, b2, c2, d2, e2) {
        var f2 = this.__currentPosition && this.__currentPosition.x, g2 = this.__currentPosition && this.__currentPosition.y;
        if (void 0 !== f2 && void 0 !== g2) {
          if (e2 < 0) throw new Error("IndexSizeError: The radius provided (" + e2 + ") is negative.");
          if (f2 === a2 && g2 === b2 || a2 === c2 && b2 === d2 || 0 === e2) return void this.lineTo(a2, b2);
          var h2 = j([f2 - a2, g2 - b2]), i2 = j([c2 - a2, d2 - b2]);
          if (h2[0] * i2[1] == h2[1] * i2[0]) return void this.lineTo(a2, b2);
          var k = h2[0] * i2[0] + h2[1] * i2[1], l = Math.acos(Math.abs(k)), m = j([h2[0] + i2[0], h2[1] + i2[1]]), n = e2 / Math.sin(l / 2), o = a2 + n * m[0], p = b2 + n * m[1], q = [-h2[1], h2[0]], r = [i2[1], -i2[0]], s = function(a3) {
            var b3 = a3[0];
            return a3[1] >= 0 ? Math.acos(b3) : -Math.acos(b3);
          }, t = s(q), u = s(r);
          this.lineTo(o + q[0] * e2, p + q[1] * e2), this.arc(o, p, e2, t, u);
        }
      }, f.prototype.stroke = function() {
        "path" === this.__currentElement.nodeName && this.__currentElement.setAttribute("paint-order", "fill stroke markers"), this.__applyCurrentDefaultPath(), this.__applyStyleToCurrentElement("stroke");
      }, f.prototype.fill = function() {
        "path" === this.__currentElement.nodeName && this.__currentElement.setAttribute("paint-order", "stroke fill markers"), this.__applyCurrentDefaultPath(), this.__applyStyleToCurrentElement("fill");
      }, f.prototype.rect = function(a2, b2, c2, d2) {
        "path" !== this.__currentElement.nodeName && this.beginPath(), this.moveTo(a2, b2), this.lineTo(a2 + c2, b2), this.lineTo(a2 + c2, b2 + d2), this.lineTo(a2, b2 + d2), this.lineTo(a2, b2), this.closePath();
      }, f.prototype.fillRect = function(a2, b2, c2, d2) {
        var e2, f2;
        e2 = this.__createElement("rect", { x: a2, y: b2, width: c2, height: d2, "shape-rendering": "crispEdges" }, true), f2 = this.__closestGroupOrSvg(), f2.appendChild(e2), this.__currentElement = e2, this.__applyStyleToCurrentElement("fill");
      }, f.prototype.strokeRect = function(a2, b2, c2, d2) {
        var e2, f2;
        e2 = this.__createElement("rect", { x: a2, y: b2, width: c2, height: d2 }, true), f2 = this.__closestGroupOrSvg(), f2.appendChild(e2), this.__currentElement = e2, this.__applyStyleToCurrentElement("stroke");
      }, f.prototype.__clearCanvas = function() {
        for (var a2 = this.__closestGroupOrSvg(), b2 = a2.getAttribute("transform"), c2 = this.__root.childNodes[1], d2 = c2.childNodes, e2 = d2.length - 1; e2 >= 0; e2--) d2[e2] && c2.removeChild(d2[e2]);
        this.__currentElement = c2, this.__groupStack = [], b2 && this.__addTransform(b2);
      }, f.prototype.clearRect = function(a2, b2, c2, d2) {
        if (0 === a2 && 0 === b2 && c2 === this.width && d2 === this.height) return void this.__clearCanvas();
        var e2, f2 = this.__closestGroupOrSvg();
        e2 = this.__createElement("rect", { x: a2, y: b2, width: c2, height: d2, fill: "#FFFFFF" }, true), f2.appendChild(e2);
      }, f.prototype.createLinearGradient = function(a2, c2, d2, e2) {
        var f2 = this.__createElement("linearGradient", { id: b(this.__ids), x1: a2 + "px", x2: d2 + "px", y1: c2 + "px", y2: e2 + "px", gradientUnits: "userSpaceOnUse" }, false);
        return this.__defs.appendChild(f2), new g(f2, this);
      }, f.prototype.createRadialGradient = function(a2, c2, d2, e2, f2, h2) {
        var i2 = this.__createElement("radialGradient", { id: b(this.__ids), cx: e2 + "px", cy: f2 + "px", r: h2 + "px", fx: a2 + "px", fy: c2 + "px", gradientUnits: "userSpaceOnUse" }, false);
        return this.__defs.appendChild(i2), new g(i2, this);
      }, f.prototype.__parseFont = function() {
        var a2 = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\'\"\sa-z0-9]+?)\s*$/i, b2 = a2.exec(this.font), c2 = { style: b2[1] || "normal", size: b2[4] || "10px", family: b2[6] || "sans-serif", weight: b2[3] || "normal", decoration: b2[2] || "normal", href: null };
        return "underline" === this.__fontUnderline && (c2.decoration = "underline"), this.__fontHref && (c2.href = this.__fontHref), c2;
      }, f.prototype.__wrapTextLink = function(a2, b2) {
        if (a2.href) {
          var c2 = this.__createElement("a");
          return c2.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", a2.href), c2.appendChild(b2), c2;
        }
        return b2;
      }, f.prototype.__applyText = function(a2, b2, e2, f2) {
        var g2 = this.__parseFont(), h2 = this.__closestGroupOrSvg(), i2 = this.__createElement("text", { "font-family": g2.family, "font-size": g2.size, "font-style": g2.style, "font-weight": g2.weight, "text-decoration": g2.decoration, x: b2, y: e2, "text-anchor": c(this.textAlign), "dominant-baseline": d(this.textBaseline) }, true);
        i2.appendChild(this.__document.createTextNode(a2)), this.__currentElement = i2, this.__applyStyleToCurrentElement(f2), h2.appendChild(this.__wrapTextLink(g2, i2));
      }, f.prototype.fillText = function(a2, b2, c2) {
        this.__applyText(a2, b2, c2, "fill");
      }, f.prototype.strokeText = function(a2, b2, c2) {
        this.__applyText(a2, b2, c2, "stroke");
      }, f.prototype.measureText = function(a2) {
        return this.__ctx.font = this.font, this.__ctx.measureText(a2);
      }, f.prototype.arc = function(b2, c2, d2, e2, f2, g2) {
        if (e2 !== f2) {
          e2 %= 2 * Math.PI, f2 %= 2 * Math.PI, e2 === f2 && (f2 = (f2 + 2 * Math.PI - 1e-3 * (g2 ? -1 : 1)) % (2 * Math.PI));
          var h2 = b2 + d2 * Math.cos(f2), i2 = c2 + d2 * Math.sin(f2), j2 = b2 + d2 * Math.cos(e2), k = c2 + d2 * Math.sin(e2), l = g2 ? 0 : 1, m = 0, n = f2 - e2;
          n < 0 && (n += 2 * Math.PI), m = g2 ? n > Math.PI ? 0 : 1 : n > Math.PI ? 1 : 0, this.lineTo(j2, k), this.__addPathCommand(a("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}", { rx: d2, ry: d2, xAxisRotation: 0, largeArcFlag: m, sweepFlag: l, endX: h2, endY: i2 })), this.__currentPosition = { x: h2, y: i2 };
        }
      }, f.prototype.clip = function() {
        var c2 = this.__closestGroupOrSvg(), d2 = this.__createElement("clipPath"), e2 = b(this.__ids), f2 = this.__createElement("g");
        this.__applyCurrentDefaultPath(), c2.removeChild(this.__currentElement), d2.setAttribute("id", e2), d2.appendChild(this.__currentElement), this.__defs.appendChild(d2), c2.setAttribute("clip-path", a("url(#{id})", { id: e2 })), c2.appendChild(f2), this.__currentElement = f2;
      }, f.prototype.drawImage = function() {
        var a2, b2, c2, d2, e2, g2, h2, i2, j2, k, l, m, n, o, p = Array.prototype.slice.call(arguments), q = p[0], r = 0, s = 0;
        if (3 === p.length) a2 = p[1], b2 = p[2], e2 = q.width, g2 = q.height, c2 = e2, d2 = g2;
        else if (5 === p.length) a2 = p[1], b2 = p[2], c2 = p[3], d2 = p[4], e2 = q.width, g2 = q.height;
        else {
          if (9 !== p.length) throw new Error("Invalid number of arguments passed to drawImage: " + arguments.length);
          r = p[1], s = p[2], e2 = p[3], g2 = p[4], a2 = p[5], b2 = p[6], c2 = p[7], d2 = p[8];
        }
        h2 = this.__closestGroupOrSvg(), this.__currentElement;
        var t = "translate(" + a2 + ", " + b2 + ")";
        if (q instanceof f) {
          if (i2 = q.getSvg().cloneNode(true), i2.childNodes && i2.childNodes.length > 1) {
            for (j2 = i2.childNodes[0]; j2.childNodes.length; ) o = j2.childNodes[0].getAttribute("id"), this.__ids[o] = o, this.__defs.appendChild(j2.childNodes[0]);
            if (k = i2.childNodes[1]) {
              var u, v = k.getAttribute("transform");
              u = v ? v + " " + t : t, k.setAttribute("transform", u), h2.appendChild(k);
            }
          }
        } else "CANVAS" !== q.nodeName && "IMG" !== q.nodeName || (l = this.__createElement("image"), l.setAttribute("width", c2), l.setAttribute("height", d2), l.setAttribute("preserveAspectRatio", "none"), l.setAttribute("opacity", this.globalAlpha), (r || s || e2 !== q.width || g2 !== q.height) && (m = this.__document.createElement("canvas"), m.width = c2, m.height = d2, n = m.getContext("2d"), n.drawImage(q, r, s, e2, g2, 0, 0, c2, d2), q = m), l.setAttribute("transform", t), l.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "CANVAS" === q.nodeName ? q.toDataURL() : q.originalSrc), h2.appendChild(l));
      }, f.prototype.createPattern = function(a2, c2) {
        var d2, e2 = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"), g2 = b(this.__ids);
        return e2.setAttribute("id", g2), e2.setAttribute("width", a2.width), e2.setAttribute("height", a2.height), "CANVAS" === a2.nodeName || "IMG" === a2.nodeName ? (d2 = this.__document.createElementNS("http://www.w3.org/2000/svg", "image"), d2.setAttribute("width", a2.width), d2.setAttribute("height", a2.height), d2.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "CANVAS" === a2.nodeName ? a2.toDataURL() : a2.getAttribute("src")), e2.appendChild(d2), this.__defs.appendChild(e2)) : a2 instanceof f && (e2.appendChild(a2.__root.childNodes[1]), this.__defs.appendChild(e2)), new h(e2, this);
      }, f.prototype.setLineDash = function(a2) {
        a2 && a2.length > 0 ? this.lineDash = a2.join(",") : this.lineDash = null;
      }, f.prototype.drawFocusRing = function() {
      }, f.prototype.createImageData = function() {
      }, f.prototype.getImageData = function() {
      }, f.prototype.putImageData = function() {
      }, f.prototype.globalCompositeOperation = function() {
      }, f.prototype.setTransform = function() {
      }, "object" == typeof window && (window.C2S = f), "object" == typeof module && "object" == typeof module.exports && (module.exports = f);
    })(), function() {
      "use strict";
      function a(a2, b2, c2) {
        if (this.mode = q.MODE_8BIT_BYTE, this.data = a2, this.parsedData = [], b2) {
          for (var d2 = 0, e2 = this.data.length; d2 < e2; d2++) {
            var f2 = [], g2 = this.data.charCodeAt(d2);
            f2[0] = g2, this.parsedData.push(f2);
          }
          this.parsedData = Array.prototype.concat.apply([], this.parsedData);
        } else this.parsedData = (function(a3) {
          for (var b3 = [], c3 = 0; c3 < a3.length; c3++) {
            var d3 = a3.charCodeAt(c3);
            d3 < 128 ? b3.push(d3) : d3 < 2048 ? b3.push(192 | d3 >> 6, 128 | 63 & d3) : d3 < 55296 || d3 >= 57344 ? b3.push(224 | d3 >> 12, 128 | d3 >> 6 & 63, 128 | 63 & d3) : (c3++, d3 = 65536 + ((1023 & d3) << 10 | 1023 & a3.charCodeAt(c3)), b3.push(240 | d3 >> 18, 128 | d3 >> 12 & 63, 128 | d3 >> 6 & 63, 128 | 63 & d3));
          }
          return b3;
        })(a2);
        this.parsedData = Array.prototype.concat.apply([], this.parsedData), c2 || this.parsedData.length == this.data.length || (this.parsedData.unshift(191), this.parsedData.unshift(187), this.parsedData.unshift(239));
      }
      function b(a2, b2) {
        this.typeNumber = a2, this.errorCorrectLevel = b2, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.dataList = [];
      }
      function c(a2, b2) {
        if (a2.length == i) throw new Error(a2.length + "/" + b2);
        for (var c2 = 0; c2 < a2.length && 0 == a2[c2]; ) c2++;
        this.num = new Array(a2.length - c2 + b2);
        for (var d2 = 0; d2 < a2.length - c2; d2++) this.num[d2] = a2[d2 + c2];
      }
      function d(a2, b2) {
        this.totalCount = a2, this.dataCount = b2;
      }
      function e() {
        this.buffer = [], this.length = 0;
      }
      function f() {
        var a2 = false, b2 = navigator.userAgent;
        if (/android/i.test(b2)) {
          a2 = true;
          var c2 = b2.toString().match(/android ([0-9]\.[0-9])/i);
          c2 && c2[1] && (a2 = parseFloat(c2[1]));
        }
        return a2;
      }
      function g(a2, b2) {
        for (var c2 = b2.correctLevel, d2 = 1, e2 = h(a2), f2 = 0, g2 = w.length; f2 < g2; f2++) {
          var i2 = 0;
          switch (c2) {
            case r.L:
              i2 = w[f2][0];
              break;
            case r.M:
              i2 = w[f2][1];
              break;
            case r.Q:
              i2 = w[f2][2];
              break;
            case r.H:
              i2 = w[f2][3];
          }
          if (e2 <= i2) break;
          d2++;
        }
        if (d2 > w.length) throw new Error("Too long data. the CorrectLevel." + ["M", "L", "H", "Q"][c2] + " limit length is " + i2);
        return 0 != b2.version && (d2 <= b2.version ? (d2 = b2.version, b2.runVersion = d2) : (console.warn("QR Code version " + b2.version + " too small, run version use " + d2), b2.runVersion = d2)), d2;
      }
      function h(a2) {
        return encodeURI(a2).toString().replace(/\%[0-9a-fA-F]{2}/g, "a").length;
      }
      var i, j, k = "object" == typeof global && global && global.Object === Object && global, l = "object" == typeof self && self && self.Object === Object && self, m = k || l || Function("return this")(), n = "object" == typeof exports && exports && !exports.nodeType && exports, o = n && "object" == typeof module && module && !module.nodeType && module, p = m.QRCode;
      a.prototype = { getLength: function(a2) {
        return this.parsedData.length;
      }, write: function(a2) {
        for (var b2 = 0, c2 = this.parsedData.length; b2 < c2; b2++) a2.put(this.parsedData[b2], 8);
      } }, b.prototype = { addData: function(b2, c2, d2) {
        var e2 = new a(b2, c2, d2);
        this.dataList.push(e2), this.dataCache = null;
      }, isDark: function(a2, b2) {
        if (a2 < 0 || this.moduleCount <= a2 || b2 < 0 || this.moduleCount <= b2) throw new Error(a2 + "," + b2);
        return this.modules[a2][b2][0];
      }, getEye: function(a2, b2) {
        if (a2 < 0 || this.moduleCount <= a2 || b2 < 0 || this.moduleCount <= b2) throw new Error(a2 + "," + b2);
        var c2 = this.modules[a2][b2];
        if (c2[1]) {
          var d2 = "P" + c2[1] + "_" + c2[2];
          return "A" == c2[2] && (d2 = "A" + c2[1]), { isDark: c2[0], type: d2 };
        }
        return null;
      }, getModuleCount: function() {
        return this.moduleCount;
      }, make: function() {
        this.makeImpl(false, this.getBestMaskPattern());
      }, makeImpl: function(a2, c2) {
        this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount);
        for (var d2 = 0; d2 < this.moduleCount; d2++) {
          this.modules[d2] = new Array(this.moduleCount);
          for (var e2 = 0; e2 < this.moduleCount; e2++) this.modules[d2][e2] = [];
        }
        this.setupPositionProbePattern(0, 0, "TL"), this.setupPositionProbePattern(this.moduleCount - 7, 0, "BL"), this.setupPositionProbePattern(0, this.moduleCount - 7, "TR"), this.setupPositionAdjustPattern("A"), this.setupTimingPattern(), this.setupTypeInfo(a2, c2), this.typeNumber >= 7 && this.setupTypeNumber(a2), null == this.dataCache && (this.dataCache = b.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, c2);
      }, setupPositionProbePattern: function(a2, b2, c2) {
        for (var d2 = -1; d2 <= 7; d2++) if (!(a2 + d2 <= -1 || this.moduleCount <= a2 + d2)) for (var e2 = -1; e2 <= 7; e2++) b2 + e2 <= -1 || this.moduleCount <= b2 + e2 || (0 <= d2 && d2 <= 6 && (0 == e2 || 6 == e2) || 0 <= e2 && e2 <= 6 && (0 == d2 || 6 == d2) || 2 <= d2 && d2 <= 4 && 2 <= e2 && e2 <= 4 ? (this.modules[a2 + d2][b2 + e2][0] = true, this.modules[a2 + d2][b2 + e2][2] = c2, this.modules[a2 + d2][b2 + e2][1] = -0 == d2 || -0 == e2 || 6 == d2 || 6 == e2 ? "O" : "I") : this.modules[a2 + d2][b2 + e2][0] = false);
      }, getBestMaskPattern: function() {
        for (var a2 = 0, b2 = 0, c2 = 0; c2 < 8; c2++) {
          this.makeImpl(true, c2);
          var d2 = t.getLostPoint(this);
          (0 == c2 || a2 > d2) && (a2 = d2, b2 = c2);
        }
        return b2;
      }, createMovieClip: function(a2, b2, c2) {
        var d2 = a2.createEmptyMovieClip(b2, c2);
        this.make();
        for (var e2 = 0; e2 < this.modules.length; e2++) for (var f2 = 1 * e2, g2 = 0; g2 < this.modules[e2].length; g2++) {
          var h2 = 1 * g2, i2 = this.modules[e2][g2][0];
          i2 && (d2.beginFill(0, 100), d2.moveTo(h2, f2), d2.lineTo(h2 + 1, f2), d2.lineTo(h2 + 1, f2 + 1), d2.lineTo(h2, f2 + 1), d2.endFill());
        }
        return d2;
      }, setupTimingPattern: function() {
        for (var a2 = 8; a2 < this.moduleCount - 8; a2++) null == this.modules[a2][6][0] && (this.modules[a2][6][0] = a2 % 2 == 0);
        for (var b2 = 8; b2 < this.moduleCount - 8; b2++) null == this.modules[6][b2][0] && (this.modules[6][b2][0] = b2 % 2 == 0);
      }, setupPositionAdjustPattern: function(a2) {
        for (var b2 = t.getPatternPosition(this.typeNumber), c2 = 0; c2 < b2.length; c2++) for (var d2 = 0; d2 < b2.length; d2++) {
          var e2 = b2[c2], f2 = b2[d2];
          if (null == this.modules[e2][f2][0]) for (var g2 = -2; g2 <= 2; g2++) for (var h2 = -2; h2 <= 2; h2++) -2 == g2 || 2 == g2 || -2 == h2 || 2 == h2 || 0 == g2 && 0 == h2 ? (this.modules[e2 + g2][f2 + h2][0] = true, this.modules[e2 + g2][f2 + h2][2] = a2, this.modules[e2 + g2][f2 + h2][1] = -2 == g2 || -2 == h2 || 2 == g2 || 2 == h2 ? "O" : "I") : this.modules[e2 + g2][f2 + h2][0] = false;
        }
      }, setupTypeNumber: function(a2) {
        for (var b2 = t.getBCHTypeNumber(this.typeNumber), c2 = 0; c2 < 18; c2++) {
          var d2 = !a2 && 1 == (b2 >> c2 & 1);
          this.modules[Math.floor(c2 / 3)][c2 % 3 + this.moduleCount - 8 - 3][0] = d2;
        }
        for (var c2 = 0; c2 < 18; c2++) {
          var d2 = !a2 && 1 == (b2 >> c2 & 1);
          this.modules[c2 % 3 + this.moduleCount - 8 - 3][Math.floor(c2 / 3)][0] = d2;
        }
      }, setupTypeInfo: function(a2, b2) {
        for (var c2 = this.errorCorrectLevel << 3 | b2, d2 = t.getBCHTypeInfo(c2), e2 = 0; e2 < 15; e2++) {
          var f2 = !a2 && 1 == (d2 >> e2 & 1);
          e2 < 6 ? this.modules[e2][8][0] = f2 : e2 < 8 ? this.modules[e2 + 1][8][0] = f2 : this.modules[this.moduleCount - 15 + e2][8][0] = f2;
        }
        for (var e2 = 0; e2 < 15; e2++) {
          var f2 = !a2 && 1 == (d2 >> e2 & 1);
          e2 < 8 ? this.modules[8][this.moduleCount - e2 - 1][0] = f2 : e2 < 9 ? this.modules[8][15 - e2 - 1 + 1][0] = f2 : this.modules[8][15 - e2 - 1][0] = f2;
        }
        this.modules[this.moduleCount - 8][8][0] = !a2;
      }, mapData: function(a2, b2) {
        for (var c2 = -1, d2 = this.moduleCount - 1, e2 = 7, f2 = 0, g2 = this.moduleCount - 1; g2 > 0; g2 -= 2) for (6 == g2 && g2--; ; ) {
          for (var h2 = 0; h2 < 2; h2++) if (null == this.modules[d2][g2 - h2][0]) {
            var i2 = false;
            f2 < a2.length && (i2 = 1 == (a2[f2] >>> e2 & 1));
            var j2 = t.getMask(b2, d2, g2 - h2);
            j2 && (i2 = !i2), this.modules[d2][g2 - h2][0] = i2, e2--, -1 == e2 && (f2++, e2 = 7);
          }
          if ((d2 += c2) < 0 || this.moduleCount <= d2) {
            d2 -= c2, c2 = -c2;
            break;
          }
        }
      } }, b.PAD0 = 236, b.PAD1 = 17, b.createData = function(a2, c2, f2) {
        for (var g2 = d.getRSBlocks(a2, c2), h2 = new e(), i2 = 0; i2 < f2.length; i2++) {
          var j2 = f2[i2];
          h2.put(j2.mode, 4), h2.put(j2.getLength(), t.getLengthInBits(j2.mode, a2)), j2.write(h2);
        }
        for (var k2 = 0, i2 = 0; i2 < g2.length; i2++) k2 += g2[i2].dataCount;
        if (h2.getLengthInBits() > 8 * k2) throw new Error("code length overflow. (" + h2.getLengthInBits() + ">" + 8 * k2 + ")");
        for (h2.getLengthInBits() + 4 <= 8 * k2 && h2.put(0, 4); h2.getLengthInBits() % 8 != 0; ) h2.putBit(false);
        for (; ; ) {
          if (h2.getLengthInBits() >= 8 * k2) break;
          if (h2.put(b.PAD0, 8), h2.getLengthInBits() >= 8 * k2) break;
          h2.put(b.PAD1, 8);
        }
        return b.createBytes(h2, g2);
      }, b.createBytes = function(a2, b2) {
        for (var d2 = 0, e2 = 0, f2 = 0, g2 = new Array(b2.length), h2 = new Array(b2.length), i2 = 0; i2 < b2.length; i2++) {
          var j2 = b2[i2].dataCount, k2 = b2[i2].totalCount - j2;
          e2 = Math.max(e2, j2), f2 = Math.max(f2, k2), g2[i2] = new Array(j2);
          for (var l2 = 0; l2 < g2[i2].length; l2++) g2[i2][l2] = 255 & a2.buffer[l2 + d2];
          d2 += j2;
          var m2 = t.getErrorCorrectPolynomial(k2), n2 = new c(g2[i2], m2.getLength() - 1), o2 = n2.mod(m2);
          h2[i2] = new Array(m2.getLength() - 1);
          for (var l2 = 0; l2 < h2[i2].length; l2++) {
            var p2 = l2 + o2.getLength() - h2[i2].length;
            h2[i2][l2] = p2 >= 0 ? o2.get(p2) : 0;
          }
        }
        for (var q2 = 0, l2 = 0; l2 < b2.length; l2++) q2 += b2[l2].totalCount;
        for (var r2 = new Array(q2), s2 = 0, l2 = 0; l2 < e2; l2++) for (var i2 = 0; i2 < b2.length; i2++) l2 < g2[i2].length && (r2[s2++] = g2[i2][l2]);
        for (var l2 = 0; l2 < f2; l2++) for (var i2 = 0; i2 < b2.length; i2++) l2 < h2[i2].length && (r2[s2++] = h2[i2][l2]);
        return r2;
      };
      for (var q = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 }, r = { L: 1, M: 0, Q: 3, H: 2 }, s = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 }, t = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo: function(a2) {
        for (var b2 = a2 << 10; t.getBCHDigit(b2) - t.getBCHDigit(t.G15) >= 0; ) b2 ^= t.G15 << t.getBCHDigit(b2) - t.getBCHDigit(t.G15);
        return (a2 << 10 | b2) ^ t.G15_MASK;
      }, getBCHTypeNumber: function(a2) {
        for (var b2 = a2 << 12; t.getBCHDigit(b2) - t.getBCHDigit(t.G18) >= 0; ) b2 ^= t.G18 << t.getBCHDigit(b2) - t.getBCHDigit(t.G18);
        return a2 << 12 | b2;
      }, getBCHDigit: function(a2) {
        for (var b2 = 0; 0 != a2; ) b2++, a2 >>>= 1;
        return b2;
      }, getPatternPosition: function(a2) {
        return t.PATTERN_POSITION_TABLE[a2 - 1];
      }, getMask: function(a2, b2, c2) {
        switch (a2) {
          case s.PATTERN000:
            return (b2 + c2) % 2 == 0;
          case s.PATTERN001:
            return b2 % 2 == 0;
          case s.PATTERN010:
            return c2 % 3 == 0;
          case s.PATTERN011:
            return (b2 + c2) % 3 == 0;
          case s.PATTERN100:
            return (Math.floor(b2 / 2) + Math.floor(c2 / 3)) % 2 == 0;
          case s.PATTERN101:
            return b2 * c2 % 2 + b2 * c2 % 3 == 0;
          case s.PATTERN110:
            return (b2 * c2 % 2 + b2 * c2 % 3) % 2 == 0;
          case s.PATTERN111:
            return (b2 * c2 % 3 + (b2 + c2) % 2) % 2 == 0;
          default:
            throw new Error("bad maskPattern:" + a2);
        }
      }, getErrorCorrectPolynomial: function(a2) {
        for (var b2 = new c([1], 0), d2 = 0; d2 < a2; d2++) b2 = b2.multiply(new c([1, u.gexp(d2)], 0));
        return b2;
      }, getLengthInBits: function(a2, b2) {
        if (1 <= b2 && b2 < 10) switch (a2) {
          case q.MODE_NUMBER:
            return 10;
          case q.MODE_ALPHA_NUM:
            return 9;
          case q.MODE_8BIT_BYTE:
          case q.MODE_KANJI:
            return 8;
          default:
            throw new Error("mode:" + a2);
        }
        else if (b2 < 27) switch (a2) {
          case q.MODE_NUMBER:
            return 12;
          case q.MODE_ALPHA_NUM:
            return 11;
          case q.MODE_8BIT_BYTE:
            return 16;
          case q.MODE_KANJI:
            return 10;
          default:
            throw new Error("mode:" + a2);
        }
        else {
          if (!(b2 < 41)) throw new Error("type:" + b2);
          switch (a2) {
            case q.MODE_NUMBER:
              return 14;
            case q.MODE_ALPHA_NUM:
              return 13;
            case q.MODE_8BIT_BYTE:
              return 16;
            case q.MODE_KANJI:
              return 12;
            default:
              throw new Error("mode:" + a2);
          }
        }
      }, getLostPoint: function(a2) {
        for (var b2 = a2.getModuleCount(), c2 = 0, d2 = 0; d2 < b2; d2++) for (var e2 = 0; e2 < b2; e2++) {
          for (var f2 = 0, g2 = a2.isDark(d2, e2), h2 = -1; h2 <= 1; h2++) if (!(d2 + h2 < 0 || b2 <= d2 + h2)) for (var i2 = -1; i2 <= 1; i2++) e2 + i2 < 0 || b2 <= e2 + i2 || 0 == h2 && 0 == i2 || g2 == a2.isDark(d2 + h2, e2 + i2) && f2++;
          f2 > 5 && (c2 += 3 + f2 - 5);
        }
        for (var d2 = 0; d2 < b2 - 1; d2++) for (var e2 = 0; e2 < b2 - 1; e2++) {
          var j2 = 0;
          a2.isDark(d2, e2) && j2++, a2.isDark(d2 + 1, e2) && j2++, a2.isDark(d2, e2 + 1) && j2++, a2.isDark(d2 + 1, e2 + 1) && j2++, 0 != j2 && 4 != j2 || (c2 += 3);
        }
        for (var d2 = 0; d2 < b2; d2++) for (var e2 = 0; e2 < b2 - 6; e2++) a2.isDark(d2, e2) && !a2.isDark(d2, e2 + 1) && a2.isDark(d2, e2 + 2) && a2.isDark(d2, e2 + 3) && a2.isDark(d2, e2 + 4) && !a2.isDark(d2, e2 + 5) && a2.isDark(d2, e2 + 6) && (c2 += 40);
        for (var e2 = 0; e2 < b2; e2++) for (var d2 = 0; d2 < b2 - 6; d2++) a2.isDark(d2, e2) && !a2.isDark(d2 + 1, e2) && a2.isDark(d2 + 2, e2) && a2.isDark(d2 + 3, e2) && a2.isDark(d2 + 4, e2) && !a2.isDark(d2 + 5, e2) && a2.isDark(d2 + 6, e2) && (c2 += 40);
        for (var k2 = 0, e2 = 0; e2 < b2; e2++) for (var d2 = 0; d2 < b2; d2++) a2.isDark(d2, e2) && k2++;
        return c2 += Math.abs(100 * k2 / b2 / b2 - 50) / 5 * 10;
      } }, u = { glog: function(a2) {
        if (a2 < 1) throw new Error("glog(" + a2 + ")");
        return u.LOG_TABLE[a2];
      }, gexp: function(a2) {
        for (; a2 < 0; ) a2 += 255;
        for (; a2 >= 256; ) a2 -= 255;
        return u.EXP_TABLE[a2];
      }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) }, v = 0; v < 8; v++) u.EXP_TABLE[v] = 1 << v;
      for (var v = 8; v < 256; v++) u.EXP_TABLE[v] = u.EXP_TABLE[v - 4] ^ u.EXP_TABLE[v - 5] ^ u.EXP_TABLE[v - 6] ^ u.EXP_TABLE[v - 8];
      for (var v = 0; v < 255; v++) u.LOG_TABLE[u.EXP_TABLE[v]] = v;
      c.prototype = { get: function(a2) {
        return this.num[a2];
      }, getLength: function() {
        return this.num.length;
      }, multiply: function(a2) {
        for (var b2 = new Array(this.getLength() + a2.getLength() - 1), d2 = 0; d2 < this.getLength(); d2++) for (var e2 = 0; e2 < a2.getLength(); e2++) b2[d2 + e2] ^= u.gexp(u.glog(this.get(d2)) + u.glog(a2.get(e2)));
        return new c(b2, 0);
      }, mod: function(a2) {
        if (this.getLength() - a2.getLength() < 0) return this;
        for (var b2 = u.glog(this.get(0)) - u.glog(a2.get(0)), d2 = new Array(this.getLength()), e2 = 0; e2 < this.getLength(); e2++) d2[e2] = this.get(e2);
        for (var e2 = 0; e2 < a2.getLength(); e2++) d2[e2] ^= u.gexp(u.glog(a2.get(e2)) + b2);
        return new c(d2, 0).mod(a2);
      } }, d.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], d.getRSBlocks = function(a2, b2) {
        var c2 = d.getRsBlockTable(a2, b2);
        if (c2 == i) throw new Error("bad rs block @ typeNumber:" + a2 + "/errorCorrectLevel:" + b2);
        for (var e2 = c2.length / 3, f2 = [], g2 = 0; g2 < e2; g2++) for (var h2 = c2[3 * g2 + 0], j2 = c2[3 * g2 + 1], k2 = c2[3 * g2 + 2], l2 = 0; l2 < h2; l2++) f2.push(new d(j2, k2));
        return f2;
      }, d.getRsBlockTable = function(a2, b2) {
        switch (b2) {
          case r.L:
            return d.RS_BLOCK_TABLE[4 * (a2 - 1) + 0];
          case r.M:
            return d.RS_BLOCK_TABLE[4 * (a2 - 1) + 1];
          case r.Q:
            return d.RS_BLOCK_TABLE[4 * (a2 - 1) + 2];
          case r.H:
            return d.RS_BLOCK_TABLE[4 * (a2 - 1) + 3];
          default:
            return i;
        }
      }, e.prototype = { get: function(a2) {
        var b2 = Math.floor(a2 / 8);
        return 1 == (this.buffer[b2] >>> 7 - a2 % 8 & 1);
      }, put: function(a2, b2) {
        for (var c2 = 0; c2 < b2; c2++) this.putBit(1 == (a2 >>> b2 - c2 - 1 & 1));
      }, getLengthInBits: function() {
        return this.length;
      }, putBit: function(a2) {
        var b2 = Math.floor(this.length / 8);
        this.buffer.length <= b2 && this.buffer.push(0), a2 && (this.buffer[b2] |= 128 >>> this.length % 8), this.length++;
      } };
      var w = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]], x = /* @__PURE__ */ (function() {
        return "undefined" != typeof CanvasRenderingContext2D;
      })() ? (function() {
        function a2() {
          if ("svg" == this._htOption.drawer) {
            var a3 = this._oContext.getSerializedSvg(true);
            this.dataURL = a3, this._el.innerHTML = a3;
          } else {
            !(function(a4, b4, c3, d3) {
              var e3 = document.createElement("canvas");
              e3.width = c3, e3.height = d3, e3.getContext("2d").drawImage(a4, 0, 0, c3, d3), a4.width = c3, a4.height = d3, b4.drawImage(e3, 0, 0);
            })(this._elCanvas, this._oContext, this._htOption.width + 2 * this._htOption.quietZone, this._htOption.height + this._htOption.titleHeight + 2 * this._htOption.quietZone);
            try {
              var b3 = this._elCanvas.toDataURL("image/png");
              this.dataURL = b3;
            } catch (a4) {
              console.error(a4);
            }
          }
          this._htOption.onRenderingEnd && (this.dataURL || console.error("Can not get base64 data, please check: 1. Published the page and image to the server 2. The image request support CORS 3. Configured `crossOrigin:'anonymous'` option"), this._htOption.onRenderingEnd(this._htOption, this.dataURL));
        }
        function b2(a3, b3) {
          var c3 = this;
          if (c3._fFail = b3, c3._fSuccess = a3, null === c3._bSupportDataURI) {
            var d3 = document.createElement("img"), e3 = function() {
              c3._bSupportDataURI = false, c3._fFail && c3._fFail.call(c3);
            }, f2 = function() {
              c3._bSupportDataURI = true, c3._fSuccess && c3._fSuccess.call(c3);
            };
            d3.onabort = e3, d3.onerror = e3, d3.onload = f2, d3.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
          } else true === c3._bSupportDataURI && c3._fSuccess ? c3._fSuccess.call(c3) : false === c3._bSupportDataURI && c3._fFail && c3._fFail.call(c3);
        }
        if (m._android && m._android <= 2.1) {
          var c2 = 1 / window.devicePixelRatio, d2 = CanvasRenderingContext2D.prototype.drawImage;
          CanvasRenderingContext2D.prototype.drawImage = function(a3, b3, e3, f2, g2, h2, i2, j2, k2) {
            if ("nodeName" in a3 && /img/i.test(a3.nodeName)) for (var l2 = arguments.length - 1; l2 >= 1; l2--) arguments[l2] = arguments[l2] * c2;
            else void 0 === j2 && (arguments[1] *= c2, arguments[2] *= c2, arguments[3] *= c2, arguments[4] *= c2);
            d2.apply(this, arguments);
          };
        }
        var e2 = function(a3, b3) {
          this._bIsPainted = false, this._android = f(), this._el = a3, this._htOption = b3, "svg" == this._htOption.drawer ? (this._oContext = {}, this._elCanvas = {}) : (this._elCanvas = document.createElement("canvas"), this._el.appendChild(this._elCanvas), this._oContext = this._elCanvas.getContext("2d")), this._bSupportDataURI = null, this.dataURL = null;
        };
        return e2.prototype.draw = function(a3) {
          function b3() {
            d3.quietZone > 0 && d3.quietZoneColor && (j2.lineWidth = 0, j2.fillStyle = d3.quietZoneColor, j2.fillRect(0, 0, k2._elCanvas.width, d3.quietZone), j2.fillRect(0, d3.quietZone, d3.quietZone, k2._elCanvas.height - 2 * d3.quietZone), j2.fillRect(k2._elCanvas.width - d3.quietZone, d3.quietZone, d3.quietZone, k2._elCanvas.height - 2 * d3.quietZone), j2.fillRect(0, k2._elCanvas.height - d3.quietZone, k2._elCanvas.width, d3.quietZone));
          }
          function c3(a4) {
            function c4(a5) {
              var c5 = Math.round(d3.width / 3.5), e4 = Math.round(d3.height / 3.5);
              c5 !== e4 && (c5 = e4), d3.logoMaxWidth ? c5 = Math.round(d3.logoMaxWidth) : d3.logoWidth && (c5 = Math.round(d3.logoWidth)), d3.logoMaxHeight ? e4 = Math.round(d3.logoMaxHeight) : d3.logoHeight && (e4 = Math.round(d3.logoHeight));
              var f3, g3;
              void 0 === a5.naturalWidth ? (f3 = a5.width, g3 = a5.height) : (f3 = a5.naturalWidth, g3 = a5.naturalHeight), (d3.logoMaxWidth || d3.logoMaxHeight) && (d3.logoMaxWidth && f3 <= c5 && (c5 = f3), d3.logoMaxHeight && g3 <= e4 && (e4 = g3), f3 <= c5 && g3 <= e4 && (c5 = f3, e4 = g3));
              var h4 = (d3.realWidth - c5) / 2, i4 = (d3.calculatedQRHeight - e4) / 2 + d3.titleHeight + d3.quietZone, k4 = Math.min(c5 / f3, e4 / g3), l4 = f3 * k4, m3 = g3 * k4;
              (d3.logoMaxWidth || d3.logoMaxHeight) && (c5 = l4, e4 = m3, h4 = (d3.realWidth - c5) / 2, i4 = (d3.realHeight - e4) / 2), d3.logoBackgroundTransparent || (j2.fillStyle = d3.logoBackgroundColor, j2.fillRect(h4, i4, c5, e4));
              var n3 = j2.imageSmoothingQuality, o3 = j2.imageSmoothingEnabled;
              j2.imageSmoothingEnabled = true, j2.imageSmoothingQuality = "high", j2.drawImage(a5, h4 + (c5 - l4) / 2, i4 + (e4 - m3) / 2, l4, m3), j2.imageSmoothingEnabled = o3, j2.imageSmoothingQuality = n3, b3(), s2._bIsPainted = true, s2.makeImage();
            }
            d3.onRenderingStart && d3.onRenderingStart(d3);
            for (var h3 = 0; h3 < e3; h3++) for (var i3 = 0; i3 < e3; i3++) {
              var k3 = i3 * f2 + d3.quietZone, l3 = h3 * g2 + d3.quietZone, m2 = a4.isDark(h3, i3), n2 = a4.getEye(h3, i3), o2 = d3.dotScale;
              j2.lineWidth = 0;
              var p2, q2;
              n2 ? (p2 = d3[n2.type] || d3[n2.type.substring(0, 2)] || d3.colorDark, q2 = d3.colorLight) : d3.backgroundImage ? (q2 = "rgba(0,0,0,0)", 6 == h3 ? d3.autoColor ? (p2 = d3.timing_H || d3.timing || d3.autoColorDark, q2 = d3.autoColorLight) : p2 = d3.timing_H || d3.timing || d3.colorDark : 6 == i3 ? d3.autoColor ? (p2 = d3.timing_V || d3.timing || d3.autoColorDark, q2 = d3.autoColorLight) : p2 = d3.timing_V || d3.timing || d3.colorDark : d3.autoColor ? (p2 = d3.autoColorDark, q2 = d3.autoColorLight) : p2 = d3.colorDark) : (p2 = 6 == h3 ? d3.timing_H || d3.timing || d3.colorDark : 6 == i3 ? d3.timing_V || d3.timing || d3.colorDark : d3.colorDark, q2 = d3.colorLight), j2.strokeStyle = m2 ? p2 : q2, j2.fillStyle = m2 ? p2 : q2, n2 ? (o2 = "AO" == n2.type ? d3.dotScaleAO : "AI" == n2.type ? d3.dotScaleAI : 1, d3.backgroundImage && d3.autoColor ? (p2 = ("AO" == n2.type ? d3.AI : d3.AO) || d3.autoColorDark, q2 = d3.autoColorLight) : p2 = ("AO" == n2.type ? d3.AI : d3.AO) || p2, m2 = n2.isDark, j2.fillRect(Math.ceil(k3 + f2 * (1 - o2) / 2), Math.ceil(d3.titleHeight + l3 + g2 * (1 - o2) / 2), Math.ceil(f2 * o2), Math.ceil(g2 * o2))) : 6 == h3 ? (o2 = d3.dotScaleTiming_H, j2.fillRect(Math.ceil(k3 + f2 * (1 - o2) / 2), Math.ceil(d3.titleHeight + l3 + g2 * (1 - o2) / 2), Math.ceil(f2 * o2), Math.ceil(g2 * o2))) : 6 == i3 ? (o2 = d3.dotScaleTiming_V, j2.fillRect(Math.ceil(k3 + f2 * (1 - o2) / 2), Math.ceil(d3.titleHeight + l3 + g2 * (1 - o2) / 2), Math.ceil(f2 * o2), Math.ceil(g2 * o2))) : (d3.backgroundImage, j2.fillRect(Math.ceil(k3 + f2 * (1 - o2) / 2), Math.ceil(d3.titleHeight + l3 + g2 * (1 - o2) / 2), Math.ceil(f2 * o2), Math.ceil(g2 * o2))), 1 == d3.dotScale || n2 || (j2.strokeStyle = d3.colorLight);
            }
            if (d3.title && (j2.fillStyle = d3.titleBackgroundColor, j2.fillRect(d3.quietZone, d3.quietZone, d3.calculatedQRWidth, d3.titleHeight), j2.font = d3.titleFont, j2.fillStyle = d3.titleColor, j2.textAlign = "center", j2.fillText(d3.title, this._elCanvas.width / 2, +d3.quietZone + d3.titleTop)), d3.subTitle && (j2.font = d3.subTitleFont, j2.fillStyle = d3.subTitleColor, j2.fillText(d3.subTitle, this._elCanvas.width / 2, +d3.quietZone + d3.subTitleTop)), d3.logo) {
              var r2 = new Image(), s2 = this;
              r2.onload = function() {
                c4(r2);
              }, r2.onerror = function(a5) {
                console.error(a5);
              }, null != d3.crossOrigin && (r2.crossOrigin = d3.crossOrigin), r2.originalSrc = d3.logo, r2.src = d3.logo;
            } else b3(), this._bIsPainted = true, this.makeImage();
          }
          var d3 = this._htOption, e3 = a3.getModuleCount(), f2 = d3.width / e3, g2 = d3.height / e3;
          f2 <= 1 && (f2 = 1), g2 <= 1 && (g2 = 1), f2 = Math.round(f2), g2 = Math.round(g2);
          var h2 = f2 * e3, i2 = g2 * e3;
          d3.heightWithTitle = i2 + d3.titleHeight, d3.realHeight = d3.heightWithTitle + 2 * d3.quietZone, d3.realWidth = h2 + 2 * d3.quietZone, d3.calculatedQRWidth = h2, d3.calculatedQRHeight = i2, this._elCanvas.width = d3.realWidth, this._elCanvas.height = d3.realHeight, "canvas" != d3.drawer && (this._oContext = new C2S(d3.width + 2 * this._htOption.quietZone, d3.height + d3.titleHeight + 2 * this._htOption.quietZone, d3.realWidth, d3.realHeight)), this.clear();
          var j2 = this._oContext;
          j2.lineWidth = 0, j2.fillStyle = d3.colorLight, j2.fillRect(0, 0, this._elCanvas.width, this._elCanvas.height), j2.clearRect(d3.quietZone, d3.quietZone, d3.calculatedQRWidth, d3.titleHeight);
          var k2 = this;
          if (d3.backgroundImage) {
            var l2 = new Image();
            l2.onload = function() {
              j2.globalAlpha = 1, j2.globalAlpha = d3.backgroundImageAlpha;
              var b4 = j2.imageSmoothingQuality, e4 = j2.imageSmoothingEnabled;
              j2.imageSmoothingEnabled = true, j2.imageSmoothingQuality = "high", (d3.title || d3.subTitle) && d3.titleHeight ? j2.drawImage(l2, d3.quietZone, d3.quietZone + d3.titleHeight, d3.width, d3.height) : j2.drawImage(l2, 0, 0, d3.realWidth, d3.realHeight), j2.imageSmoothingEnabled = e4, j2.imageSmoothingQuality = b4, j2.globalAlpha = 1, c3.call(k2, a3);
            }, null != d3.crossOrigin && (l2.crossOrigin = d3.crossOrigin), l2.originalSrc = d3.backgroundImage, l2.src = d3.backgroundImage;
          } else c3.call(k2, a3);
        }, e2.prototype.makeImage = function() {
          this._bIsPainted && b2.call(this, a2);
        }, e2.prototype.isPainted = function() {
          return this._bIsPainted;
        }, e2.prototype.clear = function() {
          this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height), this._bIsPainted = false;
        }, e2.prototype.remove = function() {
          this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height), this._bIsPainted = false, this._el.innerHTML = "";
        }, e2.prototype.round = function(a3) {
          return a3 ? Math.floor(1e3 * a3) / 1e3 : a3;
        }, e2;
      })() : (function() {
        var a2 = function(a3, b2) {
          this._el = a3, this._htOption = b2;
        };
        return a2.prototype.draw = function(a3) {
          var b2 = this._htOption, c2 = this._el, d2 = a3.getModuleCount(), e2 = b2.width / d2, f2 = b2.height / d2;
          e2 <= 1 && (e2 = 1), f2 <= 1 && (f2 = 1);
          var g2 = e2 * d2, h2 = f2 * d2;
          b2.heightWithTitle = h2 + b2.titleHeight, b2.realHeight = b2.heightWithTitle + 2 * b2.quietZone, b2.realWidth = g2 + 2 * b2.quietZone;
          var i2 = [], j2 = "", k2 = Math.round(e2 * b2.dotScale), l2 = Math.round(f2 * b2.dotScale);
          k2 < 4 && (k2 = 4, l2 = 4);
          var m2 = b2.colorDark, n2 = b2.colorLight;
          if (b2.backgroundImage) {
            b2.autoColor ? (b2.colorDark = "rgba(0, 0, 0, .6);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#99000000', EndColorStr='#99000000');", b2.colorLight = "rgba(255, 255, 255, .7);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr='#B2FFFFFF', EndColorStr='#B2FFFFFF');") : b2.colorLight = "rgba(0,0,0,0)";
            var o2 = '<div style="display:inline-block; z-index:-10;position:absolute;"><img src="' + b2.backgroundImage + '" width="' + (b2.width + 2 * b2.quietZone) + '" height="' + b2.realHeight + '" style="opacity:' + b2.backgroundImageAlpha + ";filter:alpha(opacity=" + 100 * b2.backgroundImageAlpha + '); "/></div>';
            i2.push(o2);
          }
          if (b2.quietZone && (j2 = "display:inline-block; width:" + (b2.width + 2 * b2.quietZone) + "px; height:" + (b2.width + 2 * b2.quietZone) + "px;background:" + b2.quietZoneColor + "; text-align:center;"), i2.push('<div style="font-size:0;' + j2 + '">'), i2.push('<table  style="font-size:0;border:0;border-collapse:collapse; margin-top:' + b2.quietZone + 'px;" border="0" cellspacing="0" cellspadding="0" align="center" valign="middle">'), i2.push('<tr height="' + b2.titleHeight + '" align="center"><td style="border:0;border-collapse:collapse;margin:0;padding:0" colspan="' + d2 + '">'), b2.title) {
            var p2 = b2.titleColor, q2 = b2.titleFont;
            i2.push('<div style="width:100%;margin-top:' + b2.titleTop + "px;color:" + p2 + ";font:" + q2 + ";background:" + b2.titleBackgroundColor + '">' + b2.title + "</div>");
          }
          b2.subTitle && i2.push('<div style="width:100%;margin-top:' + (b2.subTitleTop - b2.titleTop) + "px;color:" + b2.subTitleColor + "; font:" + b2.subTitleFont + '">' + b2.subTitle + "</div>"), i2.push("</td></tr>");
          for (var r2 = 0; r2 < d2; r2++) {
            i2.push('<tr style="border:0; padding:0; margin:0;" height="7">');
            for (var s2 = 0; s2 < d2; s2++) {
              var t2 = a3.isDark(r2, s2), u2 = a3.getEye(r2, s2);
              if (u2) {
                t2 = u2.isDark;
                var v2 = u2.type, w2 = b2[v2] || b2[v2.substring(0, 2)] || m2;
                i2.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + e2 + "px;height:" + f2 + 'px;"><span style="width:' + e2 + "px;height:" + f2 + "px;background-color:" + (t2 ? w2 : n2) + ';display:inline-block"></span></td>');
              } else {
                var x2 = b2.colorDark;
                6 == r2 ? (x2 = b2.timing_H || b2.timing || m2, i2.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + e2 + "px;height:" + f2 + "px;background-color:" + (t2 ? x2 : n2) + ';"></td>')) : 6 == s2 ? (x2 = b2.timing_V || b2.timing || m2, i2.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + e2 + "px;height:" + f2 + "px;background-color:" + (t2 ? x2 : n2) + ';"></td>')) : i2.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + e2 + "px;height:" + f2 + 'px;"><div style="display:inline-block;width:' + k2 + "px;height:" + l2 + "px;background-color:" + (t2 ? x2 : b2.colorLight) + ';"></div></td>');
              }
            }
            i2.push("</tr>");
          }
          if (i2.push("</table>"), i2.push("</div>"), b2.logo) {
            var y = new Image();
            null != b2.crossOrigin && (y.crossOrigin = b2.crossOrigin), y.src = b2.logo;
            var z = b2.width / 3.5, A = b2.height / 3.5;
            z != A && (z = A), b2.logoWidth && (z = b2.logoWidth), b2.logoHeight && (A = b2.logoHeight);
            var B = "position:relative; z-index:1;display:table-cell;top:-" + (b2.height / 2 + A / 2 + b2.quietZone) + "px;text-align:center; width:" + z + "px; height:" + A + "px;line-height:" + z + "px; vertical-align: middle;";
            b2.logoBackgroundTransparent || (B += "background:" + b2.logoBackgroundColor), i2.push('<div style="' + B + '"><img  src="' + b2.logo + '"  style="max-width: ' + z + "px; max-height: " + A + 'px;" /> <div style=" display: none; width:1px;margin-left: -1px;"></div></div>');
          }
          b2.onRenderingStart && b2.onRenderingStart(b2), c2.innerHTML = i2.join("");
          var C = c2.childNodes[0], D = (b2.width - C.offsetWidth) / 2, E = (b2.heightWithTitle - C.offsetHeight) / 2;
          D > 0 && E > 0 && (C.style.margin = E + "px " + D + "px"), this._htOption.onRenderingEnd && this._htOption.onRenderingEnd(this._htOption, null);
        }, a2.prototype.clear = function() {
          this._el.innerHTML = "";
        }, a2;
      })();
      j = function(a2, b2) {
        if (this._htOption = { width: 256, height: 256, typeNumber: 4, colorDark: "#000000", colorLight: "#ffffff", correctLevel: r.H, dotScale: 1, dotScaleTiming: 1, dotScaleTiming_H: i, dotScaleTiming_V: i, dotScaleA: 1, dotScaleAO: i, dotScaleAI: i, quietZone: 0, quietZoneColor: "rgba(0,0,0,0)", title: "", titleFont: "normal normal bold 16px Arial", titleColor: "#000000", titleBackgroundColor: "#ffffff", titleHeight: 0, titleTop: 30, subTitle: "", subTitleFont: "normal normal normal 14px Arial", subTitleColor: "#4F4F4F", subTitleTop: 60, logo: i, logoWidth: i, logoHeight: i, logoMaxWidth: i, logoMaxHeight: i, logoBackgroundColor: "#ffffff", logoBackgroundTransparent: false, PO: i, PI: i, PO_TL: i, PI_TL: i, PO_TR: i, PI_TR: i, PO_BL: i, PI_BL: i, AO: i, AI: i, timing: i, timing_H: i, timing_V: i, backgroundImage: i, backgroundImageAlpha: 1, autoColor: false, autoColorDark: "rgba(0, 0, 0, .6)", autoColorLight: "rgba(255, 255, 255, .7)", onRenderingStart: i, onRenderingEnd: i, version: 0, tooltip: false, binary: false, drawer: "canvas", crossOrigin: null, utf8WithoutBOM: true }, "string" == typeof b2 && (b2 = { text: b2 }), b2) for (var c2 in b2) this._htOption[c2] = b2[c2];
        this._htOption.title || this._htOption.subTitle || (this._htOption.titleHeight = 0), (this._htOption.version < 0 || this._htOption.version > 40) && (console.warn("QR Code version '" + this._htOption.version + "' is invalidate, reset to 0"), this._htOption.version = 0), (this._htOption.dotScale < 0 || this._htOption.dotScale > 1) && (console.warn(this._htOption.dotScale + " , is invalidate, dotScale must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScale = 1), (this._htOption.dotScaleTiming < 0 || this._htOption.dotScaleTiming > 1) && (console.warn(this._htOption.dotScaleTiming + " , is invalidate, dotScaleTiming must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleTiming = 1), this._htOption.dotScaleTiming_H ? (this._htOption.dotScaleTiming_H < 0 || this._htOption.dotScaleTiming_H > 1) && (console.warn(this._htOption.dotScaleTiming_H + " , is invalidate, dotScaleTiming_H must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleTiming_H = 1) : this._htOption.dotScaleTiming_H = this._htOption.dotScaleTiming, this._htOption.dotScaleTiming_V ? (this._htOption.dotScaleTiming_V < 0 || this._htOption.dotScaleTiming_V > 1) && (console.warn(this._htOption.dotScaleTiming_V + " , is invalidate, dotScaleTiming_V must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleTiming_V = 1) : this._htOption.dotScaleTiming_V = this._htOption.dotScaleTiming, (this._htOption.dotScaleA < 0 || this._htOption.dotScaleA > 1) && (console.warn(this._htOption.dotScaleA + " , is invalidate, dotScaleA must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleA = 1), this._htOption.dotScaleAO ? (this._htOption.dotScaleAO < 0 || this._htOption.dotScaleAO > 1) && (console.warn(this._htOption.dotScaleAO + " , is invalidate, dotScaleAO must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleAO = 1) : this._htOption.dotScaleAO = this._htOption.dotScaleA, this._htOption.dotScaleAI ? (this._htOption.dotScaleAI < 0 || this._htOption.dotScaleAI > 1) && (console.warn(this._htOption.dotScaleAI + " , is invalidate, dotScaleAI must greater than 0, less than or equal to 1, now reset to 1. "), this._htOption.dotScaleAI = 1) : this._htOption.dotScaleAI = this._htOption.dotScaleA, (this._htOption.backgroundImageAlpha < 0 || this._htOption.backgroundImageAlpha > 1) && (console.warn(this._htOption.backgroundImageAlpha + " , is invalidate, backgroundImageAlpha must between 0 and 1, now reset to 1. "), this._htOption.backgroundImageAlpha = 1), this._htOption.quietZone || (this._htOption.quietZone = 0), this._htOption.titleHeight || (this._htOption.titleHeight = 0), this._htOption.width = Math.round(this._htOption.width), this._htOption.height = Math.round(this._htOption.height), this._htOption.quietZone = Math.round(this._htOption.quietZone), this._htOption.titleHeight = Math.round(this._htOption.titleHeight), "string" == typeof a2 && (a2 = document.getElementById(a2)), (!this._htOption.drawer || "svg" != this._htOption.drawer && "canvas" != this._htOption.drawer) && (this._htOption.drawer = "canvas"), this._android = f(), this._el = a2, this._oQRCode = null, this._htOption._element = a2;
        var d2 = {};
        for (var c2 in this._htOption) d2[c2] = this._htOption[c2];
        this._oDrawing = new x(this._el, d2), this._htOption.text && this.makeCode(this._htOption.text);
      }, j.prototype.makeCode = function(a2) {
        this._oQRCode = new b(g(a2, this._htOption), this._htOption.correctLevel), this._oQRCode.addData(a2, this._htOption.binary, this._htOption.utf8WithoutBOM), this._oQRCode.make(), this._htOption.tooltip && (this._el.title = a2), this._oDrawing.draw(this._oQRCode);
      }, j.prototype.makeImage = function() {
        "function" == typeof this._oDrawing.makeImage && (!this._android || this._android >= 3) && this._oDrawing.makeImage();
      }, j.prototype.clear = function() {
        this._oDrawing.remove();
      }, j.prototype.resize = function(a2, b2) {
        this._oDrawing._htOption.width = a2, this._oDrawing._htOption.height = b2, this._oDrawing.draw(this._oQRCode);
      }, j.prototype.download = function(a2) {
        var b2 = this._oDrawing.dataURL, c2 = document.createElement("a");
        if ("svg" == this._htOption.drawer) {
          a2 += ".svg";
          var d2 = new Blob([b2], { type: "text/plain" });
          if (navigator.msSaveBlob) navigator.msSaveBlob(d2, a2);
          else {
            c2.download = a2;
            var e2 = new FileReader();
            e2.onload = function() {
              c2.href = e2.result, c2.click();
            }, e2.readAsDataURL(d2);
          }
        } else if (a2 += ".png", navigator.msSaveBlob) {
          var f2 = (function(a3) {
            var b3 = atob(a3.split(",")[1]), c3 = a3.split(",")[0].split(":")[1].split(";")[0], d3 = new ArrayBuffer(b3.length), e3 = new Uint8Array(d3);
            for (v = 0; v < b3.length; v++) e3[v] = b3.charCodeAt(v);
            return new Blob([d3], { type: c3 });
          })(b2);
          navigator.msSaveBlob(f2, a2);
        } else c2.download = a2, c2.href = b2, c2.click();
      }, j.prototype.noConflict = function() {
        return m.QRCode === this && (m.QRCode = p), j;
      }, j.CorrectLevel = r, "function" == typeof define && (define.amd || define.cmd) ? define([], function() {
        return j;
      }) : o ? ((o.exports = j).QRCode = j, n.QRCode = j) : m.QRCode = j;
    }.call(exports);
  }
});

// qr-vendor-entry.js
var import_easyqrcodejs = __toESM(require_easy_qrcode_min(), 1);
var qr_vendor_entry_default = import_easyqrcodejs.default;
export {
  qr_vendor_entry_default as default
};
