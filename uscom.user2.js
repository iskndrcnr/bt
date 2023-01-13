// ==UserScript==
// @name         Voc Tester Geliştirici v2
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Voc testera yeni özellikler ekler
// @author       You
// @match        https://uscom.voc-tester.com/backend.php?r=certification/view&id=*
// @match        https://uscom.voc-tester.com/backend.php?r=examPeriod/admin
// @match        https://uscom.voc-tester.com/backend.php?r=applicant/create
// @match        https://uscom.voc-tester.com/backend.php?r=estimator/examQuestion&id=*
// @match        https://uscom.voc-tester.com/backend.php?r=certification/setStatus
// @match        https://uscom.voc-tester.com/backend.php?r=tracking/index&month=-1
// @match        https://uscom.voc-tester.com/backend.php?r=certification/finish&display=disabled
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voc-tester.com
// @match        https://www.uscom.com.tr/wp-content/uploads/ekbelge.html
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// @require      https://cdn.jsdelivr.net/npm/libphonenumber-js@1.10.18/bundle/libphonenumber-js.min.js
// @require      https://momentjs.com/downloads/moment.min.js
// @require      https://momentjs.com/downloads/moment-with-locales.min.js
// @require      https://html2canvas.hertzen.com/dist/html2canvas.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.min.js
// @require      https://github.com/crabbly/Print.js/releases/download/v1.5.0/print.min.js
// @require      https://raw.githubusercontent.com/iskndrcnr/bt/master/uscom.user2.content.js
// @run-at       document-end
// ==/UserScript==
