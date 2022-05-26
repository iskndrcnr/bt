// ==UserScript==
// @name         Voc-Tester Geliştirici
// @namespace    iskender
// @version      19
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
// @icon         https://www.google.com/s2/favicons?domain=voc-tester.com
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==
/* global $ */
(function() {
    'use strict';
    var xpath = function(xpathToExecute) {
        var result = [];
        var nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
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
        return jQuery(jQuery(selector).toArray().sort(function(a, b){
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
  if (document.addEventListener) document.addEventListener("DOMContentLoaded", JavaBlink, false);
  else if (window.addEventListener) window.addEventListener("load", JavaBlink, false);
  else if (window.attachEvent) window.attachEvent("onload", JavaBlink);
  else window.onload = JavaBlink;

    if (/examPeriod\/admin/.test(window.location.href)) {//ID yoksa yanıp sön

        var sinavsatirlari = xpath('//*[@id="exam-period-grid"]/table/tbody/tr');
        for (var sinavsatir of sinavsatirlari) {
            var sutunlar = sinavsatir.getElementsByTagName('td');
            var matches = sutunlar[2].innerText.match(/^([0-9]{7})$/g);
            if(sutunlar[2].innerText ==''){
                sutunlar[2].innerHTML = '<JavaBlink><p style="color:red;font-size:16px;font-weight:bold;">UYARI!</p></JavaBlink>';
            }else if(matches == null){
                sutunlar[2].innerHTML = '<JavaBlink><p style="color:blue;font-size:13px;font-weight:bold;">'+sutunlar[2].innerText+'</p></JavaBlink>';
            }
        }

    }
    if (/certification\/renew/.test(window.location.href)) {//15 gün altı belge süresine SMS Gönder
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
            if(smssutunlar[9].innerText !=''){
                var kalangun = smssutunlar[9].innerText.replace(" gün", "").trim();
                var kalangunsayi = parseInt(kalangun);
                var adsoyad = smssutunlar[2].innerText.trim();
                var belgeno = smssutunlar[3].innerText.trim();
                var telefonno = smssutunlar[6].innerText.trim();
                var smstext = "Sayın " + adsoyad + ", USCOM Belgelendirmeden almış olduğunuz " + belgeno + " numaralı MYK belgenizin süresi " + kalangun + " gun sonra bitecektir. Süresi bitmeden önce uzatmak veya yenilemek için 0537 526 91 76 veya 0537 526 91 78 numaralardan bizimle iletişime geçiniz."
                if (kalangun.length<3 & kalangunsayi<16){


                    var aday = {"adsoyad": adsoyad, "belgeno": belgeno, "telefonno": telefonno, "kalangunsayi":kalangunsayi,"durum":0, "smstext":smstext}
                    smsler.adaylar.push(aday);


                }else{
                    break;
                }

            }else{
                break;
            }
        }
            document.getElementById("btnsms").onclick=function(){
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
                            if(response.status==200){
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
    if (/site\/home/.test(window.location.href)) {//Görevleri kabul et
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
})();
