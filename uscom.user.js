// ==UserScript==
// @name         Voc-Tester Geliştirici
// @namespace    iskender
// @version      24
// @description  Voc-Tester'a sonradan özellikler ekler
// @author       iskender
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/view&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin&ExamPeriod_page=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/update&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/create
// @match        https://*.voc-tester.com/backend.php?r=site/home
// @match        https://*.voc-tester.com/backend.php?r=certification/renew
// @match        https://uscom.voc-tester.com/backend.php?r=examPeriod/estimatorTaskAccept&id=*
// @match        https://uscom.voc-tester.com/backend.php?r=certification/view&id=*
// @match        https://uscom.voc-tester.com/backend.php?r=examPeriod/decision&id=*
// @match        https://uscom.voc-tester.com/backend.php?r=estimator/examQuestion&id=*
// @match        https://www.uscom.com.tr/wp-content/uploads/ekbelge.html
// @icon         https://www.google.com/s2/favicons?domain=voc-tester.com
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @require      https://momentjs.com/downloads/moment.min.js
// @require      https://momentjs.com/downloads/moment-with-locales.min.js
// @require      https://html2canvas.hertzen.com/dist/html2canvas.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// @run-at       document-end
// ==/UserScript==
/* global $ */
(function() {
    'use strict';
    moment.locale('tr');
    if (unsafeWindow.myVar == undefined) {
        unsafeWindow.myVar = "000";
    }
    var xpath = function(xpathToExecute, str = document) {
        var result = [];
        var nodesSnapshot = document.evaluate(xpathToExecute, str, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < nodesSnapshot.snapshotLength; i++) {
            result.push(nodesSnapshot.snapshotItem(i));
        }
        return result;
    }

    function setInputFilter(textbox, inputFilter) {
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
            textbox.addEventListener(event, function() {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                    this.value = "";
                }
            });
        });
    }

    function getSorted(selector, attrName) {
        return jQuery(jQuery(selector).toArray().sort(function(a, b) {
            var aVal = parseInt(a.getAttribute(attrName)),
                bVal = parseInt(b.getAttribute(attrName));
            return aVal - bVal;
        }));
    }

    function JavaBlink() {
        var blinks = document.getElementsByTagName('JavaBlink');
        for (var i = blinks.length - 1; i >= 0; i--) {
            var s = blinks[i];
            s.style.visibility = (s.style.visibility === 'visible') ? 'hidden' : 'visible';
        }
        window.setTimeout(JavaBlink, 1000);
    }

    function Request(url, opt={}) {
        Object.assign(opt, {
            url,
            method: 'GET',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
        })

        return new Promise((resolve, reject) => {
            opt.onerror = opt.ontimeout = reject
            opt.onload = resolve

            GM_xmlhttpRequest(opt)
        })
    }
    var support = (function() {
        if (!window.DOMParser) return false;
        var parser = new DOMParser();
        try {
            parser.parseFromString('x', 'text/html');
        } catch (err) {
            return false;
        }
        return true;
    })();
    /**
	 * Convert a template string into HTML DOM nodes
	 * @param  {String} str The template string
	 * @return {Node}       The template HTML
	 */
    var stringToHTML = function(str) {
        // If DOMParser is supported, use it
        if (support) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(str, 'text/html');
            return doc.body;
        }
        // Otherwise, fallback to old-school method
        var dom = document.createElement('div');
        dom.innerHTML = str;
        return dom;
    };
    if (document.addEventListener) document.addEventListener("DOMContentLoaded", JavaBlink, false);
    else if (window.addEventListener) window.addEventListener("load", JavaBlink, false);
    else if (window.attachEvent) window.attachEvent("onload", JavaBlink);
    else window.onload = JavaBlink;
    if (/examPeriod\/admin/.test(window.location.href)) { //ID yoksa yanıp sön
        var sinavsatirlari = xpath('//*[@id="exam-period-grid"]/table/tbody/tr');
        for (var sinavsatir of sinavsatirlari) {
            var sutunlar = sinavsatir.getElementsByTagName('td');
            var matches = sutunlar[2].innerText.match(/^([0-9]{7})$/g);
            if (sutunlar[2].innerText == '') {
                sutunlar[2].innerHTML = '<JavaBlink><p style="color:red;font-size:16px;font-weight:bold;">UYARI!</p></JavaBlink>';
            } else if (matches == null) {
                sutunlar[2].innerHTML = '<JavaBlink><p style="color:blue;font-size:13px;font-weight:bold;">' + sutunlar[2].innerText + '</p></JavaBlink>';
            }
        }
    }
    if (/certification\/renew/.test(window.location.href)) { //15 gün altı belge süresine SMS Gönder
        document.getElementById("applicant-grid_c10").insertAdjacentHTML('beforeend', '<a class="btn btn-warning btn-mini not-progress" style="color:black !important;margin:0 !important; padding:2px !important;" id="btnsms"><i class="icon-bullhorn"></i>15 Günden Az Olanlara SMS Gönder</a>');
        var smssatirlari = xpath('//*[@id="applicant-grid"]/table/tbody/tr');
        //if (localStorage.getItem("30_gunden_az_sms") === null) {
        var smsler = {};
        var adaylar = []
        smsler.adaylar = adaylar;
        //}else{
        //    var smsler = JSON.parse(localStorage.getItem("30_gunden_az_sms"));
        //}
        for (var smssatir of smssatirlari) {
            var smssutunlar = smssatir.getElementsByTagName('td');
            if (smssutunlar[9].innerText != '') {
                var kalangun = smssutunlar[9].innerText.replace(" gün", "").trim();
                var kalangunsayi = parseInt(kalangun);
                var adsoyad = smssutunlar[2].innerText.trim();
                var belgeno = smssutunlar[3].innerText.trim();
                var telefonno = smssutunlar[6].innerText.trim();
                var smstext = "Sayın " + adsoyad + ", USCOM Belgelendirmeden almış olduğunuz " + belgeno + " numaralı MYK belgenizin süresi " + kalangun + " gun sonra bitecektir. Süresi bitmeden önce uzatmak veya yenilemek için 0537 526 91 76 veya 0537 526 91 78 numaralardan bizimle iletişime geçiniz."
                if (kalangun.length < 3 & kalangunsayi < 16) {
                    var aday = {
                        "adsoyad": adsoyad,
                        "belgeno": belgeno,
                        "telefonno": telefonno,
                        "kalangunsayi": kalangunsayi,
                        "durum": 0,
                        "smstext": smstext
                    }
                    smsler.adaylar.push(aday);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        document.getElementById("btnsms").onclick = function() {
            try {
                for (var item of smsler.adaylar) {
                    //console.log(item.smstext);
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "https://uscom.voc-tester.com/backend.php?r=sms/manuel/sendManuel",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        data: "message=" + item.smstext + "&phones=" + item.telefonno + "&names=" + item.adsoyad,
                        onload: function(response) {
                            if (response.status == 200) {
                                console.log(item.smstext);
                            }
                        }
                    });
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    }
    /*
	if (/examPeriod\/update&id\=\d/.test(window.location.href)||/examPeriod\/create/.test(window.location.href)) {//ID girişine sadece numara bas
	    setInputFilter(document.getElementById("ExamPeriod_myk_portal_code"), function(value) {
	        return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1999999); });
	}
	*/
    if (/site\/home/.test(window.location.href)) { //Görevleri kabul et
        try {
            window.addEventListener('load', (event) => { // its a magic
                var gorevler = xpath('//*[@id="tasks-waitingTaskAccept_list"]/table/tbody/tr');
                gorevler.forEach((gorev) => {
                    if (gorev.querySelectorAll("td")[5].innerText == "Bekliyor") {
                        var link = gorev.querySelectorAll("td")[6].querySelectorAll("a")[0].href;
                        console.log(link);
                        //var params = link.matchAll("(\?|\&)([^=]+)\=([^&]+)");
                        var params = link.split('&');
                        var id = params[1].replace('id=', '');
                        var type = params[2].replace('type=', '');
                        var duty = params[3].replace('duty=', '');
                        if (duty == "Karar+Verici") {
                            duty = 3;
                        } else if (duty == "G%C3%B6zetmen") {
                            duty = 2;
                        } else if (duty == "De%C4%9Ferlendirici") {
                            duty = 1;
                        } else {
                            duty = 4;
                        }
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "https://uscom.voc-tester.com/backend.php?r=examPeriod/estimatorTaskStatusSave&id=" + id,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                            },
                            data: "EstimatorTaskAccept[description]=&action=accept&type=" + type + "&duty=" + duty,
                            onload: function(response) {
                                console.log("görevlendirmeler kabul edildi");
                            }
                        });
                    }
                });
            });
        } catch (err) {
            console.log(err.message);
        }
        try {
            var dokumanlar = xpath('//*[@id="documents_list"]/table/tbody/tr');
            if (dokumanlar.length > 0) {
                dokumanlar.forEach((dokuman) => {
                    var doclink = dokuman.querySelectorAll("td")[4].querySelectorAll("a")[0].href;
                    //var params = doclink.matchAll("(\?|\&)([^=]+)\=([^&]+)");
                    var docparams = doclink.split('&');
                    var docid = docparams[1].replace('id=', '');
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: "https://uscom.voc-tester.com/backend.php?r=documentDistributionRecord/documentApproved&id=" + docid,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        //data: "EstimatorTaskAccept[description]=&action=accept&type=" + type + "&duty=" + duty,
                        onload: function(response) {
                            console.log("dokumanlar kabul edildi");
                        }
                    });
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    }
    if (/certification\/view/.test(window.location.href)) { //Ek belge çıkart
        var htmlbuton = "";
        var uykodu = xpath('//*[@id="yw0"]/tbody/tr[7]/td/b')[0].innerText;
        var birimleryeri = xpath('//*[@id="yw0"]/tbody/tr[14]/td');
        var birimler = [...birimleryeri[0].innerText.matchAll(/\(([0-9]{3})\)/g)];
        if (birimler.length > 0 && uykodu=="11UY0010-3") {
            birimler.forEach((birim) => {
                htmlbuton += '<a class="btn btn-warning btn-mini not-progress ekbelge" style="color:black !important;margin:0 !important; padding:2px !important;" data-id="' + birim[1] + '">Ek Belge Oluştur (' + birim[1] + ')</a>&nbsp;';
            });
        }
        var ekbelgeElements = document.getElementsByClassName("ekbelge");
        document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[13].getElementsByTagName('td')[0].insertAdjacentHTML('beforeend', '<br>' + htmlbuton);
        var ekbelgeFonksiyon = function() {
            var keys = GM_listValues();
            keys.forEach(key => {
                GM_deleteValue(key);
            });
            var ekbelgeBasvuruno = document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].innerText;
            var ekbelgeTc = document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[0].innerText;
            var ekbelgeAd = document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[2].getElementsByTagName('td')[0].innerText;
            var ekbelgeYil = parseInt(document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[10].getElementsByTagName('td')[0].innerText);
            var ekbelgeSon = document.getElementById("yw0").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[11].getElementsByTagName('td')[0].getElementsByTagName('a')[0].getAttribute('data-value');
            var belgeIlkgun = moment(ekbelgeSon, 'YYYY-MM-DD').add(1, 'days').subtract(parseInt(ekbelgeYil), 'years').format("DD.MM.YYYY");
            var belgeSongun = moment(ekbelgeSon, 'YYYY-MM-DD').format("DD.MM.YYYY");
            var sertifikatarihi = moment(belgeIlkgun, 'DD.MM.YYYY').add(1, 'days').format("DD.MM.YYYY");
            var tarih93a = moment(belgeIlkgun, 'DD.MM.YYYY').add(3, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var tarih93b = moment(belgeIlkgun, 'DD.MM.YYYY').add(2, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var tarih93c = moment(belgeIlkgun, 'DD.MM.YYYY').add(2.5, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var gozetim1 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(6, 'months').format("DD.MM.YYYY");
            var gozetim2 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(12, 'months').format("DD.MM.YYYY");
            var gozetim3 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(18, 'months').format("DD.MM.YYYY");
            var gozetim4 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(24, 'months').format("DD.MM.YYYY");
            var gozetim5 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(30, 'months').format("DD.MM.YYYY");
            //console.log(moment(belgeSongun).diff(moment().format("DD.MM.YYYY"), 'years',false));
            GM_setValue("ekbelgeBasvuruno", ekbelgeBasvuruno);
            GM_setValue("ekbelgeTc", ekbelgeTc);
            GM_setValue("ekbelgeAd", ekbelgeAd);
            GM_setValue("ekbelgeYil", ekbelgeYil);
            GM_setValue("belgeIlkgun", belgeIlkgun);
            GM_setValue("belgeSongun", belgeSongun);
            GM_setValue("sertifikatarihi", sertifikatarihi);
            GM_setValue("tarih93a", tarih93a);
            GM_setValue("tarih93b", tarih93b);
            GM_setValue("tarih93c", tarih93c);
            GM_setValue("gozetim1", gozetim1);
            GM_setValue("gozetim2", gozetim2);
            GM_setValue("gozetim3", gozetim3);
            GM_setValue("gozetim4", gozetim4);
            GM_setValue("gozetim5", gozetim5);
            var attribute = this.getAttribute("data-id");
            var wpsno = "";
            var tanimlama = "";
            var proses = "";
            var proseskapsam = "";
            var kutup = "";
            var dolgumalzeme = "";
            var dolgukapsam = "";
            var koruyucugaz = "";
            var fillergroup = "FM1";
            var fillergroupkapsam = "FM1, FM2";
            var transfer = "Spray";
            var transferkapsam = "Spray";
            if (attribute == 111 && uykodu=="11UY0010-3") {
                proses = "111 (MMA / SMAW)";
                proseskapsam = "111";
                wpsno = "pWPS-109";
                tanimlama = "111 P FW RR t5 PB sl";
                kutup = "DC (-)";
                dolgumalzeme = "RR";
                dolgukapsam = "A, RA, RB, RC, RR, R";
                koruyucugaz = "-";
                transfer = "Short circuit arc";
                transferkapsam = "Short circuit arc";
            } else if (attribute == 131 && uykodu=="11UY0010-3") {
                proses = "131 (MIG / GMAW)";
                proseskapsam = "131";
                wpsno = ""; //wps yazılacak
                tanimlama = "131 P FW S t5 PB sl";
                kutup = "DC (+)";
                dolgumalzeme = "S";
                dolgukapsam = "S, M";
                koruyucugaz = "XX (EN ISO 14175)"; //??
                fillergroup = "FM5";
                fillergroupkapsam = "FM5";
            } else if (attribute == 135 && uykodu=="11UY0010-3") {
                proses = "135 (MAG / GMAW)";
                proseskapsam = "135, 138";
                wpsno = "pWPS-105";
                tanimlama = "135 P FW S t5 PB sl";
                kutup = "DC (+)";
                dolgumalzeme = "S";
                dolgukapsam = "S, M";
                koruyucugaz = "M24 (EN ISO 14175)";
            } else if (attribute == 136 && uykodu=="11UY0010-3") {
                proses = "136 (FCAW)";
                proseskapsam = "136";
                wpsno = "pWPS-111";
                tanimlama = "136 P FW S t5 PB sl";
                kutup = "DC (+)";
                dolgumalzeme = "S";
                dolgukapsam = "S, M";
                koruyucugaz = "M24 (EN ISO 14175)";
            } else if (attribute == 141 && uykodu=="11UY0010-3") {
                proses = "141 (TIG / GTAW)";
                proseskapsam = "141";
                wpsno = "pWPS-110";
                tanimlama = "141 P FW S t5 PB sl";
                kutup = "DC (-)";
                dolgumalzeme = "S";
                dolgukapsam = "S, M";
                koruyucugaz = "I1 (EN ISO 14175)";
            }
            GM_setValue("wpsno", wpsno);
            GM_setValue("tanimlama", tanimlama);
            GM_setValue("kutup", kutup);
            GM_setValue("dolgumalzeme", dolgumalzeme);
            GM_setValue("dolgukapsam", dolgukapsam);
            GM_setValue("koruyucugaz", koruyucugaz);
            GM_setValue("fillergroup", fillergroup);
            GM_setValue("fillergroupkapsam", fillergroupkapsam);
            GM_setValue("proses", proses);
            GM_setValue("proseskapsam", proseskapsam);
            GM_setValue("transfer", transfer);
            GM_setValue("transferkapsam", transferkapsam);


            //var dom0 = Request("https://uscom.voc-tester.com/backend.php?r=applicant/view&jl=" + ekbelgeBasvuruno).then(response => {return response.responseText;}).then(data => {return data});
            //console.log(dom0);
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://uscom.voc-tester.com/backend.php?r=applicant/view&jl=" + ekbelgeBasvuruno,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                //data: "EstimatorTaskAccept[description]=&action=accept&type=" + type + "&duty=" + duty,
                onload: function(response) {
                    //var dogumtarihi = response.responseText.getElementById("yw1").getElementsByTagName('tbody')[0].getElementsByTagName('tr')[2].getElementsByTagName('td')[0];
                    var htmlcode = response.responseText.match(/<th>Doğum Tarihi<\/th><td>(.*?)<\/td>/g)[0];
                    var dogumtarihiyazi = htmlcode.split("<td>")[1].split("</td>")[0];
                    var dogumtarihi = moment(dogumtarihiyazi, 'DD/MM/YYYY').format("DD.MM.YYYY");
                    GM_setValue("dogumyertarih", dogumtarihi);
                    var dom = stringToHTML(response.responseText);
                    var sinavsatirlari = xpath('//*[@id="applicant-units-history-table-' + ekbelgeBasvuruno + '"]/table/tbody/tr', dom);
                    var persinavs = xpath('//div[contains(@class, "well")][2]/div/div/table/tbody/tr/td[contains(string(), "' + attribute + '")]/following-sibling::td[2]/span[contains(string(), "Başarılı")]/preceding::table[1]/tbody/tr[3]/td[1]/a[1]/@href[1]', dom);
                    //div[contains(@class, "well")][2]/div/div/table/tbody/tr/td[contains(string(), "141")]/following-sibling::td[2]/span[contains(string(), "Başarılı")]/preceding::table[1]/tbody/tr[3]/td[1]/a[1]/@href[1]
                    var yerid = persinavs[0].value.split("id=")[1];
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: "https://uscom.voc-tester.com/backend.php?r=location/view&id=" + yerid,
                        synchronous: true,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        //data: "EstimatorTaskAccept[description]=&action=accept&type=" + type + "&duty=" + duty,
                        onload: function(response2) {
                            var dom2 = stringToHTML(response2.responseText);
                            var sinavililce = xpath('//*[@id="yw0"]/tbody/tr[2]/td[1]', dom2);
                            GM_setValue("sinavililce", sinavililce[0].innerText);
                        }
                    });
                    var myReg = new RegExp('(' + attribute + ')');
                    try {
                        sinavsatirlari.forEach((sinavsatir) => {
                            var durumlar = xpath('/td', sinavsatir);
                            if (durumlar[0].innerText.match(myReg) && durumlar[3].innerText == "Başarılı") {
                                var sinavlink = durumlar[6].getElementsByTagName('a')[0].getAttribute('href');
                                GM_setValue("sinavlink", sinavlink.split("id=")[1]);
                                throw 'Break';
                            }
                        });
                    } catch (e) {
                        if (e !== 'Break') throw e
                    }

                    GM_xmlhttpRequest({
                        method: "GET",
                        url: "https://uscom.voc-tester.com/backend.php?r=examPeriod/decision&id=" + GM_getValue("sinavlink"),
                        synchronous: true,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        onload: function(response3) {
                            var dom3 = stringToHTML(response3.responseText);
                            var sinavkod = xpath('//*[@id="examPeriod_information"]/tbody/tr[1]/td', dom3);
                            console.log(GM_getValue("sinavlink"));
                            GM_setValue("sinavkod", sinavkod[0].innerText);
                            var tcnumaralar = xpath('//*[@id="exam-period-applicant-decision-grid"]/table/tbody/tr', dom3);
                            try {
                                tcnumaralar.forEach((tcnumara, index) => {
                                    var belgeler = xpath('/td', tcnumara);
                                    if (tcnumara.getElementsByTagName("td")[3].innerText == GM_getValue("ekbelgeTc")) {
                                        GM_setValue("sirano", (index + 1).toLocaleString('tr-TR', {
                                            minimumIntegerDigits: 2,
                                            useGrouping: false
                                        }));
                                        throw 'Break';
                                    }
                                });
                            } catch (e) {
                                if (e !== 'Break') throw e
                            }
                        }
                    });
                }

            });

            setTimeout(function () {
                window.open("https://www.uscom.com.tr/wp-content/uploads/ekbelge.html");
            }, 5000);
            //window.open("https://www.uscom.com.tr/wp-content/uploads/ekbelge.html");
            //window.print();
        };
        for (var i = 0; i < ekbelgeElements.length; i++) {
            ekbelgeElements[i].addEventListener('click', ekbelgeFonksiyon, false);
        }
    }
    //puanları oto doldur
    if (/estimator\/examQuestion/.test(window.location.href)) {
        $(document).ready(function () {
            //gerekli html eklemeleri
            var otodoldurbutonlari = xpath('//*[@id="exam-checklist-grid"]/table/thead/tr[2]/td[6]');
            var otobuttons = '<a class="btn btn-success btn-mini not-progress hepsitam" style="color:white !important;margin:0 !important; padding:2px !important;">Hepsi Tam</a>&nbsp;<a class="btn btn-warning btn-mini not-progress hepsisifir" style="color:black !important;margin:0 !important; padding:2px !important;">Hepsi Sıfır</a>';
            document.getElementById("exam-checklist-grid").getElementsByTagName('table')[0].getElementsByTagName('thead')[0].getElementsByTagName('tr')[1].getElementsByTagName('td')[5].insertAdjacentHTML('beforeend', otobuttons);
            $("body").prepend('<span class="toplampuan scrollup label label-important" style="display: block;margin-bottom:30px;color:white;font-weight:normal;font-size:14px;padding:8px;">Toplam Puan: <strong style="font-weight:bold;font-size:15px;">0</strong></span>');
            //hepsine tam puan ve hepsine sıfır puan ver butonları
            jQuery('input.applicantPoint').each(
                function(index){
                    $(this).parent().attr('style','min-width: 200px !important');
                    $(this).before('&nbsp;<button class="btn btn-mini tamla">Tam Puan</button>&nbsp;<button class="btn btn-mini sifirla">0 Puan</button>');
                    //$(this).after('&nbsp;<button class="btn btn-mini sifirla">0 Puan</button>');
                })
            //inputa sıfır puan verir
            jQuery('.sifirla').on('click', function(){
                var input = $(this).parent().find('.applicantPoint');
                //input.attr('value', parseFloat("0"))
                input.val(parseFloat("0"));
                puantopla();
            })
            //imputa tam puan verir
            jQuery('.tamla').on('click', function(){
                var tampuan = $(this).parent().prev().find('.maxPoint').text().replace(",", ".");
                var input = $(this).parent().find('.applicantPoint');
                //input.attr('value', parseFloat("0"))
                input.val(parseFloat(tampuan));
                puantopla();
            })
            //bütün inputlara tam puan yazar
            jQuery('.hepsitam').on('click', function(){
                jQuery('#exam-checklist-grid table tr td a.maxPoint').each(
                    function(index){
                        var input = $(this).parent().next().find('.applicantPoint');
                        input.val(parseFloat($(this).text()));
                        //input.attr('value', parseFloat($(this).text()))
                    })
                puantopla();
            })
            //bütün inputlara sıfır puan yazar
            jQuery('.hepsisifir').on('click', function(){
                jQuery('#exam-checklist-grid table tr td a.maxPoint').each(
                    function(index){
                        var input = $(this).parent().next().find('.applicantPoint');
                        input.val(parseFloat("0"));
                        //input.attr('value', parseFloat("0"))
                    })
                puantopla();
            })
            /*
            $('input.applicantPoint').change(function() {
                $("input.applicantPoint").each(function() {
                    console.log("değişti");
                puantopla();
            });
            });
*/

        })
//puan toplama ve yazdırma fonksiyonu
        function puantopla() {
            var tot = 0;
            $("input.applicantPoint").each(function() {
                tot += parseFloat($(this).val());
            });
            $("span.toplampuan strong").text(tot)
        }
    }

    if (/ekbelge/.test(window.location.href)) { //Ekbelge sayfası
        moment.locale('tr');
        document.querySelector('title').textContent = GM_getValue("ekbelgeAd") + " " + GM_getValue("tanimlama");
        document.getElementById('wpsno').innerHTML = GM_getValue("wpsno");
        document.getElementById("isim").innerHTML = GM_getValue("ekbelgeAd");
        document.getElementById("tcno").innerHTML = GM_getValue("ekbelgeTc");
        document.getElementById("dogumyertarih").innerHTML = GM_getValue("dogumyertarih");
        document.getElementById("isveren").innerHTML = "";
        document.getElementById("isverenadres").innerHTML = "";
        document.getElementById("sertifikano").innerHTML = "";
        document.getElementById("sertifikatarihi").innerHTML = GM_getValue("sertifikatarihi");
        document.getElementById("gecerliliktarihi").innerHTML = GM_getValue("belgeSongun");
        document.getElementById("tanimlama").innerHTML = GM_getValue("tanimlama");
        document.getElementById("onaytarihyer").innerHTML = GM_getValue("belgeIlkgun") + " / İSTANBUL";
        document.getElementById("sertifikano").innerHTML = GM_getValue("sinavkod") + "/" + GM_getValue("sirano");
        if (GM_getValue("ekbelgeYil") == 3) {
            document.getElementById("onay93a").style.color = "";
        } else if (GM_getValue("ekbelgeYil") == 2) {
            document.getElementById("onay93b").style.color = "";
        } else {
            document.getElementById("onay93c").style.color = "";
        }
        document.getElementById("tarih93a").innerHTML = GM_getValue("tarih93a");
        document.getElementById("tarih93b").innerHTML = GM_getValue("tarih93b");
        document.getElementById("tarih93c").innerHTML = GM_getValue("tarih93c");
        document.getElementById("gozetim1").innerHTML = GM_getValue("gozetim1");
        document.getElementById("gozetim2").innerHTML = GM_getValue("gozetim2");
        document.getElementById("gozetim3").innerHTML = GM_getValue("gozetim3");
        document.getElementById("gozetim4").innerHTML = GM_getValue("gozetim4");
        document.getElementById("gozetim5").innerHTML = GM_getValue("gozetim5");
        document.getElementById("ikiyiluzatmatarih").innerHTML = GM_getValue("tarih93b");
        document.getElementById("kutup").innerHTML = GM_getValue("kutup");
        document.getElementById("dolgumalzeme").innerHTML = GM_getValue("dolgumalzeme");
        document.getElementById("dolgukapsam").innerHTML = GM_getValue("dolgukapsam");
        document.getElementById("fillergroup").innerHTML = GM_getValue("fillergroup");
        document.getElementById("fillergroupkapsam").innerHTML = GM_getValue("fillergroupkapsam");
        document.getElementById("proses").innerHTML = GM_getValue("proses");
        document.getElementById("proseskapsam").innerHTML = GM_getValue("proseskapsam");
        document.getElementById("transfer").innerHTML = GM_getValue("transfer");
        document.getElementById("transferkapsam").innerHTML = GM_getValue("transferkapsam");
        document.getElementById("koruyucugaz").innerHTML = GM_getValue("koruyucugaz");
        document.getElementById("sinavililce").innerHTML = GM_getValue("belgeIlkgun") + " " + GM_getValue("sinavililce");
        window.jsPDF = window.jspdf.jsPDF;
        $(document).bind("keyup keydown", function(e) {
            if (e.ctrlKey && e.keyCode == 219) {
                Print();
                e.preventDefault();
            }
        });

        function Print() {
            pdfGenerator()
            //additional function do something else.
        }

        function pdfGenerator() {
            html2canvas(document.body).then(canvas => {
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
                pdf.save("deneme.pdf");
                //canvas.toBlob(function(blob) {
                //window.saveAs(blob, 'my_image.jpg');
                //});
            });
        }
    }
})();
