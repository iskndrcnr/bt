// ==UserScript==
// @name         Voc-Tester Geliştirici
// @namespace    iskender
// @version      7
// @description  Voc-Tester'a sonradan özellikler ekler
// @author       iskender
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/view&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin&ExamPeriod_page=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/update&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/create
// @match        https://*.voc-tester.com/backend.php?r=site/home
// @icon         https://www.google.com/s2/favicons?domain=voc-tester.com
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
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
    if (/examPeriod\/view&id\=\d/.test(window.location.href)) {//programdan aday al
        if (localStorage.getItem("voc_user_ids") !== null) {
            localStorage.removeItem("voc_user_ids");
            localStorage.removeItem("voc_sinav_info_id");
            localStorage.removeItem("voc_sinav_info_uy");
            localStorage.removeItem("voc_sinav_info_tarih");
            localStorage.removeItem("voc_sinav_info_yer");
        }
        var myk_id = xpath('//*[@id="examPeriodInfo"]/tbody/tr[2]/td')[0].innerText;
        var yeterlilik = xpath('//*[@id="examPeriodInfo"]/tbody/tr[3]/td')[0].innerText;
        var tarih = xpath('//*[@id="yw1"]/tbody/tr[2]/td')[0].innerText;
        var yer = xpath('//*[@id="yw1"]/tbody/tr[3]/td')[0].innerText;
        var userIds = [];
        try {
            var idnolar = xpath('//a[contains(@href,"/backend.php?r=applicant/view&jl=")]');
            idnolar.forEach(function(id) {
                userIds.push(id.innerText);
            });
            if (Object.keys(userIds).length > 0) {
                //localStorage.setItem("voc_"+myk_id,'{"sinavid":{"voc_user_ids":'+JSON.stringify(userIds)+',"voc_sinav_info_id": "'+myk_id+'","voc_sinav_info_uy": "'+yeterlilik+'","voc_sinav_info_tarih": "'+tarih+'","voc_sinav_info_yer": "'+yer+'"}}');
                localStorage.setItem("voc_user_ids", JSON.stringify(userIds));
                localStorage.setItem("voc_sinav_info_id", myk_id);
                localStorage.setItem("voc_sinav_info_uy", yeterlilik);
                localStorage.setItem("voc_sinav_info_tarih", tarih);
                localStorage.setItem("voc_sinav_info_yer", yer);
            }
        } catch (err) {
            console.log(err.message);
        }
        var addHes = document.evaluate('//*[@id="examDocumentList"]/fieldset/table/tbody', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var addHesInner = document.createElement("tr");
        addHesInner.innerHTML = "<td></td><td style='color:red !important;'>HES KODU KARE KOD</td><td><a class='not-progress exam-form-download-usage-document-button btn btn-warning btn-mini' style='padding:2px 5px 0px 5px;' onclick='window.open(\"backend.php?r=examPeriod/view&id=heskarekod\");'><i class='icon icon-barcode icon-white'></i>Oluştur</a></td>";
        addHes.appendChild(addHesInner);
    }
    if (/examPeriod\/view&id\=heskarekod/.test(window.location.href)) {//QR kod oluştur
        document.body.innerHTML = '<h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_id") + ' - ' + localStorage.getItem("voc_sinav_info_tarih") + '</h4><h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_uy") + '</h4><h5 class="m-0 mb-2 p-0 text-center">' + localStorage.getItem("voc_sinav_info_yer") + '</h5>';
        document.body.style.background = "#ffffff";
        document.body.setAttribute("style", "background-image: none !important;background-color:#ffffff !important;");
        document.body.innerHTML += '<div class="container-fluid row mt-3" id="container"></div>';

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.integrity = 'sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l'
        link.crossOrigin = 'anonymous';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css';
        document.head.appendChild(link);
/*
        var jscript = document.createElement('script');
        jscript.type = 'text/javascript';
        jscript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js';
        document.head.appendChild(jscript);
*/
        var voc_user_ids = JSON.parse(localStorage.getItem("voc_user_ids")); //get user ids
        console.log(voc_user_ids);
        var $ = window.jQuery;
        var say = 0;
        var cnt = 0;
        voc_user_ids.forEach(function(uid) {
            try{
            jQuery.ajax({
                url: "backend.php?r=applicant/view&jl=" + uid,
                async: true, // this will solve the problem
                contentType: "text/html",
                data: "",
                type: "GET",
                success: function(response) {
                    if (response) {

                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(response, "text/html");
                        var adsoyad = xmlDoc.evaluate('//*[@id="yw0"]/tbody/tr[2]/td', xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        var tcno = xmlDoc.evaluate('//*[@id="yw0"]/tbody/tr[3]/td', xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        var heskodu = xmlDoc.evaluate('//*[@id="ApplicantInfo_hes_code"]/@value', xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                        if (heskodu && heskodu.value.length == 10) {
                            document.getElementById("container").innerHTML += '<div class="col-6"><div class="card mb-4"><div class="row g-0"><div class="col-4"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=c64dc337b87b41d08a165ffb020126ac|' + heskodu.value + '"></div><div class="col-8"><div class="card-body p-1"><h4 class="card-title">' + adsoyad.innerText + '</h4><h6 class="card-text">' + tcno.innerText + '</h6><h6 class="card-text">' + heskodu.value.substring(0, 4) + "-" + heskodu.value.substring(4, 8) + "-" + heskodu.value.substring(8, 10) + '</h6></div></div></div></div></div>';

                            cnt++;
                        }
                    }

                    say++;
                    console.log(say);
                    if (say == voc_user_ids.length && cnt > 0) {
                        setTimeout(function () {
                        window.print();
                        }, 5000);
                    }
                }
            });
            }
            catch(e){
            }
            });
    }
    if (/examPeriod\/admin/.test(window.location.href)) {//ID yoksa yanıp sön

        var sinavsatirlari = xpath('//*[@id="exam-period-grid"]/table/tbody/tr');
        for (var sinavsatir of sinavsatirlari) {
            var sutunlar = sinavsatir.getElementsByTagName('td');
            if(sutunlar[2].innerText ==''){
                sutunlar[2].innerHTML = '<p style="color:red;font-size:18px;font-weight:bold;">UYARI!</p>';
                var yanson = sutunlar[2].getElementsByTagName('p')[0];
                setInterval(function() {
                    yanson.style.display = (yanson.style.display == 'none' ? '' : 'none');
                }, 800);
            }
}

    }
    if (/examPeriod\/update&id\=\d/.test(window.location.href)||/examPeriod\/create/.test(window.location.href)) {//ID girişine sadece numara bas
    setInputFilter(document.getElementById("ExamPeriod_myk_portal_code"), function(value) {
  return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1999999); });
}
if (/site\/home/.test(window.location.href)) {//Görevleri kabul et
    try {
        var gorevler = xpath('//*[@id="tasks-waitingTaskAccept_list"]/table/tbody/tr');
        gorevler.forEach((gorev) => {
            if (gorev.querySelectorAll("td")[5].innerText == "Bekliyor") {
                var link = gorev.querySelectorAll("td")[6].querySelectorAll("a")[0].href;
                //var params = link.matchAll("(\?|\&)([^=]+)\=([^&]+)");
                var params = link.split('&');
                var id = params[1].replace('id=', '');
                var type = params[2].replace('type=', '');
                var duty = params[3].replace('duty=', '');
                if (duty == "Karar+Verici") {
                    duty = 3;
                } else if (duty == "Gözetmen") {
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

    } catch (err) {
        console.log(err.message);
    }
}
})();
