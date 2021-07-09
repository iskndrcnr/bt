// ==UserScript==
// @name         Voc-Tester Karekod
// @namespace    iskender
// @version      4.3
// @description  Heskoduna karekod ekle
// @author       iskender
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/view&id=*
// @icon         https://www.google.com/s2/favicons?domain=voc-tester.com
// @require      https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js
// @resource     REMOTE_CSS https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css
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
    if (/examPeriod\/view&id\=\d/.test(window.location.href)) {
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
        var addeHesInner = document.createElement("tr");
        addeHesInner.innerHTML = "<td></td><td style='color:red !important;'>HES KODU KARE KOD</td><td><a class='btn btn-warning  btn-mini' style='padding:2px 5px 0px 5px;' onclick='window.open(\"backend.php?r=examPeriod/view&id=heskarekod\");'><i class='fa fa-qrcode fa-3x fa-fw'></i></a></td>";
        addHes.appendChild(addeHesInner);
    }
    if (/examPeriod\/view&id\=heskarekod/.test(window.location.href)) {
        document.body.innerHTML = '<h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_id") + ' - ' + localStorage.getItem("voc_sinav_info_tarih") + '</h4><h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_uy") + '</h4><h5 class="m-0 mb-2 p-0 text-center">' + localStorage.getItem("voc_sinav_info_yer") + '</h5>';
        document.body.style.background = "#ffffff";
        document.body.setAttribute("style", "background-image: none !important;background-color:#ffffff !important;");
        document.body.innerHTML += '<div class="container-fluid row mt-3" id="container"></div>';

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
})();
