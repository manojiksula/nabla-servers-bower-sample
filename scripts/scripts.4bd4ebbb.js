/**
 * bower-sample
 * @version v1.0.2 - 2018-07-16
 * @link http://home.nabla.mobi
 * @author Alban Andrieu alban.andrieu@nabla.mobi
 * @license , 
 */

"use strict";function square(e){return e*e}angular.module("myTestApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","pascalprecht.translate","tmh.dynamicLocale","ui.gravatar","ui.bootstrap"]).constant("DEBUG_MODE",!1).constant("VERSION_TAG",1531692793895).constant("LOCALES",{locales:{en_US:"English",fr_FR:"Francais",no_NO:"Norsk"},preferredLocale:"en_US"}).config(["$routeProvider",function(e){e.when("/",{navitem:!0,name:"route1",templateUrl:"views/main.html",controller:"MainController"}).when("/about",{navitem:!0,name:"route2",templateUrl:"views/about.html",controller:"AboutController"}).when("/blog",{navitem:!0,name:"route3",templateUrl:"views/blog.html",controller:"BlogController"}).when("/project",{navitem:!0,name:"route4",templateUrl:"views/project.html",controller:"ProjectController"}).when("/sample",{navitem:!0,name:"route5",templateUrl:"views/sample.html",controller:"SampleController"}).when("/yeoman",{navitem:!0,name:"route6",templateUrl:"views/yeoman.html",controller:"YeomanController"}).when("/boostrap",{navitem:!0,name:"route7",templateUrl:"views/styles.html",controller:"BootstrapController"}).when("/contacts",{navitem:!0,name:"route8",templateUrl:"views/contact.html",controller:"ContactController"}).when("/test",{template:"<p>i am route 4 and not in the navbar</p>"}).otherwise({redirectTo:"/"})}]).config(["$httpProvider",function(e){e.useApplyAsync(!0)}]).config(["$compileProvider","DEBUG_MODE",function(e,o){o||e.debugInfoEnabled(!1)}]).config(["$translateProvider","DEBUG_MODE","LOCALES",function(e,o,a){o&&e.useMissingTranslationHandlerLog();e.translations("en",{HEADLINE:"XSS possible!",PARAGRAPH:"Hello {{username}}!"}),e.useStaticFilesLoader({prefix:"resources/locale-",suffix:".json"}),e.preferredLanguage(a.preferredLocale),e.useLocalStorage(),e.useSanitizeValueStrategy("sanitizeParameters")}]).config(["tmhDynamicLocaleProvider",function(e){e.localeLocationPattern("bower_components/angular-i18n/angular-locale_{{locale}}.js")}]),angular.module("myTestApp").controller("AppController",["$scope","$location","$anchorScroll","$rootScope","$translate","$interval","VERSION_TAG",function(a,o,n,t,l,e,r){t.VERSION_TAG=r;var s="PAGE_TITLE",c="PAGE_CONTENT";l(s,c).then(function(e,o){t.pageTitle=e,t.pageContent=o}),a.locale=l.use(),t.$on("$routeChangeSuccess",function(e,o){a.currentPath=o.$$route.originalPath}),a.currentTime=Date.now(),e(function(){a.currentTime=Date.now()},1e3),t.$on("$translateChangeSuccess",function(e,o){a.locale=o.language,t.pageTitle=l.instant(s),t.pageContent=l.instant(c)}),a.scrollTo=function(e){o.hash(e),n()}}]),angular.module("myTestApp").controller("MainController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("BlogController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("ProjectController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("SampleController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("YeomanController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"],e.today=new Date}]),angular.module("myTestApp").controller("BootstrapController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("AboutController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").controller("ContactController",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","Bootstrap","AngularJS","Karma"]}]),angular.module("myTestApp").service("LocaleService",["$translate","LOCALES","$rootScope","tmhDynamicLocale",function(a,e,o,n){var t=e.locales,l=Object.keys(t);l&&0!==l.length||console.error("There are no _LOCALES provided");var r=[];l.forEach(function(e){r.push(t[e])}),console.log("'translate 'me!");var s=a.proposedLanguage(),c=function(e){var o;(o=e,-1!==l.indexOf(o))?(i.addClass(u),s=e,a.use(e)):console.error('Locale name "'+e+'" is invalid')},i=angular.element("html"),u="app-loading";return o.$on("$translateChangeSuccess",function(e,o){console.log("It entered translateChangeSuccess"),document.documentElement.setAttribute("lang",o.language),n.set(o.language.toLowerCase().replace(/_/g,"-"))}),o.today=new Date,o.$on("$localeChangeSuccess",function(){console.log("Event received if jquery is loaded before angular in index.html"),i.removeClass(u)}),{getLocaleDisplayName:function(){return t[s]},setLocaleByDisplayName:function(e){c(l[r.indexOf(e)])},getLocalesDisplayNames:function(){return r}}}]),angular.module("myTestApp").directive("ngTranslateLanguageSelect",["LocaleService",function(o){return{restrict:"A",replace:!0,template:'<div class="language-select" ng-if="visible"><select class="form-control" ng-model="currentLocaleDisplayName"ng-options="localesDisplayName for localesDisplayName in localesDisplayNames"ng-change="changeLanguage(currentLocaleDisplayName)"></select></div>',controller:["$scope",function(e){e.currentLocaleDisplayName=o.getLocaleDisplayName(),e.localesDisplayNames=o.getLocalesDisplayNames(),e.visible=e.localesDisplayNames&&1<e.localesDisplayNames.length,e.changeLanguage=function(e){o.setLocaleByDisplayName(e)}}]}}]),console.log("'Allo 'Allo!"),angular.module("sample-test",[]).filter("truncate",function(){return function(e,o,a){if(isNaN(o))return e;if(o<=0)return"";if(e&&e.length>o){if(e=e.substring(0,o),a)for(;" "===e.charAt(e.length-1);)e=e.substr(0,e.length-1);else{var n=e.lastIndexOf(" ");-1!==n&&(e=e.substr(0,n))}return e+"…"}return e}});