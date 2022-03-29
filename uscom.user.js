// ==UserScript==
// @name         Voc-Tester Geliştirici
// @namespace    iskender
// @version      16
// @description  Voc-Tester'a sonradan özellikler ekler
// @author       iskender
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/view&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/admin&ExamPeriod_page=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/update&id=*
// @match        https://*.voc-tester.com/backend.php?r=examPeriod/create
// @match        https://*.voc-tester.com/backend.php?r=site/home
// @match        https://*.voc-tester.com/backend.php?r=certification/renew
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
/*
    window.onload = function() {
    //window.addEventListener('load', function() {

        document.getElementById("btnhes").onclick=function(){
            try {



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

                //localStorage.clear();
                var idnolar = xpath('//a[contains(@href,"/backend.php?r=applicant/view&jl=")]');
                var userIds = [];
                idnolar.forEach(function(id) {
                    userIds.push(id.innerText);
                    console.log(id.innerText);
                });

                if (Object.keys(userIds).length > 0) {
                    //localStorage.setItem("voc_"+myk_id,'{"sinavid":{"voc_user_ids":'+JSON.stringify(userIds)+',"voc_sinav_info_id": "'+myk_id+'","voc_sinav_info_uy": "'+yeterlilik+'","voc_sinav_info_tarih": "'+tarih+'","voc_sinav_info_yer": "'+yer+'"}}');
                    localStorage.setItem("voc_user_ids", JSON.stringify(userIds));
                    localStorage.setItem("voc_sinav_info_id", myk_id);
                    localStorage.setItem("voc_sinav_info_uy", yeterlilik);
                    localStorage.setItem("voc_sinav_info_tarih", tarih);
                    localStorage.setItem("voc_sinav_info_yer", yer);
                }

                window.open("backend.php?r=examPeriod/view&id=heskarekod");
            } catch (err) {
                console.log(err.message);
            }
        }
    //}, false);
    };
    if (/examPeriod\/view&id\=\d/.test(window.location.href)) {//programdan aday al
        var addHes = document.evaluate('//*[@id="examDocumentList"]/fieldset/table/tbody', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var addHesInner = document.createElement("tr");
        addHesInner.innerHTML = "<td></td><td style='color:red !important;'>HES KODU KARE KOD</td><td><a class='not-progress exam-form-download-usage-document-button btn btn-warning btn-mini' style='padding:2px 5px 0px 5px;' id='btnhes'><i class='icon icon-barcode icon-white'></i>Oluştur</a></td>";
        addHes.appendChild(addHesInner);
    }
    if (/examPeriod\/view&id\=heskarekod/.test(window.location.href)) {//QR kod oluştur
        document.body.innerHTML = '<h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_id") + ' - ' + localStorage.getItem("voc_sinav_info_tarih") + '</h4><h4 class="m-0 p-0 text-center">' + localStorage.getItem("voc_sinav_info_uy") + '</h4><h5 class="m-0 mb-2 p-0 text-center">' + localStorage.getItem("voc_sinav_info_yer") + '</h5>';
        document.body.style.background = "#ffffff";
        document.body.setAttribute("style", "background-image: none !important;background-color:#ffffff !important;");
        document.body.innerHTML += '<ul class="container-fluid row mt-3 list-unstyled" id="container"></ul>';

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.integrity = 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3'
        link.crossOrigin = 'anonymous';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        GM_addStyle('@media print{li:nth-child(14) {  margin-bottom: 100px;}}');

        var voc_user_ids = JSON.parse(localStorage.getItem("voc_user_ids")); //get user ids
        console.log(voc_user_ids);
        var $ = window.jQuery;
        var say = 0;
        var cnt = 0;
        voc_user_ids.forEach(function callback(uid, index) {
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
                            var cardstyle ="";
                            if(!/^[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{7}$/.test(heskodu.value)){
                                cardstyle ="bg-danger";
                            }
                            if (heskodu && heskodu.value.length == 10) {
                                document.getElementById("container").innerHTML += '<li class="col-6" data-index="'+index+'"><div class="card mb-4 '+cardstyle+'"><div class="row g-0"><div class="col-4"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=c64dc337b87b41d08a165ffb020126ac|' + heskodu.value + '"></div><div class="col-8"><div class="card-body p-1"><h5 class="card-title">' + adsoyad.innerText + '</h5><h6 class="card-text">' + tcno.innerText + '</h6><h6 class="card-text">' + heskodu.value.substring(0, 4) + "-" + heskodu.value.substring(4, 8) + "-" + heskodu.value.substring(8, 10) + '</h6></div></div></div></div></li>';

                                cnt++;
                            }
                        }

                        say++;
                        console.log(say);
                        if (say == voc_user_ids.length && cnt > 0) {
                            setTimeout(function () {

                                //sırala

                                jQuery('ul li').sort(function(a, b) {
                                    return jQuery(a).data('index') - jQuery(b).data('index');
                                }).appendTo('ul');

                                window.print();
                            }, 5000);
                        }
                    }
                });
            }
            catch(e){
            }
        });

        //each sonu

    }
*/
    if (/examPeriod\/admin/.test(window.location.href)) {//ID yoksa yanıp sön

        var sinavsatirlari = xpath('//*[@id="exam-period-grid"]/table/tbody/tr');
        for (var sinavsatir of sinavsatirlari) {
            var sutunlar = sinavsatir.getElementsByTagName('td');
            if(sutunlar[2].innerText ==''){
                sutunlar[2].innerHTML = '<JavaBlink><p style="color:red;font-size:18px;font-weight:bold;">UYARI!</p></JavaBlink>';
                /**
                var yanson = sutunlar[2].getElementsByTagName('p')[0];
                setInterval(function() {
                    yanson.style.display = (yanson.style.display == 'none' ? '' : 'none');
                }, 800);
                **/
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
                                alert(item.smstext);
                            }
                        }
                    });


                }
            } catch (err) {
                console.log(err.message);
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
