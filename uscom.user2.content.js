/* global moment */
/* global jsPDF */

(function() {
    'use strict';
    window.jsPDF = window.jspdf.jsPDF;
    var $ = unsafeWindow.jQuery;
    var libphonenumber = unsafeWindow.libphonenumber = window.libphonenumber;
    var jQuery = unsafeWindow.jQuery;
    window.addEventListener('load', function () {
        echo(" Voc-Tester Özelleştirici v2 ","color: white; background-color:darkred;");

        var _url = window.location.href;
        switch(true){
            case /certification\/view/.test(_url): ekbelgeOlustur(); break;
            case /examPeriod\/admin/.test(_url): idYok(); break;
            case /uploads\/ekbelge/.test(_url): ekbelgeYazdir(); break;
            case /applicant\/create/.test(_url): kayitKontrol(); break;
            case /estimator\/examQuestion/.test(_url): puanDoldur(); break;
            case /tracking\/index&month=-1/.test(_url): topluAski(); break;
            case /certification\/finish&display=disabled/.test(_url): mykAski(); break;
        }
        moment.locale('tr');
        //Görevleri kontrol et ve kabul et
        request("GET","https://uscom.voc-tester.com/backend.php?r=dashboard/default/list&w=tasks&e=waitingTaskAccept&all=1","").then(function (gorevResponse) {
            var parser = new DOMParser();
            var gorevDom = parser.parseFromString(gorevResponse.responseText, "text/html").getElementsByTagName("html")[0];
            var gorevler = xpath('//*[@id="tasks-waitingTaskAccept_list"]/table/tbody/tr',gorevDom);
            gorevler.forEach((gorev) => {
                if (gorev.querySelector("td:nth-child(6)").innerText == "Bekliyor") {

                };
            })

            //echo(gorevDom);
        });

    });

    //################ Fonksiyonlar Başlar #########################
    //======================================================
    //askıdaki belgeleri myk dan da askıya al
    function mykAski(){

        var butonAskiYer = xpath('//*[@id="applicant-grid"]/table/thead/tr[2]/td[last()]');
        var butonAski = '<a class="btn btn-warning btn-mini not-progress toplumykaski" style="color:black !important;margin:0 !important; padding:2px !important;">MYK\'da Askıya Al</a>';
        document.getElementById("applicant-grid").getElementsByTagName('table')[0].getElementsByTagName('thead')[0].getElementsByTagName('tr')[1].querySelector("td:last-child").insertAdjacentHTML('beforeend', butonAski);
        document.getElementsByClassName("toplumykaski")[0].addEventListener('click', (event) => {
            event.preventDefault();
            var belgeNos = xpath('//*[@id="applicant-grid"]/table/tbody/tr/td[12]');
            request("GET","https://portal.myk.gov.tr","").then(function(event){
                var parser = new DOMParser();
                var domDoc = parser.parseFromString(event.responseText, "text/html").getElementsByTagName("html")[0];
                var nekot_frsc = xpath('//meta[@name="nekot_frsc"]/@content',domDoc)[0].value;
                var loginDurum = xpath('//*[@id="s5_login"]/ul/li/span/span',domDoc)[0].innerText.trim()
                if(loginDurum != "Çıkış"){
                    request("POST","https://portal.myk.gov.tr/index.php?option=com_user","username=icinar&passwd=icinar12345.&Submit=Giri%C5%9F+Yap&option=com_user&task=login&return=Lw%3D%3D&"+nekot_frsc+"=1").then(function(event2){
                        var parser2 = new DOMParser();
                        var domDoc2 = parser2.parseFromString(event2.responseText, "text/html").getElementsByTagName("html")[0];
                        var nekot_frsc2 = xpath('//meta[@name="nekot_frsc"]/@content',domDoc2)[0].value;
                    });
                }

                belgeNos.forEach(function(belgeNo,index) {

                    request("POST","https://portal.myk.gov.tr/index.php?option=com_belgelendirme&view=belgelendirme_islemleri&task=KurulusSinavlarBelgeNo&format=raw","belgeNo=" + encodeURIComponent(belgeNo.innerText) +"&kurulusId=21003221","json").then(function(event3){
                        var dat = JSON.parse(event3.responseText);
                        console.log(dat);
                    });

                });

            });


        });
    }
    //======================================================

    //======================================================
    //toplu askıya al
    function topluAski(){
        var butonTopluYer = xpath('//*[@id="applicant-grid"]/table/thead/tr[2]/td[last()]');
        var butonToplu = '<a class="btn btn-warning btn-mini not-progress topluaski" style="color:black !important;margin:0 !important; padding:2px !important;">Tümünü Askıya Al</a>';
        document.getElementById("applicant-grid").getElementsByTagName('table')[0].getElementsByTagName('thead')[0].getElementsByTagName('tr')[1].querySelector("td:last-child").insertAdjacentHTML('beforeend', butonToplu);

        document.getElementsByClassName("topluaski")[0].addEventListener('click', (event) => {
            event.preventDefault();
            var belgeNos = xpath('//*[@id="applicant-grid"]/table/tbody/tr/td[last()]/input[boolean(@data-id-certificate)]');
            belgeNos.forEach(function(belgeNo) {
                var simdi = moment();
                var certId = belgeNo.getAttribute("data-id-certificate");
                var kontrolDate = belgeNo.getAttribute("data-date-check");
                var gunFark = simdi.diff(moment(kontrolDate),'days');
                // 90 günden fazla geçenleri askıya alır
                if (gunFark > 90) {
                    $.ajax({
                        type: "POST",
                        url: 'https://uscom.voc-tester.com/backend.php?r=certification/setStatus',
                        data: {id_user: certId, status: 0 , note: "gözetim evrağını göndermemiştir.", examRec: 0},
                        dataType: "text",
                        success: function (result) {
                            var certificationJSON = JSON.parse(result);
                            if (certificationJSON.result == "ok") {
                                echo(certId + " askıya alındı","color: green");
                            }
                            else {
                                echo(certId + " hata!","color: red");
                            }
                        }
                    });
                }else {
                    echo(certId + " 90 günden fazla değil!","color: red");
                }
            });
        });
    }
    //======================================================

    //======================================================
    //puanları oto doldur
    function puanDoldur(){
        puantopla();
        xpath('//*[@id="exam-checklist-grid"]/table/tbody/tr/td[1]').forEach((siraNo,index) => {
            siraNo.innerHTML = siraNo.innerText + ' <span style="color:darkred;font-size:14px;font-weight:bold;padding-left:3px;">(' + (index + 1) + ')</span>';
        })
        var otodoldurbutonlari = xpath('//*[@id="exam-checklist-grid"]/table/thead/tr[2]/td[last()]');
        var otobuttons = '<a class="btn btn-success btn-mini not-progress hepsitam" style="color:white !important;margin:0 !important; padding:2px !important;">Hepsi Tam</a>&nbsp;<a class="btn btn-warning btn-mini not-progress hepsisifir" style="color:black !important;margin:0 !important; padding:2px !important;">Hepsi Sıfır</a>';
        document.getElementById("exam-checklist-grid").getElementsByTagName('table')[0].getElementsByTagName('thead')[0].getElementsByTagName('tr')[1].querySelector("td:last-child").insertAdjacentHTML('beforeend', otobuttons);
        $("body").prepend('<span class="toplampuan scrollup label label-important" style="display: block;margin-bottom:30px;color:white;font-weight:normal;font-size:14px;padding:8px;">Toplam Puan: <strong style="font-weight:bold;font-size:15px;">0</strong></span>');
        //hepsine tam puan ve hepsine sıfır puan ver butonları
        jQuery('input.applicantPoint').each(
            function(index){
                $(this).parent().attr('style','min-width: 200px !important');
                $(this).before('&nbsp;<button class="btn btn-mini tamla">Tam Puan</button>&nbsp;<button class="btn btn-mini sifirla">0 Puan</button>');
            })
        //inputa sıfır puan verir
        jQuery('.tamla').on('click', function(){
            var input = $(this).parent().find('.applicantPoint');
            input.val(parseFloat("0"));
            puantopla();
        });
        //imputa tam puan verir
        jQuery('.sifirla').on('click', function(){
            var tampuan = $(this).parent().find('.maxPoint').text().replace(",", ".");
            var input = $(this).parent().find('.applicantPoint');
            input.val(parseFloat(tampuan));
            puantopla();
        });
        //bütün inputlara tam puan yazar
        jQuery('.hepsitam').on('click', function(){
            jQuery('#exam-checklist-grid table tr td a.maxPoint').each(
                function(index){
                    var input = $(this).parent().next().find('.applicantPoint');
                    input.val(parseFloat($(this).text()));
                })
            puantopla();
        });
        //bütün inputlara sıfır puan yazar
        jQuery('.hepsisifir').on('click', function(){
            jQuery('#exam-checklist-grid table tr td a.maxPoint').each(
                function(index){
                    var input = $(this).parent().next().find('.applicantPoint');
                    input.val(parseFloat("0"));
                })
            puantopla();
        });

        $("#exam-checklist-grid table tbody tr").click(function() {
            var input = $(this).find('.applicantPoint');
            if (input.val() =="" || input.val()==0){
                var tampuan = $(this).find('.maxPoint').text().replace(",", ".");
                input.val(parseFloat(tampuan));
            }else{
                input.val(parseFloat("0"));
            }
            puantopla();
        });

    }
    //======================================================

    //======================================================
    //kayıt ekranında iyileştirme ve aday kontrolü
    function kayitKontrol(){
        $("#id_job_level").on("change", function (a) {
            a.preventDefault();

            document.getElementById("Applicant_is_web").value = "0";
            document.getElementById("Applicant_gender").value = "1";
            $('#ApplicantInfo_work_status').select2().select2('val','ÇALIŞIYOR');
            $('#ApplicantInfo_work_status').trigger('change');
            $('#ApplicantInfo_education_type').select2().select2('val','OKUR YAZAR');
            $('#ApplicantInfo_education_type').trigger('change');
            var intervalId = window.setInterval(function(){
                $('#uif_elements').show();
                $('#ApplicantInfo_payback').val(0);
                $('#ApplicantInfo_education_type').trigger('change');
                $('#ApplicantInfo_physical_obstruction').val(0);
                $('#ApplicantInfo_physical_obstruction').trigger('change');
                $('#ApplicantInfo_has_special_need').val(0);
                $('#ApplicantInfo_has_special_need').trigger('change');
            }, 1000);
            document.getElementById("ApplicantInfo_chronic_disease").value = "0";
            document.getElementById("ApplicantInfo_certificate_language").value = "0";
            $("#ApplicantInfo_gsm").attr('maxlength','18');

        });

        var adayTc = xpath('//input[@id="Applicant_tc_number"]')[0];
        adayTc.addEventListener('blur', (event) => {
            event.preventDefault();
            request("POST","https://uscom.voc-tester.com/backend.php?r=applicant/create","applicationType=1&id_job_level=30&unitsJoin=0&applicant_job_level_units_required%5B%5D=113&applicant_job_level_units_required%5B%5D=114&level_type=&examProgram=0&ApplicantInfo%5Brecord_type%5D=0&ApplicantInfo%5Binstitution_name_dropdown%5D=&ApplicantInfo%5Binstitution_name%5D=&Applicant%5Bis_web%5D=0&Applicant%5Bnationality%5D=0&Applicant%5Btc_number%5D="+event.target.value+"&Applicant%5Bfirstname%5D=%C3%96ner&Applicant%5Blastname%5D=BUDAK&Applicant%5Bbirthday%5D%5Bday%5D=01&Applicant%5Bbirthday%5D%5Bmonth%5D=01&Applicant%5Bbirthday%5D%5Byear%5D=1998&Applicant%5Bplace_of_date%5D=01%2F01%2F1998&bufferPassword2=&Applicant%5Bidcard_serial_number%5D=&Applicant%5Bnew_idcard_serial_number%5D=&bufferPassword=&Applicant%5B_passwd%5D=&Applicant%5Brecord_number%5D=&Applicant%5Bgender%5D=1&Applicant%5Bplace_of_birth%5D=&ApplicantInfo%5Bgsm%5D=1111111111&ApplicantInfo%5Bphone%5D=&ApplicantInfo%5Bemail%5D=&ApplicantInfo%5Baddress%5D=&ApplicantInfo%5Bpayback%5D=&ApplicantInfo%5Bone_point%5D=0&ApplicantInfo%5Bone_point_payment%5D=&ApplicantInfo%5Bid_company%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5BibanNumber%5D%5B%5D=&ApplicantInfo%5Bwork_status%5D=%C3%87ALI%C5%9EIYOR&ApplicantInfo%5Bwork_name%5D=&ApplicantInfo%5Bwork_tax_name%5D=&ApplicantInfo%5Bwork_job%5D=&ApplicantInfo%5Beducation_type%5D=OKUR+YAZAR&ApplicantInfo%5Bphysical_obstruction%5D=&ApplicantInfo%5Bphysical_obstruction_detail%5D=&ApplicantInfo%5Bhas_special_need%5D=&ApplicantInfo%5Bhas_special_need_description%5D=&ApplicantInfo%5Bchronic_disease%5D=&ApplicantInfo%5Bchronic_disease_description%5D=&ApplicantInfo%5Bhes_code%5D=&ApplicantInfo%5Bcertificate_language%5D=&ajax=applicant-form&yt0=undefined").then(function (kayitResponse) {
                var data = JSON.parse(kayitResponse.responseText);
                if(data.Applicant_tc_number[1] && data.Applicant_tc_number[1].includes("kayıtlıdır"))
                {
                    [...document.getElementsByClassName('iskokayitli')].map(elem => elem.remove());
                    adayTc.insertAdjacentHTML('afterend', '<span class="label label-important iskokayitli" style="margin-left:5px;">KAYITLI</span>');
                }else{
                    [...document.getElementsByClassName('iskokayitli')].map(elem => elem.remove());
                }

            });

        });
        xpath('//input[@id="ApplicantInfo_gsm"]')[0].addEventListener('blur', (event) => {
            event.preventDefault();
            $("#ApplicantInfo_gsm").val(libphonenumber.parseNumber(event.target.value, 'TR').phone);
        });


    }
    //======================================================

    //======================================================
    //id yoksa uyarı ver
    function idYok(){
        GM_addStyle(".blink {animation: blinker 1.5s step-start infinite;} @keyframes blinker { 50% { opacity: 0;}}");
        var bosSatirlar = xpath('//*[@id="exam-period-grid"]/table/tbody/tr/td[3][not(text())]');
        var turkakSinavlar = xpath('//*[@id="exam-period-grid"]/table/tbody/tr/td[3][not(starts-with(text(),"1") or starts-with(text(),"2"))]');
        //sıralama önemli
        turkakSinavlar.forEach((turkakSinav) => {
            turkakSinav.innerHTML = '<p style="color:blue;font-size:13px;font-weight:bold;">' + turkakSinav.innerText + '</p>';
        });
        bosSatirlar.forEach((bosSatir) => {
            bosSatir.innerHTML = '<p class="blink" style="color:red;font-size:16px;font-weight:bold;">UYARI!</p>';
        });
    }
    //======================================================

    //======================================================
    //el belge yazdır
    function ekbelgeYazdir(){
        moment.locale('tr');
        document.querySelector('title').textContent = GM_getValue("ekbelgeAd") + " " + GM_getValue("tanimlama");
        document.getElementById('wpsno').innerHTML = GM_getValue("wpsno");
        document.getElementById("isim").innerHTML = GM_getValue("ekbelgeAd");
        document.getElementById("tcno").innerHTML = GM_getValue("ekbelgeTc");
        document.getElementById("dogumyertarih").innerHTML = GM_getValue("dogumyertarih");
        document.getElementById("isveren").innerHTML = "";
        document.getElementById("isverenadres").innerHTML = "";
        //document.getElementById("sertifikano").innerHTML = "";
        document.getElementById("sertifikatarihi").innerHTML = GM_getValue("sertifikatarihi");
        document.getElementById("gecerliliktarihi").innerHTML = GM_getValue("belgeSongun");
        document.getElementById("tanimlama").innerHTML = GM_getValue("tanimlama");
        document.getElementById("onaytarihyer").innerHTML = GM_getValue("belgeIlkgun") + " / İSTANBUL";
        document.getElementById("sertifikano").innerHTML = GM_getValue("sinavkod") + "/" + GM_getValue("sirano");
        (GM_getValue("ekbelgeYil") == 3) ? document.getElementById("onay93a").style.color = "black" : document.getElementById("onay93a").style.color = "white";
        (GM_getValue("ekbelgeYil") == 2) ? document.getElementById("onay93b").style.color = "black" : document.getElementById("onay93b").style.color = "white";
        (GM_getValue("ekbelgeYil") == 2.5) ? document.getElementById("onay93c").style.color = "black" : document.getElementById("onay93c").style.color = "white";
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
        setTimeout(function () {
            window.print();
        },3000);



    }
    //======================================================

    //======================================================
    //el belge oluştur
    function ekbelgeOlustur(){

        var ekbelgeButton = "";
        var uyKod = xpath('//*[@id="yw0"]/tbody/tr[7]/td/b')[0].innerText;
        var birimlerDom = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Başarılı Birimler"]/following-sibling::td');
        var birimler = getMatches(birimlerDom[0].innerText, /\(([0-9]{3})\)/gm, 1);
        if (birimler && uyKod=="11UY0010-3") {
            birimler.forEach((birim) => {
                ekbelgeButton += '<a class="btn btn-warning btn-mini not-progress ekbelge" style="color:black !important;margin:0 !important; padding:2px !important;" data-id="' + birim + '">Ek Belge Oluştur (' + birim + ')</a>&nbsp;';
            });
        }
        birimlerDom[0].insertAdjacentHTML('beforeend', '<br>' + ekbelgeButton);
        var ekbelgeElements = document.getElementsByClassName("ekbelge");
        for (var i = 0; i < ekbelgeElements.length; i++) {
            ekbelgeElements[i].addEventListener('click', ekbelgeFonksiyon, false);
        }
        function ekbelgeFonksiyon() {
            var sariButton = this;
            sariButton.classList.add("disabled")
            sariButton.style.pointerEvents = 'none';
            var keys = GM_listValues();
            keys.forEach(key => {
                GM_deleteValue(key);
            });
            var uykodu = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Yeterlilik"]/following-sibling::td/b')[0].innerText;
            var ekbelgeBasvuruno = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Başvuru No"]/following-sibling::td')[0].innerText;
            var ekbelgeTc = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "T.C. Kimlik Numarası"]/following-sibling::td')[0].innerText;
            var ekbelgeAd = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Adayın Adı Soyadı"]/following-sibling::td')[0].innerText;
            var ekbelgeYil = parseInt(xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Geçerlilik Süresi (Yıl)"]/following-sibling::td')[0].innerText);
            var ekbelgeSon = xpath('//*[@id="yw0"]/tbody/tr//th[text() = "Belge Bitiş Tarihi"]/following-sibling::td/a/@data-value')[0].value;
            var belgeIlkgun = moment(ekbelgeSon, 'YYYY-MM-DD').add(1, 'days').subtract(parseInt(ekbelgeYil), 'years').format("DD.MM.YYYY");
            var belgeSongun = moment(ekbelgeSon, 'YYYY-MM-DD').format("DD.MM.YYYY");
            //var sertifikatarihi = moment(belgeIlkgun, 'DD.MM.YYYY').add(1, 'days').format("DD.MM.YYYY");
            var sertifikatarihi = moment(belgeIlkgun, 'DD.MM.YYYY').format("DD.MM.YYYY");
            var tarih93a = moment(belgeIlkgun, 'DD.MM.YYYY').add(3, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var tarih93b = moment(belgeIlkgun, 'DD.MM.YYYY').add(2, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var tarih93c = moment(belgeIlkgun, 'DD.MM.YYYY').add(2.5, 'years').subtract(1, 'days').format("DD.MM.YYYY");
            var gozetim1 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(6, 'months').format("DD.MM.YYYY");
            var gozetim2 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(12, 'months').format("DD.MM.YYYY");
            var gozetim3 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(18, 'months').format("DD.MM.YYYY");
            var gozetim4 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(24, 'months').format("DD.MM.YYYY");
            var gozetim5 = moment(belgeIlkgun, 'DD.MM.YYYY').subtract(1, 'days').add(30, 'months').format("DD.MM.YYYY");
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
            var wpsVars = {
                111:{proses:"111 (MMA / SMAW)",proseskapsam : "111",wpsno : "pWPS-109",tanimlama : "111 P FW RR t5 PB sl",kutup : "DC (-)",dolgumalzeme : "RR",dolgukapsam : "A, RA, RB, RC, RR, R",koruyucugaz : "-",transfer : "Short circuit arc",transferkapsam : "Short circuit arc",fillergroup : "FM1",fillergroupkapsam : "FM1, FM2"},
                131:{proses:"131 (MIG / GMAW)",proseskapsam : "131",wpsno : "????????",tanimlama : "131 P FW S t5 PB sl",kutup : "DC (+)",dolgumalzeme : "S",dolgukapsam : "S, M",koruyucugaz : "XX (EN ISO 14175)",transfer : "Spray",transferkapsam : "Spray",fillergroup : "FM5",fillergroupkapsam : "FM5"},
                135:{proses:"135 (MAG / GMAW)",proseskapsam : "135, 138",wpsno : "pWPS-105",tanimlama : "135 P FW S t5 PB sl",kutup : "DC (+)",dolgumalzeme : "S",dolgukapsam : "S, M",koruyucugaz : "M24 (EN ISO 14175)",transfer : "Spray",transferkapsam : "Spray",fillergroup : "FM1",fillergroupkapsam : "FM1, FM2"},
                136:{proses:"136 (FCAW)",proseskapsam : "136",wpsno : "pWPS-111",tanimlama : "135 P FW S t5 PB sl",kutup : "DC (+)",dolgumalzeme : "S",dolgukapsam : "S, M",koruyucugaz : "M24 (EN ISO 14175)",transfer : "Spray",transferkapsam : "Spray",fillergroup : "FM1",fillergroupkapsam : "FM1, FM2"},
                141:{proses:"141 (TIG / GTAW)",proseskapsam : "141",wpsno : "pWPS-110",tanimlama : "141 P FW S t5 PB sl",kutup : "DC (+)",dolgumalzeme : "S",dolgukapsam : "S, M",koruyucugaz : "I1 (EN ISO 14175)",transfer : "Spray",transferkapsam : "Spray",fillergroup : "FM1",fillergroupkapsam : "FM1, FM2"},
            }
            GM_setValue("wpsno", wpsVars[attribute].wpsno);
            GM_setValue("tanimlama", wpsVars[attribute].tanimlama);
            GM_setValue("kutup", wpsVars[attribute].kutup);
            GM_setValue("dolgumalzeme", wpsVars[attribute].dolgumalzeme);
            GM_setValue("dolgukapsam", wpsVars[attribute].dolgukapsam);
            GM_setValue("koruyucugaz", wpsVars[attribute].koruyucugaz);
            GM_setValue("fillergroup", wpsVars[attribute].fillergroup);
            GM_setValue("fillergroupkapsam", wpsVars[attribute].fillergroupkapsam);
            GM_setValue("proses", wpsVars[attribute].proses);
            GM_setValue("proseskapsam", wpsVars[attribute].proseskapsam);
            GM_setValue("transfer", wpsVars[attribute].transfer);
            GM_setValue("transferkapsam", wpsVars[attribute].transferkapsam);
            request("GET","https://uscom.voc-tester.com/backend.php?r=applicant/view&jl=" + ekbelgeBasvuruno,"").then(function (adayBilgi) {
                var parser = new DOMParser();
                var adayBilgiDoc = parser.parseFromString(adayBilgi.responseText, "text/html").getElementsByTagName("body")[0];
                var dogumtarihiyazi = xpath('//th[text() = "Doğum Tarihi"]/following-sibling::td',adayBilgiDoc)[0].innerText;
                var dogumtarihi = moment(dogumtarihiyazi, 'DD/MM/YYYY').format("DD.MM.YYYY");
                var dogumyeri = xpath('//th[text() = "Doğum Yeri"]/following-sibling::td',adayBilgiDoc)[0].innerText;
                var dogumtarihyer = (dogumyeri) ? dogumtarihi + " / " + dogumyeri : dogumtarihi;
                GM_setValue("dogumyertarih", dogumtarihyer);
                var sonsinavlink = xpath('//*[@id="applicant-units-history-table-' + ekbelgeBasvuruno + '"]/table/tbody/tr[1]/td[last()]/a/@href', adayBilgiDoc)[0].value;
                var sonsinavid = sonsinavlink.split("id=")[1];
                var examsDom = xpath('//*[@id="apl_exams_' + ekbelgeBasvuruno + '"]//table/tbody/tr[1]/th[text() = "Sınav Kodu"]', adayBilgiDoc);
                var sinavyerlink = xpath('//*[@id="apl_exams_' + ekbelgeBasvuruno + '"]//table/tbody/tr[1]/th[text() = "Sınav Kodu"]/following-sibling::td/a[@href = "/backend.php?r=examPeriod/view&id=' + sonsinavid + '"]/../../../../following-sibling::table/tbody/tr/td[contains(string(), "' + attribute + '")]/../../../preceding-sibling::table/tbody/tr/th[text() = "Sınav Yeri"]/following-sibling::td/a/@href',adayBilgiDoc)[0].value;

                request("GET","https://uscom.voc-tester.com" + sinavyerlink,"").then(function (yerBilgi) {
                    var parser = new DOMParser();
                    var yerBilgiDoc = parser.parseFromString(yerBilgi.responseText, "text/html").getElementsByTagName("body")[0];
                    var sinavililce = xpath('//*[@id="content"]//table[1]/tbody//tr/th[text() = "İl - İlçe"]/following-sibling::td', yerBilgiDoc)[0].innerText;
                    GM_setValue("sinavililce", sinavililce);
                    request("GET","https://uscom.voc-tester.com/backend.php?r=examPeriod/decision&id=" + sonsinavid,"").then(function (kararBilgi) {
                        var parser = new DOMParser();
                        var kararBilgiDoc = parser.parseFromString(kararBilgi.responseText, "text/html").getElementsByTagName("body")[0];
                        var sinavkod = xpath('//*[@id="examPeriod_information"]/tbody/tr[1]/th[text() = "Sınav Programı Kodu"]/following-sibling::td', kararBilgiDoc)[0].innerText;
                        GM_setValue("sinavkod", sinavkod);
                        var tcnumaralar = xpath('//*[@id="exam-period-applicant-decision-grid"]/table/tbody/tr/td[8][contains(string(),"Başarılı")]/../td[4]', kararBilgiDoc);
                        tcnumaralar.forEach((tcnumara, index) => {
                            if (tcnumara.getElementsByTagName("a")[0].innerText == GM_getValue("ekbelgeTc")) {
                                GM_setValue("sirano", (index + 1).toLocaleString('tr-TR', {
                                    minimumIntegerDigits: 2,
                                    useGrouping: false
                                }));
                            }
                        });
                        sariButton.classList.remove("disabled")
                        sariButton.style.pointerEvents = 'auto';
                        var curTab = GM_openInTab("https://www.uscom.com.tr/wp-content/uploads/ekbelge.html");
                    });

                });

            });
        }
    }
    //======================================================

    //======================================================
    // get post talepleri gönder
    function request (method, url, data, datatype=""){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: method,
                url: url,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.76"
                },
                data: data,
                dataType: datatype,
                onload: function(response) {
                    //if (response.status == 200) {
                    resolve(response);
                    //}
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }
    function request2 (method, url, data, token="", datatype=""){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: method,
                url: url,
                headers: {
                    token : "1",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.76"
                },
                data: data,
                responseType : datatype,
                onload: function(response) {
                    //if (response.status == 200) {
                    resolve(response);
                    //}
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }
    //======================================================

    //======================================================
    //sekme aç
    function open (url){
        return new Promise((resolve, reject) => {
            try {
                resolve(GM_openInTab(url));
            } catch (e) {
                reject(e);
            }
        });
    }
    //======================================================

    //======================================================
    //regex grup eşleşmesi
    function getMatches(string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
    }
    //======================================================

    //======================================================
    //xpath bulma
    function xpath(xpathToExecute, str = document) {
        var result = [];
        var nodesSnapshot = document.evaluate(xpathToExecute, str, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < nodesSnapshot.snapshotLength; i++) {
            result.push(nodesSnapshot.snapshotItem(i));
        }
        return result;
    }
    //======================================================

    //======================================================
    //konsola yazdırma
    function echo (str,param = ""){
        console.log("%c" + str,param);
    }
    //======================================================

    //======================================================
    const timer = ms => new Promise(res => setTimeout(res, ms))
    function sleep( seconds ){
        return new Promise(function(resolve){
            setTimeout( resolve, seconds * 1000 );
        });
    }
    //======================================================

    //======================================================
    function puantopla() {
        var tot = 0;
        $("input.applicantPoint").each(function() {
            tot += parseFloat($(this).val()) || 0;
        });
        $("span.toplampuan strong").text(tot)
    }
    //======================================================
    //################ Fonksiyonlar Biter #########################
})();
