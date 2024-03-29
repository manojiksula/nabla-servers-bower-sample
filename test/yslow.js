/**
 * Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var i, arg, page, urlCount, viewport, webpage = require("webpage"),
	system = require("system"),
    args = system.args,
    len = args.length,
    urls = [],
    yslowArgs = {
        info: "all",
        format: "json",
        ruleset: "ydefault",
        beacon: false,
        ua: false,
        viewport: false,
        headers: false,
        console: 0,
        threshold: 80
    },
    unaryArgs = {
        help: false,
        version: false,
        dict: false,
        verbose: false
    },
    argsAlias = {
        i: "info",
        f: "format",
        r: "ruleset",
        h: "help",
        V: "version",
        d: "dict",
        u: "ua",
        vp: "viewport",
        c: "console",
        b: "beacon",
        v: "verbose",
        t: "threshold",
        ch: "headers"
    };
for (i = 0; i < len; i += 1) {
    arg = args[i];
    if (arg[0] !== "-") {
        if (arg.indexOf("http") !== 0) {
            arg = "http://" + arg
        }
        urls.push(arg)
    }
    arg = arg.replace(/^\-\-?/, "");
    if (yslowArgs.hasOwnProperty(arg)) {
        i += 1;
        yslowArgs[arg] = args[i]
    } else {
        if (yslowArgs.hasOwnProperty(argsAlias[arg])) {
            i += 1;
            yslowArgs[argsAlias[arg]] = args[i]
        } else {
            if (unaryArgs.hasOwnProperty(arg)) {
                unaryArgs[arg] = true
            } else {
                if (unaryArgs.hasOwnProperty(argsAlias[arg])) {
                    unaryArgs[argsAlias[arg]] = true
                }
            }
        }
    }
}
urlCount = urls.length;
if (unaryArgs.version) {
    console.log("3.1.5");
    phantom.exit()
}
if (len === 0 || urlCount === 0 || unaryArgs.help) {
    console.log(["", "  Usage: phantomjs [phantomjs options] " + phantom.scriptName + " [yslow options] [url ...]", "", "  PhantomJS Options:", "", "    http://y.ahoo.it/phantomjs/options", "", "  YSlow Options:", "", "    -h, --help               output usage information", "    -V, --version            output the version number", "    -i, --info <info>        specify the information to display/log (basic|grade|stats|comps|all) [all]", "    -f, --format <format>    specify the output results format (json|xml|plain|tap|junit) [json]", "    -r, --ruleset <ruleset>  specify the YSlow performance ruleset to be used (ydefault|yslow1|yblog) [ydefault]", "    -b, --beacon <url>       specify an URL to log the results", "    -d, --dict               include dictionary of results fields", "    -v, --verbose            output beacon response information", "    -t, --threshold <score>  for test formats, the threshold to test scores ([0-100]|[A-F]|{JSON}) [80]", '                             e.g.: -t B or -t 75 or -t \'{"overall": "B", "ycdn": "F", "yexpires": 85}\'', '    -u, --ua "<user agent>"  specify the user agent string sent to server when the page requests resources', "    -vp, --viewport <WxH>    specify page viewport size WxY, where W = width and H = height [400x300]", '    -ch, --headers <JSON>    specify custom request headers, e.g.: -ch \'{"Cookie": "foo=bar"}\'', "    -c, --console <level>    output page console messages (0: none, 1: message, 2: message + line + source) [0]", "", "  Examples:", "", "    phantomjs " + phantom.scriptName + " http://yslow.org", "    phantomjs " + phantom.scriptName + " -i grade -f xml www.yahoo.com www.cnn.com www.nytimes.com", "    phantomjs " + phantom.scriptName + ' -info all --format plain --ua "MSIE 9.0" http://yslow.org', "    phantomjs " + phantom.scriptName + " -i basic --rulseset yslow1 -d http://yslow.org", "    phantomjs " + phantom.scriptName + " -i grade -b http://www.showslow.com/beacon/yslow/ -v yslow.org", "    phantomjs --load-plugins=yes " + phantom.scriptName + " -vp 800x600 http://www.yahoo.com", "    phantomjs " + phantom.scriptName + " -i grade -f tap -t 85 http://yslow.org", ""].join("\n"));
    phantom.exit()
}
yslowArgs.dict = unaryArgs.dict;
yslowArgs.verbose = unaryArgs.verbose;
urls.forEach(function(a) {
    var c = webpage.create();
    c.resources = {};
    c.settings.webSecurityEnabled = false;
    c.onResourceRequested = function(d) {
        c.resources[d.url] = {
            request: d
        }
    };
    c.onResourceReceived = function(d) {
        var e, f = c.resources[d.url].response;
        if (!f) {
            c.resources[d.url].response = d
        } else {
            for (e in d) {
                if (d.hasOwnProperty(e)) {
                    f[e] = d[e]
                }
            }
        }
    };
    yslowArgs.console = parseInt(yslowArgs.console, 10) || 0;
    if (yslowArgs.console) {
        if (yslowArgs.console === 1) {
            c.onConsoleMessage = function(d) {
                console.log(d)
            };
            c.onError = function(d) {
                console.error(d)
            }
        } else {
            c.onConsoleMessage = function(f, d, e) {
                console.log(JSON.stringify({
                    message: f,
                    lineNumber: d,
                    source: e
                }, null, 4))
            };
            c.onError = function(e, d) {
                console.error(JSON.stringify({
                    message: e,
                    stacktrace: d
                }))
            }
        }
    } else {
        c.onError = function() {}
    }
    if (yslowArgs.ua) {
        c.settings.userAgent = yslowArgs.ua
    }
    if (yslowArgs.viewport) {
        viewport = yslowArgs.viewport.toLowerCase();
        c.viewportSize = {
            width: parseInt(viewport.slice(0, viewport.indexOf("x")), 10) || c.viewportSize.width,
            height: parseInt(viewport.slice(viewport.indexOf("x") + 1), 10) || c.viewportSize.height
        }
    }
    if (yslowArgs.headers) {
        try {
            c.customHeaders = JSON.parse(yslowArgs.headers)
        } catch (b) {
            console.log("Invalid custom headers: " + b)
        }
    }
    c.startTime = new Date();
    c.open(a, function(k) {
        var f, j, m, n, l, d, h, e = c.startTime,
            g = c.resources;
        if (k !== "success") {
            console.log("FAIL to load " + d)
        } else {
            l = new Date() - e;
            for (d in g) {
                if (g.hasOwnProperty(d)) {
                    h = g[d].response;
                    if (h) {
                        h.time = new Date(h.time) - e
                    }
                }
            }
            f = function() {
                if (typeof YSLOW === "undefined") {
                    YSLOW = {}
                }
                YSLOW.DEBUG = true;
                YSLOW.registerRule = function(o) {
                    YSLOW.controller.addRule(o)
                };
                YSLOW.registerRuleset = function(o) {
                    YSLOW.controller.addRuleset(o)
                };
                YSLOW.registerRenderer = function(o) {
                    YSLOW.controller.addRenderer(o)
                };
                YSLOW.registerTool = function(o) {
                    YSLOW.Tools.addCustomTool(o)
                };
                YSLOW.addEventListener = function(p, q, o) {
                    YSLOW.util.event.addListener(p, q, o)
                };
                YSLOW.removeEventListener = function(o, p) {
                    return YSLOW.util.event.removeListener(o, p)
                };
                YSLOW.Error = function(o, p) {
                    this.name = o;
                    this.message = p
                };
                YSLOW.Error.prototype = {
                    toString: function() {
                        return this.name + "\n" + this.message
                    }
                };
                YSLOW.version = "3.1.5";
                YSLOW.ComponentSet = function(o, p) {
                    this.root_node = o;
                    this.components = [];
                    this.outstanding_net_request = 0;
                    this.component_info = [];
                    this.onloadTimestamp = p;
                    this.nextID = 1;
                    this.notified_fetch_done = false
                };
                YSLOW.ComponentSet.prototype = {
                    clear: function() {
                        this.components = [];
                        this.component_info = [];
                        this.cleared = true;
                        if (this.outstanding_net_request > 0) {
                            YSLOW.util.dump("YSLOW.ComponentSet.Clearing component set before all net requests finish.")
                        }
                    },
                    addComponent: function(s, t, q, v) {
                        var p, u, r;
                        if (!s) {
                            if (!this.empty_url) {
                                this.empty_url = []
                            }
                            this.empty_url[t] = (this.empty_url[t] || 0) + 1
                        }
                        if (s && t) {
                            if (!YSLOW.ComponentSet.isValidProtocol(s) || !YSLOW.ComponentSet.isValidURL(s)) {
                                return p
                            }
                            s = YSLOW.util.makeAbsoluteUrl(s, q);
                            s = YSLOW.util.escapeHtml(s);
                            u = typeof this.component_info[s] !== "undefined";
                            r = t === "doc";
                            if (!u || r) {
                                this.component_info[s] = {
                                    state: "NONE",
                                    count: u ? this.component_info[s].count : 0
                                };
                                p = new YSLOW.Component(s, t, this, v);
                                if (p) {
                                    p.id = this.nextID += 1;
                                    this.components[this.components.length] = p;
                                    if (!this.doc_comp && r) {
                                        this.doc_comp = p
                                    }
                                    if (this.component_info[s].state === "NONE") {
                                        this.component_info[s].state = "REQUESTED";
                                        this.outstanding_net_request += 1
                                    }
                                } else {
                                    this.component_info[s].state = "ERROR";
                                    YSLOW.util.event.fire("componentFetchError")
                                }
                            }
                            this.component_info[s].count += 1
                        }
                        return p
                    },
                    addComponentNoDuplicate: function(p, q, o) {
                        if (p && q) {
                            p = YSLOW.util.escapeHtml(p);
                            p = YSLOW.util.makeAbsoluteUrl(p, o);
                            if (this.component_info[p] === undefined) {
                                return this.addComponent(p, q, o)
                            }
                        }
                    },
                    getComponentsByType: function(B, y, r) {
                        var u, s, z, q, C, w, p, v = this.components,
                            A = this.component_info,
                            o = [],
                            x = {};
                        if (typeof y === "undefined") {
                            y = !(YSLOW.util.Preference.getPref("excludeAfterOnload", true))
                        }
                        if (typeof r === "undefined") {
                            r = !(YSLOW.util.Preference.getPref("excludeBeaconsFromLint", true))
                        }
                        if (typeof B === "string") {
                            x[B] = 1
                        } else {
                            for (u = 0, z = B.length; u < z; u += 1) {
                                C = B[u];
                                if (C) {
                                    x[C] = 1
                                }
                            }
                        }
                        for (u = 0, z = v.length; u < z; u += 1) {
                            w = v[u];
                            if (!w || (w && !x[w.type]) || (w.is_beacon && !r) || (w.after_onload && !y)) {
                                continue
                            }
                            o[o.length] = w;
                            p = A[u];
                            if (!p || (p && p.count <= 1)) {
                                continue
                            }
                            for (s = 1, q = p.count; s < q; s += 1) {
                                o[o.length] = w
                            }
                        }
                        return o
                    },
                    getProgress: function() {
                        var o, p = 0,
                            q = 0;
                        for (o in this.component_info) {
                            if (this.component_info.hasOwnProperty(o) && this.component_info[o]) {
                                if (this.component_info[o].state === "RECEIVED") {
                                    q += 1
                                }
                                p += 1
                            }
                        }
                        return {
                            total: p,
                            received: q
                        }
                    },
                    onComponentGetInfoStateChange: function(r) {
                        var o, q, p;
                        if (r) {
                            if (typeof r.comp !== "undefined") {
                                o = r.comp
                            }
                            if (typeof r.state !== "undefined") {
                                q = r.state
                            }
                        }
                        if (typeof this.component_info[o.url] === "undefined") {
                            YSLOW.util.dump("YSLOW.ComponentSet.onComponentGetInfoStateChange(): Unexpected component: " + o.url);
                            return
                        }
                        if (this.component_info[o.url].state === "NONE" && q === "DONE") {
                            this.component_info[o.url].state = "RECEIVED"
                        } else {
                            if (this.component_info[o.url].state === "REQUESTED" && q === "DONE") {
                                this.component_info[o.url].state = "RECEIVED";
                                this.outstanding_net_request -= 1;
                                if (this.outstanding_net_request === 0) {
                                    this.notified_fetch_done = true;
                                    YSLOW.util.event.fire("componentFetchDone", {
                                        component_set: this
                                    })
                                }
                            } else {
                                YSLOW.util.dump("Unexpected component info state: [" + o.type + "]" + o.url + "state: " + q + " comp_info_state: " + this.component_info[o.url].state)
                            }
                        }
                        p = this.getProgress();
                        YSLOW.util.event.fire("componentFetchProgress", {
                            total: p.total,
                            current: p.received,
                            last_component_url: o.url
                        })
                    },
                    notifyPeelDone: function() {
                        if (this.outstanding_net_request === 0 && !this.notified_fetch_done) {
                            this.notified_fetch_done = true;
                            YSLOW.util.event.fire("componentFetchDone", {
                                component_set: this
                            })
                        }
                    },
                    setSimpleAfterOnload: function(t, y) {
                        var B, A, E, p, u, v, q, s, o, r, C, D, x, F, z, w;
                        if (y) {
                            x = y.docBody;
                            F = y.doc;
                            z = y.components;
                            w = y.components
                        } else {
                            x = this.doc_comp && this.doc_comp.body;
                            F = this.root_node;
                            z = this.components;
                            w = this
                        }
                        if (!x) {
                            YSLOW.util.dump("doc body is empty");
                            return t(w)
                        }
                        p = F.createElement("div");
                        p.innerHTML = x;
                        u = p.getElementsByTagName("*");
                        for (B = 0, C = z.length; B < C; B += 1) {
                            E = z[B];
                            r = E.type;
                            if (r === "cssimage" || r === "doc") {
                                continue
                            }
                            q = false;
                            s = E.url;
                            for (A = 0, D = u.length; !q && A < D; A += 1) {
                                o = u[A];
                                v = o.src || o.href || o.getAttribute("src") || o.getAttribute("href") || (o.nodeName === "PARAM" && o.value);
                                q = (v === s)
                            }
                            E.after_onload = !q
                        }
                        t(w)
                    },
                    setAfterOnload: function(q, w) {
                        var y, D, G, v, A, o, s, t, L, x, J, r, u, p = YSLOW.util,
                            B = p.addEventListener,
                            C = p.removeEventListener,
                            I = setTimeout,
                            F = clearTimeout,
                            z = [],
                            K = {},
                            H = function(Q) {
                                var O, M, P, R, N;
                                F(v);
                                O = Q.type;
                                M = Q.attrName;
                                P = Q.target;
                                R = P.src || P.href || (P.getAttribute && (P.getAttribute("src") || P.getAttribute("href")));
                                N = P.dataOldSrc;
                                if (R && (O === "DOMNodeInserted" || (O === "DOMSubtreeModified" && R !== N) || (O === "DOMAttrModified" && (M === "src" || M === "href"))) && !K[R]) {
                                    K[R] = 1;
                                    z.push(P)
                                }
                                v = I(A, 1000)
                            },
                            E = function() {
                                var N, M, P, O, Q;
                                F(o);
                                P = D.getElementsByTagName("*");
                                for (N = 0, M = P.length; N < M; N += 1) {
                                    O = P[N];
                                    Q = O.src || O.href;
                                    if (Q) {
                                        O.dataOldSrc = Q
                                    }
                                }
                                B(G, "DOMSubtreeModified", H);
                                B(G, "DOMNodeInserted", H);
                                B(G, "DOMAttrModified", H);
                                v = I(A, 3000);
                                r = I(A, 10000)
                            };
                        if (w) {
                            s = YSLOW.ComponentSet.prototype;
                            t = w.docBody;
                            L = w.doc;
                            x = w.components;
                            J = x
                        } else {
                            s = this;
                            t = s.doc_comp && s.doc_comp.body;
                            L = s.root_node;
                            x = s.components;
                            J = s
                        }
                        if (typeof MutationEvent === "undefined" || YSLOW.antiIframe) {
                            return s.setSimpleAfterOnload(q, w)
                        }
                        if (!t) {
                            p.dump("doc body is empty");
                            return q(J)
                        }
                        A = function() {
                            var Q, P, N, M, O, S, R;
                            if (u) {
                                return
                            }
                            F(r);
                            F(v);
                            C(G, "DOMSubtreeModified", H);
                            C(G, "DOMNodeInserted", H);
                            C(G, "DOMAttrModified", H);
                            C(y, "load", E);
                            C(G, "load", E);
                            for (Q = 0, N = z.length; Q < N; Q += 1) {
                                O = z[Q];
                                S = O.src || O.href || (O.getAttribute && (O.getAttribute("src") || O.getAttribute("href")));
                                if (!S) {
                                    continue
                                }
                                for (P = 0, M = x.length; P < M; P += 1) {
                                    R = x[P];
                                    if (R.url === S) {
                                        R.after_onload = true
                                    }
                                }
                            }
                            y.parentNode.removeChild(y);
                            u = 1;
                            q(J)
                        };
                        y = L.createElement("iframe");
                        y.style.cssText = "position:absolute;top:-999em;";
                        L.body.appendChild(y);
                        G = y.contentWindow;
                        o = I(A, 3000);
                        if (G) {
                            D = G.document
                        } else {
                            G = D = y.contentDocument
                        }
                        B(G, "load", E);
                        B(y, "load", E);
                        D.open().write(t);
                        D.close();
                        B(G, "load", E)
                    }
                };
                YSLOW.ComponentSet.ignoreProtocols = ["data", "chrome", "javascript", "about", "resource", "jar", "chrome-extension", "file"];
                YSLOW.ComponentSet.isValidProtocol = function(r) {
                    var q, p, u, t = this.ignoreProtocols,
                        o = t.length;
                    r = r.toLowerCase();
                    p = r.indexOf(":");
                    if (p > 0) {
                        u = r.substr(0, p);
                        for (q = 0; q < o; q += 1) {
                            if (u === t[q]) {
                                return false
                            }
                        }
                    }
                    return true
                };
                YSLOW.ComponentSet.isValidURL = function(p) {
                    var o, q;
                    p = p.toLowerCase();
                    o = p.split(":");
                    if (o[0] === "http" || o[0] === "https") {
                        if (o[1].substr(0, 2) !== "//") {
                            return false
                        }
                        q = o[1].substr(2);
                        if (q.length === 0 || q.indexOf("/") === 0) {
                            return false
                        }
                    }
                    return true
                };
                YSLOW.Component = function(q, r, t, u) {
                    var s = u && u.obj,
                        p = (u && u.comp) || {};
                    this.url = q;
                    this.type = r;
                    this.parent = t;
                    this.headers = {};
                    this.raw_headers = "";
                    this.req_headers = null;
                    this.body = "";
                    this.compressed = false;
                    this.expires = undefined;
                    this.size = 0;
                    this.status = 0;
                    this.is_beacon = false;
                    this.method = "unknown";
                    this.cookie = "";
                    this.respTime = null;
                    this.after_onload = false;
                    this.object_prop = undefined;
                    if (r === undefined) {
                        this.type = "unknown"
                    }
                    this.get_info_state = "NONE";
                    if (s && r === "image" && s.width && s.height) {
                        this.object_prop = {
                            width: s.width,
                            height: s.height
                        }
                    }
                    if (p.containerNode) {
                        this.containerNode = p.containerNode
                    }
                    this.setComponentDetails(u)
                };
                YSLOW.Component.prototype.getInfoState = function() {
                    return this.get_info_state
                };
                YSLOW.Component.prototype.populateProperties = function(y, q) {
                    var t, o, p, v, w, s, x, u = this,
                        r = null,
                        z = "undefined";
                    if (u.headers.location && y) {
                        t = u.parent.addComponentNoDuplicate(u.headers.location, (u.type !== "redirect" ? u.type : "unknown"), u.url);
                        if (t && u.after_onload) {
                            t.after_onload = true
                        }
                        u.type = "redirect"
                    }
                    v = u.headers["content-length"];
                    o = YSLOW.util.trim(u.headers["content-encoding"]);
                    if (o === "gzip" || o === "deflate") {
                        u.compressed = o;
                        u.size = (u.body.length) ? u.body.length : r;
                        if (v) {
                            u.size_compressed = parseInt(v, 10) || v
                        } else {
                            if (typeof u.nsize !== z) {
                                u.size_compressed = u.nsize
                            } else {
                                u.size_compressed = Math.round(u.size / 3)
                            }
                        }
                    } else {
                        u.compressed = false;
                        u.size_compressed = r;
                        if (v) {
                            u.size = parseInt(v, 10)
                        } else {
                            if (typeof u.nsize !== z) {
                                u.size = parseInt(u.nsize, 10)
                            } else {
                                u.size = u.body.length
                            }
                        }
                    }
                    if (!u.size) {
                        if (typeof u.nsize !== z) {
                            u.size = u.nsize
                        } else {
                            u.size = u.body.length
                        }
                    }
                    u.uncompressed_size = u.body.length;
                    p = u.headers.expires;
                    if (p && p.length > 0) {
                        u.expires = new Date(p);
                        if (u.expires.toString() === "Invalid Date") {
                            u.expires = u.getMaxAge()
                        }
                    } else {
                        u.expires = u.getMaxAge()
                    }
                    if (u.type === "image" && !q) {
                        if (typeof Image !== z) {
                            s = new Image()
                        } else {
                            s = document.createElement("img")
                        }
                        if (u.body.length) {
                            w = "data:" + u.headers["content-type"] + ";base64," + YSLOW.util.base64Encode(u.body);
                            x = 1
                        } else {
                            w = u.url
                        }
                        s.onerror = function() {
                            s.onerror = r;
                            if (x) {
                                s.src = u.url
                            }
                        };
                        s.onload = function() {
                            s.onload = r;
                            if (s && s.width && s.height) {
                                if (u.object_prop) {
                                    u.object_prop.actual_width = s.width;
                                    u.object_prop.actual_height = s.height
                                } else {
                                    u.object_prop = {
                                        width: s.width,
                                        height: s.height,
                                        actual_width: s.width,
                                        actual_height: s.height
                                    }
                                }
                                if (s.width < 2 && s.height < 2) {
                                    u.is_beacon = true
                                }
                            }
                        };
                        s.src = w
                    }
                };
                YSLOW.Component.prototype.hasOldModifiedDate = function() {
                    var o = Number(new Date()),
                        p = this.headers["last-modified"];
                    if (typeof p !== "undefined") {
                        return ((o - Number(new Date(p))) > (24 * 60 * 60 * 1000))
                    }
                    return false
                };
                YSLOW.Component.prototype.hasFarFutureExpiresOrMaxAge = function() {
                    var r, p = Number(new Date()),
                        q = YSLOW.util.Preference.getPref("minFutureExpiresSeconds", 2 * 24 * 60 * 60),
                        o = q * 1000;
                    if (typeof this.expires === "object") {
                        r = Number(this.expires);
                        if ((r - p) > o) {
                            return true
                        }
                    }
                    return false
                };
                YSLOW.Component.prototype.getEtag = function() {
                    return this.headers.etag || ""
                };
                YSLOW.Component.prototype.getMaxAge = function() {
                    var p, q, o, r = this.headers["cache-control"];
                    if (r) {
                        p = r.indexOf("max-age");
                        if (p > -1) {
                            q = parseInt(r.substring(p + 8), 10);
                            if (q > 0) {
                                o = YSLOW.util.maxAgeToDate(q)
                            }
                        }
                    }
                    return o
                };
                YSLOW.Component.prototype.getSetCookieSize = function() {
                    var q, o, p = 0;
                    if (this.headers && this.headers["set-cookie"]) {
                        q = this.headers["set-cookie"].split("\n");
                        if (q.length > 0) {
                            for (o = 0; o < q.length; o += 1) {
                                p += q[o].length
                            }
                        }
                    }
                    return p
                };
                YSLOW.Component.prototype.getReceivedCookieSize = function() {
                    var q, o, p = 0;
                    if (this.cookie && this.cookie.length > 0) {
                        q = this.cookie.split("\n");
                        if (q.length > 0) {
                            for (o = 0; o < q.length; o += 1) {
                                p += q[o].length
                            }
                        }
                    }
                    return p
                };
                YSLOW.Component.prototype.setComponentDetails = function(r) {
                    var p = this,
                        q = function(t, o) {
                            var u;
                            p.status = o.status;
                            p.headers = {};
                            p.raw_headers = "";
                            o.headers.forEach(function(v) {
                                p.headers[v.name.toLowerCase()] = v.value;
                                p.raw_headers += v.name + ": " + v.value + "\n"
                            });
                            p.req_headers = {};
                            t.headers.forEach(function(v) {
                                p.req_headers[v.name.toLowerCase()] = v.value
                            });
                            p.method = t.method;
                            if (o.contentText) {
                                p.body = o.contentText
                            } else {
                                try {
                                    u = new XMLHttpRequest();
                                    u.open("GET", p.url, false);
                                    u.send();
                                    p.body = u.responseText
                                } catch (s) {
                                    p.body = {
                                        toString: function() {
                                            return ""
                                        },
                                        length: o.bodySize || 0
                                    }
                                }
                            }
                            p.response_type = p.type;
                            p.cookie = (p.headers["set-cookie"] || "") + (p.req_headers.cookie || "");
                            p.nsize = parseInt(p.headers["content-length"], 10) || o.bodySize;
                            p.respTime = o.time;
                            p.after_onload = (new Date(t.time).getTime()) > p.parent.onloadTimestamp;
                            p.populateProperties(false, true);
                            p.get_info_state = "DONE";
                            p.parent.onComponentGetInfoStateChange({
                                comp: p,
                                state: "DONE"
                            })
                        };
                    if (r.request && r.response) {
                        q(r.request, r.response)
                    }
                };
                YSLOW.controller = {
                    rules: {},
                    rulesets: {},
                    onloadTimestamp: null,
                    renderers: {},
                    default_ruleset_id: "ydefault",
                    run_pending: 0,
                    init: function() {
                        var p, o, r, q;
                        YSLOW.util.event.addListener("onload", function(s) {
                            this.onloadTimestamp = s.time;
                            YSLOW.util.setTimer(function() {
                                YSLOW.controller.run_pending_event()
                            })
                        }, this);
                        YSLOW.util.event.addListener("onUnload", function(s) {
                            this.run_pending = 0;
                            this.onloadTimestamp = null
                        }, this);
                        p = YSLOW.util.Preference.getPrefList("customRuleset.", undefined);
                        if (p && p.length > 0) {
                            for (o = 0; o < p.length; o += 1) {
                                q = p[o].value;
                                if (typeof q === "string" && q.length > 0) {
                                    r = JSON.parse(q, null);
                                    r.custom = true;
                                    this.addRuleset(r)
                                }
                            }
                        }
                        this.default_ruleset_id = YSLOW.util.Preference.getPref("defaultRuleset", "ydefault");
                        this.loadRulePreference()
                    },
                    run: function(r, s, p) {
                        var t, o, q = r.document;
                        if (!q || !q.location || q.location.href.indexOf("about:") === 0 || "undefined" === typeof q.location.hostname) {
                            if (!p) {
                                o = "Please enter a valid website address before running YSlow.";
                                YSLOW.ysview.openDialog(YSLOW.ysview.panel_doc, 389, 150, o, "", "Ok")
                            }
                            return
                        }
                        if (!s.PAGE.loaded) {
                            this.run_pending = {
                                win: r,
                                yscontext: s
                            };
                            return
                        }
                        YSLOW.util.event.fire("peelStart", undefined);
                        t = YSLOW.peeler.peel(q, this.onloadTimestamp);
                        s.component_set = t;
                        YSLOW.util.event.fire("peelComplete", {
                            component_set: t
                        });
                        t.notifyPeelDone()
                    },
                    run_pending_event: function() {
                        if (this.run_pending) {
                            this.run(this.run_pending.win, this.run_pending.yscontext, false);
                            this.run_pending = 0
                        }
                    },
                    lint: function(F, q, o) {
                        var r, v, D, u, w, x, E, C = [],
                            A = [],
                            B = 0,
                            z = 0,
                            s = this,
                            t = s.rulesets,
                            y = s.default_ruleset_id;
                        if (o) {
                            C = t[o]
                        } else {
                            if (y && t[y]) {
                                C = t[y]
                            } else {
                                for (D in t) {
                                    if (t.hasOwnProperty(D) && t[D]) {
                                        C = t[D];
                                        break
                                    }
                                }
                            }
                        }
                        v = C.rules;
                        for (D in v) {
                            if (v.hasOwnProperty(D) && v[D] && this.rules.hasOwnProperty(D)) {
                                try {
                                    r = this.rules[D];
                                    u = YSLOW.util.merge(r.config, v[D]);
                                    w = r.lint(F, q.component_set, u);
                                    x = (C.weights ? C.weights[D] : undefined);
                                    if (x !== undefined) {
                                        x = parseInt(x, 10)
                                    }
                                    if (x === undefined || x < 0 || x > 100) {
                                        if (t.ydefault.weights[D]) {
                                            x = t.ydefault.weights[D]
                                        } else {
                                            x = 5
                                        }
                                    }
                                    w.weight = x;
                                    if (w.score !== undefined) {
                                        if (typeof w.score !== "number") {
                                            E = parseInt(w.score, 10);
                                            if (!isNaN(E)) {
                                                w.score = E
                                            }
                                        }
                                        if (typeof w.score === "number") {
                                            z += w.weight;
                                            if (!YSLOW.util.Preference.getPref("allowNegativeScore", false)) {
                                                if (w.score < 0) {
                                                    w.score = 0
                                                }
                                                if (typeof w.score !== "number") {
                                                    w.score = -1
                                                }
                                            }
                                            if (w.score !== 0) {
                                                B += w.score * (typeof w.weight !== "undefined" ? w.weight : 1)
                                            }
                                        }
                                    }
                                    w.name = r.name;
                                    w.category = r.category;
                                    w.rule_id = D;
                                    A[A.length] = w
                                } catch (p) {
                                    YSLOW.util.dump("YSLOW.controller.lint: " + D, p);
                                    YSLOW.util.event.fire("lintError", {
                                        rule: D,
                                        message: p
                                    })
                                }
                            }
                        }
                        q.PAGE.overallScore = B / (z > 0 ? z : 1);
                        q.result_set = new YSLOW.ResultSet(A, q.PAGE.overallScore, C);
                        q.result_set.url = q.component_set.doc_comp.url;
                        YSLOW.util.event.fire("lintResultReady", {
                            yslowContext: q
                        });
                        return q.result_set
                    },
                    runTool: function(B, y, p) {
                        var E, u, A, t, w, o, z, q, D, C, v, x = YSLOW.Tools.getTool(B);
                        try {
                            if (typeof x === "object") {
                                E = x.run(y.document, y.component_set, p);
                                if (x.print_output) {
                                    u = "";
                                    if (typeof E === "object") {
                                        u = E.html
                                    } else {
                                        if (typeof E === "string") {
                                            u = E
                                        }
                                    }
                                    A = YSLOW.util.getNewDoc();
                                    v = A.body || A.documentElement;
                                    v.innerHTML = u;
                                    t = A.getElementsByTagName("head")[0];
                                    if (typeof E.css === "undefined") {
                                        o = "chrome://yslow/content/yslow/tool.css";
                                        z = new XMLHttpRequest();
                                        z.open("GET", o, false);
                                        z.send(null);
                                        w = z.responseText
                                    } else {
                                        w = E.css
                                    }
                                    if (typeof w === "string") {
                                        q = A.createElement("style");
                                        q.setAttribute("type", "text/css");
                                        q.appendChild(A.createTextNode(w));
                                        t.appendChild(q)
                                    }
                                    if (typeof E.js !== "undefined") {
                                        D = A.createElement("script");
                                        D.setAttribute("type", "text/javascript");
                                        D.appendChild(A.createTextNode(E.js));
                                        t.appendChild(D)
                                    }
                                    if (typeof E.plot_component !== "undefined" && E.plot_component === true) {
                                        YSLOW.renderer.plotComponents(A, y)
                                    }
                                }
                            } else {
                                C = B + " is not a tool.";
                                YSLOW.util.dump(C);
                                YSLOW.util.event.fire("toolError", {
                                    tool_id: B,
                                    message: C
                                })
                            }
                        } catch (r) {
                            YSLOW.util.dump("YSLOW.controller.runTool: " + B, r);
                            YSLOW.util.event.fire("toolError", {
                                tool_id: B,
                                message: r
                            })
                        }
                    },
                    render: function(s, o, r) {
                        var q = this.renderers[s],
                            p = "";
                        if (q.supports[o] !== undefined && q.supports[o] === 1) {
                            switch (o) {
                                case "components":
                                    p = q.componentsView(r.comps, r.total_size);
                                    break;
                                case "reportcard":
                                    p = q.reportcardView(r.result_set);
                                    break;
                                case "stats":
                                    p = q.statsView(r.stats);
                                    break;
                                case "tools":
                                    p = q.toolsView(r.tools);
                                    break;
                                case "rulesetEdit":
                                    p = q.rulesetEditView(r.rulesets);
                                    break
                            }
                        }
                        return p
                    },
                    getRenderer: function(o) {
                        return this.renderers[o]
                    },
                    addRule: function(q) {
                        var o, p, r = ["id", "name", "config", "info", "lint"];
                        if (YSLOW.doc.rules && YSLOW.doc.rules[q.id]) {
                            p = YSLOW.doc.rules[q.id];
                            if (p.name) {
                                q.name = p.name
                            }
                            if (p.info) {
                                q.info = p.info
                            }
                        }
                        for (o = 0; o < r.length; o += 1) {
                            if (typeof q[r[o]] === "undefined") {
                                throw new YSLOW.Error("Interface error", "Improperly implemented rule interface")
                            }
                        }
                        if (this.rules[q.id] !== undefined) {
                            throw new YSLOW.Error("Rule register error", q.id + " is already defined.")
                        }
                        this.rules[q.id] = q
                    },
                    addRuleset: function(o, r) {
                        var p, q = ["id", "name", "rules"];
                        for (p = 0; p < q.length; p += 1) {
                            if (typeof o[q[p]] === "undefined") {
                                throw new YSLOW.Error("Interface error", "Improperly implemented ruleset interface")
                            }
                            if (this.checkRulesetName(o.id) && r !== true) {
                                throw new YSLOW.Error("Ruleset register error", o.id + " is already defined.")
                            }
                        }
                        this.rulesets[o.id] = o
                    },
                    removeRuleset: function(p) {
                        var o = this.rulesets[p];
                        if (o && o.custom === true) {
                            delete this.rulesets[p];
                            if (this.default_ruleset_id === p) {
                                this.default_ruleset_id = "ydefault";
                                YSLOW.util.Preference.setPref("defaultRuleset", this.default_ruleset_id)
                            }
                            return o
                        }
                        return null
                    },
                    saveRulesetToPref: function(o) {
                        if (o.custom === true) {
                            YSLOW.util.Preference.setPref("customRuleset." + o.id, JSON.stringify(o, null, 2))
                        }
                    },
                    deleteRulesetFromPref: function(o) {
                        if (o.custom === true) {
                            YSLOW.util.Preference.deletePref("customRuleset." + o.id)
                        }
                    },
                    getRuleset: function(o) {
                        return this.rulesets[o]
                    },
                    addRenderer: function(o) {
                        this.renderers[o.id] = o
                    },
                    getRegisteredRuleset: function() {
                        return this.rulesets
                    },
                    getRegisteredRules: function() {
                        return this.rules
                    },
                    getRule: function(o) {
                        return this.rules[o]
                    },
                    checkRulesetName: function(q) {
                        var r, p, o = this.rulesets;
                        q = q.toLowerCase();
                        for (r in o) {
                            if (o.hasOwnProperty(r)) {
                                p = o[r];
                                if (p.id.toLowerCase() === q || p.name.toLowerCase() === q) {
                                    return true
                                }
                            }
                        }
                        return false
                    },
                    setDefaultRuleset: function(o) {
                        if (this.rulesets[o] !== undefined) {
                            this.default_ruleset_id = o;
                            YSLOW.util.Preference.setPref("defaultRuleset", o)
                        }
                    },
                    getDefaultRuleset: function() {
                        if (this.rulesets[this.default_ruleset_id] === undefined) {
                            this.setDefaultRuleset("ydefault")
                        }
                        return this.rulesets[this.default_ruleset_id]
                    },
                    getDefaultRulesetId: function() {
                        return this.default_ruleset_id
                    },
                    loadRulePreference: function() {
                        var p = this.getRule("yexpires"),
                            o = YSLOW.util.Preference.getPref("minFutureExpiresSeconds", 2 * 24 * 60 * 60);
                        if (o > 0 && p) {
                            p.config.howfar = o
                        }
                    }
                };
                YSLOW.util = {
                    merge: function(q, p) {
                        var r, s = {};
                        for (r in q) {
                            if (q.hasOwnProperty(r)) {
                                s[r] = q[r]
                            }
                        }
                        for (r in p) {
                            if (p.hasOwnProperty(r)) {
                                s[r] = p[r]
                            }
                        }
                        return s
                    },
                    dump: function() {
                        var o;
                        if (!YSLOW.DEBUG) {
                            return
                        }
                        o = Array.prototype.slice.apply(arguments);
                        o = o && o.length === 1 ? o[0] : o;
                        try {
                            if (typeof Firebug !== "undefined" && Firebug.Console && Firebug.Console.log) {
                                Firebug.Console.log(o)
                            } else {
                                if (typeof Components !== "undefined" && Components.classes && Components.interfaces) {
                                    Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(JSON.stringify(o, null, 2))
                                }
                            }
                        } catch (q) {
                            try {
                                console.log(o)
                            } catch (p) {}
                        }
                    },
                    filter: function(r, s, p) {
                        var q, o = p ? [] : {};
                        for (q in r) {
                            if (r.hasOwnProperty(q) && s(q, r[q])) {
                                o[p ? o.length : q] = r[q]
                            }
                        }
                        return o
                    },
                    expires_month: {
                        Jan: 1,
                        Feb: 2,
                        Mar: 3,
                        Apr: 4,
                        May: 5,
                        Jun: 6,
                        Jul: 7,
                        Aug: 8,
                        Sep: 9,
                        Oct: 10,
                        Nov: 11,
                        Dec: 12
                    },
                    prettyExpiresDate: function(o) {
                        var p;
                        if (Object.prototype.toString.call(o) === "[object Date]" && o.toString() !== "Invalid Date" && !isNaN(o)) {
                            p = o.getMonth() + 1;
                            return o.getFullYear() + "/" + p + "/" + o.getDate()
                        } else {
                            if (!o) {
                                return "no expires"
                            }
                        }
                        return "invalid date object"
                    },
                    maxAgeToDate: function(p) {
                        var o = new Date();
                        o = o.getTime() + parseInt(p, 10) * 1000;
                        return new Date(o)
                    },
                    plural: function(q, r) {
                        var p, o = q,
                            s = {
                                are: ["are", "is"],
                                s: ["s", ""],
                                "do": ["do", "does"],
                                num: [r, r]
                            };
                        for (p in s) {
                            if (s.hasOwnProperty(p)) {
                                o = o.replace(new RegExp("%" + p + "%", "gm"), (r === 1) ? s[p][1] : s[p][0])
                            }
                        }
                        return o
                    },
                    countExpressions: function(q) {
                        var o = 0,
                            p;
                        p = q.indexOf("expression(");
                        while (p !== -1) {
                            o += 1;
                            p = q.indexOf("expression(", p + 1)
                        }
                        return o
                    },
                    countAlphaImageLoaderFilter: function(t) {
                        var r, s, q, u, p = 0,
                            v = 0,
                            o = {};
                        r = t.indexOf("filter:");
                        while (r !== -1) {
                            q = false;
                            if (r > 0 && t.charAt(r - 1) === "_") {
                                q = true
                            }
                            s = t.indexOf(";", r + 7);
                            if (s !== -1) {
                                u = t.substring(r + 7, s);
                                if (u.indexOf("AlphaImageLoader") !== -1) {
                                    if (q) {
                                        v += 1
                                    } else {
                                        p += 1
                                    }
                                }
                            }
                            r = t.indexOf("filter:", r + 1)
                        }
                        if (v > 0) {
                            o.hackFilter = v
                        }
                        if (p > 0) {
                            o.filter = p
                        }
                        return o
                    },
                    getHostname: function(p) {
                        var o = p.split("/")[2];
                        return (o && o.split(":")[0]) || ""
                    },
                    getUniqueDomains: function(u, s) {
                        var r, p, t, o = {},
                            q = [];
                        for (r = 0, p = u.length; r < p; r += 1) {
                            t = u[r].url.split("/");
                            if (t[2]) {
                                o[t[2].split(":")[0]] = 1
                            }
                        }
                        for (r in o) {
                            if (o.hasOwnProperty(r)) {
                                if (!s) {
                                    q.push(r)
                                } else {
                                    t = r.split(".");
                                    if (isNaN(parseInt(t[t.length - 1], 10))) {
                                        q.push(r)
                                    }
                                }
                            }
                        }
                        return q
                    },
                    summaryByDomain: function(p, z, q) {
                        var v, u, y, t, A, s, w, r, B, x, C = {},
                            o = [];
                        z = [].concat(z);
                        r = z.length;
                        for (v = 0, y = p.length; v < y; v += 1) {
                            w = p[v];
                            t = w.url.split("/");
                            if (t[2]) {
                                A = t[2].split(":")[0];
                                s = C[A];
                                if (!s) {
                                    s = {
                                        domain: A,
                                        count: 0
                                    };
                                    C[A] = s
                                }
                                s.count += 1;
                                for (u = 0; u < r; u += 1) {
                                    B = z[u];
                                    x = s["sum_" + B] || 0;
                                    x += parseInt(w[B], 10) || 0;
                                    s["sum_" + B] = x
                                }
                            }
                        }
                        for (s in C) {
                            if (C.hasOwnProperty(s)) {
                                if (!q) {
                                    o.push(C[s])
                                } else {
                                    t = s.split(".");
                                    if (isNaN(parseInt(t[t.length - 1], 10))) {
                                        o.push(C[s])
                                    }
                                }
                            }
                        }
                        return o
                    },
                    isMinified: function(q) {
                        var o = q.length,
                            p;
                        if (o === 0) {
                            return true
                        }
                        p = q.replace(/\n| {2}|\t|\r/g, "").length;
                        if (((o - p) / o) > 0.2) {
                            return false
                        }
                        return true
                    },
                    isETagGood: function(o) {
                        var q = /^[0-9a-f]+:[0-9a-f]+$/,
                            p = /^[0-9a-f]+\-[0-9a-f]+\-[0-9a-f]+$/;
                        if (!o) {
                            return true
                        }
                        o = o.replace(/^["']|["'][\s\S]*$/g, "");
                        return !(p.test(o) || q.test(o))
                    },
                    getComponentType: function(o) {
                        var p = "unknown";
                        if (o && typeof o === "string") {
                            if (o === "text/html" || o === "text/plain") {
                                p = "doc"
                            } else {
                                if (o === "text/css") {
                                    p = "css"
                                } else {
                                    if (/javascript/.test(o)) {
                                        p = "js"
                                    } else {
                                        if (/flash/.test(o)) {
                                            p = "flash"
                                        } else {
                                            if (/image/.test(o)) {
                                                p = "image"
                                            } else {
                                                if (/font/.test(o)) {
                                                    p = "font"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        return p
                    },
                    base64Encode: function(t) {
                        var s, r, q, v, p = "",
                            u = 0,
                            o = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
                        for (s = 0; s < t.length; s += 3) {
                            r = t.charCodeAt(s);
                            if ((s + 1) < t.length) {
                                q = t.charCodeAt(s + 1)
                            } else {
                                q = 0;
                                u += 1
                            }
                            if ((s + 2) < t.length) {
                                v = t.charCodeAt(s + 2)
                            } else {
                                v = 0;
                                u += 1
                            }
                            p += o[(r & 252) >> 2];
                            p += o[((r & 3) << 4) | ((q & 240) >> 4)];
                            if (u > 0) {
                                p += "="
                            } else {
                                p += o[((q & 15) << 2) | ((v & 192) >> 6)]
                            }
                            if (u > 1) {
                                p += "="
                            } else {
                                p += o[(v & 63)]
                            }
                        }
                        return p
                    },
                    getXHR: function() {
                        var o = 0,
                            r = null,
                            p = ["MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
                        if (typeof XMLHttpRequest === "function") {
                            return new XMLHttpRequest()
                        }
                        for (o = 0; o < p.length; o += 1) {
                            try {
                                r = new ActiveXObject(p[o]);
                                break
                            } catch (q) {}
                        }
                        return r
                    },
                    getComputedStyle: function(t, p, o) {
                        var s, r, q = "";
                        if (t.currentStyle) {
                            q = t.currentStyle[p]
                        }
                        if (t.ownerDocument && t.ownerDocument.defaultView && document.defaultView.getComputedStyle) {
                            s = t.ownerDocument.defaultView.getComputedStyle(t, "");
                            if (s) {
                                q = s[p]
                            }
                        }
                        if (!o) {
                            return q
                        }
                        if (typeof q !== "string") {
                            return false
                        }
                        r = q.match(/\burl\((\'|\"|)([^\'\"]+?)\1\)/);
                        if (r) {
                            return r[2]
                        } else {
                            return false
                        }
                    },
                    escapeHtml: function(o) {
                        return (o || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    },
                    escapeQuotes: function(p, o) {
                        if (o === "single") {
                            return p.replace(/\'/g, "\\'")
                        }
                        if (o === "double") {
                            return p.replace(/\"/g, '\\"')
                        }
                        return p.replace(/\'/g, "\\'").replace(/\"/g, '\\"')
                    },
                    formatHeaderName: (function() {
                        var o = {
                            "content-md5": "Content-MD5",
                            dnt: "DNT",
                            etag: "ETag",
                            p3p: "P3P",
                            te: "TE",
                            "www-authenticate": "WWW-Authenticate",
                            "x-att-deviceid": "X-ATT-DeviceId",
                            "x-cdn": "X-CDN",
                            "x-ua-compatible": "X-UA-Compatible",
                            "x-xss-protection": "X-XSS-Protection"
                        };
                        return function(q) {
                            var p = q.toLowerCase();
                            if (o.hasOwnProperty(p)) {
                                return o[p]
                            } else {
                                return p.replace(/(^|-)([a-z])/g, function(r, s, t) {
                                    return s + t.toUpperCase()
                                })
                            }
                        }
                    }()),
                    mod: function(o, p) {
                        return Math.round(o - (Math.floor(o / p) * p))
                    },
                    briefUrl: function(q, o) {
                        var p, r, s, t;
                        o = o || 100;
                        if (q === undefined) {
                            return ""
                        }
                        p = q.indexOf("//");
                        if (-1 !== p) {
                            r = q.indexOf("?");
                            if (-1 !== r) {
                                q = q.substring(0, r) + "?..."
                            }
                            if (q.length > o) {
                                s = q.indexOf("/", p + 2);
                                t = q.lastIndexOf("/");
                                if (-1 !== s && -1 !== t && s !== t) {
                                    q = q.substring(0, s + 1) + "..." + q.substring(t)
                                } else {
                                    q = q.substring(0, o + 1) + "..."
                                }
                            }
                        }
                        return q
                    },
                    prettyAnchor: function(w, p, r, q, u, o, x) {
                        var s, v = "",
                            t = "",
                            y = 0;
                        if (typeof p === "undefined") {
                            p = w
                        }
                        if (typeof r === "undefined") {
                            r = ""
                        } else {
                            r = ' class="' + r + '"'
                        }
                        if (typeof u === "undefined") {
                            u = 100
                        }
                        if (typeof o === "undefined") {
                            o = 1
                        }
                        x = (x) ? ' rel="' + x + '"' : "";
                        p = YSLOW.util.escapeHtml(p);
                        w = YSLOW.util.escapeHtml(w);
                        s = YSLOW.util.escapeQuotes(p, "double");
                        if (q) {
                            w = YSLOW.util.briefUrl(w, u);
                            v = ' title="' + s + '"'
                        }
                        while (0 < w.length) {
                            t += "<a" + x + r + v + ' href="' + s + '" onclick="javascript:document.ysview.openLink(\'' + YSLOW.util.escapeQuotes(p) + "'); return false;\">" + w.substring(0, u);
                            w = w.substring(u);
                            y += 1;
                            if (y >= o) {
                                if (0 < w.length) {
                                    t += "[snip]"
                                }
                                t += "</a>";
                                break
                            } else {
                                t += "</a><font style='font-size: 0px;'> </font>"
                            }
                        }
                        return t
                    },
                    kbSize: function(o) {
                        var p = o % (o > 100 ? 100 : 10);
                        o -= p;
                        return parseFloat(o / 1000) + (0 === (o % 1000) ? ".0" : "") + "K"
                    },
                    prettyTypes: {
                        image: "Image",
                        doc: "HTML/Text",
                        cssimage: "CSS Image",
                        css: "Stylesheet File",
                        js: "JavaScript File",
                        flash: "Flash Object",
                        iframe: "IFrame",
                        xhr: "XMLHttpRequest",
                        redirect: "Redirect",
                        favicon: "Favicon",
                        unknown: "Unknown"
                    },
                    prettyType: function(o) {
                        return YSLOW.util.prettyTypes[o]
                    },
                    prettyScore: function(p) {
                        var o = "F";
                        if (!parseInt(p, 10) && p !== 0) {
                            return p
                        }
                        if (p === -1) {
                            return "N/A"
                        }
                        if (p >= 90) {
                            o = "A"
                        } else {
                            if (p >= 80) {
                                o = "B"
                            } else {
                                if (p >= 70) {
                                    o = "C"
                                } else {
                                    if (p >= 60) {
                                        o = "D"
                                    } else {
                                        if (p >= 50) {
                                            o = "E"
                                        }
                                    }
                                }
                            }
                        }
                        return o
                    },
                    getResults: function(u, Q) {
                        var M, J, H, s, r, F, R, E, D, v, t, p, U, O, G, q, C, B, w, y, L, I, z, x = / <button [\s\S]+<\/button>/,
                            o = YSLOW.util,
                            A = o.isArray,
                            T = {},
                            N = {},
                            K = [],
                            S = {},
                            P = {};
                        Q = (Q || "basic").split(",");
                        for (M = 0, O = Q.length; M < O; M += 1) {
                            if (Q[M] === "all") {
                                G = C = q = true;
                                break
                            } else {
                                switch (Q[M]) {
                                    case "grade":
                                        G = true;
                                        break;
                                    case "stats":
                                        C = true;
                                        break;
                                    case "comps":
                                        q = true;
                                        break
                                }
                            }
                        }
                        S.w = parseInt(u.PAGE.totalSize, 10);
                        S.o = parseInt(u.PAGE.overallScore, 10);
                        S.u = encodeURIComponent(u.result_set.url);
                        S.r = parseInt(u.PAGE.totalRequests, 10);
                        y = o.getPageSpaceid(u.component_set);
                        if (y) {
                            S.s = encodeURI(y)
                        }
                        S.i = u.result_set.getRulesetApplied().id;
                        if (u.PAGE.t_done) {
                            S.lt = parseInt(u.PAGE.t_done, 10)
                        }
                        if (G) {
                            H = u.result_set.getResults();
                            for (M = 0, O = H.length; M < O; M += 1) {
                                D = {};
                                B = H[M];
                                if (B.hasOwnProperty("score")) {
                                    if (B.score >= 0) {
                                        D.score = parseInt(B.score, 10)
                                    } else {
                                        if (B.score === -1) {
                                            D.score = "n/a"
                                        }
                                    }
                                }
                                D.message = B.message.replace(/javascript:document\.ysview\.openLink\('(.+)'\)/, "$1");
                                F = B.components;
                                if (A(F)) {
                                    D.components = [];
                                    for (J = 0, w = F.length; J < w; J += 1) {
                                        R = F[J];
                                        if (typeof R === "string") {
                                            s = R
                                        } else {
                                            if (typeof R.url === "string") {
                                                s = R.url
                                            }
                                        }
                                        if (s) {
                                            s = encodeURIComponent(s.replace(x, ""));
                                            D.components.push(s)
                                        }
                                    }
                                }
                                P[B.rule_id] = D
                            }
                            S.g = P
                        }
                        if (C) {
                            S.w_c = parseInt(u.PAGE.totalSizePrimed, 10);
                            S.r_c = parseInt(u.PAGE.totalRequestsPrimed, 10);
                            for (r in u.PAGE.totalObjCount) {
                                if (u.PAGE.totalObjCount.hasOwnProperty(r)) {
                                    T[r] = {
                                        r: u.PAGE.totalObjCount[r],
                                        w: u.PAGE.totalObjSize[r]
                                    }
                                }
                            }
                            S.stats = T;
                            for (r in u.PAGE.totalObjCountPrimed) {
                                if (u.PAGE.totalObjCountPrimed.hasOwnProperty(r)) {
                                    N[r] = {
                                        r: u.PAGE.totalObjCountPrimed[r],
                                        w: u.PAGE.totalObjSizePrimed[r]
                                    }
                                }
                            }
                            S.stats_c = N
                        }
                        if (q) {
                            F = u.component_set.components;
                            for (M = 0, O = F.length; M < O; M += 1) {
                                R = F[M];
                                E = encodeURIComponent(R.url);
                                D = {
                                    type: R.type,
                                    url: E,
                                    size: R.size,
                                    resp: R.respTime
                                };
                                if (R.size_compressed) {
                                    D.gzip = R.size_compressed
                                }
                                if (R.expires && R.expires instanceof Date) {
                                    D.expires = o.prettyExpiresDate(R.expires)
                                }
                                v = R.getReceivedCookieSize();
                                if (v > 0) {
                                    D.cr = v
                                }
                                t = R.getSetCookieSize();
                                if (t > 0) {
                                    D.cs = t
                                }
                                p = R.getEtag();
                                if (typeof p === "string" && p.length > 0) {
                                    D.etag = p
                                }
                                D.headers = {};
                                if (R.req_headers) {
                                    I = R.req_headers;
                                    D.headers.request = {};
                                    z = D.headers.request;
                                    for (L in I) {
                                        if (I.hasOwnProperty(L)) {
                                            z[o.formatHeaderName(L)] = I[L]
                                        }
                                    }
                                }
                                if (R.headers) {
                                    I = R.headers;
                                    D.headers.response = {};
                                    z = D.headers.response;
                                    for (L in I) {
                                        if (I.hasOwnProperty(L)) {
                                            z[o.formatHeaderName(L)] = I[L]
                                        }
                                    }
                                }
                                K.push(D)
                            }
                            S.comps = K
                        }
                        return S
                    },
                    sendBeacon: function(t, s, p) {
                        var u, x, y, q, v, r = "",
                            w = YSLOW.util,
                            z = w.Preference,
                            o = "get";
                        s = (s || "basic").split(",");
                        for (u = 0, x = s.length; u < x; u += 1) {
                            if (s[u] === "all") {
                                o = "post";
                                break
                            } else {
                                switch (s[u]) {
                                    case "grade":
                                        o = "post";
                                        break;
                                    case "stats":
                                        o = "post";
                                        break;
                                    case "comps":
                                        o = "post";
                                        break
                                }
                            }
                        }
                        if (o === "post") {
                            r = JSON.stringify(t, null);
                            y = w.getXHR();
                            y.open("POST", p, true);
                            y.setRequestHeader("Content-Length", r.length);
                            y.setRequestHeader("Content-Type", "application/json");
                            y.send(r)
                        } else {
                            for (q in t) {
                                if (t.hasOwnProperty(q)) {
                                    r += q + "=" + t[q] + "&"
                                }
                            }
                            v = new Image();
                            v.src = p + "?" + r
                        }
                        return r
                    },
                    getDict: function(r, z) {
                        var v, x, q, u, o, y, t, p = YSLOW,
                            w = p.controller,
                            A = p.doc.rules,
                            s = {
                                w: "size",
                                o: "overall score",
                                u: "url",
                                r: "total number of requests",
                                s: "space id of the page",
                                i: "id of the ruleset used",
                                lt: "page load time",
                                grades: "100 >= A >= 90 > B >= 80 > C >= 70 > D >= 60 > E >= 50 > F >= 0 > N/A = -1"
                            };
                        r = (r || "basic").split(",");
                        z = z || "ydefault";
                        y = w.rulesets[z].weights;
                        for (v = 0, x = r.length; v < x; v += 1) {
                            if (r[v] === "all") {
                                q = u = o = true;
                                break
                            } else {
                                switch (r[v]) {
                                    case "grade":
                                        q = true;
                                        break;
                                    case "stats":
                                        u = true;
                                        break;
                                    case "comps":
                                        o = true;
                                        break
                                }
                            }
                        }
                        if (q) {
                            s.g = "scores of all rules in the ruleset";
                            s.rules = {};
                            for (t in y) {
                                if (y.hasOwnProperty(t)) {
                                    s.rules[t] = A[t];
                                    s.rules[t].weight = y[t]
                                }
                            }
                        }
                        if (u) {
                            s.w_c = "page weight with primed cache";
                            s.r_c = "number of requests with primed cache";
                            s.stats = "number of requests and weight grouped by component type";
                            s.stats_c = "number of request and weight of components group by component type with primed cache"
                        }
                        if (o) {
                            s.comps = "array of all the components found on the page"
                        }
                        return s
                    },
                    isObject: function(p) {
                        return Object.prototype.toString.call(p).indexOf("Object") > -1
                    },
                    isArray: function(p) {
                        if (Array.isArray) {
                            return Array.isArray(p)
                        } else {
                            return Object.prototype.toString.call(p).indexOf("Array") > -1
                        }
                    },
                    decodeURIComponent: function(p) {
                        try {
                            return decodeURIComponent(p)
                        } catch (o) {
                            return p
                        }
                    },
                    decodeEntities: function(o) {
                        return String(o).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
                    },
                    safeXML: (function() {
                        var o = this.decodeURIComponent,
                            p = /[<&>]/;
                        return function(q, r) {
                            if (r) {
                                q = o(q)
                            }
                            if (p.test(q)) {
                                return "<![CDATA[" + q + "]]>"
                            }
                            return q
                        }
                    }()),
                    objToXML: function(s, q) {
                        var o, p = YSLOW.util,
                            t = p.safeXML,
                            r = '<?xml version="1.0" encoding="UTF-8"?>';
                        o = function(A) {
                            var x, y, v, u, z, w;
                            for (x in A) {
                                if (A.hasOwnProperty(x)) {
                                    y = A[x];
                                    r += "<" + x + ">";
                                    if (p.isArray(y)) {
                                        for (v = 0, u = y.length; v < u; v += 1) {
                                            z = y[v];
                                            w = typeof z;
                                            r += "<item>";
                                            if (w === "string" || w === "number") {
                                                r += t(z, x === "components")
                                            } else {
                                                o(z)
                                            }
                                            r += "</item>"
                                        }
                                    } else {
                                        if (p.isObject(y)) {
                                            o(y)
                                        } else {
                                            r += t(y, x === "u" || x === "url")
                                        }
                                    }
                                    r += "</" + x + ">"
                                }
                            }
                        };
                        q = q || "results";
                        r += "<" + q + ">";
                        o(s);
                        r += "</" + q + ">";
                        return r
                    },
                    prettyPrintResults: function(s) {
                        var q, p = YSLOW.util,
                            t = "",
                            r = {},
                            u = {
                                w: "size",
                                o: "overall score",
                                u: "url",
                                r: "# of requests",
                                s: "space id",
                                i: "ruleset",
                                lt: "page load time",
                                g: "scores",
                                w_c: "page size (primed cache)",
                                r_c: "# of requests (primed cache)",
                                stats: "statistics by component",
                                stats_c: "statistics by component (primed cache)",
                                comps: "components found on the page",
                                components: "offenders",
                                cr: "received cookie size",
                                cs: "set cookie size",
                                resp: "response time"
                            },
                            o = function(x) {
                                var v, w = r[x];
                                if (typeof w === "undefined") {
                                    v = [];
                                    v.length = (4 * x) + 1;
                                    r[x] = w = v.join(" ")
                                }
                                return w
                            };
                        q = function(B, C) {
                            var y, z, w, v, A, x;
                            for (y in B) {
                                if (B.hasOwnProperty(y)) {
                                    z = B[y];
                                    t += o(C) + (u[y] || y) + ":";
                                    if (p.isArray(z)) {
                                        t += "\n";
                                        for (w = 0, v = z.length; w < v; w += 1) {
                                            A = z[w];
                                            x = typeof A;
                                            if (x === "string" || x === "number") {
                                                t += o(C + 1) + p.decodeURIComponent(A) + "\n"
                                            } else {
                                                q(A, C + 1);
                                                if (w < v - 1) {
                                                    t += "\n"
                                                }
                                            }
                                        }
                                    } else {
                                        if (p.isObject(z)) {
                                            t += "\n";
                                            q(z, C + 1)
                                        } else {
                                            if (y === "score" || y === "o") {
                                                z = p.prettyScore(z) + " (" + z + ")"
                                            }
                                            if (y === "w" || y === "w_c" || y === "size" || y === "gzip" || y === "cr" || y === "cs") {
                                                z = p.kbSize(z) + " (" + z + " bytes)"
                                            }
                                            t += " " + p.decodeURIComponent(z) + "\n"
                                        }
                                    }
                                }
                            }
                        };
                        q(s, 0);
                        return t
                    },
                    testResults: function(w, q) {
                        var A, F, p, x, C, r, B, D, t = [],
                            z = {
                                a: 90,
                                b: 80,
                                c: 70,
                                d: 60,
                                e: 50,
                                f: 0,
                                "n/a": -1
                            },
                            E = YSLOW,
                            o = E.util,
                            y = o.isObject(q),
                            v = E.doc.rules,
                            s = function(H) {
                                var I = parseInt(H, 10);
                                if (isNaN(I) && typeof H === "string") {
                                    I = z[H.toLowerCase()]
                                }
                                if (I === 0) {
                                    return 0
                                }
                                return I || A || z.b
                            },
                            u = function(H) {
                                if (r) {
                                    return r
                                }
                                if (!y) {
                                    r = s(q);
                                    return r
                                } else {
                                    if (q.hasOwnProperty(H)) {
                                        return s(q[H])
                                    } else {
                                        return A || z.b
                                    }
                                }
                            },
                            G = function(L, J, H, I, M) {
                                var K = v.hasOwnProperty(H) && v[H].name;
                                t.push({
                                    ok: L >= J,
                                    score: L,
                                    grade: o.prettyScore(L),
                                    name: H,
                                    description: K || "",
                                    message: I,
                                    offenders: M
                                })
                            };
                        A = u("overall");
                        G(w.o, A, "overall score");
                        x = w.g;
                        if (x) {
                            for (p in x) {
                                if (x.hasOwnProperty(p)) {
                                    F = x[p];
                                    C = F.score;
                                    if (typeof C === "undefined") {
                                        C = -1
                                    }
                                    G(C, u(p), p, F.message, F.components)
                                }
                            }
                        }
                        return t
                    },
                    formatAsTAP: function(q) {
                        var r, w, y, t, p, o, u = q.length,
                            v = [],
                            s = YSLOW.util,
                            x = s.decodeURIComponent;
                        v.push("TAP version 13");
                        v.push("1.." + u);
                        for (r = 0; r < u; r += 1) {
                            w = q[r];
                            y = w.ok || w.score < 0 ? "ok" : "not ok";
                            y += " " + (r + 1) + " " + w.grade + " (" + w.score + ") " + w.name;
                            if (w.description) {
                                y += ": " + w.description
                            }
                            if (w.score < 0) {
                                y += " # SKIP score N/A"
                            }
                            v.push(y);
                            if (w.message) {
                                v.push("  ---");
                                v.push("  message: " + w.message)
                            }
                            t = w.offenders;
                            if (t) {
                                o = t.length;
                                if (o > 0) {
                                    if (!w.message) {
                                        v.push("  ---")
                                    }
                                    v.push("  offenders:");
                                    for (p = 0; p < o; p += 1) {
                                        v.push('    - "' + x(t[p]) + '"')
                                    }
                                }
                            }
                            if (w.message || o > 0) {
                                v.push("  ...")
                            }
                        }
                        return v.join("\n")
                    },
                    formatAsJUnit: function(s) {
                        var t, z, D, v, r, p, w = s.length,
                            y = 0,
                            o = 0,
                            x = [],
                            C = [],
                            u = YSLOW.util,
                            A = u.decodeURIComponent,
                            B = u.safeXML,
                            q = function(E) {
                                return E.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
                            };
                        for (t = 0; t < w; t += 1) {
                            z = s[t];
                            D = '    <testcase name="' + q(z.name + (z.description ? ": " + z.description : "")) + '"';
                            D += ' status="' + z.grade + " (" + z.score + ")";
                            if (z.ok) {
                                C.push(D + '"/>')
                            } else {
                                o += 1;
                                C.push(D + '">');
                                if (z.score < 0) {
                                    y += 1;
                                    C.push("      <skipped>score N/A</skipped>")
                                }
                                D = "      <failure";
                                if (z.message) {
                                    D += ' message="' + q(z.message) + '"'
                                }
                                v = z.offenders;
                                if (v) {
                                    C.push(D + ">");
                                    p = v.length;
                                    for (r = 0; r < p; r += 1) {
                                        C.push("        " + B(A(v[r])))
                                    }
                                    C.push("      </failure>")
                                } else {
                                    C.push(D + "/>")
                                }
                                C.push("    </testcase>")
                            }
                        }
                        x.push('<?xml version="1.0" encoding="UTF-8" ?>');
                        x.push("<testsuites>");
                        D = '  <testsuite name="YSlow" tests="' + w + '"';
                        if (o) {
                            D += ' failures="' + o + '"'
                        }
                        if (y) {
                            D += ' skipped="' + y + '"'
                        }
                        D += ">";
                        x.push(D);
                        x = x.concat(C);
                        x.push("  </testsuite>");
                        x.push("</testsuites>");
                        return x.join("\n")
                    },
                    getPageSpaceid: function(y) {
                        var x, t, u, s, p, r, q, w, v = /^\d+$/,
                            o = y.getComponentsByType("doc");
                        if (o[0] && typeof o[0].body === "string" && o[0].body.length > 0) {
                            x = o[0].body;
                            t = ["%2fE%3d", "/S=", "SpaceID=", "?f=", " sid="];
                            u = ["%2fR%3d", ":", " ", "&", " "];
                            for (s = 0; s < t.length; s += 1) {
                                p = t[s];
                                if (-1 !== x.indexOf(p)) {
                                    r = x.indexOf(p) + p.length;
                                    q = x.indexOf(u[s], r);
                                    if (-1 !== q && (q - r) < 15) {
                                        w = x.substring(r, q);
                                        if (v.test(w)) {
                                            return w
                                        }
                                    }
                                }
                            }
                        }
                        return ""
                    },
                    loadCSS: function(o, p) {
                        var q;
                        if (!p) {
                            YSLOW.util.dump("YSLOW.util.loadCSS: doc is not specified");
                            return ""
                        }
                        q = p.createElement("link");
                        q.rel = "stylesheet";
                        q.type = "text/css";
                        q.href = o;
                        p.body.appendChild(q);
                        return q
                    },
                    openLink: function(o) {
                        if (YSLOW.util.Preference.getPref("browser.link.open_external") === 3) {
                            gBrowser.selectedTab = gBrowser.addTab(o)
                        } else {
                            window.open(o, " blank")
                        }
                    },
                    smushIt: function(q, t) {
                        var s, o = this.getSmushUrl(),
                            p = o + "/ws.php?img=" + encodeURIComponent(q),
                            r = YSLOW.util.getXHR();
                        r.open("GET", p, true);
                        r.onreadystatechange = function(u) {
                            s = (u ? u.target : r);
                            if (s.readyState === 4) {
                                t(JSON.parse(s.responseText))
                            }
                        };
                        r.send(null)
                    },
                    getSmushUrl: function() {
                        var o = "http://www.smushit.com/ysmush.it";
                        return YSLOW.util.Preference.getPref("smushItURL", o) + "/"
                    },
                    getNewDoc: function() {
                        var p = null,
                            o = new XMLHttpRequest();
                        getBrowser().selectedTab = getBrowser().addTab("about:blank");
                        p = window;
                        o.open("get", "about:blank", false);
                        o.overrideMimeType("text/html");
                        o.send(null);
                        return p.content.document
                    },
                    makeAbsoluteUrl: function(o, p) {
                        var s, r, q, t;
                        if (typeof o === "string" && p) {
                            s = p.indexOf("://");
                            t = p.slice(0, 4);
                            if (o.indexOf("://") < 0 && (t === "http" || t === "file")) {
                                if (o.slice(0, 1) === "/") {
                                    r = p.indexOf("/", s + 3);
                                    if (r > -1) {
                                        o = p.slice(0, r) + o
                                    } else {
                                        o = p + o
                                    }
                                } else {
                                    q = p.lastIndexOf("/");
                                    if (q > s + 3) {
                                        o = p.slice(0, q + 1) + o
                                    } else {
                                        o = p + "/" + o
                                    }
                                }
                            }
                        }
                        return o
                    },
                    preventDefault: function(o) {
                        if (typeof o.preventDefault === "function") {
                            o.preventDefault()
                        } else {
                            o.returnValue = false
                        }
                    },
                    trim: function(o) {
                        try {
                            return (o && o.trim) ? o.trim() : o.replace(/^\s+|\s+$/g, "")
                        } catch (p) {
                            return o
                        }
                    },
                    addEventListener: function(q, r, p) {
                        var o = YSLOW.util;
                        if (q.addEventListener) {
                            o.addEventListener = function(t, u, s) {
                                t.addEventListener(u, s, false)
                            }
                        } else {
                            if (q.attachEvent) {
                                o.addEventListener = function(t, u, s) {
                                    t.attachEvent("on" + u, s)
                                }
                            } else {
                                o.addEventListener = function(t, u, s) {
                                    t["on" + u] = s
                                }
                            }
                        }
                        o.addEventListener(q, r, p)
                    },
                    removeEventListener: function(q, r, p) {
                        var o = YSLOW.util;
                        if (q.removeEventListener) {
                            o.removeEventListener = function(t, u, s) {
                                t.removeEventListener(u, s, false)
                            }
                        } else {
                            if (q.detachEvent) {
                                o.removeEventListener = function(t, u, s) {
                                    t.detachEvent("on" + u, s)
                                }
                            } else {
                                o.removeEventListener = function(t, u, s) {
                                    delete t["on" + u]
                                }
                            }
                        }
                        o.removeEventListener(q, r, p)
                    },
                    getCurrentTarget: function(o) {
                        return o.currentTarget || o.srcElement
                    },
                    getTarget: function(o) {
                        return o.target || o.srcElement
                    },
                    getInlineTags: function(t, r, p) {
                        var s, o, q = function(A, w, v) {
                            var y, u, x, z, B = [];
                            if (!A) {
                                return B
                            }
                            x = A.getElementsByTagName(w);
                            for (y = 0, u = x.length; y < u; y += 1) {
                                z = x[y];
                                if (!z.src) {
                                    B.push({
                                        contentNode: v,
                                        body: z.innerHTML
                                    })
                                }
                            }
                            return B
                        };
                        r = r || (t && t.getElementsByTagName("head")[0]);
                        p = p || (t && t.getElementsByTagName("body")[0]);
                        s = q(r, "style", "head");
                        s = s.concat(q(p, "style", "body"));
                        o = q(r, "script", "head");
                        o = o.concat(q(p, "script", "body"));
                        return {
                            styles: s,
                            scripts: o
                        }
                    },
                    countDOMElements: function(o) {
                        return (o && o.getElementsByTagName("*").length) || 0
                    },
                    getDocCookies: function(o) {
                        return (o && o.cookie) || ""
                    },
                    setInjected: function(y, r, w) {
                        var u, x, t, s, o, v, z, q, p = {};
                        if (!w) {
                            return r
                        }
                        if (typeof y.createElement === "function") {
                            q = y.createElement("div");
                            q.innerHTML = w
                        } else {
                            q = y
                        }
                        t = q.getElementsByTagName("script");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.src || s.getAttribute("src");
                            if (o) {
                                p[o] = {
                                    defer: s.defer || s.getAttribute("defer"),
                                    async: s.async || s.getAttribute("async")
                                }
                            }
                        }
                        t = q.getElementsByTagName("link");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.href || s.getAttribute("href");
                            if (o && (s.rel === "stylesheet" || s.type === "text/css")) {
                                p[o] = 1
                            }
                        }
                        t = q.getElementsByTagName("iframe");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.src || s.getAttribute("src");
                            if (o) {
                                p[o] = 1
                            }
                        }
                        t = q.getElementsByTagName("embed");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.src || s.getAttribute("src");
                            if (o) {
                                p[o] = 1
                            }
                        }
                        t = q.getElementsByTagName("param");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.value || s.getAttribute("value");
                            if (o) {
                                p[o] = 1
                            }
                        }
                        t = q.getElementsByTagName("img");
                        for (u = 0, x = t.length; u < x; u += 1) {
                            s = t[u];
                            o = s.src || s.getAttribute("src");
                            if (o) {
                                p[o] = 1
                            }
                        }
                        for (u = 0, x = r.length; u < x; u += 1) {
                            v = r[u];
                            if (v.type === "js" || v.type === "css" || v.type === "flash" || v.type === "flash" || v.type === "image") {
                                z = p[v.url];
                                v.injected = !z;
                                if (v.type === "js" && z) {
                                    v.defer = z.defer;
                                    v.async = z.async
                                }
                            }
                        }
                        return r
                    },
                    setTimer: function(p, o) {
                        setTimeout(p, o)
                    }
                };
                YSLOW.util.event = {
                    subscribers: {},
                    addListener: function(o, s, q) {
                        var p = this.subscribers,
                            r = p[o];
                        if (!r) {
                            r = p[o] = []
                        }
                        r.push({
                            callback: s,
                            that: q
                        })
                    },
                    removeListener: function(p, s) {
                        var q, r = this.subscribers[p],
                            o = (r && r.length) || 0;
                        for (q = 0; q < o; q += 1) {
                            if (r[q].callback === s) {
                                r.splice(q, 1);
                                return true
                            }
                        }
                        return false
                    },
                    fire: function(r, s) {
                        var o, p;
                        if (typeof this.subscribers[r] === "undefined") {
                            return false
                        }
                        for (o = 0; o < this.subscribers[r].length; o += 1) {
                            p = this.subscribers[r][o];
                            try {
                                p.callback.call(p.that, s)
                            } catch (q) {}
                        }
                        return true
                    }
                };
                YSLOW.util.Preference = {
                    nativePref: null,
                    registerNative: function(p) {
                        this.nativePref = p
                    },
                    getPref: function(p, o) {
                        if (this.nativePref) {
                            return this.nativePref.getPref(p, o)
                        }
                        return o
                    },
                    getPrefList: function(p, o) {
                        if (this.nativePref) {
                            return this.nativePref.getPrefList(p, o)
                        }
                        return o
                    },
                    setPref: function(o, p) {
                        if (this.nativePref) {
                            this.nativePref.setPref(o, p)
                        }
                    },
                    deletePref: function(o) {
                        if (this.nativePref) {
                            this.nativePref.deletePref(o)
                        }
                    }
                };
                YSLOW.doc = {
                    tools_desc: undefined,
                    view_names: {},
                    splash: {},
                    rules: {},
                    tools: {},
                    components_legend: {},
                    addRuleInfo: function(q, o, p) {
                        if (typeof q === "string" && typeof o === "string" && typeof p === "string") {
                            this.rules[q] = {
                                name: o,
                                info: p
                            }
                        }
                    },
                    addToolInfo: function(q, o, p) {
                        if (typeof q === "string" && typeof o === "string" && typeof p === "string") {
                            this.tools[q] = {
                                name: o,
                                info: p
                            }
                        }
                    }
                };
                YSLOW.doc.addRuleInfo("ynumreq", "Make fewer HTTP requests", "Decreasing the number of components on a page reduces the number of HTTP requests required to render the page, resulting in faster page loads.  Some ways to reduce the number of components include:  combine files, combine multiple scripts into one script, combine multiple CSS files into one style sheet, and use CSS Sprites and image maps.");
                YSLOW.doc.addRuleInfo("ycdn", "Use a Content Delivery Network (CDN)", "User proximity to web servers impacts response times.  Deploying content across multiple geographically dispersed servers helps users perceive that pages are loading faster.");
                YSLOW.doc.addRuleInfo("yexpires", "Add Expires headers", "Web pages are becoming increasingly complex with more scripts, style sheets, images, and Flash on them.  A first-time visit to a page may require several HTTP requests to load all the components.  By using Expires headers these components become cacheable, which avoids unnecessary HTTP requests on subsequent page views.  Expires headers are most often associated with images, but they can and should be used on all page components including scripts, style sheets, and Flash.");
                YSLOW.doc.addRuleInfo("ycompress", "Compress components with gzip", "Compression reduces response times by reducing the size of the HTTP response.  Gzip is the most popular and effective compression method currently available and generally reduces the response size by about 70%.  Approximately 90% of today's Internet traffic travels through browsers that claim to support gzip.");
                YSLOW.doc.addRuleInfo("ycsstop", "Put CSS at top", "Moving style sheets to the document HEAD element helps pages appear to load quicker since this allows pages to render progressively.");
                YSLOW.doc.addRuleInfo("yjsbottom", "Put JavaScript at bottom", "JavaScript scripts block parallel downloads; that is, when a script is downloading, the browser will not start any other downloads.  To help the page load faster, move scripts to the bottom of the page if they are deferrable.");
                YSLOW.doc.addRuleInfo("yexpressions", "Avoid CSS expressions", "CSS expressions (supported in IE beginning with Version 5) are a powerful, and dangerous, way to dynamically set CSS properties.  These expressions are evaluated frequently:  when the page is rendered and resized, when the page is scrolled, and even when the user moves the mouse over the page.  These frequent evaluations degrade the user experience.");
                YSLOW.doc.addRuleInfo("yexternal", "Make JavaScript and CSS external", "Using external JavaScript and CSS files generally produces faster pages because the files are cached by the browser.  JavaScript and CSS that are inlined in HTML documents get downloaded each time the HTML document is requested.  This reduces the number of HTTP requests but increases the HTML document size.  On the other hand, if the JavaScript and CSS are in external files cached by the browser, the HTML document size is reduced without increasing the number of HTTP requests.");
                YSLOW.doc.addRuleInfo("ydns", "Reduce DNS lookups", "The Domain Name System (DNS) maps hostnames to IP addresses, just like phonebooks map people's names to their phone numbers.  When you type URL www.yahoo.com into the browser, the browser contacts a DNS resolver that returns the server's IP address.  DNS has a cost; typically it takes 20 to 120 milliseconds for it to look up the IP address for a hostname.  The browser cannot download anything from the host until the lookup completes.");
                YSLOW.doc.addRuleInfo("yminify", "Minify JavaScript and CSS", "Minification removes unnecessary characters from a file to reduce its size, thereby improving load times.  When a file is minified, comments and unneeded white space characters (space, newline, and tab) are removed.  This improves response time since the size of the download files is reduced.");
                YSLOW.doc.addRuleInfo("yredirects", "Avoid URL redirects", "URL redirects are made using HTTP status codes 301 and 302.  They tell the browser to go to another location.  Inserting a redirect between the user and the final HTML document delays everything on the page since nothing on the page can be rendered and no components can be downloaded until the HTML document arrives.");
                YSLOW.doc.addRuleInfo("ydupes", "Remove duplicate JavaScript and CSS", "Duplicate JavaScript and CSS files hurt performance by creating unnecessary HTTP requests (IE only) and wasted JavaScript execution (IE and Firefox).  In IE, if an external script is included twice and is not cacheable, it generates two HTTP requests during page loading.  Even if the script is cacheable, extra HTTP requests occur when the user reloads the page.  In both IE and Firefox, duplicate JavaScript scripts cause wasted time evaluating the same scripts more than once.  This redundant script execution happens regardless of whether the script is cacheable.");
                YSLOW.doc.addRuleInfo("yetags", "Configure entity tags (ETags)", "Entity tags (ETags) are a mechanism web servers and the browser use to determine whether a component in the browser's cache matches one on the origin server.  Since ETags are typically constructed using attributes that make them unique to a specific server hosting a site, the tags will not match when a browser gets the original component from one server and later tries to validate that component on a different server.");
                YSLOW.doc.addRuleInfo("yxhr", "Make AJAX cacheable", "One of AJAX's benefits is it provides instantaneous feedback to the user because it requests information asynchronously from the backend web server.  However, using AJAX does not guarantee the user will not wait for the asynchronous JavaScript and XML responses to return.  Optimizing AJAX responses is important to improve performance, and making the responses cacheable is the best way to optimize them.");
                YSLOW.doc.addRuleInfo("yxhrmethod", "Use GET for AJAX requests", "When using the XMLHttpRequest object, the browser implements POST in two steps:  (1) send the headers, and (2) send the data.  It is better to use GET instead of POST since GET sends the headers and the data together (unless there are many cookies).  IE's maximum URL length is 2 KB, so if you are sending more than this amount of data you may not be able to use GET.");
                YSLOW.doc.addRuleInfo("ymindom", "Reduce the number of DOM elements", "A complex page means more bytes to download, and it also means slower DOM access in JavaScript.  Reduce the number of DOM elements on the page to improve performance.");
                YSLOW.doc.addRuleInfo("yno404", "Avoid HTTP 404 (Not Found) error", 'Making an HTTP request and receiving a 404 (Not Found) error is expensive and degrades the user experience.  Some sites have helpful 404 messages (for example, "Did you mean ...?"), which may assist the user, but server resources are still wasted.');
                YSLOW.doc.addRuleInfo("ymincookie", "Reduce cookie size", "HTTP cookies are used for authentication, personalization, and other purposes.  Cookie information is exchanged in the HTTP headers between web servers and the browser, so keeping the cookie size small minimizes the impact on response time.");
                YSLOW.doc.addRuleInfo("ycookiefree", "Use cookie-free domains", "When the browser requests a static image and sends cookies with the request, the server ignores the cookies.  These cookies are unnecessary network traffic.  To workaround this problem, make sure that static components are requested with cookie-free requests by creating a subdomain and hosting them there.");
                YSLOW.doc.addRuleInfo("ynofilter", "Avoid AlphaImageLoader filter", "The IE-proprietary AlphaImageLoader filter attempts to fix a problem with semi-transparent true color PNG files in IE versions less than Version 7.  However, this filter blocks rendering and freezes the browser while the image is being downloaded.  Additionally, it increases memory consumption.  The problem is further multiplied because it is applied per element, not per image.");
                YSLOW.doc.addRuleInfo("yimgnoscale", "Do not scale images in HTML", "Web page designers sometimes set image dimensions by using the width and height attributes of the HTML image element.  Avoid doing this since it can result in images being larger than needed.  For example, if your page requires image myimg.jpg which has dimensions 240x720 but displays it with dimensions 120x360 using the width and height attributes, then the browser will download an image that is larger than necessary.");
                YSLOW.doc.addRuleInfo("yfavicon", "Make favicon small and cacheable", "A favicon is an icon associated with a web page; this icon resides in the favicon.ico file in the server's root.  Since the browser requests this file, it needs to be present; if it is missing, the browser returns a 404 error (see \"Avoid HTTP 404 (Not Found) error\" above).  Since favicon.ico resides in the server's root, each time the browser requests this file, the cookies for the server's root are sent.  Making the favicon small and reducing the cookie size for the server's root cookies improves performance for retrieving the favicon.  Making favicon.ico cacheable avoids frequent requests for it.");
                YSLOW.doc.addRuleInfo("yemptysrc", "Avoid empty src or href", "You may expect a browser to do nothing when it encounters an empty image src.  However, it is not the case in most browsers. IE makes a request to the directory in which the page is located; Safari, Chrome, Firefox 3 and earlier make a request to the actual page itself. This behavior could possibly corrupt user data, waste server computing cycles generating a page that will never be viewed, and in the worst case, cripple your servers by sending a large amount of unexpected traffic.");
                YSLOW.doc.tools_desc = "Click on the tool name to launch the tool.";
                YSLOW.doc.addToolInfo("jslint", "JSLint", "Run JSLint on all JavaScript code in this document");
                YSLOW.doc.addToolInfo("alljs", "All JS", "Show all JavaScript code in this document");
                YSLOW.doc.addToolInfo("jsbeautified", "All JS Beautified", "Show all JavaScript code in this document in an easy to read format");
                YSLOW.doc.addToolInfo("jsminified", "All JS Minified", "Show all JavaScript code in this document in a minified (no comments or white space) format");
                YSLOW.doc.addToolInfo("allcss", "All CSS", "Show all CSS code in this document");
                YSLOW.doc.addToolInfo("cssmin", "YUI CSS Compressor", "Show all CSS code in the document in a minified format");
                YSLOW.doc.addToolInfo("smushItAll", "All Smush.it&trade;", "Run Smush.it&trade; on all image components in this document");
                YSLOW.doc.addToolInfo("printableview", "Printable View", "Show a printable view of grades, component lists, and statistics");
                YSLOW.doc.splash.title = "Grade your web pages with YSlow";
                YSLOW.doc.splash.content = {
                    header: "YSlow gives you:",
                    text: "<ul><li>Grade based on the performance of the page (you can define your own ruleset)</li><li>Summary of the page components</li><li>Chart with statistics</li><li>Tools for analyzing performance, including Smush.it&trade; and JSLint</li></ul>"
                };
                YSLOW.doc.splash.more_info = "Learn more about YSlow and the Yahoo! Developer Network";
                YSLOW.doc.rulesettings_desc = "Choose which ruleset (YSlow V2, Classic V1, or Small Site/Blog) best fits your specific needs.  Or create a new set and click Save as... to save it.";
                YSLOW.doc.components_legend.beacon = "type column indicates the component is loaded after window onload event";
                YSLOW.doc.components_legend.after_onload = "denotes 1x1 pixels image that may be image beacon";
                YSLOW.doc.view_names = {
                    grade: "Grade",
                    components: "Components",
                    stats: "Statistics",
                    tools: "Tools",
                    rulesetedit: "Rule Settings"
                };
                YSLOW.doc.copyright = "Copyright &copy; " + (new Date()).getFullYear() + " Yahoo! Inc. All rights reserved.";
                YSLOW.registerRule({
                    id: "ynumreq",
                    url: "http://developer.yahoo.com/performance/rules.html#num_http",
                    category: ["content"],
                    config: {
                        max_js: 3,
                        points_js: 4,
                        max_css: 2,
                        points_css: 4,
                        max_cssimages: 6,
                        points_cssimages: 3
                    },
                    lint: function(t, v, o) {
                        var s = v.getComponentsByType("js").length - o.max_js,
                            p = v.getComponentsByType("css").length - o.max_css,
                            r = v.getComponentsByType("cssimage").length - o.max_cssimages,
                            u = 100,
                            q = [];
                        if (s > 0) {
                            u -= s * o.points_js;
                            q[q.length] = "This page has " + YSLOW.util.plural("%num% external Javascript script%s%", (s + o.max_js)) + ".  Try combining them into one."
                        }
                        if (p > 0) {
                            u -= p * o.points_css;
                            q[q.length] = "This page has " + YSLOW.util.plural("%num% external stylesheet%s%", (p + o.max_css)) + ".  Try combining them into one."
                        }
                        if (r > 0) {
                            u -= r * o.points_cssimages;
                            q[q.length] = "This page has " + YSLOW.util.plural("%num% external background image%s%", (r + o.max_cssimages)) + ".  Try combining them with CSS sprites."
                        }
                        return {
                            score: u,
                            message: q.join("\n"),
                            components: []
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ycdn",
                    url: "http://developer.yahoo.com/performance/rules.html#cdn",
                    category: ["server"],
                    config: {
                        points: 10,
                        patterns: ["^([^\\.]*)\\.([^\\.]*)\\.yimg\\.com/[^/]*\\.yimg\\.com/.*$", "^([^\\.]*)\\.([^\\.]*)\\.yimg\\.com/[^/]*\\.yahoo\\.com/.*$", "^sec.yimg.com/", "^a248.e.akamai.net", "^[dehlps].yimg.com", "^(ads|cn|mail|maps|s1).yimg.com", "^[\\d\\w\\.]+.yimg.com", "^a.l.yimg.com", "^us.(js|a)2.yimg.com", "^yui.yahooapis.com", "^adz.kr.yahoo.com", "^img.yahoo.co.kr", "^img.(shopping|news|srch).yahoo.co.kr", "^pimg.kr.yahoo.com", "^kr.img.n2o.yahoo.com", "^s3.amazonaws.com", "^(www.)?google-analytics.com", ".cloudfront.net", ".ak.fbcdn.net", "platform.twitter.com", "cdn.api.twitter.com", "apis.google.com", ".akamaihd.net", ".rackcdn.com"],
                        exceptions: ["^chart.yahoo.com", "^(a1|f3|f5|f3c|f5c).yahoofs.com", "^us.(a1c|f3).yahoofs.com"],
                        servers: ["cloudflare-nginx"],
                        types: ["js", "css", "image", "cssimage", "flash", "favicon"]
                    },
                    lint: function(O, t, N) {
                        var G, E, s, D, u, y, K, I, L, M, r, q, H = 100,
                            p = [],
                            J = [],
                            x = "",
                            o = YSLOW.util,
                            C = o.plural,
                            v = o.kbSize,
                            w = o.getHostname,
                            B = w(t.doc_comp.url),
                            A = t.getComponentsByType(N.types),
                            z = o.Preference.getPref("cdnHostnames", ""),
                            F = o.Preference.nativePref;
                        if (z) {
                            z = z.split(",")
                        }
                        for (G = 0, I = A.length; G < I; G += 1) {
                            M = A[G];
                            s = M.url;
                            y = w(s);
                            q = M.headers;
                            if (M.type === "favicon" && y === B) {
                                continue
                            }
                            u = q["x-cdn"] || q["x-amz-cf-id"] || q["x-edge-location"] || q["powered-by-chinacache"];
                            if (u) {
                                continue
                            }
                            r = N.patterns;
                            for (E = 0, L = r.length; E < L; E += 1) {
                                D = new RegExp(r[E]);
                                if (D.test(y)) {
                                    u = 1;
                                    break
                                }
                            }
                            if (z) {
                                for (E = 0, L = z.length; E < L; E += 1) {
                                    D = new RegExp(o.trim(z[E]));
                                    if (D.test(y)) {
                                        u = 1;
                                        break
                                    }
                                }
                            }
                            if (!u) {
                                r = N.servers;
                                for (E = 0, L = r.length; E < L; E += 1) {
                                    D = new RegExp(r[E]);
                                    if (D.test(q.server)) {
                                        u = 1;
                                        break
                                    }
                                }
                                if (!u) {
                                    r = N.exceptions;
                                    for (E = 0, L = r.length; E < L; E += 1) {
                                        D = new RegExp(r[E]);
                                        if (D.test(y)) {
                                            J.push(M);
                                            u = 1;
                                            break
                                        }
                                    }
                                    if (!u) {
                                        p.push(M)
                                    }
                                }
                            }
                        }
                        H -= p.length * N.points;
                        p.concat(J);
                        if (p.length > 0) {
                            x = C("There %are% %num% static component%s% that %are% not on CDN. ", p.length)
                        }
                        if (J.length > 0) {
                            x += C("There %are% %num% component%s% that %are% not on CDN, but %are% exceptions:", J.length) + "<ul>";
                            for (G = 0, I = p.length; G < I; G += 1) {
                                x += "<li>" + o.prettyAnchor(J[G].url, J[G].url, null, true, 120, null, J[G].type) + "</li>"
                            }
                            x += "</ul>"
                        }
                        if (z) {
                            x += "<p>Using these CDN hostnames from your preferences: " + z + "</p>"
                        } else {
                            x += "<p>You can specify CDN hostnames in your preferences. See <a href=\"javascript:document.ysview.openLink('https://github.com/marcelduran/yslow/wiki/FAQ#wiki-faq_cdn')\">YSlow FAQ</a> for details.</p>"
                        }
                        if (p.length) {
                            p = o.summaryByDomain(p, ["size", "size_compressed"], true);
                            for (G = 0, I = p.length; G < I; G += 1) {
                                K = p[G];
                                p[G] = K.domain + ": " + C("%num% component%s%, ", K.count) + v(K.sum_size) + (K.sum_size_compressed > 0 ? " (" + v(K.sum_size_compressed) + " GZip)" : "") + (F ? (" <button onclick=\"javascript:document.ysview.addCDN('" + K.domain + "')\">Add as CDN</button>") : "")
                            }
                        }
                        return {
                            score: H,
                            message: x,
                            components: p
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yexpires",
                    url: "http://developer.yahoo.com/performance/rules.html#expires",
                    category: ["server"],
                    config: {
                        points: 11,
                        howfar: 172800,
                        types: ["css", "js", "image", "cssimage", "flash", "favicon"]
                    },
                    lint: function(w, y, p) {
                        var v, r, x, q, u, s = parseInt(p.howfar, 10) * 1000,
                            t = [],
                            o = y.getComponentsByType(p.types);
                        for (r = 0, u = o.length; r < u; r += 1) {
                            x = o[r].expires;
                            if (typeof x === "object" && typeof x.getTime === "function") {
                                v = new Date().getTime();
                                if (x.getTime() > v + s) {
                                    continue
                                }
                            }
                            t.push(o[r])
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% static component%s%", t.length) + " without a far-future expiration date." : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ycompress",
                    url: "http://developer.yahoo.com/performance/rules.html#gzip",
                    category: ["server"],
                    config: {
                        min_filesize: 500,
                        types: ["doc", "iframe", "xhr", "js", "css"],
                        points: 11
                    },
                    lint: function(v, w, p) {
                        var r, u, q, s, t = [],
                            o = w.getComponentsByType(p.types);
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            if (s.compressed || s.size < 500) {
                                continue
                            }
                            t.push(s)
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% plain text component%s%", t.length) + " that should be sent compressed" : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ycsstop",
                    url: "http://developer.yahoo.com/performance/rules.html#css_top",
                    category: ["css"],
                    config: {
                        points: 10
                    },
                    lint: function(v, w, p) {
                        var r, u, q, s, o = w.getComponentsByType("css"),
                            t = [];
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            if (s.containerNode === "body") {
                                t.push(s)
                            }
                        }
                        q = 100;
                        if (t.length > 0) {
                            q -= 1 + t.length * parseInt(p.points, 10)
                        }
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% stylesheet%s%", t.length) + " found in the body of the document" : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yjsbottom",
                    url: "http://developer.yahoo.com/performance/rules.html#js_bottom",
                    category: ["javascript"],
                    config: {
                        points: 5
                    },
                    lint: function(v, w, p) {
                        var r, u, s, q, t = [],
                            o = w.getComponentsByType("js");
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            if (s.containerNode === "head" && !s.injected && (!s.defer || !s.async)) {
                                t.push(s)
                            }
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% JavaScript script%s%", t.length) + " found in the head of the document" : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yexpressions",
                    url: "http://developer.yahoo.com/performance/rules.html#css_expressions",
                    category: ["css"],
                    config: {
                        points: 2
                    },
                    lint: function(w, z, p) {
                        var r, u, y, s, x = (z.inline && z.inline.styles) || [],
                            o = z.getComponentsByType("css"),
                            t = [],
                            q = 100,
                            v = 0;
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            if (typeof s.expr_count === "undefined") {
                                y = YSLOW.util.countExpressions(s.body);
                                s.expr_count = y
                            } else {
                                y = s.expr_count
                            }
                            if (y > 0) {
                                s.yexpressions = YSLOW.util.plural("%num% expression%s%", y);
                                v += y;
                                t.push(s)
                            }
                        }
                        for (r = 0, u = x.length; r < u; r += 1) {
                            y = YSLOW.util.countExpressions(x[r].body);
                            if (y > 0) {
                                t.push("inline &lt;style&gt; tag #" + (r + 1) + " (" + YSLOW.util.plural("%num% expression%s%", y) + ")");
                                v += y
                            }
                        }
                        if (v > 0) {
                            q = 90 - v * p.points
                        }
                        return {
                            score: q,
                            message: v > 0 ? "There is a total of " + YSLOW.util.plural("%num% expression%s%", v) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yexternal",
                    url: "http://developer.yahoo.com/performance/rules.html#external",
                    category: ["javascript", "css"],
                    config: {},
                    lint: function(t, v, p) {
                        var r, s = v.inline,
                            q = (s && s.styles) || [],
                            o = (s && s.scripts) || [],
                            u = [];
                        if (q.length) {
                            r = YSLOW.util.plural("There is a total of %num% inline css", q.length);
                            u.push(r)
                        }
                        if (o.length) {
                            r = YSLOW.util.plural("There is a total of %num% inline script%s%", o.length);
                            u.push(r)
                        }
                        return {
                            score: "n/a",
                            message: "Only consider this if your property is a common user home page.",
                            components: u
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ydns",
                    url: "http://developer.yahoo.com/performance/rules.html#dns_lookups",
                    category: ["content"],
                    config: {
                        max_domains: 4,
                        points: 5
                    },
                    lint: function(w, y, o) {
                        var r, t, q, s = YSLOW.util,
                            u = s.kbSize,
                            v = s.plural,
                            p = 100,
                            x = s.summaryByDomain(y.components, ["size", "size_compressed"], true);
                        if (x.length > o.max_domains) {
                            p -= (x.length - o.max_domains) * o.points
                        }
                        if (x.length) {
                            for (r = 0, t = x.length; r < t; r += 1) {
                                q = x[r];
                                x[r] = q.domain + ": " + v("%num% component%s%, ", q.count) + u(q.sum_size) + (q.sum_size_compressed > 0 ? " (" + u(q.sum_size_compressed) + " GZip)" : "")
                            }
                        }
                        return {
                            score: p,
                            message: (x.length > o.max_domains) ? v("The components are split over more than %num% domain%s%", o.max_domains) : "",
                            components: x
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yminify",
                    url: "http://developer.yahoo.com/performance/rules.html#minify",
                    category: ["javascript", "css"],
                    config: {
                        points: 10,
                        types: ["js", "css"]
                    },
                    lint: function(y, A, p) {
                        var s, v, q, x, t, w = A.inline,
                            z = (w && w.styles) || [],
                            r = (w && w.scripts) || [],
                            o = A.getComponentsByType(p.types),
                            u = [];
                        for (s = 0, v = o.length; s < v; s += 1) {
                            t = o[s];
                            if (typeof t.minified === "undefined") {
                                x = YSLOW.util.isMinified(t.body);
                                t.minified = x
                            } else {
                                x = t.minified
                            }
                            if (!x) {
                                u.push(t)
                            }
                        }
                        for (s = 0, v = z.length; s < v; s += 1) {
                            if (!YSLOW.util.isMinified(z[s].body)) {
                                u.push("inline &lt;style&gt; tag #" + (s + 1))
                            }
                        }
                        for (s = 0, v = r.length; s < v; s += 1) {
                            if (!YSLOW.util.isMinified(r[s].body)) {
                                u.push("inline &lt;script&gt; tag #" + (s + 1))
                            }
                        }
                        q = 100 - u.length * p.points;
                        return {
                            score: q,
                            message: (u.length > 0) ? YSLOW.util.plural("There %are% %num% component%s% that can be minified", u.length) : "",
                            components: u
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yredirects",
                    url: "http://developer.yahoo.com/performance/rules.html#redirects",
                    category: ["content"],
                    config: {
                        points: 10
                    },
                    lint: function(w, x, p) {
                        var s, v, t, q, u = [],
                            r = YSLOW.util.briefUrl,
                            o = x.getComponentsByType("redirect");
                        for (s = 0, v = o.length; s < v; s += 1) {
                            t = o[s];
                            u.push(r(t.url, 80) + " redirects to " + r(t.headers.location, 60))
                        }
                        q = 100 - o.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (o.length > 0) ? YSLOW.util.plural("There %are% %num% redirect%s%", o.length) : "",
                            components: u
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ydupes",
                    url: "http://developer.yahoo.com/performance/rules.html#js_dupes",
                    category: ["javascript", "css"],
                    config: {
                        points: 5,
                        types: ["js", "css"]
                    },
                    lint: function(w, x, q) {
                        var t, o, r, v, s = {},
                            u = [],
                            p = x.getComponentsByType(q.types);
                        for (t = 0, v = p.length; t < v; t += 1) {
                            o = p[t].url;
                            if (typeof s[o] === "undefined") {
                                s[o] = {
                                    count: 1,
                                    compindex: t
                                }
                            } else {
                                s[o].count += 1
                            }
                        }
                        for (t in s) {
                            if (s.hasOwnProperty(t) && s[t].count > 1) {
                                u.push(p[s[t].compindex])
                            }
                        }
                        r = 100 - u.length * parseInt(q.points, 10);
                        return {
                            score: r,
                            message: (u.length > 0) ? YSLOW.util.plural("There %are% %num% duplicate component%s%", u.length) : "",
                            components: u
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yetags",
                    url: "http://developer.yahoo.com/performance/rules.html#etags",
                    category: ["server"],
                    config: {
                        points: 11,
                        types: ["flash", "js", "css", "cssimage", "image", "favicon"]
                    },
                    lint: function(w, x, p) {
                        var r, u, q, s, v, t = [],
                            o = x.getComponentsByType(p.types);
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            v = s.headers && s.headers.etag;
                            if (v && !YSLOW.util.isETagGood(v)) {
                                t.push(s)
                            }
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% component%s% with misconfigured ETags", t.length) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yxhr",
                    url: "http://developer.yahoo.com/performance/rules.html#cacheajax",
                    category: ["content"],
                    config: {
                        points: 5,
                        min_cache_time: 3600
                    },
                    lint: function(w, y, p) {
                        var s, x, v, q, u, r = parseInt(p.min_cache_time, 10) * 1000,
                            t = [],
                            o = y.getComponentsByType("xhr");
                        for (s = 0; s < o.length; s += 1) {
                            u = o[s].headers["cache-control"];
                            if (u) {
                                if (u.indexOf("no-cache") !== -1 || u.indexOf("no-store") !== -1) {
                                    continue
                                }
                            }
                            x = o[s].expires;
                            if (typeof x === "object" && typeof x.getTime === "function") {
                                v = new Date().getTime();
                                if (x.getTime() > v + r) {
                                    continue
                                }
                            }
                            t.push(o[s])
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% XHR component%s% that %are% not cacheable", t.length) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yxhrmethod",
                    url: "http://developer.yahoo.com/performance/rules.html#ajax_get",
                    category: ["server"],
                    config: {
                        points: 5
                    },
                    lint: function(q, u, o) {
                        var p, r, t = [],
                            s = u.getComponentsByType("xhr");
                        for (p = 0; p < s.length; p += 1) {
                            if (typeof s[p].method === "string") {
                                if (s[p].method !== "GET" && s[p].method !== "unknown") {
                                    t.push(s[p])
                                }
                            }
                        }
                        r = 100 - t.length * parseInt(o.points, 10);
                        return {
                            score: r,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% XHR component%s% that %do% not use GET HTTP method", t.length) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ymindom",
                    url: "http://developer.yahoo.com/performance/rules.html#min_dom",
                    category: ["content"],
                    config: {
                        range: 250,
                        points: 10,
                        maxdom: 900
                    },
                    lint: function(q, s, p) {
                        var o = s.domElementsCount,
                            r = 100;
                        if (o > p.maxdom) {
                            r = 99 - Math.ceil((o - parseInt(p.maxdom, 10)) / parseInt(p.range, 10)) * parseInt(p.points, 10)
                        }
                        return {
                            score: r,
                            message: (o > p.maxdom) ? YSLOW.util.plural("There %are% %num% DOM element%s% on the page", o) : "",
                            components: []
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yno404",
                    url: "http://developer.yahoo.com/performance/rules.html#no404",
                    category: ["content"],
                    config: {
                        points: 5,
                        types: ["css", "js", "image", "cssimage", "flash", "xhr", "favicon"]
                    },
                    lint: function(v, w, p) {
                        var r, u, s, q, t = [],
                            o = w.getComponentsByType(p.types);
                        for (r = 0, u = o.length; r < u; r += 1) {
                            s = o[r];
                            if (parseInt(s.status, 10) === 404) {
                                t.push(s)
                            }
                        }
                        q = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: q,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% request%s% that %are% 404 Not Found", t.length) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ymincookie",
                    url: "http://developer.yahoo.com/performance/rules.html#cookie_size",
                    category: ["cookie"],
                    config: {
                        points: 10,
                        max_cookie_size: 1000
                    },
                    lint: function(s, v, p) {
                        var u, r = v.cookies,
                            o = (r && r.length) || 0,
                            q = "",
                            t = 100;
                        if (o > p.max_cookie_size) {
                            u = Math.floor(o / p.max_cookie_size);
                            t -= 1 + u * parseInt(p.points, 10);
                            q = YSLOW.util.plural("There %are% %num% byte%s% of cookies on this page", o)
                        }
                        return {
                            score: t,
                            message: q,
                            components: []
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ycookiefree",
                    url: "http://developer.yahoo.com/performance/rules.html#cookie_free",
                    category: ["cookie"],
                    config: {
                        points: 5,
                        types: ["js", "css", "image", "cssimage", "flash", "favicon"]
                    },
                    lint: function(y, z, r) {
                        var t, x, s, v, o, w = [],
                            q = YSLOW.util.getHostname,
                            u = q(z.doc_comp.url),
                            p = z.getComponentsByType(r.types);
                        for (t = 0, x = p.length; t < x; t += 1) {
                            v = p[t];
                            if (v.type === "favicon" && q(v.url) === u) {
                                continue
                            }
                            o = v.cookie;
                            if (typeof o === "string" && o.length) {
                                w.push(p[t])
                            }
                        }
                        s = 100 - w.length * parseInt(r.points, 10);
                        return {
                            score: s,
                            message: (w.length > 0) ? YSLOW.util.plural("There %are% %num% component%s% that %are% not cookie-free", w.length) : "",
                            components: w
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "ynofilter",
                    url: "http://developer.yahoo.com/performance/rules.html#no_filters",
                    category: ["css"],
                    config: {
                        points: 5,
                        halfpoints: 2
                    },
                    lint: function(z, C, q) {
                        var s, w, r, t, y, v, B, A = (C.inline && C.inline.styles) || [],
                            p = C.getComponentsByType("css"),
                            u = [],
                            o = 0,
                            x = 0;
                        for (s = 0, w = p.length; s < w; s += 1) {
                            t = p[s];
                            if (typeof t.filter_count === "undefined") {
                                B = YSLOW.util.countAlphaImageLoaderFilter(t.body);
                                t.filter_count = B
                            } else {
                                B = t.filter_count
                            }
                            v = 0;
                            for (y in B) {
                                if (B.hasOwnProperty(y)) {
                                    if (y === "hackFilter") {
                                        x += B[y];
                                        v += B[y]
                                    } else {
                                        o += B[y];
                                        v += B[y]
                                    }
                                }
                            }
                            if (v > 0) {
                                p[s].yfilters = YSLOW.util.plural("%num% filter%s%", v);
                                u.push(p[s])
                            }
                        }
                        for (s = 0, w = A.length; s < w; s += 1) {
                            B = YSLOW.util.countAlphaImageLoaderFilter(A[s].body);
                            v = 0;
                            for (y in B) {
                                if (B.hasOwnProperty(y)) {
                                    if (y === "hackFilter") {
                                        x += B[y];
                                        v += B[y]
                                    } else {
                                        o += B[y];
                                        v += B[y]
                                    }
                                }
                            }
                            if (v > 0) {
                                u.push("inline &lt;style&gt; tag #" + (s + 1) + " (" + YSLOW.util.plural("%num% filter%s%", v) + ")")
                            }
                        }
                        r = 100 - (o * q.points + x * q.halfpoints);
                        return {
                            score: r,
                            message: (o + x) > 0 ? "There is a total of " + YSLOW.util.plural("%num% filter%s%", o + x) : "",
                            components: u
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yimgnoscale",
                    url: "http://developer.yahoo.com/performance/rules.html#no_scale",
                    category: ["images"],
                    config: {
                        points: 5
                    },
                    lint: function(q, v, o) {
                        var p, u, r, t = [],
                            s = v.getComponentsByType("image");
                        for (p = 0; p < s.length; p += 1) {
                            u = s[p].object_prop;
                            if (u && typeof u.width !== "undefined" && typeof u.height !== "undefined" && typeof u.actual_width !== "undefined" && typeof u.actual_height !== "undefined") {
                                if (u.width < u.actual_width || u.height < u.actual_height) {
                                    t.push(s[p])
                                }
                            }
                        }
                        r = 100 - t.length * parseInt(o.points, 10);
                        return {
                            score: r,
                            message: (t.length > 0) ? YSLOW.util.plural("There %are% %num% image%s% that %are% scaled down", t.length) : "",
                            components: t
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yfavicon",
                    url: "http://developer.yahoo.com/performance/rules.html#favicon",
                    category: ["images"],
                    config: {
                        points: 5,
                        size: 2000,
                        min_cache_time: 3600
                    },
                    lint: function(w, y, p) {
                        var v, x, u, r, q, t = [],
                            s = parseInt(p.min_cache_time, 10) * 1000,
                            o = y.getComponentsByType("favicon");
                        if (o.length) {
                            u = o[0];
                            if (parseInt(u.status, 10) === 404) {
                                t.push("Favicon was not found")
                            }
                            if (u.size > p.size) {
                                t.push(YSLOW.util.plural("Favicon is more than %num% bytes", p.size))
                            }
                            x = u.expires;
                            if (typeof x === "object" && typeof x.getTime === "function") {
                                v = new Date().getTime();
                                q = x.getTime() >= v + s
                            }
                            if (!q) {
                                t.push("Favicon is not cacheable")
                            }
                        }
                        r = 100 - t.length * parseInt(p.points, 10);
                        return {
                            score: r,
                            message: (t.length > 0) ? t.join("\n") : "",
                            components: []
                        }
                    }
                });
                YSLOW.registerRule({
                    id: "yemptysrc",
                    url: "http://developer.yahoo.com/performance/rules.html#emptysrc",
                    category: ["server"],
                    config: {
                        points: 100
                    },
                    lint: function(v, y, p) {
                        var u, q, t, w = y.empty_url,
                            s = [],
                            r = [],
                            o = "",
                            x = parseInt(p.points, 10);
                        q = 100;
                        if (w) {
                            for (u in w) {
                                if (w.hasOwnProperty(u)) {
                                    t = w[u];
                                    q -= t * x;
                                    r.push(t + " " + u)
                                }
                            }
                            o = r.join(", ") + YSLOW.util.plural(" component%s% with empty link were found.", r.length)
                        }
                        return {
                            score: q,
                            message: o,
                            components: s
                        }
                    }
                });
                YSLOW.registerRuleset({
                    id: "ydefault",
                    name: "YSlow(V2)",
                    rules: {
                        ynumreq: {},
                        ycdn: {},
                        yemptysrc: {},
                        yexpires: {},
                        ycompress: {},
                        ycsstop: {},
                        yjsbottom: {},
                        yexpressions: {},
                        yexternal: {},
                        ydns: {},
                        yminify: {},
                        yredirects: {},
                        ydupes: {},
                        yetags: {},
                        yxhr: {},
                        yxhrmethod: {},
                        ymindom: {},
                        yno404: {},
                        ymincookie: {},
                        ycookiefree: {},
                        ynofilter: {},
                        yimgnoscale: {},
                        yfavicon: {}
                    },
                    weights: {
                        ynumreq: 8,
                        ycdn: 6,
                        yemptysrc: 30,
                        yexpires: 10,
                        ycompress: 8,
                        ycsstop: 4,
                        yjsbottom: 4,
                        yexpressions: 3,
                        yexternal: 4,
                        ydns: 3,
                        yminify: 4,
                        yredirects: 4,
                        ydupes: 4,
                        yetags: 2,
                        yxhr: 4,
                        yxhrmethod: 3,
                        ymindom: 3,
                        yno404: 4,
                        ymincookie: 3,
                        ycookiefree: 3,
                        ynofilter: 4,
                        yimgnoscale: 3,
                        yfavicon: 2
                    }
                });
                YSLOW.registerRuleset({
                    id: "yslow1",
                    name: "Classic(V1)",
                    rules: {
                        ynumreq: {},
                        ycdn: {},
                        yexpires: {},
                        ycompress: {},
                        ycsstop: {},
                        yjsbottom: {},
                        yexpressions: {},
                        yexternal: {},
                        ydns: {},
                        yminify: {
                            types: ["js"],
                            check_inline: false
                        },
                        yredirects: {},
                        ydupes: {
                            types: ["js"]
                        },
                        yetags: {}
                    },
                    weights: {
                        ynumreq: 8,
                        ycdn: 6,
                        yexpires: 10,
                        ycompress: 8,
                        ycsstop: 4,
                        yjsbottom: 4,
                        yexpressions: 3,
                        yexternal: 4,
                        ydns: 3,
                        yminify: 4,
                        yredirects: 4,
                        ydupes: 4,
                        yetags: 2
                    }
                });
                YSLOW.registerRuleset({
                    id: "yblog",
                    name: "Small Site or Blog",
                    rules: {
                        ynumreq: {},
                        yemptysrc: {},
                        ycompress: {},
                        ycsstop: {},
                        yjsbottom: {},
                        yexpressions: {},
                        ydns: {},
                        yminify: {},
                        yredirects: {},
                        ydupes: {},
                        ymindom: {},
                        yno404: {},
                        ynofilter: {},
                        yimgnoscale: {},
                        yfavicon: {}
                    },
                    weights: {
                        ynumreq: 8,
                        yemptysrc: 30,
                        ycompress: 8,
                        ycsstop: 4,
                        yjsbottom: 4,
                        yexpressions: 3,
                        ydns: 3,
                        yminify: 4,
                        yredirects: 4,
                        ydupes: 4,
                        ymindom: 3,
                        yno404: 4,
                        ynofilter: 4,
                        yimgnoscale: 3,
                        yfavicon: 2
                    }
                });
                YSLOW.ResultSet = function(q, p, o) {
                    this.ruleset_applied = o;
                    this.overall_score = p;
                    this.results = q
                };
                YSLOW.ResultSet.prototype = {
                    getResults: function() {
                        return this.results
                    },
                    getRulesetApplied: function() {
                        return this.ruleset_applied
                    },
                    getOverallScore: function() {
                        return this.overall_score
                    }
                };
                YSLOW.view = function(p, u) {
                    var s, r, t, o, q;
                    this.panel_doc = p.document;
                    this.buttonViews = {};
                    this.curButtonId = "";
                    this.panelNode = p.panelNode;
                    this.loadCSS(this.panel_doc);
                    s = this.panel_doc.createElement("div");
                    s.id = "toolbarDiv";
                    s.innerHTML = this.getToolbarSource();
                    s.style.display = "block";
                    r = this.panel_doc.createElement("div");
                    r.style.display = "block";
                    t = '<div class="dialog-box"><h1><div class="dialog-text">text</div></h1><div class="dialog-more-text"></div><div class="buttons"><input class="dialog-left-button" type="button" value="Ok" onclick="javascript:document.ysview.closeDialog(document)"><input class="dialog-right-button" type="button" value="Cancel" onclick="javascript:document.ysview.closeDialog(document)"></div></div><div class="dialog-mask"></div>';
                    o = this.panel_doc.createElement("div");
                    o.id = "dialogDiv";
                    o.innerHTML = t;
                    o.style.display = "none";
                    this.modaldlg = o;
                    this.tooltip = new YSLOW.view.Tooltip(this.panel_doc, p.panelNode);
                    q = this.panel_doc.createElement("div");
                    q.id = "copyrightDiv";
                    q.innerHTML = YSLOW.doc.copyright;
                    this.copyright = q;
                    if (p.panelNode) {
                        p.panelNode.id = "yslowDiv";
                        p.panelNode.appendChild(o);
                        p.panelNode.appendChild(s);
                        p.panelNode.appendChild(r);
                        p.panelNode.appendChild(q)
                    }
                    this.viewNode = r;
                    this.viewNode.id = "viewDiv";
                    this.viewNode.className = "yui-skin-sam";
                    this.yscontext = u;
                    YSLOW.util.addEventListener(this.panelNode, "click", function(C) {
                        var w, z, v, D, A, B = p.document.ysview.getElementByTagNameAndId(p.panelNode, "div", "toolbarDiv");
                        if (B) {
                            z = p.document.ysview.getElementByTagNameAndId(B, "li", "helpLink");
                            if (z) {
                                v = z.offsetLeft;
                                D = z.offsetTop;
                                A = z.offsetParent;
                                while (A) {
                                    v += A.offsetLeft;
                                    D += A.offsetTop;
                                    A = A.offsetParent
                                }
                                if (C.clientX >= v && C.clientY >= D && C.clientX < v + z.offsetWidth && C.clientY < D + z.offsetHeight) {
                                    return
                                }
                            }
                            w = p.document.ysview.getElementByTagNameAndId(B, "div", "helpDiv")
                        }
                        if (w && w.style.visibility === "visible") {
                            w.style.visibility = "hidden"
                        }
                    });
                    YSLOW.util.addEventListener(this.panelNode, "scroll", function(w) {
                        var v = p.document.ysview.modaldlg;
                        if (v && v.style.display === "block") {
                            v.style.top = p.panelNode.scrollTop + "px";
                            v.style.left = p.panelNode.scrollLeft + "px"
                        }
                    });
                    YSLOW.util.addEventListener(this.panelNode, "mouseover", function(w) {
                        var v;
                        if (w.target && typeof w.target === "object") {
                            if (w.target.nodeName === "LABEL" && w.target.className === "rules") {
                                if (w.target.firstChild && w.target.firstChild.nodeName === "INPUT" && w.target.firstChild.type === "checkbox") {
                                    v = YSLOW.controller.getRule(w.target.firstChild.value);
                                    p.document.ysview.tooltip.show("<b>" + v.name + "</b><br><br>" + v.info, w.target)
                                }
                            }
                        }
                    });
                    YSLOW.util.addEventListener(this.panelNode, "mouseout", function(v) {
                        p.document.ysview.tooltip.hide()
                    });
                    YSLOW.util.addEventListener(this.panel_doc.defaultView || this.panel_doc.parentWindow, "resize", function(w) {
                        var v = p.document.ysview.modaldlg;
                        if (v && v.style.display === "block") {
                            v.style.display = "none"
                        }
                    })
                };
                YSLOW.view.prototype = {
                    setDocument: function(o) {
                        this.panel_doc = o
                    },
                    loadCSS: function() {},
                    addButtonView: function(o, q) {
                        var p = this.getButtonView(o);
                        if (!p) {
                            p = this.panel_doc.createElement("div");
                            p.style.display = "none";
                            this.viewNode.appendChild(p);
                            this.buttonViews[o] = p
                        }
                        p.innerHTML = q;
                        this.showButtonView(o)
                    },
                    clearAllButtonView: function() {
                        var p = this.buttonViews,
                            q = this.viewNode,
                            o = function(r) {
                                if (p.hasOwnProperty(r)) {
                                    q.removeChild(p[r]);
                                    delete p[r]
                                }
                            };
                        o("ysPerfButton");
                        o("ysCompsButton");
                        o("ysStatsButton")
                    },
                    showButtonView: function(p) {
                        var o, q = this.getButtonView(p);
                        if (!q) {
                            YSLOW.util.dump("ERROR: YSLOW.view.showButtonView: Couldn't find ButtonView '" + p + "'.");
                            return
                        }
                        for (o in this.buttonViews) {
                            if (this.buttonViews.hasOwnProperty(o) && o !== p) {
                                this.buttonViews[o].style.display = "none"
                            }
                        }
                        if (p === "ysPerfButton") {
                            if (this.copyright) {
                                this.copyright.style.display = "none"
                            }
                        } else {
                            if (this.curButtonId === "ysPerfButton") {
                                if (this.copyright) {
                                    this.copyright.style.display = "block"
                                }
                            }
                        }
                        q.style.display = "block";
                        this.curButtonId = p
                    },
                    getButtonView: function(o) {
                        return (this.buttonViews.hasOwnProperty(o) ? this.buttonViews[o] : undefined)
                    },
                    setButtonView: function(o, q) {
                        var p = this.getButtonView(o);
                        if (!p) {
                            YSLOW.util.dump("ERROR: YSLOW.view.setButtonView: Couldn't find ButtonView '" + o + "'.");
                            return
                        }
                        p.innerHTML = q;
                        this.showButtonView(o)
                    },
                    setSplashView: function(p, q, r) {
                        var u, t = "Grade your web pages with YSlow",
                            v = "YSlow gives you:",
                            s = "<li>Grade based on the performance (you can define your own rules)</li><li>Summary of the Components in the page</li><li>Chart with statistics</li><li>Tools including Smush.It and JSLint</li>",
                            o = "Learn more about YSlow and YDN";
                        if (YSLOW.doc.splash) {
                            if (YSLOW.doc.splash.title) {
                                t = YSLOW.doc.splash.title
                            }
                            if (YSLOW.doc.splash.content) {
                                if (YSLOW.doc.splash.content.header) {
                                    v = YSLOW.doc.splash.content.header
                                }
                                if (YSLOW.doc.splash.content.text) {
                                    s = YSLOW.doc.splash.content.text
                                }
                            }
                            if (YSLOW.doc.splash.more_info) {
                                o = YSLOW.doc.splash.more_info
                            }
                        }
                        if (typeof r !== "undefined") {
                            YSLOW.hideToolsInfo = r
                        } else {
                            r = YSLOW.hideToolsInfo
                        }
                        if (r) {
                            s = s.replace(/<li>Tools[^<]+<\/li>/, "")
                        }
                        u = '<div id="splashDiv"><div id="splashDivCenter"><b id="splashImg" width="250" height="150" alt="splash image" src="chrome://yslow/content/yslow/img/speedometer.png"></b><div id="left"><h2>' + t + '</h2><div id="content" class="padding50"><h3>' + v + '</h3><ul id="splashBullets">' + s + "</ul>";
                        if (typeof p !== "undefined") {
                            YSLOW.hideAutoRun = p
                        } else {
                            p = YSLOW.hideAutoRun
                        }
                        if (!p) {
                            u += '<label><input type="checkbox" name="autorun" onclick="javascript:document.ysview.setAutorun(this.checked)" ';
                            if (YSLOW.util.Preference.getPref("extensions.yslow.autorun", false)) {
                                u += "checked"
                            }
                            u += "> Autorun YSlow each time a web page is loaded</label>"
                        }
                        if (typeof q !== "undefined") {
                            YSLOW.showAntiIframe = q
                        } else {
                            q = YSLOW.showAntiIframe
                        }
                        if (q) {
                            u += '<label><input type="checkbox" onclick="javascript:document.ysview.setAntiIframe(this.checked)"> Check here if the current page prevents itself from being embedded/iframed. A simpler post onload detection will be used instead.</label>'
                        }
                        u += '<div id="runtestDiv"><button id="runtest-btn" onclick="javascript:document.ysview.runTest()">Run Test</button></div></div><div class="footer"><div class="moreinfo"><a href="javascript:document.ysview.openLink(\'https://yslow.org/\');"><b>&#187;</b>' + o + "</a></div></div></div></div></div>";
                        this.addButtonView("panel_about", u)
                    },
                    genProgressView: function() {
                        var o = '<div id="progressDiv"><div id="peel"><p>Finding components in the page:</p><div id="peelprogress"><div id="progbar"></div></div><div id="progtext"></div></div><div id="fetch"><p>Getting component information:</p><div id="fetchprogress"><div id="progbar2"></div></div><div id="progtext2">start...</div></div></div>';
                        this.setButtonView("panel_about", o)
                    },
                    updateProgressView: function(o, t) {
                        var s, v, w, u, x, p, q, r, y = "";
                        if (this.curButtonId === "panel_about") {
                            x = this.getButtonView(this.curButtonId);
                            if (o === "peel") {
                                s = this.getElementByTagNameAndId(x, "div", "peelprogress");
                                v = this.getElementByTagNameAndId(x, "div", "progbar");
                                w = this.getElementByTagNameAndId(x, "div", "progtext");
                                y = t.message;
                                u = (t.current_step * 100) / t.total_step
                            } else {
                                if (o === "fetch") {
                                    s = this.getElementByTagNameAndId(x, "div", "fetchprogress");
                                    v = this.getElementByTagNameAndId(x, "div", "progbar2");
                                    w = this.getElementByTagNameAndId(x, "div", "progtext2");
                                    y = t.last_component_url;
                                    u = (t.current * 100) / t.total
                                } else {
                                    if (o === "message") {
                                        w = this.getElementByTagNameAndId(x, "div", "progtext2");
                                        if (w) {
                                            w.innerHTML = t
                                        }
                                        return
                                    } else {
                                        return
                                    }
                                }
                            }
                        }
                        if (s && v && w) {
                            p = s.clientWidth;
                            if (u < 0) {
                                u = 0
                            }
                            if (u > 100) {
                                u = 100
                            }
                            u = 100 - u;
                            q = (p * u) / 100;
                            if (q > p) {
                                q = p
                            }
                            r = p - parseInt(q, 10);
                            v.style.width = parseInt(q, 10) + "px";
                            v.style.left = parseInt(r, 10) + "px";
                            w.innerHTML = y
                        }
                    },
                    updateStatusBar: function(v) {
                        var x, q, y, r, o, p = YSLOW,
                            s = p.util,
                            u = p.view,
                            w = s.Preference,
                            t = this.yscontext;
                        if (!t.PAGE.statusbar) {
                            t.PAGE.statusbar = true;
                            if (!t.PAGE.overallScore) {
                                p.controller.lint(v, t)
                            }
                            if (!t.PAGE.totalSize) {
                                t.collectStats()
                            }
                            x = s.kbSize(t.PAGE.totalSize);
                            q = s.prettyScore(t.PAGE.overallScore);
                            u.setStatusBar(q, "yslow_status_grade");
                            u.setStatusBar(x, "yslow_status_size");
                            if (w.getPref("optinBeacon", false)) {
                                r = w.getPref("beaconInfo", "basic"), o = w.getPref("beaconUrl", "http://rtblab.pclick.yahoo.com/images/ysb.gif");
                                y = s.getResults(t, r);
                                s.sendBeacon(y, r, o)
                            }
                        }
                    },
                    getRulesetListSource: function(o) {
                        var s, q, r = "",
                            p = YSLOW.controller.getDefaultRulesetId();
                        for (s in o) {
                            if (o[s]) {
                                r += '<option value="' + o[s].id + '" ';
                                if (!q && o[s].hasOwnProperty("custom") && o[s].custom) {
                                    q = true;
                                    r += 'class="firstInGroup" '
                                }
                                if (p !== undefined && s === p) {
                                    r += "selected"
                                }
                                r += ">" + o[s].name + "</option>"
                            }
                        }
                        return r
                    },
                    updateRulesetList: function() {
                        var s, u, q, r = this.panel_doc.getElementsByTagName("select"),
                            o = YSLOW.controller.getRegisteredRuleset(),
                            p = this.getRulesetListSource(o),
                            t = function(v) {
                                this.ownerDocument.ysview.onChangeRuleset(v)
                            };
                        for (s = 0; s < r.length; s += 1) {
                            if (r[s].id === "toolbar-rulesetList") {
                                u = r[s].parentNode;
                                if (u && u.id === "toolbar-ruleset") {
                                    q = this.panel_doc.createElement("select");
                                    if (q) {
                                        q.id = "toolbar-rulesetList";
                                        q.name = "rulesets";
                                        q.onchange = t;
                                        q.innerHTML = p
                                    }
                                    u.replaceChild(q, r[s])
                                }
                            }
                        }
                    },
                    getToolbarSource: function() {
                        var p, o, r = '<div id="menu">',
                            q = {
                                home: "Home",
                                grade: "Grade",
                                components: "Components",
                                stats: "Statistics",
                                tools: "Tools"
                            };
                        if (YSLOW.doc && YSLOW.doc.view_names) {
                            for (p in q) {
                                if (q.hasOwnProperty(p) && YSLOW.doc.view_names[p]) {
                                    q[p] = YSLOW.doc.view_names[p]
                                }
                            }
                        }
                        o = YSLOW.controller.getRegisteredRuleset();
                        r = '<div id="toolbar-ruleset" class="floatRight">Rulesets <select id="toolbar-rulesetList" name="rulesets" onchange="javascript:document.ysview.onChangeRuleset(event)">' + this.getRulesetListSource(o) + "</select>";
                        r += '<button onclick="javascript:document.ysview.showRuleSettings()">Edit</button><ul id="tbActions"><li id="printLink" class="first"><a href="javascript:document.ysview.openPrintableDialog(document)"><b class="icon">&asymp;</b><em>Printable View</em></a></li><li id="helpLink"><a href="javascript:document.ysview.showHideHelp()"><b class="icon">?</b><em>Help &darr;</em></a></li></ul></div>';
                        r += '<div id="helpDiv" class="help" style="visibility: hidden"><div><a href="javascript:document.ysview.openLink(\'https://github.com/marcelduran/yslow/wiki/User-Guide\')">YSlow Help</a></div><div><a href="javascript:document.ysview.openLink(\'https://github.com/marcelduran/yslow/wiki/FAQ\')">YSlow FAQ</a></div><div class="new-section"><a href="javascript:document.ysview.openLink(\'http://yslow.org/blog/\')">YSlow Blog</a></div><div><a href="javascript:document.ysview.openLink(\'http://tech.groups.yahoo.com/group/exceptional-performance/\')">YSlow Community</a></div><div class="new-section"><a href="javascript:document.ysview.openLink(\'https://github.com/marcelduran/yslow/issues\')">YSlow Issues</a></div><div class="new-section"><div><a class="social yslow" href="javascript:document.ysview.openLink(\'http://yslow.org/\')">YSlow Home</a></div><div><a class="social facebook" href="javascript:document.ysview.openLink(\'http://www.facebook.com/getyslow\')">Like YSlow</a></div><div><a class="social twitter" href="javascript:document.ysview.openLink(\'http://twitter.com/yslow\')">Follow YSlow</a></div></div><div class="new-section" id="help-version">Version ' + YSLOW.version + "</div></div>";
                        r += '<div id="nav-menu"><ul class="yui-nav" id="toolbarLinks"><li class="first selected off" id="ysHomeButton"><a href="javascript:document.ysview.setSplashView()" onclick="javascript:document.ysview.onclickToolbarMenu(event)"><em>' + q.home + '</em><span class="pipe"/></a></li><li id="ysPerfButton"><a href="javascript:document.ysview.showPerformance()" onclick="javascript:document.ysview.onclickToolbarMenu(event)"><em>' + q.grade + '</em><span class="pipe"/></a></li><li id="ysCompsButton"><a href="javascript:document.ysview.showComponents()" onclick="javascript:document.ysview.onclickToolbarMenu(event)"><em>' + q.components + '</em><span class="pipe"/></a></li><li id="ysStatsButton"><a href="javascript:document.ysview.showStats()" onclick="javascript:document.ysview.onclickToolbarMenu(event)"><em>' + q.stats + '</em><span class="pipe"/></a></li><li id="ysToolButton"><a href="javascript:document.ysview.showTools()" onclick="javascript:document.ysview.onclickToolbarMenu(event)"><em>' + q.tools + "</em></a></li></ul></div>";
                        r += "</div>";
                        return r
                    },
                    show: function(p) {
                        var q = "html",
                            o = "";
                        p = p || this.yscontext.defaultview;
                        if (this.yscontext.component_set === null) {
                            YSLOW.controller.run(window.top.content, this.yscontext, false);
                            this.yscontext.defaultview = p
                        } else {
                            if (this.getButtonView(p)) {
                                this.showButtonView(p)
                            } else {
                                if ("ysCompsButton" === p) {
                                    o += this.yscontext.genComponents(q);
                                    this.addButtonView("ysCompsButton", o)
                                } else {
                                    if ("ysStatsButton" === p) {
                                        o += this.yscontext.genStats(q);
                                        this.addButtonView("ysStatsButton", o);
                                        YSLOW.renderer.plotComponents(this.getButtonView("ysStatsButton"), this.yscontext)
                                    } else {
                                        if ("ysToolButton" === p) {
                                            o += this.yscontext.genToolsView(q);
                                            this.addButtonView("ysToolButton", o)
                                        } else {
                                            o += this.yscontext.genPerformance(q);
                                            this.addButtonView("ysPerfButton", o)
                                        }
                                    }
                                }
                            }
                            this.panelNode.scrollTop = 0;
                            this.panelNode.scrollLeft = 0;
                            this.updateStatusBar(this.yscontext.document);
                            this.updateToolbarSelection()
                        }
                    },
                    updateToolbarSelection: function() {
                        var o, p, q;
                        switch (this.curButtonId) {
                            case "ysCompsButton":
                            case "ysPerfButton":
                            case "ysStatsButton":
                            case "ysToolButton":
                                o = this.getElementByTagNameAndId(this.panelNode, "li", this.curButtonId);
                                if (o) {
                                    if (o.className.indexOf("selected") !== -1) {
                                        return
                                    } else {
                                        o.className += " selected";
                                        if (o.previousSibling) {
                                            o.previousSibling.className += " off"
                                        }
                                    }
                                }
                                break;
                            default:
                                break
                        }
                        p = this.getElementByTagNameAndId(this.panelNode, "ul", "toolbarLinks");
                        q = p.firstChild;
                        while (q) {
                            if (q.id !== this.curButtonId && q.className.indexOf("selected") !== -1) {
                                this.unselect(q);
                                if (q.previousSibling) {
                                    YSLOW.view.removeClassName(q.previousSibling, "off")
                                }
                            }
                            q = q.nextSibling
                        }
                    },
                    showPerformance: function() {
                        this.show("ysPerfButton")
                    },
                    showStats: function() {
                        this.show("ysStatsButton")
                    },
                    showComponents: function() {
                        this.show("ysCompsButton")
                    },
                    showTools: function() {
                        this.show("ysToolButton")
                    },
                    showRuleSettings: function() {
                        var o = this.yscontext.genRulesetEditView("html");
                        this.addButtonView("ysRuleEditButton", o);
                        this.panelNode.scrollTop = 0;
                        this.panelNode.scrollLeft = 0;
                        this.updateToolbarSelection()
                    },
                    runTest: function() {
                        YSLOW.controller.run(window.top.content, this.yscontext, false)
                    },
                    setAutorun: function(o) {
                        YSLOW.util.Preference.setPref("extensions.yslow.autorun", o)
                    },
                    setAntiIframe: function(o) {
                        YSLOW.antiIframe = o
                    },
                    addCDN: function(x) {
                        var r, p, t = this,
                            v = document,
                            y = t.yscontext,
                            z = YSLOW.util.Preference,
                            u = z.getPref("cdnHostnames", ""),
                            o = t.panel_doc,
                            q = o.getElementById("tab-label-list"),
                            w = q.getElementsByTagName("li"),
                            s = w.length;
                        if (u) {
                            u = u.replace(/\s+/g, "").split(",");
                            u.push(x);
                            u = u.join()
                        } else {
                            u = x
                        }
                        z.setPref("extensions.yslow.cdnHostnames", u);
                        for (r = 0; r < s; r += 1) {
                            q = w[r];
                            if (q.className.indexOf("selected") > -1) {
                                p = q.id;
                                break
                            }
                        }
                        YSLOW.controller.lint(y.document, y);
                        t.addButtonView("ysPerfButton", y.genPerformance("html"));
                        YSLOW.view.restoreStatusBar(y);
                        t.updateToolbarSelection();
                        q = o.getElementById(p);
                        t.onclickTabLabel({
                            currentTarget: q
                        }, true)
                    },
                    onChangeRuleset: function(r) {
                        var s, p, t, u, o = YSLOW.util.getCurrentTarget(r),
                            q = o.options[o.selectedIndex];
                        YSLOW.controller.setDefaultRuleset(q.value);
                        s = o.ownerDocument;
                        p = "Do you want to run the selected ruleset now?";
                        t = "Run Test";
                        u = function(w) {
                            var v;
                            s.ysview.closeDialog(s);
                            if (s.yslowContext.component_set === null) {
                                YSLOW.controller.run(s.yslowContext.document.defaultView || s.yslowContext.document.parentWindow, s.yslowContext, false)
                            } else {
                                YSLOW.controller.lint(s.yslowContext.document, s.yslowContext)
                            }
                            v = s.yslowContext.genPerformance("html");
                            s.ysview.addButtonView("ysPerfButton", v);
                            s.ysview.panelNode.scrollTop = 0;
                            s.ysview.panelNode.scrollLeft = 0;
                            YSLOW.view.restoreStatusBar(s.yslowContext);
                            s.ysview.updateToolbarSelection()
                        };
                        this.openDialog(s, 389, 150, p, undefined, t, u)
                    },
                    onclickTabLabel: function(o, u) {
                        var q, p, r, w, y, x, t, z = YSLOW.util.getCurrentTarget(o),
                            v = z.parentNode,
                            s = v.nextSibling;
                        if (z.className.indexOf("selected") !== -1 || z.id.indexOf("label") === -1) {
                            return false
                        }
                        if (v) {
                            q = v.firstChild;
                            while (q) {
                                if (this.unselect(q)) {
                                    p = q.id.substring(5);
                                    break
                                }
                                q = q.nextSibling
                            }
                            z.className += " selected";
                            r = z.id.substring(5);
                            q = s.firstChild;
                            while (q) {
                                t = q.id.substring(3);
                                if (!w && p && t === p) {
                                    if (q.className.indexOf("yui-hidden") === -1) {
                                        q.className += " yui-hidden"
                                    }
                                    w = true
                                }
                                if (!y && r && t === r) {
                                    YSLOW.view.removeClassName(q, "yui-hidden");
                                    y = true;
                                    x = q
                                }
                                if ((w || !p) && (y || !r)) {
                                    break
                                }
                                q = q.nextSibling
                            }
                            if (u === true && y === true && x) {
                                this.positionResultTab(x, s, z)
                            }
                        }
                        return false
                    },
                    positionResultTab: function(p, o, u) {
                        var s, w, x, t = 5,
                            v = this.panel_doc,
                            r = v.defaultView || v.parentWindow,
                            q = r.offsetHeight ? r.offsetHeight : r.innerHeight,
                            z = u.offsetTop + p.offsetHeight;
                        o.style.height = z + "px";
                        p.style.position = "absolute";
                        p.style.left = u.offsetLeft + u.offsetWidth + "px";
                        p.style.top = u.offsetTop + "px";
                        s = p.offsetTop;
                        w = p.offsetParent;
                        while (w !== null) {
                            s += w.offsetTop;
                            w = w.offsetParent
                        }
                        if (s < this.panelNode.scrollTop || s + p.offsetHeight > this.panelNode.scrollTop + q) {
                            if (s < this.panelNode.scrollTop) {
                                this.panelNode.scrollTop = s - t
                            } else {
                                x = s + p.offsetHeight - this.panelNode.scrollTop - q + t;
                                if (x > s - this.panelNode.scrollTop) {
                                    x = s - this.panelNode.scrollTop
                                }
                                this.panelNode.scrollTop += x
                            }
                        }
                    },
                    onclickResult: function(o) {
                        YSLOW.util.preventDefault(o);
                        return this.onclickTabLabel(o, true)
                    },
                    unselect: function(o) {
                        return YSLOW.view.removeClassName(o, "selected")
                    },
                    filterResult: function(x, o) {
                        var t, s, p, u, q, v, r, w = this.getButtonView("ysPerfButton");
                        if (o === "all") {
                            s = true
                        }
                        if (w) {
                            t = this.getElementByTagNameAndId(w, "ul", "tab-label-list")
                        }
                        if (t) {
                            p = t.firstChild;
                            r = t.nextSibling;
                            q = r.firstChild;
                            while (p) {
                                YSLOW.view.removeClassName(p, "first");
                                if (s || p.className.indexOf(o) !== -1) {
                                    p.style.display = "block";
                                    if (u === undefined) {
                                        u = q;
                                        v = p;
                                        YSLOW.view.removeClassName(q, "yui-hidden");
                                        p.className += " first";
                                        if (p.className.indexOf("selected") === -1) {
                                            p.className += " selected"
                                        }
                                        p = p.nextSibling;
                                        q = q.nextSibling;
                                        continue
                                    }
                                } else {
                                    p.style.display = "none"
                                }
                                if (q.className.indexOf("yui-hidden") === -1) {
                                    q.className += " yui-hidden"
                                }
                                this.unselect(p);
                                p = p.nextSibling;
                                q = q.nextSibling
                            }
                            if (u) {
                                this.positionResultTab(u, r, v)
                            }
                        }
                    },
                    updateFilterSelection: function(q) {
                        var o, p = YSLOW.util.getCurrentTarget(q);
                        YSLOW.util.preventDefault(q);
                        if (p.className.indexOf("selected") !== -1) {
                            return
                        }
                        p.className += " selected";
                        o = p.parentNode.firstChild;
                        while (o) {
                            if (o !== p && this.unselect(o)) {
                                break
                            }
                            o = o.nextSibling
                        }
                        this.filterResult(p.ownerDocument, p.id)
                    },
                    onclickToolbarMenu: function(o) {
                        var s, q = YSLOW.util.getCurrentTarget(o),
                            r = q.parentNode,
                            p = r.parentNode;
                        if (r.className.indexOf("selected") !== -1) {
                            return
                        }
                        r.className += " selected";
                        if (r.previousSibling) {
                            r.previousSibling.className += " off"
                        }
                        if (p) {
                            s = p.firstChild;
                            while (s) {
                                if (s !== r && this.unselect(s)) {
                                    if (s.previousSibling) {
                                        YSLOW.view.removeClassName(s.previousSibling, "off")
                                    }
                                    break
                                }
                                s = s.nextSibling
                            }
                        }
                    },
                    expandCollapseComponentType: function(s, p) {
                        var q, r = YSLOW.controller.getRenderer("html"),
                            o = this.getButtonView("ysCompsButton");
                        if (o) {
                            q = this.getElementByTagNameAndId(o, "table", "components-table");
                            r.expandCollapseComponentType(s, q, p)
                        }
                    },
                    expandAll: function(r) {
                        var p, q = YSLOW.controller.getRenderer("html"),
                            o = this.getButtonView("ysCompsButton");
                        if (o) {
                            p = this.getElementByTagNameAndId(o, "table", "components-table");
                            q.expandAllComponentType(r, p)
                        }
                    },
                    regenComponentsTable: function(t, s, p) {
                        var q, r = YSLOW.controller.getRenderer("html"),
                            o = this.getButtonView("ysCompsButton");
                        if (o) {
                            q = this.getElementByTagNameAndId(o, "table", "components-table");
                            r.regenComponentsTable(t, q, s, p, this.yscontext.component_set)
                        }
                    },
                    showComponentHeaders: function(q) {
                        var p, r, o = this.getButtonView("ysCompsButton");
                        if (o) {
                            p = this.getElementByTagNameAndId(o, "tr", q);
                            if (p) {
                                r = p.firstChild;
                                if (p.style.display === "none") {
                                    p.style.display = "table-row"
                                } else {
                                    p.style.display = "none"
                                }
                            }
                        }
                    },
                    openLink: function(o) {
                        YSLOW.util.openLink(o)
                    },
                    openPopup: function(q, p, s, o, r) {
                        window.open(q, p || "_blank", "width=" + (s || 626) + ",height=" + (o || 436) + "," + (r || "toolbar=0,status=1,location=1,resizable=1"))
                    },
                    runTool: function(o, p) {
                        YSLOW.controller.runTool(o, this.yscontext, p)
                    },
                    onclickRuleset: function(t) {
                        var q, p, o, s, u = YSLOW.util.getCurrentTarget(t),
                            r = u.className.indexOf("ruleset-");
                        YSLOW.util.preventDefault(t);
                        if (r !== -1) {
                            p = u.className.indexOf(" ", r + 8);
                            if (p !== -1) {
                                q = u.className.substring(r + 8, p)
                            } else {
                                q = u.className.substring(r + 8)
                            }
                            o = this.getButtonView("ysRuleEditButton");
                            if (o) {
                                s = this.getElementByTagNameAndId(o, "form", "edit-form");
                                YSLOW.renderer.initRulesetEditForm(u.ownerDocument, s, YSLOW.controller.getRuleset(q))
                            }
                        }
                        return this.onclickTabLabel(t, false)
                    },
                    openSaveAsDialog: function(q, p) {
                        var o = '<label>Save ruleset as: <input type="text" id="saveas-name" class="text-input" name="saveas-name" length="100" maxlength="100"></label>',
                            r = "Save",
                            s = function(z) {
                                var w, u, t, x, v, y = YSLOW.util.getCurrentTarget(z).ownerDocument;
                                if (y.ysview.modaldlg) {
                                    w = y.ysview.getElementByTagNameAndId(y.ysview.modaldlg, "input", "saveas-name")
                                }
                                if (w) {
                                    if (YSLOW.controller.checkRulesetName(w.value) === true) {
                                        u = o + '<div class="error">' + w.value + " ruleset already exists.</div>";
                                        y.ysview.closeDialog(y);
                                        y.ysview.openDialog(y, 389, 150, u, "", r, s)
                                    } else {
                                        t = y.ysview.getButtonView("ysRuleEditButton");
                                        if (t) {
                                            x = y.ysview.getElementByTagNameAndId(t, "form", p);
                                            v = y.createElement("input");
                                            v.type = "hidden";
                                            v.name = "saveas-name";
                                            v.value = w.value;
                                            x.appendChild(v);
                                            x.submit()
                                        }
                                        y.ysview.closeDialog(y)
                                    }
                                }
                            };
                        this.openDialog(q, 389, 150, o, undefined, r, s)
                    },
                    openPrintableDialog: function(r) {
                        var q = "Please run YSlow first before using Printable View.",
                            p = "Check which information you want to view or print<br>",
                            o = '<div id="printOptions"><label><input type="checkbox" name="print-type" value="grade" checked>Grade</label><label><input type="checkbox" name="print-type" value="components" checked>Components</label><label><input type="checkbox" name="print-type" value="stats" checked>Statistics</label></div>',
                            s = "Ok",
                            t = function(w) {
                                var u, v = YSLOW.util.getCurrentTarget(w).ownerDocument,
                                    y = v.getElementsByName("print-type"),
                                    x = {};
                                for (u = 0; u < y.length; u += 1) {
                                    if (y[u].checked) {
                                        x[y[u].value] = 1
                                    }
                                }
                                v.ysview.closeDialog(v);
                                v.ysview.runTool("printableview", {
                                    options: x,
                                    yscontext: v.yslowContext
                                })
                            };
                        if (r.yslowContext.component_set === null) {
                            this.openDialog(r, 389, 150, q, "", "Ok");
                            return
                        }
                        this.openDialog(r, 389, 150, p, o, s, t)
                    },
                    getElementByTagNameAndId: function(q, r, s) {
                        var o, p;
                        if (q) {
                            p = q.getElementsByTagName(r);
                            if (p.length > 0) {
                                for (o = 0; o < p.length; o += 1) {
                                    if (p[o].id === s) {
                                        return p[o]
                                    }
                                }
                            }
                        }
                        return null
                    },
                    openDialog: function(I, A, z, v, u, s, D) {
                        var C, B, E, x, w, o, p, r, G, t, q, y, F = this.modaldlg,
                            H = F.getElementsByTagName("div");
                        for (C = 0; C < H.length; C += 1) {
                            if (H[C].className && H[C].className.length > 0) {
                                if (H[C].className === "dialog-box") {
                                    E = H[C]
                                } else {
                                    if (H[C].className === "dialog-text") {
                                        x = H[C]
                                    } else {
                                        if (H[C].className === "dialog-more-text") {
                                            w = H[C]
                                        }
                                    }
                                }
                            }
                        }
                        if (F && E && x && w) {
                            x.innerHTML = (v ? v : "");
                            w.innerHTML = (u ? u : "");
                            p = F.getElementsByTagName("input");
                            for (B = 0; B < p.length; B += 1) {
                                if (p[B].className === "dialog-left-button") {
                                    o = p[B]
                                }
                            }
                            if (o) {
                                o.value = s;
                                o.onclick = D || function(J) {
                                    I.ysview.closeDialog(I)
                                }
                            }
                            r = I.defaultView || I.parentWindow;
                            G = r.innerWidth;
                            t = r.innerHeight;
                            q = Math.floor((G - A) / 2);
                            y = Math.floor((t - z) / 2);
                            E.style.left = ((q && q > 0) ? q : 225) + "px";
                            E.style.top = ((y && y > 0) ? y : 80) + "px";
                            F.style.left = this.panelNode.scrollLeft + "px";
                            F.style.top = this.panelNode.scrollTop + "px";
                            F.style.display = "block";
                            if (p.length > 0) {
                                p[0].focus()
                            }
                        }
                    },
                    closeDialog: function(p) {
                        var o = this.modaldlg;
                        o.style.display = "none"
                    },
                    saveRuleset: function(s, p) {
                        var q, r = YSLOW.controller.getRenderer("html"),
                            o = this.getButtonView("ysRuleEditButton");
                        if (o) {
                            q = this.getElementByTagNameAndId(o, "form", p);
                            r.saveRuleset(s, q)
                        }
                    },
                    deleteRuleset: function(s, p) {
                        var q, r = YSLOW.controller.getRenderer("html"),
                            o = this.getButtonView("ysRuleEditButton");
                        if (o) {
                            q = this.getElementByTagNameAndId(o, "form", p);
                            r.deleteRuleset(s, q)
                        }
                    },
                    shareRuleset: function(t, r) {
                        var o, v, s, w, u, p = YSLOW.controller.getRenderer("html"),
                            q = this.getButtonView("ysRuleEditButton");
                        if (q) {
                            o = this.getElementByTagNameAndId(q, "form", r);
                            v = p.getEditFormRulesetId(o);
                            s = YSLOW.controller.getRuleset(v);
                            if (s) {
                                w = YSLOW.Exporter.exportRuleset(s);
                                if (w) {
                                    u = "<label>" + w.message + "</label>";
                                    this.openDialog(t, 389, 150, u, "", "Ok")
                                }
                            }
                        }
                    },
                    createRuleset: function(q, p) {
                        var o, r, t = q.parentNode,
                            s = t.parentNode,
                            u = s.firstChild;
                        while (u) {
                            this.unselect(u);
                            u = u.nextSibling
                        }
                        o = this.getButtonView("ysRuleEditButton");
                        if (o) {
                            r = this.getElementByTagNameAndId(o, "form", p);
                            YSLOW.renderer.initRulesetEditForm(this.panel_doc, r)
                        }
                    },
                    showHideHelp: function() {
                        var o, p = this.getElementByTagNameAndId(this.panelNode, "div", "toolbarDiv");
                        if (p) {
                            o = this.getElementByTagNameAndId(p, "div", "helpDiv")
                        }
                        if (o) {
                            if (o.style.visibility === "visible") {
                                o.style.visibility = "hidden"
                            } else {
                                o.style.visibility = "visible"
                            }
                        }
                    },
                    smushIt: function(p, o) {
                        YSLOW.util.smushIt(o, function(u) {
                            var s, r, t, v, q = "";
                            if (u.error) {
                                q += "<br><div>" + u.error + "</div>"
                            } else {
                                t = YSLOW.util.getSmushUrl();
                                v = YSLOW.util.makeAbsoluteUrl(u.dest, t);
                                q += "<div>Original size: " + u.src_size + " bytes</div><div>Result size: " + u.dest_size + " bytes</div><div>% Savings: " + u.percent + "%</div><div><a href=\"javascript:document.ysview.openLink('" + v + "')\">Click here to view or save the result image.</a></div>"
                            }
                            s = '<div class="smushItResult"><div>Image: ' + YSLOW.util.briefUrl(o, 250) + "</div></div>";
                            r = q;
                            p.ysview.openDialog(p, 389, 150, s, r, "Ok")
                        })
                    },
                    checkAllRules: function(t, q, p) {
                        var r, o, s, u;
                        if (typeof p !== "boolean") {
                            return
                        }
                        o = this.getButtonView("ysRuleEditButton");
                        if (o) {
                            s = this.getElementByTagNameAndId(o, "form", q);
                            u = s.elements;
                            for (r = 0; r < u.length; r += 1) {
                                if (u[r].type === "checkbox") {
                                    u[r].checked = p
                                }
                            }
                        }
                    }
                };
                YSLOW.view.Tooltip = function(p, o) {
                    this.tooltip = p.createElement("div");
                    if (this.tooltip) {
                        this.tooltip.id = "tooltipDiv";
                        this.tooltip.innerHTML = "";
                        this.tooltip.style.display = "none";
                        if (o) {
                            o.appendChild(this.tooltip)
                        }
                    }
                    this.timer = null
                };
                YSLOW.view.Tooltip.prototype = {
                    show: function(q, p) {
                        var o = this;
                        this.text = q;
                        this.target = p;
                        this.tooltipData = {
                            text: q,
                            target: p
                        };
                        this.timer = YSLOW.util.setTimer(function() {
                            o.showX()
                        }, 500)
                    },
                    showX: function() {
                        if (this.tooltipData) {
                            this.showTooltip(this.tooltipData.text, this.tooltipData.target)
                        }
                        this.timer = null
                    },
                    showTooltip: function(E, u) {
                        var s, F, D, r, q, p, v, A = 10,
                            z = 0,
                            w = 0,
                            C = u.ownerDocument,
                            t = C.defaultView || C.parentWindow,
                            B = t.offsetWidth ? t.offsetWidth : t.innerWidth,
                            o = t.offsetHeight ? t.offsetHeight : t.innerHeight;
                        this.tooltip.innerHTML = E;
                        this.tooltip.style.display = "block";
                        s = this.tooltip.offsetWidth;
                        F = this.tooltip.offsetHeight;
                        if (s > B || F > o) {
                            this.tooltip.style.display = "none";
                            return
                        }
                        D = u.offsetParent;
                        while (D !== null) {
                            z += D.offsetLeft;
                            w += D.offsetTop;
                            D = D.offsetParent
                        }
                        z += u.offsetLeft;
                        w += u.offsetTop;
                        if (z < C.ysview.panelNode.scrollLeft || w < C.ysview.panelNode.scrollTop || (w + u.offsetHeight > C.ysview.panelNode.scrollTop + o)) {
                            this.tooltip.style.display = "none";
                            return
                        }
                        r = z + u.offsetWidth / 2;
                        q = w + u.offsetHeight / 2;
                        if (z + u.offsetWidth + A + s < B) {
                            z += u.offsetWidth + A;
                            if ((w >= C.ysview.panelNode.scrollTop) && (w - A + F + A <= C.ysview.panelNode.scrollTop + o)) {
                                w = w - A;
                                p = "right top"
                            } else {
                                w += u.offsetHeight - F;
                                p = "right bottom"
                            }
                        } else {
                            if (w - F - A >= C.ysview.panelNode.scrollTop) {
                                w -= F + A;
                                p = "top"
                            } else {
                                w += u.offsetHeight + A;
                                p = "bottom"
                            }
                            v = Math.floor(r - s / 2);
                            if ((v >= C.ysview.panelNode.scrollLeft) && (v + s <= C.ysview.panelNode.scrollLeft + B)) {
                                z = v
                            } else {
                                if (v < C.ysview.panelNode.scrollLeft) {
                                    z = C.ysview.panelNode.scrollLeft
                                } else {
                                    z = C.ysview.panelNode.scrollLeft + B - A - s
                                }
                            }
                        }
                        if (p) {
                            this.tooltip.className = p
                        }
                        this.tooltip.style.left = z + "px";
                        this.tooltip.style.top = w + "px"
                    },
                    hide: function() {
                        if (this.timer) {
                            clearTimeout(this.timer)
                        }
                        this.tooltip.style.display = "none"
                    }
                };
                YSLOW.view.setStatusBar = function(q, o) {
                    var p = document.getElementById(o || "yslow_status_grade");
                    if (p) {
                        p.value = q
                    }
                };
                YSLOW.view.clearStatusBar = function() {
                    this.setStatusBar("", "yslow_status_time");
                    this.setStatusBar("YSlow", "yslow_status_grade");
                    this.setStatusBar("", "yslow_status_size")
                };
                YSLOW.view.restoreStatusBar = function(r) {
                    var q, o, p;
                    if (r) {
                        if (r.PAGE.overallScore) {
                            q = YSLOW.util.prettyScore(r.PAGE.overallScore);
                            this.setStatusBar(q, "yslow_status_grade")
                        }
                        if (r.PAGE.totalSize) {
                            o = YSLOW.util.kbSize(r.PAGE.totalSize);
                            this.setStatusBar(o, "yslow_status_size")
                        }
                        if (r.PAGE.t_done) {
                            p = r.PAGE.t_done / 1000 + "s";
                            this.setStatusBar(p, "yslow_status_time")
                        }
                    }
                };
                YSLOW.view.toggleStatusBar = function(o) {
                    document.getElementById("yslow-status-bar").hidden = o
                };
                YSLOW.view.removeClassName = function(q, o) {
                    var p, r;
                    if (q && q.className && q.className.length > 0 && o && o.length > 0) {
                        r = q.className.split(" ");
                        for (p = 0; p < r.length; p += 1) {
                            if (r[p] === o) {
                                r.splice(p, 1);
                                q.className = r.join(" ");
                                return true
                            }
                        }
                    }
                    return false
                };
                YSLOW.context = function(o) {
                    this.document = o;
                    this.component_set = null;
                    this.result_set = null;
                    this.onloadTimestamp = null;
                    if (YSLOW.renderer) {
                        YSLOW.renderer.reset()
                    }
                    this.PAGE = {
                        totalSize: 0,
                        totalRequests: 0,
                        totalObjCount: {},
                        totalObjSize: {},
                        totalSizePrimed: 0,
                        totalRequestsPrimed: 0,
                        totalObjCountPrimed: {},
                        totalObjSizePrimed: {},
                        canvas_data: {},
                        statusbar: false,
                        overallScore: 0,
                        t_done: undefined,
                        loaded: false
                    }
                };
                YSLOW.context.prototype = {
                    defaultview: "ysPerfButton",
                    computeStats: function(y) {
                        var s, x, r, v, z, B, A, q, w, o, t = {},
                            u = {},
                            p = 0;
                        if (!this.component_set) {
                            return
                        }
                        s = this.component_set.components;
                        if (!s) {
                            return
                        }
                        for (v = 0, z = s.length; v < z; v += 1) {
                            x = s[v];
                            if (!y || !x.hasFarFutureExpiresOrMaxAge()) {
                                p += 1;
                                r = x.type;
                                t[r] = (typeof t[r] === "undefined" ? 1 : t[r] + 1);
                                B = 0;
                                if (!y || !x.hasOldModifiedDate()) {
                                    if (x.compressed === "gzip" || x.compressed === "deflate") {
                                        if (x.size_compressed) {
                                            B = parseInt(x.size_compressed, 10)
                                        }
                                    } else {
                                        B = x.size
                                    }
                                }
                                u[r] = (typeof u[r] === "undefined" ? B : u[r] + B)
                            }
                        }
                        A = 0;
                        q = YSLOW.peeler.types;
                        w = {};
                        for (v = 0; v < q.length; v += 1) {
                            o = q[v];
                            if (typeof t[o] !== "undefined") {
                                if (u[o] > 0) {
                                    w[o] = u[o]
                                }
                                A += u[o]
                            }
                        }
                        return {
                            total_size: A,
                            num_requests: p,
                            count_obj: t,
                            size_obj: u,
                            canvas_data: w
                        }
                    },
                    collectStats: function() {
                        var o = this.computeStats();
                        if (o !== undefined) {
                            this.PAGE.totalSize = o.total_size;
                            this.PAGE.totalRequests = o.num_requests;
                            this.PAGE.totalObjCount = o.count_obj;
                            this.PAGE.totalObjSize = o.size_obj;
                            this.PAGE.canvas_data.empty = o.canvas_data
                        }
                        o = this.computeStats(true);
                        if (o) {
                            this.PAGE.totalSizePrimed = o.total_size;
                            this.PAGE.totalRequestsPrimed = o.num_requests;
                            this.PAGE.totalObjCountPrimed = o.count_obj;
                            this.PAGE.totalObjSizePrimed = o.size_obj;
                            this.PAGE.canvas_data.primed = o.canvas_data
                        }
                    },
                    genPerformance: function(p, o) {
                        if (this.result_set === null) {
                            if (!o) {
                                o = this.document
                            }
                            YSLOW.controller.lint(o, this)
                        }
                        return YSLOW.controller.render(p, "reportcard", {
                            result_set: this.result_set
                        })
                    },
                    genStats: function(p) {
                        var o = {};
                        if (!this.PAGE.totalSize) {
                            this.collectStats()
                        }
                        o.PAGE = this.PAGE;
                        return YSLOW.controller.render(p, "stats", {
                            stats: o
                        })
                    },
                    genComponents: function(o) {
                        if (!this.PAGE.totalSize) {
                            this.collectStats()
                        }
                        return YSLOW.controller.render(o, "components", {
                            comps: this.component_set.components,
                            total_size: this.PAGE.totalSize
                        })
                    },
                    genToolsView: function(p) {
                        var o = YSLOW.Tools.getAllTools();
                        return YSLOW.controller.render(p, "tools", {
                            tools: o
                        })
                    },
                    genRulesetEditView: function(o) {
                        return YSLOW.controller.render(o, "rulesetEdit", {
                            rulesets: YSLOW.controller.getRegisteredRuleset()
                        })
                    }
                };
                YSLOW.renderer = {
                    sortBy: "type",
                    sortDesc: false,
                    bPrintable: false,
                    colors: {
                        doc: "#8963df",
                        redirect: "#FC8C8C",
                        iframe: "#FFDFDF",
                        xhr: "#89631f",
                        flash: "#8D4F5B",
                        js: "#9fd0e8",
                        css: "#aba5eb",
                        cssimage: "#677ab8",
                        image: "#d375cd",
                        favicon: "#a26c00",
                        unknown: "#888888"
                    },
                    reset: function() {
                        this.sortBy = "type";
                        this.sortDesc = false
                    },
                    genStats: function(w, x) {
                        var t, u, q, p, z, v, o, s, r = "",
                            y = 0;
                        if (!w.PAGE) {
                            return ""
                        }
                        if (x) {
                            t = w.PAGE.totalObjCountPrimed;
                            u = w.PAGE.totalObjSizePrimed;
                            q = w.PAGE.totalRequestsPrimed;
                            y = w.PAGE.totalSizePrimed
                        } else {
                            t = w.PAGE.totalObjCount;
                            u = w.PAGE.totalObjSize;
                            q = w.PAGE.totalRequests;
                            y = w.PAGE.totalSize
                        }
                        p = YSLOW.peeler.types;
                        z = (x) ? "primed" : "empty";
                        for (v = 0; v < p.length; v += 1) {
                            o = p[v];
                            if (typeof t[o] !== "undefined") {
                                r += '<tr><td class="legend"><div class="stats-legend" style="background: ' + this.colors[o] + '">&nbsp;</div></td><td class="count">' + t[o] + '</td><td class="type">' + YSLOW.util.prettyType(o) + '</td><td class="size">' + YSLOW.util.kbSize(u[o]) + "</td></tr>"
                            }
                        }
                        s = '<div id="stats-detail"><div class="summary-row">HTTP Requests - ' + q + '</div><div class="summary-row-2">Total Weight - ' + YSLOW.util.kbSize(y) + '</div><table id="stats-table">' + r + "</table></div>";
                        return s
                    },
                    plotComponents: function(o, p) {
                        if (typeof o !== "object") {
                            return
                        }
                        this.plotOne(o, p.PAGE.canvas_data.empty, p.PAGE.totalSize, "comp-canvas-empty");
                        this.plotOne(o, p.PAGE.canvas_data.primed, p.PAGE.totalSizePrimed, "comp-canvas-primed")
                    },
                    plotOne: function(y, r, x, w) {
                        var q, s, A, p, v, o, u, B, t, z = y.getElementsByTagName("canvas");
                        for (s = 0; s < z.length; s += 1) {
                            if (z[s].id === w) {
                                q = z[s]
                            }
                        }
                        if (!q) {
                            return
                        }
                        A = q.getContext("2d");
                        p = [q.width, q.height];
                        v = Math.min(p[0], p[1]) / 2;
                        o = [p[0] / 2, p[1] / 2];
                        u = 0;
                        for (B in r) {
                            if (r.hasOwnProperty(B) && r[B]) {
                                t = r[B] / x;
                                A.beginPath();
                                A.moveTo(o[0], o[1]);
                                A.arc(o[0], o[1], v, Math.PI * (-0.5 + 2 * u), Math.PI * (-0.5 + 2 * (u + t)), false);
                                A.lineTo(o[0], o[1]);
                                A.closePath();
                                A.fillStyle = this.colors[B];
                                A.fill();
                                u += t
                            }
                        }
                    },
                    getComponentHeadersTable: function(o) {
                        var q, p = '<table><tr class="respHeaders"><td colspan=2>Response Headers</td></tr>';
                        for (q in o.headers) {
                            if (o.headers.hasOwnProperty(q) && o.headers[q]) {
                                p += '<tr><td class="param-name">' + YSLOW.util.escapeHtml(YSLOW.util.formatHeaderName(q)) + '</td><td class="param-value">' + YSLOW.util.escapeHtml(o.headers[q]) + "</td></tr>"
                            }
                        }
                        if (o.req_headers) {
                            p += '<tr class="reqHeaders"><td colspan=2>Request Headers</td></tr>';
                            for (q in o.req_headers) {
                                if (o.req_headers.hasOwnProperty(q) && o.req_headers[q]) {
                                    p += '<tr><td class="param-name">' + YSLOW.util.escapeHtml(YSLOW.util.formatHeaderName(q)) + '</td><td class="param-value"><p>' + YSLOW.util.escapeHtml(o.req_headers[q]) + "</p></td></tr>"
                                }
                            }
                        }
                        p += "</table>";
                        return p
                    },
                    genComponentRow: function(u, t, p, s) {
                        var q, y, r, o, x, w, v;
                        if (typeof p !== "string") {
                            p = ""
                        }
                        if (t.status >= 400 && t.status < 500) {
                            p += " compError"
                        }
                        if (t.after_onload === true) {
                            p += " afteronload"
                        }
                        q = "compHeaders" + t.id;
                        y = '<tr class="' + p + " type-" + t.type + '"' + (s ? ' style="display:none"' : "") + ">";
                        for (r in u) {
                            if (u.hasOwnProperty(r)) {
                                o = r;
                                x = "";
                                if (r === "type") {
                                    x += t[r];
                                    if (t.is_beacon) {
                                        x += " &#8224;"
                                    }
                                    if (t.after_onload) {
                                        x += " *"
                                    }
                                } else {
                                    if (r === "size") {
                                        x += YSLOW.util.kbSize(t.size)
                                    } else {
                                        if (r === "url") {
                                            if (t.status >= 400 && t.status < 500) {
                                                y += '<td class="' + o + '">' + t[r] + " (status: " + t.status + ")</td>";
                                                continue
                                            } else {
                                                x += YSLOW.util.prettyAnchor(t[r], t[r], undefined, !YSLOW.renderer.bPrintable, 100, 1, t.type)
                                            }
                                        } else {
                                            if (r === "gzip" && (t.compressed === "gzip" || t.compressed === "deflate")) {
                                                x += (t.size_compressed !== undefined ? YSLOW.util.kbSize(t.size_compressed) : "uncertain")
                                            } else {
                                                if (r === "set-cookie") {
                                                    w = t.getSetCookieSize();
                                                    x += w > 0 ? w : ""
                                                } else {
                                                    if (r === "cookie") {
                                                        v = t.getReceivedCookieSize();
                                                        x += v > 0 ? v : ""
                                                    } else {
                                                        if (r === "etag") {
                                                            x += t.getEtag()
                                                        } else {
                                                            if (r === "expires") {
                                                                x += YSLOW.util.prettyExpiresDate(t.expires)
                                                            } else {
                                                                if (r === "headers") {
                                                                    if (YSLOW.renderer.bPrintable) {
                                                                        continue
                                                                    }
                                                                    if (t.raw_headers && t.raw_headers.length > 0) {
                                                                        x += "<a href=\"javascript:document.ysview.showComponentHeaders('" + q + '\')"><b class="mag"></b></a>'
                                                                    }
                                                                } else {
                                                                    if (r === "action") {
                                                                        if (YSLOW.renderer.bPrintable) {
                                                                            continue
                                                                        }
                                                                        if (t.type === "cssimage" || t.type === "image") {
                                                                            if (t.response_type === undefined || t.response_type === "image") {
                                                                                x += "<a href=\"javascript:document.ysview.smushIt(document, '" + t.url + "')\">smush.it</a>"
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if (t[r] !== undefined) {
                                                                            x += t[r]
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                y += '<td class="' + o + '">' + x + "</td>"
                            }
                        }
                        y += "</tr>";
                        if (t.raw_headers && t.raw_headers.length > 0) {
                            y += '<tr id="' + q + '" class="headers" style="display:none;"><td colspan="12">' + this.getComponentHeadersTable(t) + "</td></tr>"
                        }
                        return y
                    },
                    componentSortCallback: function(o, w) {
                        var p, r, s, u = "",
                            t = "",
                            v = YSLOW.renderer.sortBy,
                            q = YSLOW.renderer.sortDesc;
                        switch (v) {
                            case "type":
                                u = o.type;
                                t = w.type;
                                break;
                            case "size":
                                u = o.size ? Number(o.size) : 0;
                                t = w.size ? Number(w.size) : 0;
                                break;
                            case "gzip":
                                u = o.size_compressed ? Number(o.size_compressed) : 0;
                                t = w.size_compressed ? Number(w.size_compressed) : 0;
                                break;
                            case "set-cookie":
                                u = o.getSetCookieSize();
                                t = w.getSetCookieSize();
                                break;
                            case "cookie":
                                u = o.getReceivedCookieSize();
                                t = w.getReceivedCookieSize();
                                break;
                            case "headers":
                                break;
                            case "url":
                                u = o.url;
                                t = w.url;
                                break;
                            case "respTime":
                                u = o.respTime ? Number(o.respTime) : 0;
                                t = w.respTime ? Number(w.respTime) : 0;
                                break;
                            case "etag":
                                u = o.getEtag();
                                t = w.getEtag();
                                break;
                            case "action":
                                if (o.type === "cssimage" || o.type === "image") {
                                    u = "smush.it"
                                }
                                if (w.type === "cssimage" || w.type === "image") {
                                    t = "smush.it"
                                }
                                break;
                            case "expires":
                                u = o.expires || 0;
                                t = w.expires || 0;
                                break
                        }
                        if (u === t) {
                            if (o.id > w.id) {
                                return (q) ? -1 : 1
                            }
                            if (o.id < w.id) {
                                return (q) ? 1 : -1
                            }
                        }
                        if (v === "type") {
                            r = YSLOW.peeler.types;
                            for (p = 0, s = r.length; p < s; p += 1) {
                                if (o.type === r[p]) {
                                    return (q) ? 1 : -1
                                }
                                if (w.type === r[p]) {
                                    return (q) ? -1 : 1
                                }
                            }
                        }
                        if (u > t) {
                            return (q) ? -1 : 1
                        }
                        if (u < t) {
                            return (q) ? 1 : -1
                        }
                        return 0
                    },
                    sortComponents: function(r, q, p) {
                        var o = r;
                        this.sortBy = q;
                        this.sortDesc = p;
                        o.sort(this.componentSortCallback);
                        return o
                    },
                    genRulesCheckbox: function(x) {
                        var q, o, w, p, u = "",
                            z = 0,
                            y = YSLOW.controller.getRegisteredRules(),
                            s = 0,
                            v = '<div class="column1">',
                            t = '<div class="column2">',
                            r = '<div class="column3">';
                        for (o in y) {
                            if (y.hasOwnProperty(o) && y[o]) {
                                w = y[o];
                                q = '<label class="rules"><input id="rulesetEditRule' + o + '" name="rules" value="' + o + '" type="checkbox"' + (x.rules[o] ? " checked" : "") + ">" + w.name + "</label><br>";
                                if (x.rules[o] !== undefined) {
                                    z += 1
                                }
                                if (x.weights !== undefined && x.weights[o] !== undefined) {
                                    u += '<input type="hidden" name="weight-' + o + '" value="' + x.weights[w.id] + '">'
                                }
                                p = (s % 3);
                                switch (p) {
                                    case 0:
                                        v += q;
                                        break;
                                    case 1:
                                        t += q;
                                        break;
                                    case 2:
                                        r += q;
                                        break
                                }
                                s += 1
                            }
                        }
                        v += "</div>";
                        t += "</div>";
                        r += "</div>";
                        return '<h4><span id="rulesetEditFormTitle">' + x.name + '</span> Ruleset <span id="rulesetEditFormNumRules" class="font10">(includes ' + parseInt(z, 10) + " of " + parseInt(s, 10) + ' rules)</span></h4><div class="rulesColumns"><table><tr><td>' + v + "</td><td>" + t + "</td><td>" + r + '</td></tr></table><div id="rulesetEditWeightsDiv" class="weightsDiv">' + u + "</div></div>"
                    },
                    genRulesetEditForm: function(o) {
                        var p = "";
                        p += '<div id="rulesetEditFormDiv"><form id="edit-form" action="javascript:document.ysview.saveRuleset(document, \'edit-form\')"><div class="floatRight"><a href="javascript:document.ysview.checkAllRules(document, \'edit-form\', true)">Check All</a>|<a href="javascript:document.ysview.checkAllRules(document, \'edit-form\', false)">Uncheck All</a></div>' + YSLOW.renderer.genRulesCheckbox(o) + '<div class="buttons"><input type="button" value="Save ruleset as ..." onclick="javascript:document.ysview.openSaveAsDialog(document, \'edit-form\')"><span id="rulesetEditCustomButtons" style="visibility: ' + (o.custom === true ? "visible" : "hidden") + '"><input type="button" value="Save" onclick="this.form.submit()"><!--<input type="button" value="Share" onclick="javascript:document.ysview.shareRuleset(document, \'edit-form\')">--><input class="btn_delete" type="button" value="Delete" onclick="javascript:document.ysview.deleteRuleset(document, \'edit-form\')"></span></div><div id="rulesetEditRulesetId"><input type="hidden" name="ruleset-id" value="' + o.id + '"></div><div id="rulesetEditRulesetName"><input type="hidden" name="ruleset-name" value="' + o.name + '"></div></form></div>';
                        return p
                    },
                    initRulesetEditForm: function(G, p, B) {
                        var A, D, C, z, E, I, u, H, t, w, o, s, y, q = p.elements,
                            r = "",
                            x = [],
                            v = 0,
                            F = 0;
                        for (D = 0; D < q.length; D += 1) {
                            if (q[D].name === "rules") {
                                q[D].checked = false;
                                x[q[D].id] = q[D];
                                F += 1
                            } else {
                                if (q[D].name === "saveas-name") {
                                    p.removeChild(q[D])
                                }
                            }
                        }
                        A = p.getElementsByTagName("div");
                        for (D = 0; D < A.length; D += 1) {
                            if (A[D].id === "rulesetEditWeightsDiv") {
                                t = A[D]
                            } else {
                                if (A[D].id === "rulesetEditRulesetId") {
                                    I = A[D]
                                } else {
                                    if (A[D].id === "rulesetEditRulesetName") {
                                        u = A[D]
                                    }
                                }
                            }
                        }
                        s = p.parentNode.getElementsByTagName("span");
                        for (C = 0; C < s.length; C += 1) {
                            if (s[C].id === "rulesetEditFormTitle") {
                                H = s[C]
                            } else {
                                if (s[C].id === "rulesetEditCustomButtons") {
                                    E = s[C];
                                    if (B !== undefined && B.custom === true) {
                                        E.style.visibility = "visible"
                                    } else {
                                        E.style.visibility = "hidden"
                                    }
                                } else {
                                    if (s[C].id === "rulesetEditFormNumRules") {
                                        o = s[C]
                                    }
                                }
                            }
                        }
                        if (B) {
                            w = B.rules;
                            for (z in w) {
                                if (w.hasOwnProperty(z) && w[z]) {
                                    y = x["rulesetEditRule" + z];
                                    if (y) {
                                        y.checked = true
                                    }
                                    if (B.weights !== undefined && B.weights[z] !== undefined) {
                                        r += '<input type="hidden" name="weight-' + z + '" value="' + B.weights[z] + '">'
                                    }
                                    v += 1
                                }
                            }
                            o.innerHTML = "(includes " + parseInt(v, 10) + " of " + parseInt(F, 10) + " rules)";
                            I.innerHTML = '<input type="hidden" name="ruleset-id" value="' + B.id + '">';
                            u.innerHTML = '<input type="hidden" name="ruleset-name" value="' + B.name + '">';
                            H.innerHTML = B.name
                        } else {
                            I.innerHTML = "";
                            u.innerHTML = "";
                            H.innerHTML = "New";
                            o.innerHTML = ""
                        }
                        t.innerHTML = r
                    }
                };
                YSLOW.registerRenderer({
                    id: "html",
                    supports: {
                        components: 1,
                        reportcard: 1,
                        stats: 1,
                        tools: 1,
                        rulesetEdit: 1
                    },
                    genComponentsTable: function(p, A, t) {
                        var y, w, z, x, s = {
                                type: "TYPE",
                                size: "SIZE<br> (KB)",
                                gzip: "GZIP<br> (KB)",
                                "set-cookie": "COOKIE&nbsp;RECEIVED<br>(bytes)",
                                cookie: "COOKIE&nbsp;SENT<br>(bytes)",
                                headers: "HEADERS",
                                url: "URL",
                                expires: "EXPIRES<br>(Y/M/D)",
                                respTime: "RESPONSE<br> TIME&nbsp;(ms)",
                                etag: "ETAG",
                                action: "ACTION"
                            },
                            v = false,
                            r = "",
                            u = "",
                            o = 0,
                            q = 0;
                        if (A !== undefined && s[A] === undefined) {
                            return ""
                        }
                        if (YSLOW.renderer.bPrintable) {
                            A = YSLOW.renderer.sortBy;
                            t = YSLOW.renderer.sortDesc
                        } else {
                            if (A === undefined || A === "type") {
                                A = "type";
                                v = true
                            }
                        }
                        p = YSLOW.renderer.sortComponents(p, A, t);
                        r += '<table id="components-table"><tr>';
                        for (y in s) {
                            if (s.hasOwnProperty(y) && s[y]) {
                                if (YSLOW.renderer.bPrintable && (y === "action" || y === "components" || y === "headers")) {
                                    continue
                                }
                                r += "<th";
                                if (A === y) {
                                    r += ' class=" sortBy"'
                                }
                                r += ">";
                                if (YSLOW.renderer.bPrintable) {
                                    r += s[y]
                                } else {
                                    r += '<div class="';
                                    if (A === y) {
                                        r += (t ? " sortDesc" : " sortAsc")
                                    }
                                    r += '"><a href="javascript:document.ysview.regenComponentsTable(document, \'' + y + "'" + (A === y ? (t ? ", false" : ", true") : "") + ')">' + (A === y ? (t ? "&darr;" : "&uarr;") : "") + " " + s[y] + "</a></div>"
                                }
                            }
                        }
                        r += "</tr>";
                        for (w = 0; w < p.length; w += 1) {
                            x = p[w];
                            if ((A === undefined || A === "type") && !YSLOW.renderer.bPrintable) {
                                if (z === undefined) {
                                    z = x.type
                                } else {
                                    if (z !== x.type) {
                                        r += '<tr class="type-summary ' + (v ? "expand" : "collapse") + '"><td><a href="javascript:document.ysview.expandCollapseComponentType(document, \'' + z + '\')"><b class="expcol"><b class="exp exph"></b><b class="exp expv"></b><b class="col"></b></b><span class="rowTitle type-' + z + '">' + z + "&nbsp;(" + o + ')</span></a></td><td class="size">' + YSLOW.util.kbSize(q) + "</td><td><!-- GZIP --></td><td></td><td></td><td><!-- HEADERS --></td><td><!-- URL --></td><td><!-- EXPIRES --></td><td><!-- RESPTIME --></td><td><!-- ETAG --></td><td><!-- ACTION--></td></tr>";
                                        r += u;
                                        u = "";
                                        o = 0;
                                        q = 0;
                                        z = x.type
                                    }
                                }
                                u += YSLOW.renderer.genComponentRow(s, x, (o % 2 === 0 ? "even" : "odd"), v);
                                o += 1;
                                q += x.size
                            } else {
                                r += YSLOW.renderer.genComponentRow(s, x, (w % 2 === 0 ? "even" : "odd"), false)
                            }
                        }
                        if (u.length > 0) {
                            r += '<tr class="type-summary ' + (v ? "expand" : "collapse") + '"><td><a href="javascript:document.ysview.expandCollapseComponentType(document, \'' + z + '\')"><b class="expcol"><b class="exp exph"></b><b class="exp expv"></b><b class="col"></b></b><span class="rowTitle type-' + z + '">' + z + "&nbsp;(" + o + ')</span></a></td><td class="size">' + YSLOW.util.kbSize(q) + "</td><td><!-- GZIP --></td><td></td><td></td><td><!-- HEADERS --></td><td><!-- URL --></td><td><!-- EXPIRES --></td><td><!-- RESPTIME --></td><td><!-- ETAG --></td><td><!-- ACTION--></td></tr>";
                            r += u
                        }
                        r += "</table>";
                        return r
                    },
                    componentsView: function(u, p) {
                        var r, q = this.genComponentsTable(u, YSLOW.renderer.sortBy, false),
                            s = "in type column indicates the component is loaded after window onload event.",
                            o = "denotes 1x1 pixels image that may be image beacon",
                            t = "Components";
                        if (YSLOW.doc) {
                            if (YSLOW.doc.components_legend) {
                                if (YSLOW.doc.components_legend.beacon) {
                                    s = YSLOW.doc.components_legend.beacon
                                }
                                if (YSLOW.doc.components_legend.after_onload) {
                                    o = YSLOW.doc.components_legend.after_onload
                                }
                            }
                            if (YSLOW.doc.view_names && YSLOW.doc.view_names.components) {
                                t = YSLOW.doc.view_names.components
                            }
                        }
                        r = '<div id="componentsDiv"><div id="summary"><span class="view-title">' + t + '</span>The page has a total of <span class="number">' + u.length + '</span> components and a total weight of <span class="number">' + YSLOW.util.kbSize(p) + '</span> bytes</div><div id="expand-all"><a href="javascript:document.ysview.expandAll(document)"><b>&#187;</b><span id="expand-all-text">Expand All</span></a></div><div id="components">' + q + '</div><div class="legend">* ' + s + "<br>&#8224; " + o + "</div></div>";
                        return r
                    },
                    reportcardPrintableView: function(r, p, u) {
                        var s, q, w, o, v, t = '<div id="reportDiv"><table><tr class="header"><td colspan="2">Overall Grade: ' + p + "  (Ruleset applied: " + u.name + ")</td></tr>";
                        for (s = 0; s < r.length; s += 1) {
                            w = r[s];
                            if (typeof w === "object") {
                                o = YSLOW.util.prettyScore(w.score);
                                v = "grade-" + (o === "N/A" ? "NA" : o);
                                t += '<tr><td class="grade ' + v + '"><b>' + o + '</b></td><td class="desc"><p>' + w.name + '<br><div class="message">' + w.message + "</div>";
                                if (w.components && w.components.length > 0) {
                                    t += '<ul class="comps-list">';
                                    for (q = 0; q < w.components.length; q += 1) {
                                        if (typeof w.components[q] === "string") {
                                            t += "<li>" + w.components[q] + "</li>"
                                        } else {
                                            if (w.components[q].url !== undefined) {
                                                t += "<li>" + YSLOW.util.briefUrl(w.components[q].url, 60) + "</li>"
                                            }
                                        }
                                    }
                                    t += "</ul><br>"
                                }
                                t += "</p></td></tr>"
                            }
                        }
                        t += "</table></div>";
                        return t
                    },
                    getFilterCode: function(v, s, q, o) {
                        var u, p, t, w, z, A, r, y = s.length,
                            x = [];
                        for (p in v) {
                            if (v.hasOwnProperty(p) && v[p]) {
                                x.push(p)
                            }
                        }
                        x.sort();
                        u = '<div id="filter"><ul><li class="first selected" id="all" onclick="javascript:document.ysview.updateFilterSelection(event)"><a href="#">ALL (' + y + ')</a></li><li class="first">FILTER BY: </li>';
                        for (t = 0, w = x.length; t < w; t += 1) {
                            u += "<li";
                            if (t === 0) {
                                u += ' class="first"'
                            }
                            u += ' id="' + x[t] + '" onclick="javascript:document.ysview.updateFilterSelection(event)"><a href="#">' + x[t].toUpperCase() + " (" + v[x[t]] + ")</a></li>"
                        }
                        z = "http://yslow.org/scoremeter/?url=" + encodeURIComponent(o) + "&grade=" + q;
                        for (t = 0; t < y; t += 1) {
                            A = s[t];
                            r = parseInt(A.score, 10);
                            if (r >= 0 && r < 100) {
                                z += "&" + A.rule_id.toLowerCase() + "=" + r
                            }
                        }
                        z = encodeURIComponent(encodeURIComponent(z));
                        o = encodeURIComponent(encodeURIComponent(o.slice(0, 60) + (o.length > 60 ? "..." : "")));
                        u += '<li class="social"><a class="facebook" href="javascript:document.ysview.openPopup(\'http://www.facebook.com/sharer.php?t=YSlow%20Scoremeter&u=' + z + "', 'facebook')\" title=\"Share these results\"><span>Share</span></a></li>";
                        u += '<li class="social"><a class="twitter" href="javascript:document.ysview.openPopup(\'http://twitter.com/share?original_referer=&source=tweetbutton&text=YSlow%20grade%20' + q + "%20for%20" + o + "&url=" + z + "&via=yslow', 'twitter')\" title=\"Tweet these results\"><span>Tweet</spam></a></li>";
                        u += "</ul></div>";
                        return u
                    },
                    reportcardView: function(q) {
                        var u, F, D, C, v, p, t, J, z, G, I, H, o, s, w = '<div id="reportDiv">',
                            E = q.getRulesetApplied(),
                            y = q.getResults(),
                            r = q.url,
                            K = "Grade",
                            B = "",
                            A = "",
                            x = {};
                        if (YSLOW.doc) {
                            if (YSLOW.doc.view_names && YSLOW.doc.view_names.grade) {
                                K = YSLOW.doc.view_names.grade
                            }
                        }
                        u = YSLOW.util.prettyScore(q.getOverallScore());
                        if (YSLOW.renderer.bPrintable) {
                            return this.reportcardPrintableView(y, u, E)
                        }
                        w += '<div id="summary"><table><tr><td><div class="bigFont">' + K + '</div></td><td class="padding5"><div id="overall-grade" class="grade-' + u + '">' + u + '</div></td><td class="padding15">Overall performance score ' + Math.round(q.getOverallScore()) + '</td><td class="padding15">Ruleset applied: ' + E.name + '</td><td class="padding15">URL: ' + YSLOW.util.briefUrl(r, 100) + "</td></tr></table></div>";
                        for (F = 0; F < y.length; F += 1) {
                            v = y[F];
                            if (typeof v === "object") {
                                p = YSLOW.util.prettyScore(v.score);
                                t = F + 1;
                                J = "";
                                z = "grade-" + (p === "N/A" ? "NA" : p);
                                G = parseInt(v.score, 10);
                                if (isNaN(G) || v.score === -1) {
                                    G = "n/a"
                                } else {
                                    G += "%"
                                }
                                B += '<li id="label' + t + '"';
                                if (F === 0) {
                                    J += "first selected"
                                }
                                if (v.category) {
                                    for (C = 0; C < v.category.length; C += 1) {
                                        if (J.length > 0) {
                                            J += " "
                                        }
                                        J += v.category[C];
                                        if (x[v.category[C]] === undefined) {
                                            x[v.category[C]] = 0
                                        }
                                        x[v.category[C]] += 1
                                    }
                                }
                                if (J.length > 0) {
                                    B += ' class="' + J + '"'
                                }
                                B += ' onclick="javascript:document.ysview.onclickResult(event)"><a href="#" class="' + z + '"><div class="tab-label"><span class="grade" title="' + G + '">' + p + '</span><span class="desc">' + v.name + "</span></div></a></li>";
                                A += '<div id="tab' + t + '" class="result-tab';
                                if (F !== 0) {
                                    A += " yui-hidden"
                                }
                                I = v.message.split("\n");
                                if (I) {
                                    v.message = I.join("<br>")
                                }
                                A += '"><h4>Grade ' + p + " on " + v.name + "</h4><p>" + v.message + "<br>";
                                if (v.components && v.components.length > 0) {
                                    A += '<ul class="comps-list">';
                                    for (D = 0; D < v.components.length; D += 1) {
                                        H = v.components[D];
                                        if (typeof H === "string") {
                                            A += "<li>" + H + "</li>"
                                        } else {
                                            if (H.url !== undefined) {
                                                A += "<li>";
                                                o = v.rule_id.toLowerCase();
                                                if (v.rule_id.match("expires")) {
                                                    A += "(" + YSLOW.util.prettyExpiresDate(H.expires) + ") "
                                                }
                                                A += YSLOW.util.prettyAnchor(H.url, H.url, undefined, true, 120, undefined, H.type) + "</li>"
                                            }
                                        }
                                    }
                                    A += "</ul><br>"
                                }
                                A += "</p>";
                                s = YSLOW.controller.getRule(v.rule_id);
                                if (s) {
                                    A += '<hr><p class="rule-info">' + (s.info || "** To be added **") + "</p>";
                                    if (s.url !== undefined) {
                                        A += '<p class="more-info"><a href="javascript:document.ysview.openLink(\'' + s.url + "')\"><b>&#187;</b>Read More</a></p>"
                                    }
                                }
                                A += "</div>"
                            }
                        }
                        w += '<div id="reportInnerDiv">' + this.getFilterCode(x, y, u, r) + '<div id="result" class="yui-navset yui-navset-left"><ul class="yui-nav" id="tab-label-list">' + B + '</ul><div class="yui-content">' + A + '</div><div id="copyright2">' + YSLOW.doc.copyright + "</div></div></div></div>";
                        return w
                    },
                    statsView: function(p) {
                        var o = "",
                            q = "Stats";
                        if (YSLOW.doc) {
                            if (YSLOW.doc.view_names && YSLOW.doc.view_names.stats) {
                                q = YSLOW.doc.view_names.stats
                            }
                        }
                        o += '<div id="statsDiv"><div id="summary"><span class="view-title">' + q + '</span>The page has a total of <span class="number">' + p.PAGE.totalRequests + '</span> HTTP requests and a total weight of <span class="number">' + YSLOW.util.kbSize(p.PAGE.totalSize) + "</span> bytes with empty cache</div>";
                        o += '<div class="section-header">WEIGHT GRAPHS</div>';
                        o += '<div id="empty-cache"><div class="stats-graph floatLeft"><div class="canvas-title">Empty Cache</div><canvas id="comp-canvas-empty" width="150" height="150"></canvas></div><div class="yslow-stats-empty">' + YSLOW.renderer.genStats(p, false) + "</div></div>";
                        o += '<div id="primed-cache"><div class="stats-graph floatLeft"><div class="canvas-title">Primed Cache</div><canvas id="comp-canvas-primed" width="150" height="150"></canvas></div><div class="yslow-stats-primed">' + YSLOW.renderer.genStats(p, true) + "</div></div>";
                        o += "</div>";
                        return o
                    },
                    toolsView: function(s) {
                        var r, q, p, o = "<table>",
                            u = "Tools",
                            t = "Click the Launch Tool link next to the tool you want to run to start the tool.";
                        if (YSLOW.doc) {
                            if (YSLOW.doc.tools_desc) {
                                t = YSLOW.doc.tools_desc
                            }
                            if (YSLOW.doc.view_names && YSLOW.doc.view_names.tools) {
                                u = YSLOW.doc.view_names.tools
                            }
                        }
                        for (r = 0; r < s.length; r += 1) {
                            p = s[r];
                            o += '<tr><td class="name"><b><a href="#" onclick="javascript:document.ysview.runTool(\'' + p.id + "', {'yscontext': document.yslowContext })\">" + p.name + "</a></b></td><td>-</td><td>" + (p.short_desc || "Short text here explaining what are the main benefits of running this App") + "</td></tr>"
                        }
                        o += "</table>";
                        q = '<div id="toolsDiv"><div id="summary"><span class="view-title">' + u + "</span>" + t + '</div><div id="tools">' + o + "</div></div>";
                        return q
                    },
                    rulesetEditView: function(B) {
                        var q, z, s, r, u = '<div id="settingsDiv" class="yui-navset yui-navset-left">',
                            A, x, w = 0,
                            p = false,
                            o, t, y = "Rule Settings",
                            v = "Choose which ruleset better fit your specific needs. You can Save As an existing rule, based on an existing ruleset.";
                        if (YSLOW.doc) {
                            if (YSLOW.doc.rulesettings_desc) {
                                v = YSLOW.doc.rulesettings_desc
                            }
                            if (YSLOW.doc.view_names && YSLOW.doc.view_names.rulesetedit) {
                                y = YSLOW.doc.view_names.rulesetedit
                            }
                        }
                        t = YSLOW.controller.getDefaultRulesetId();
                        A = '<ul class="yui-nav"><li class="header">STANDARD SETS</li>';
                        for (q in B) {
                            if (B.hasOwnProperty(q) && B[q]) {
                                z = B[q];
                                s = "tab" + w;
                                if (!p && z.custom === true) {
                                    A += '<li class="new-section header" id="custom-set-title">CUSTOM SETS</li>';
                                    p = true
                                }
                                A += '<li id="label' + w + '" class="ruleset-' + z.id;
                                if (q === t) {
                                    o = B[q];
                                    A += ' selected"'
                                }
                                A += '" onclick="javascript:document.ysview.onclickRuleset(event)"><a href="#' + s + '">' + z.name + "</a></li>";
                                w += 1
                            }
                        }
                        A += '<li class="new-section create-ruleset" id="create-ruleset"><input type="button" value="New Set" onclick="javascript:document.ysview.createRuleset(this, \'edit-form\')"></li></ul>';
                        x = '<div class="yui-content">' + YSLOW.renderer.genRulesetEditForm(o) + "</div>";
                        u += A + x;
                        r = '<div id="rulesetEditDiv"><div id="summary"><span class="view-title">' + y + "</span>" + v + "</div>" + u + "</div>";
                        return r
                    },
                    rulesetEditUpdateTab: function(G, o, A, p, y) {
                        var q, z, D, s, x, E, B, v, r, w, F, C, t, u = o.parentNode.parentNode.parentNode;
                        if (u && u.id === "settingsDiv" && A.custom === true) {
                            q = u.firstChild;
                            z = q.nextSibling;
                            if (p < 1) {
                                D = q.firstChild;
                                while (D) {
                                    s = D.className.indexOf("ruleset-");
                                    if (s !== -1) {
                                        x = D.className.substring(s + 8);
                                        s = x.indexOf(" ");
                                        if (s !== -1) {
                                            x = x.substring(0, s)
                                        }
                                        if (A.id === x) {
                                            s = D.id.indexOf("label");
                                            if (s !== -1) {
                                                E = D.id.substring(s + 5);
                                                if (D.className.indexOf("selected") !== -1) {
                                                    B = {};
                                                    B.currentTarget = F;
                                                    G.ysview.onclickRuleset(B)
                                                }
                                                if (D.previousSibling && D.previousSibling.id === "custom-set-title" && D.nextSibling && D.nextSibling.id === "create-ruleset") {
                                                    v = D.previousSibling
                                                }
                                                q.removeChild(D);
                                                if (v) {
                                                    q.removeChild(v)
                                                }
                                            }
                                            break
                                        } else {
                                            F = D
                                        }
                                    }
                                    D = D.nextSibling
                                }
                            } else {
                                D = q.lastChild;
                                while (D) {
                                    w = D.id.indexOf("label");
                                    if (w !== -1) {
                                        r = D.id.substring(w + 5);
                                        break
                                    }
                                    D = D.previousSibling
                                }
                                r = Number(r) + 1;
                                D = G.createElement("li");
                                D.className = "ruleset-" + A.id;
                                D.id = "label" + r;
                                D.onclick = function(H) {
                                    G.ysview.onclickRuleset(H)
                                };
                                D.innerHTML = '<a href="#tab' + r + '">' + A.name + "</a>";
                                q.insertBefore(D, q.lastChild);
                                C = q.firstChild;
                                while (C) {
                                    if (C.id && C.id === "custom-set-title") {
                                        v = C;
                                        break
                                    }
                                    C = C.nextSibling
                                }
                                if (!v) {
                                    v = G.createElement("li");
                                    v.className = "new-section header";
                                    v.id = "custom-set-title";
                                    v.innerHTML = "CUSTOM SETS";
                                    q.insertBefore(v, D)
                                }
                                if (y) {
                                    t = {};
                                    t.currentTarget = D;
                                    G.ysview.onclickRuleset(t)
                                }
                            }
                        }
                    },
                    hasClassName: function(r, o) {
                        var p, q = r.split(" ");
                        if (q) {
                            for (p = 0; p < q.length; p += 1) {
                                if (q[p] === o) {
                                    return true
                                }
                            }
                        }
                        return false
                    },
                    expandCollapseComponentType: function(I, F, s, o, q) {
                        var z, D, A, H, u, B, w, C, r, E, x, G, v, y, p = this.hasClassName,
                            t = {
                                expand: 0,
                                collapse: 0
                            };
                        if (typeof q === "boolean" && q === true) {
                            H = true
                        }
                        if (F) {
                            for (D = 0, E = F.rows.length; D < E; D += 1) {
                                u = F.rows[D];
                                r = u.className;
                                if (p(r, "type-summary")) {
                                    if (p(r, "expand")) {
                                        t.expand += 1;
                                        z = false
                                    } else {
                                        if (p(r, "collapse")) {
                                            t.collapse += 1;
                                            z = true
                                        }
                                    }
                                    B = u.getElementsByTagName("span")[0];
                                    if (H || p(B.className, "type-" + s)) {
                                        if (H) {
                                            w = B.className.split(" ");
                                            for (A = 0; A < w.length; A += 1) {
                                                if (w[A].substring(0, 5) === "type-") {
                                                    s = w[A].substring(5)
                                                }
                                            }
                                        }
                                        if (typeof z !== "boolean" || (typeof o === "boolean" && o === z)) {
                                            if (H) {
                                                z = !o;
                                                continue
                                            } else {
                                                return
                                            }
                                        }
                                        YSLOW.view.removeClassName(u, (z ? "collapse" : "expand"));
                                        u.className += (z ? " expand" : " collapse");
                                        if (z) {
                                            t.collapse -= 1;
                                            t.expand += 1
                                        } else {
                                            t.collapse += 1;
                                            t.expand -= 1
                                        }
                                    }
                                } else {
                                    if (p(r, "type-" + s)) {
                                        if (z) {
                                            u.style.display = "none";
                                            C = u.nextSibling;
                                            if (C.id.indexOf("compHeaders") !== -1) {
                                                C.style.display = "none"
                                            }
                                        } else {
                                            u.style.display = "table-row"
                                        }
                                    }
                                }
                            }
                        }
                        if (t.expand === 0 || t.collapse === 0) {
                            x = F.parentNode.previousSibling;
                            if (x) {
                                G = x.getElementsByTagName("span");
                                for (D = 0; D < G.length; D += 1) {
                                    if (G[D].id === "expand-all-text") {
                                        v = G[D]
                                    }
                                }
                                y = false;
                                if (v.innerHTML.indexOf("Expand") !== -1) {
                                    y = true
                                }
                                if (y) {
                                    if (t.expand === 0) {
                                        v.innerHTML = "Collapse All"
                                    }
                                } else {
                                    if (t.collapse === 0) {
                                        v.innerHTML = "Expand All"
                                    }
                                }
                            }
                        }
                    },
                    expandAllComponentType: function(u, t) {
                        var s, p, q = false,
                            r = t.parentNode.previousSibling,
                            o = r.getElementsByTagName("span");
                        for (p = 0; p < o.length; p += 1) {
                            if (o[p].id === "expand-all-text") {
                                s = o[p]
                            }
                        }
                        if (s) {
                            if (s.innerHTML.indexOf("Expand") !== -1) {
                                q = true
                            }
                        }
                        this.expandCollapseComponentType(u, t, undefined, q, true);
                        if (s) {
                            s.innerHTML = (q ? "Collapse All" : "Expand All")
                        }
                    },
                    regenComponentsTable: function(u, s, t, p, v) {
                        var o, r, q;
                        if (s) {
                            if (p === undefined) {
                                p = false
                            }
                            if (t === "type") {
                                o = true
                            }
                            r = s.parentNode.previousSibling;
                            if (r.id === "expand-all") {
                                r.style.visibility = (o ? "visible" : "hidden")
                            }
                            q = this.genComponentsTable(v.components, t, p);
                            s.parentNode.innerHTML = q
                        }
                    },
                    saveRuleset: function(w, p) {
                        var r, q, t, o, s, x, z, y, v = {},
                            u = {};
                        if (p) {
                            v.custom = true;
                            v.rules = {};
                            v.weights = {};
                            for (r = 0; r < p.elements.length; r += 1) {
                                q = p.elements[r];
                                if (q.name === "rules" && q.type === "checkbox") {
                                    if (q.checked) {
                                        v.rules[q.value] = {}
                                    }
                                } else {
                                    if (q.name === "saveas-name") {
                                        s = q.value
                                    } else {
                                        if (q.name === "ruleset-name") {
                                            x = q.value
                                        } else {
                                            if (q.name === "ruleset-id") {
                                                z = q.value
                                            } else {
                                                if ((t = q.name.indexOf("weight-")) !== -1) {
                                                    u[q.name.substring(t)] = q.value
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            y = v.rules;
                            for (o in y) {
                                if (y.hasOwnProperty(o) && u["weight-" + o]) {
                                    v.weights[o] = parseInt(u["weight-" + o], 10)
                                }
                            }
                            if (s) {
                                v.id = s.replace(/\s/g, "-");
                                v.name = s
                            } else {
                                v.id = z;
                                v.name = x
                            }
                            if (v.id && v.name) {
                                YSLOW.controller.addRuleset(v, true);
                                YSLOW.controller.saveRulesetToPref(v);
                                if (s !== undefined) {
                                    this.updateRulesetUI(w, p, v, 1)
                                }
                            }
                        }
                    },
                    updateRulesetUI: function(t, s, o, r) {
                        var q, p = t.getElementsByTagName("form");
                        for (q = 0; q < p.length; q += 1) {
                            if (p[q].id === s.id) {
                                this.rulesetEditUpdateTab(t, p[q], o, r, (p[q] === s))
                            }
                        }
                        t.ysview.updateRulesetList()
                    },
                    deleteRuleset: function(r, q) {
                        var p = this.getEditFormRulesetId(q),
                            o = YSLOW.controller.removeRuleset(p);
                        if (o && o.custom) {
                            YSLOW.controller.deleteRulesetFromPref(o);
                            this.updateRulesetUI(r, q, o, -1)
                        }
                    },
                    getEditFormRulesetId: function(p) {
                        var o, q = p.getElementsByTagName("input");
                        for (o = 0; o < q.length; o += 1) {
                            if (q[o].name === "ruleset-id") {
                                return q[o].value
                            }
                        }
                        return undefined
                    }
                });
                YSLOW.registerRenderer({
                    id: "xml",
                    supports: {
                        components: 1,
                        reportcard: 1,
                        stats: 1
                    },
                    componentsView: function(s, p) {
                        var r, o, q = "<components>";
                        for (r = 0; r < s.length; r += 1) {
                            q += "<component>";
                            q += "<type>" + s[r].type + "</type>";
                            q += "<size>" + s[r].size + "</size>";
                            if (s[r].compressed === false) {
                                q += "<gzip/>"
                            } else {
                                q += "<gzip>" + (s[r].size_compressed !== undefined ? parseInt(s[r].size_compressed, 10) : "uncertain") + "</gzip>"
                            }
                            o = s[r].getSetCookieSize();
                            if (o > 0) {
                                q += "<set-cookie>" + parseInt(o, 10) + "</set-cookie>"
                            }
                            o = s[r].getReceivedCookieSize();
                            if (o > 0) {
                                q += "<cookie>" + parseInt(o, 10) + "</cookie>"
                            }
                            q += "<url>" + encodeURI(s[r].url) + "</url>";
                            q += "<expires>" + s[r].expires + "</expires>";
                            q += "<resptime>" + s[r].respTime + "</resptime>";
                            q += "<etag>" + s[r].getEtag() + "</etag>";
                            q += "</component>"
                        }
                        q += "</components>";
                        return q
                    },
                    reportcardView: function(u) {
                        var r, p, w, s = u.getOverallScore(),
                            q = YSLOW.util.prettyScore(s),
                            v = u.getRulesetApplied(),
                            t = u.getResults(),
                            o = '<performance ruleset="' + v.name + '" url="' + u.url + '">';
                        o += '<overall grade="' + q + '" score="' + s + '" />';
                        for (r = 0; r < t.length; r += 1) {
                            w = t[r];
                            o += '<lints id="' + w.rule_id + '" ruletext="' + w.name + '" hreftext="' + YSLOW.controller.getRule(w.rule_id).url + '" grade="' + YSLOW.util.prettyScore(w.score) + '" score="' + w.score + '" category="' + w.category.join(",") + '">';
                            o += "<message>" + w.message + "</message>";
                            if (t.components && t.components.length > 0) {
                                o += "<offenders>";
                                for (p = 0; p < w.components.length; p += 1) {
                                    if (typeof w.components[p] === "string") {
                                        o += "<offender>" + w.components[p] + "</offender>"
                                    } else {
                                        if (w.components[p].url !== undefined) {
                                            o += "<offender>" + w.components[p].url + "</offender>"
                                        }
                                    }
                                }
                                o += "</offenders>"
                            }
                            o += "</lints>"
                        }
                        o += "</performance>";
                        return o
                    },
                    statsView: function(r) {
                        var q, u, p, t = '<items type="primedCache">',
                            s = '<items type="emptyCache">',
                            o = YSLOW.peeler.types;
                        for (q = 0; q < o.length; q += 1) {
                            u = o[q];
                            if ((r.PAGE.totalObjCountPrimed[u]) !== undefined) {
                                t += '<item type="' + u + '" count="' + r.PAGE.totalObjCountPrimed[u] + '" size="' + r.PAGE.totalObjSizePrimed[u] + '" />'
                            }
                            if ((r.PAGE.totalObjCount[u]) !== undefined) {
                                s += '<item type="' + u + '" count="' + r.PAGE.totalObjCount[u] + '" size="' + r.PAGE.totalObjSize[u] + '" />'
                            }
                        }
                        t += "</items>";
                        s += "</items>";
                        p = '<stats numRequests="' + r.PAGE.totalRequests + '" totalSize="' + r.PAGE.totalSize + '" numRequests_p="' + r.PAGE.totalRequestsPrimed + '" totalSize_p="' + r.PAGE.totalSizePrimed + '">' + t + s + "</stats>";
                        return p
                    }
                });
                YSLOW.peeler = {
                    types: ["doc", "js", "css", "iframe", "flash", "cssimage", "image", "favicon", "xhr", "redirect", "font"],
                    NODETYPE: {
                        ELEMENT: 1,
                        DOCUMENT: 9
                    },
                    CSSRULE: {
                        IMPORT_RULE: 3,
                        FONT_FACE_RULE: 5
                    },
                    peel: function(o, p) {},
                    findDocuments: function(p) {
                        var w, z, s, x, t, u, o, A, y, q = {};
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 1,
                            message: "Finding documents"
                        });
                        if (!p) {
                            return
                        }
                        if (!YSLOW.util.Preference.getPref("extensions.yslow.getFramesComponents", true)) {
                            q[p.URL] = {
                                document: p,
                                type: "doc"
                            };
                            return q
                        }
                        x = "doc";
                        if (p.nodeType === this.NODETYPE.DOCUMENT) {
                            z = p;
                            s = p.URL
                        } else {
                            if (p.nodeType === this.NODETYPE.ELEMENT && p.nodeName.toLowerCase() === "frame") {
                                z = p.contentDocument;
                                s = p.src
                            } else {
                                if (p.nodeType === this.NODETYPE.ELEMENT && p.nodeName.toLowerCase() === "iframe") {
                                    z = p.contentDocument;
                                    s = p.src;
                                    x = "iframe";
                                    try {
                                        y = p.contentWindow;
                                        y = y && y.parent;
                                        y = y && y.document;
                                        y = y || p.ownerDocument;
                                        if (y && y.URL === s) {
                                            s = !p.getAttribute("src") ? "" : "about:blank"
                                        }
                                    } catch (r) {
                                        YSLOW.util.dump(r)
                                    }
                                } else {
                                    return q
                                }
                            }
                        }
                        q[s] = {
                            document: z,
                            type: x
                        };
                        try {
                            w = z.getElementsByTagName("iframe");
                            for (t = 0, u = w.length; t < u; t += 1) {
                                o = w[t];
                                if (o.src) {
                                    A = this.findDocuments(o);
                                    if (A) {
                                        q = YSLOW.util.merge(q, A)
                                    }
                                }
                            }
                            w = z.getElementsByTagName("frame");
                            for (t = 0, u = w.length; t < u; t += 1) {
                                o = w[t];
                                A = this.findDocuments(o);
                                if (A) {
                                    q = YSLOW.util.merge(q, A)
                                }
                            }
                        } catch (v) {
                            YSLOW.util.dump(v)
                        }
                        return q
                    },
                    findComponentsInNode: function(q, o, w) {
                        var p = [];
                        try {
                            p = this.findStyleSheets(q, o)
                        } catch (x) {
                            YSLOW.util.dump(x)
                        }
                        try {
                            p = p.concat(this.findScripts(q))
                        } catch (v) {
                            YSLOW.util.dump(v)
                        }
                        try {
                            p = p.concat(this.findFlash(q))
                        } catch (u) {
                            YSLOW.util.dump(u)
                        }
                        try {
                            p = p.concat(this.findCssImages(q))
                        } catch (t) {
                            YSLOW.util.dump(t)
                        }
                        try {
                            p = p.concat(this.findImages(q))
                        } catch (s) {
                            YSLOW.util.dump(s)
                        }
                        try {
                            if (w === "doc") {
                                p = p.concat(this.findFavicon(q, o))
                            }
                        } catch (r) {
                            YSLOW.util.dump(r)
                        }
                        return p
                    },
                    addComponentsNotInNode: function(p, o) {
                        var r, q, s, w, t, u = ["flash", "js", "css", "doc", "redirect"],
                            v = YSLOW.net.getResponseURLsByType("xhr");
                        if (v.length > 0) {
                            for (q = 0; q < v.length; q += 1) {
                                p.addComponent(v[q], "xhr", o)
                            }
                        }
                        s = YSLOW.net.getResponseURLsByType("image");
                        if (s.length > 0) {
                            for (q = 0; q < s.length; q += 1) {
                                w = "image";
                                if (s[q].indexOf("favicon.ico") !== -1) {
                                    w = "favicon"
                                }
                                p.addComponentNoDuplicate(s[q], w, o)
                            }
                        }
                        for (r = 0; r < u.length; r += 1) {
                            t = YSLOW.net.getResponseURLsByType(u[r]);
                            for (q = 0; q < t.length; q += 1) {
                                p.addComponentNoDuplicate(t[q], u[r], o)
                            }
                        }
                    },
                    findStyleSheets: function(r, o) {
                        var y, p, s, w, x = r.getElementsByTagName("head")[0],
                            u = r.getElementsByTagName("body")[0],
                            q = [],
                            v = this,
                            t = function(D, A) {
                                var C, z, F, B, E;
                                for (C = 0, z = D.length; C < z; C += 1) {
                                    F = D[C];
                                    B = F.href || F.getAttribute("href");
                                    if (B && (F.rel === "stylesheet" || F.type === "text/css")) {
                                        q.push({
                                            type: "css",
                                            href: B === r.URL ? "" : B,
                                            containerNode: A
                                        });
                                        E = YSLOW.util.makeAbsoluteUrl(B, o);
                                        q = q.concat(v.findImportedStyleSheets(F.sheet, E))
                                    }
                                }
                            };
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 2,
                            message: "Finding StyleSheets"
                        });
                        if (x || u) {
                            if (x) {
                                t(x.getElementsByTagName("link"), "head")
                            }
                            if (u) {
                                t(u.getElementsByTagName("link"), "body")
                            }
                        } else {
                            t(r.getElementsByTagName("link"))
                        }
                        y = r.getElementsByTagName("style");
                        for (s = 0, w = y.length; s < w; s += 1) {
                            p = y[s];
                            q = q.concat(v.findImportedStyleSheets(p.sheet, o))
                        }
                        return q
                    },
                    findImportedStyleSheets: function(x, o) {
                        var r, y, v, s, p, t, w = /url\s*\(["']*([^"'\)]+)["']*\)/i,
                            q = [];
                        try {
                            if (!(y = x.cssRules)) {
                                return q
                            }
                            for (r = 0, t = y.length; r < t; r += 1) {
                                v = y[r];
                                if (v.type === YSLOW.peeler.CSSRULE.IMPORT_RULE && v.styleSheet && v.href) {
                                    q.push({
                                        type: "css",
                                        href: v.href,
                                        base: o
                                    });
                                    s = YSLOW.util.makeAbsoluteUrl(v.href, o);
                                    q = q.concat(this.findImportedStyleSheets(v.styleSheet, s))
                                } else {
                                    if (v.type === YSLOW.peeler.CSSRULE.FONT_FACE_RULE) {
                                        if (v.style && typeof v.style.getPropertyValue === "function") {
                                            p = v.style.getPropertyValue("src");
                                            p = w.exec(p);
                                            if (p) {
                                                p = p[1];
                                                q.push({
                                                    type: "font",
                                                    href: p,
                                                    base: o
                                                })
                                            }
                                        }
                                    } else {
                                        break
                                    }
                                }
                            }
                        } catch (u) {
                            YSLOW.util.dump(u)
                        }
                        return q
                    },
                    findScripts: function(r) {
                        var s = [],
                            q = r.getElementsByTagName("head")[0],
                            o = r.getElementsByTagName("body")[0],
                            p = function(u, v) {
                                var x, t, w, y, z;
                                for (x = 0, t = u.length; x < t; x += 1) {
                                    w = u[x];
                                    y = w.type;
                                    if (y && y.toLowerCase().indexOf("javascript") < 0) {
                                        continue
                                    }
                                    z = w.src || w.getAttribute("src");
                                    if (z) {
                                        s.push({
                                            type: "js",
                                            href: z === r.URL ? "" : z,
                                            containerNode: v
                                        })
                                    }
                                }
                            };
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 3,
                            message: "Finding JavaScripts"
                        });
                        if (q || o) {
                            if (q) {
                                p(q.getElementsByTagName("script"), "head")
                            }
                            if (o) {
                                p(o.getElementsByTagName("script"), "body")
                            }
                        } else {
                            p(r.getElementsByTagName("script"))
                        }
                        return s
                    },
                    findFlash: function(s) {
                        var q, r, p, o, t = [];
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 4,
                            message: "Finding Flash"
                        });
                        p = s.getElementsByTagName("embed");
                        for (q = 0, o = p.length; q < o; q += 1) {
                            r = p[q];
                            if (r.src) {
                                t.push({
                                    type: "flash",
                                    href: r.src
                                })
                            }
                        }
                        p = s.getElementsByTagName("object");
                        for (q = 0, o = p.length; q < o; q += 1) {
                            r = p[q];
                            if (r.data && r.type === "application/x-shockwave-flash") {
                                t.push({
                                    type: "flash",
                                    href: r.data
                                })
                            }
                        }
                        return t
                    },
                    findCssImages: function(s) {
                        var x, v, r, u, o, p, y, q = [],
                            w = {},
                            z = ["backgroundImage", "listStyleImage", "content", "cursor"],
                            t = z.length;
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 5,
                            message: "Finding CSS Images"
                        });
                        u = s.getElementsByTagName("*");
                        for (x = 0, y = u.length; x < y; x += 1) {
                            r = u[x];
                            for (v = 0; v < t; v += 1) {
                                o = z[v];
                                p = YSLOW.util.getComputedStyle(r, o, true);
                                if (p && !w[p]) {
                                    q.push({
                                        type: "cssimage",
                                        href: p
                                    });
                                    w[p] = 1
                                }
                            }
                        }
                        return q
                    },
                    findImages: function(r) {
                        var q, p, v, t, o, u = [],
                            s = {};
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 6,
                            message: "Finding Images"
                        });
                        v = r.getElementsByTagName("img");
                        for (q = 0, o = v.length; q < o; q += 1) {
                            p = v[q];
                            t = p.src;
                            if (t && !s[t]) {
                                u.push({
                                    type: "image",
                                    href: t,
                                    obj: {
                                        width: p.width,
                                        height: p.height
                                    }
                                });
                                s[t] = 1
                            }
                        }
                        return u
                    },
                    findFavicon: function(u, s) {
                        var r, p, t, q, o, v = [];
                        YSLOW.util.event.fire("peelProgress", {
                            total_step: 7,
                            current_step: 7,
                            message: "Finding favicon"
                        });
                        q = u.getElementsByTagName("link");
                        for (r = 0, p = q.length; r < p; r += 1) {
                            t = q[r];
                            o = (t.rel || "").toLowerCase();
                            if (t.href && (o === "icon" || o === "shortcut icon")) {
                                v.push({
                                    type: "favicon",
                                    href: t.href
                                })
                            }
                        }
                        if (!v.length) {
                            v.push({
                                type: "favicon",
                                href: YSLOW.util.makeAbsoluteUrl("/favicon.ico", s)
                            })
                        }
                        return v
                    },
                    getBaseHref: function(q) {
                        var o;
                        try {
                            o = q.getElementsByTagName("base")[0];
                            o = (o && o.href) || q.URL
                        } catch (p) {
                            YSLOW.util.dump(p)
                        }
                        return o
                    }
                };
                YSLOW.peeler.peel = function(r) {
                    var o, u, t, s, p, v = [];
                    try {
                        u = this.findDocuments(r);
                        for (o in u) {
                            if (u.hasOwnProperty(o)) {
                                t = u[o];
                                if (t) {
                                    v.push({
                                        type: t.type,
                                        href: o
                                    });
                                    s = t.document;
                                    if (s && o) {
                                        p = this.getBaseHref(s);
                                        v = v.concat(this.findComponentsInNode(s, p, t.type))
                                    }
                                }
                            }
                        }
                    } catch (q) {
                        YSLOW.util.dump(q);
                        YSLOW.util.event.fire("peelError", {
                            message: q
                        })
                    }
                    return v
                }
            };
            j = "YSLOW.phantomjs = {resources: " + JSON.stringify(g) + ",args: " + JSON.stringify(yslowArgs) + ",loadTime: " + JSON.stringify(l) + "};";
            m = function() {
                YSLOW.phantomjs.run = function() {
                    try {
                        var z, w, x, r, G = document,
                            B = YSLOW,
                            u = new B.context(G),
                            v = B.peeler,
                            y = v.peel(G),
                            o = v.getBaseHref(G),
                            t = new B.ComponentSet(G),
                            C = B.phantomjs,
                            E = C.resources,
                            p = C.args,
                            F = B.util,
                            A = function(I) {
                                var J = (p.format || "").toLowerCase(),
                                    K = {
                                        tap: {
                                            func: F.formatAsTAP,
                                            contentType: "text/plain"
                                        },
                                        junit: {
                                            func: F.formatAsJUnit,
                                            contentType: "text/xml"
                                        }
                                    };
                                switch (J) {
                                    case "xml":
                                        return {
                                            content: F.objToXML(I),
                                            contentType: "text/xml"
                                        };
                                    case "plain":
                                        return {
                                            content: F.prettyPrintResults(I),
                                            contentType: "text/plain"
                                        };
                                    case "tap":
                                    case "junit":
                                        try {
                                            r = JSON.parse(p.threshold)
                                        } catch (H) {
                                            r = p.threshold
                                        }
                                        return {
                                            content: K[J].func(F.testResults(I, r)),
                                            contentType: K[J].contentType
                                        };
                                    default:
                                        return {
                                            content: JSON.stringify(I),
                                            contentType: "application/json"
                                        }
                                }
                            },
                            D = function(I) {
                                var H = /^([^:]+):\s*([\s\S]+)$/,
                                    K = /[\n\r]/g,
                                    J = {};
                                I.split("\n").forEach(function(M) {
                                    var L = H.exec(M.replace(K, ""));
                                    if (L) {
                                        J[L[1]] = L[2]
                                    }
                                });
                                return J
                            };
                        y.forEach(function(H) {
                            var I = E[H.href] || {};
                            t.addComponent(H.href, H.type, H.base || o, {
                                obj: H.obj,
                                request: I.request,
                                response: I.response
                            })
                        });
                        t.inline = F.getInlineTags(G);
                        t.domElementsCount = F.countDOMElements(G);
                        t.cookies = t.doc_comp.cookie;
                        t.components = F.setInjected(G, t.components, t.doc_comp.body);
                        u.component_set = t;
                        B.controller.lint(G, u, p.ruleset);
                        u.result_set.url = o;
                        u.PAGE.t_done = C.loadTime;
                        u.collectStats();
                        z = F.getResults(u, p.info);
                        if (p.dict && p.format !== "plain") {
                            z.dictionary = F.getDict(p.info, p.ruleset)
                        }
                        x = A(z);
                        if (p.beacon) {
                            try {
                                w = new XMLHttpRequest();
                                w.onreadystatechange = function() {
                                    if (w.readyState === 4 && p.verbose) {
                                        z.beacon = {
                                            status: w.status,
                                            headers: D(w.getAllResponseHeaders()),
                                            body: w.responseText
                                        };
                                        x = A(z)
                                    }
                                };
                                w.open("POST", p.beacon, false);
                                w.setRequestHeader("Content-Type", x.contentType);
                                w.send(x.content)
                            } catch (q) {
                                if (p.verbose) {
                                    z.beacon = {
                                        error: q
                                    };
                                    x = A(z)
                                }
                            }
                        }
                        return x.content
                    } catch (s) {
                        return s
                    }
                };
                return YSLOW.phantomjs.run()
            };
            f = f.toString();
            f = f.slice(13, f.length - 1);
            if (f.slice(f.length - 1) !== ";") {
                f += ";"
            }
            m = m.toString();
            m = m.slice(13, m.length - 1);
            n = new Function(f + j + m);
            console.log(c.evaluate(n))
        }
        urlCount -= 1;
        if (urlCount === 0) {
            phantom.exit()
        }
    })
});
