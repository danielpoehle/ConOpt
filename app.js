(function () {
    'use strict'; 

    angular.module('ConOpt', [])
    .controller('OptController', OptController)
    .service('OptService', OptService);
    
    OptController.$inject = ['OptService'];
    function OptController(OptService) {
        let optList = this;
        
        optList.Filename = 'bla';
        optList.loadComplete = false;
        optList.loadVzG = false;
        optList.BOB1 = ''; //mother
        optList.BOB2 = ''; //daughter
        optList.Trains = [];
        optList.BOB = [];
        optList.SavingsList = [];
        optList.sv = 0;
        optList.analyzed = false;
        optList.Region = '';
        optList.Strecke = '';
        optList.BETR = [];
        optList.ZUEGE = [];
        optList.VDAYS = [];
        
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        optList.fromDate = new Date().toLocaleDateString('de-DE', options);   
        
        optList.analyzeTrains = function(){
            optList.analyzed = false;
            optList.SavingsList = [];
            optList.sv = 0;
            if(optList.BOB1 === ''){ return;}
            if(optList.BOB2 === ''){ return;}
            let b1 = optList.Trains.filter((t) => t.Vorgangsnummer === optList.BOB1);
            let b2 = optList.Trains.filter((t) => t.Vorgangsnummer === optList.BOB2);

            let nr1 = b1.map((t) => t.Zugnummer);
            nr1 = nr1.filter((item, index) => nr1.indexOf(item)===index);
            let nr2 = b2.map((t) => t.Zugnummer);
            nr2 = nr2.filter((item, index) => nr2.indexOf(item)===index);

            const intersectNumbers = nr1.filter(value => nr2.includes(value));
            
            
            for (let i = 0; i < intersectNumbers.length; i+=1) {
                //t1 is mother
                let t1 = b1.filter((t) => t.Zugnummer === intersectNumbers[i]).map((t) => t.Verkehrstag.VText);
                t1 = t1.filter((item, index) => t1.indexOf(item)===index);
                //t2 is daughter
                let t2 = b2.filter((t) => t.Zugnummer === intersectNumbers[i]).map((t) => t.Verkehrstag.VText);
                t2 = t2.filter((item, index) => t2.indexOf(item)===index);
                
                let saving = t2.filter((t) => !t1.includes(t));
                if(saving.length > 0){
                    optList.sv += saving.length;
                    optList.SavingsList.push({
                      'ZNR': intersectNumbers[i],
                      'Savings': saving.length,
                      'Days': saving.join(', ')
                    });
                }
                                
            }

            console.log(b1);
            console.log(b2);
            console.log(optList.SavingsList);
            console.log(intersectNumbers);
            optList.analyzed = true;
        };

        optList.findMother = function(filt){
            optList.BETR = [];
            optList.ZUEGE = [];
            optList.VDAYS = [];            
            let b = [];
            if(filt === 'Region'){
                if(optList.Region === ''){return;}
                b = optList.Trains.filter((t) => t['RB Fpl'] === optList.Region);
            }

            if(filt === 'Strecke'){
                if(optList.Strecke === ''){return;}
                b = optList.Trains.filter((t) => t['VzG'] === optList.Strecke);
            }
            
            if(b.length <= 0){return;}

            let vg = b.map((t) => t.Vorgangsnummer);
            vg = vg.filter((item, index) => vg.indexOf(item)===index);

            for (let i = 0; i < vg.length; i+=1) {
                let tmp = b.filter((t) => t.Vorgangsnummer === vg[i]);

                let znr = tmp.map((t) => t.Zugnummer);
                znr = znr.filter((item, index) => znr.indexOf(item)===index);

                let vd = tmp.map((t) => t.Verkehrstag.VText);
                vd = vd.filter((item, index) => vd.indexOf(item)===index);

                optList.BETR.push({
                    'Vorgang': vg[i],
                    'Anz': tmp.length
                });

                optList.ZUEGE.push({
                    'Vorgang': vg[i],
                    'Anz': znr.length
                });

                optList.VDAYS.push({
                    'Vorgang': vg[i],
                    'Anz': vd.length
                });
            }
        };

        optList.selectMother = function(vg){
            optList.BOB1 = vg; //mother
            optList.BOB2 = ''; //daughter
            optList.analyzeTrains();
            document.getElementById("nav-home-tab").click();
        };

        optList.readVzG = function(){
            console.log("click");
        };



        optList.download = function() {

            let filename = optList.ImportDate + '-Aufteilung-' + optList.bobSequence.join('+') + '.csv';
            console.log(filename);
            let text = encodeURIComponent(createCsvText());

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
            element.setAttribute('download', filename);
        
            element.style.display = 'none';
            document.body.appendChild(element);
        
            element.click();
        
            document.body.removeChild(element);
        }

        function createCsvText(){

            let text = '';

            for (let i = 0; i < optList.assignList.length; i+= 1) {
                const element = optList.assignList[i];
                text += 'Vorgang ' + element.bobnr + ';;;;;;;;\n';
                text += 'Vorgang;Kunde;Zugnummer;Tag;Regelung;Laufweg;Bemerkung;Status;\n';
                for (let j = 0; j < element.trains.length; j+= 1) {
                    const train = element.trains[j];
                    for (let k = 0; k < train.vt.length; k++) {
                        const vt = train.vt[k];
                        for (let n = 0; n < vt.trains.length; n++) {
                            const regelung = vt.trains[n];
                            text += regelung.Vorgangsnummer + ';' + regelung.Kundennummer + ';' + regelung.Zugnummer + ';';
                            text += regelung.Verkehrstag.VText + ';' + regelung.Regelungsart + ';';
                            if(regelung.Regelungsart === 'Verspätung'){text += regelung.Verspätung + ' min;';}
                            else if(regelung.Regelungsart === 'Umleitung'){text += regelung.Umleitungsstrecke + ';';}
                            else if(regelung.Regelungsart === 'Ausfall'){text += 'von ' + regelung.Ausfallab + ' bis ' + regelung.Ausfallbis + ';';}
                            else if(regelung.Regelungsart === 'Vorplan'){text += 'ab ' + regelung['Vorplanab BS'] + ';';}
                            else {text += ';';}
                            text += regelung.Bemerkung.replace(/(\r\n|\n|\r)/gm," ") + ';;\n';
                        }
                    }
                }
                text += ';;;;;;;;\n';                
            }
            return text;
        };

        $(document).ready(function () {
            $('#list').bind('change', handleDialog);
            $('#vzg').bind('change', handleVzG);
        });

        function handleVzG(event){
            const { files } = event.target;
            const file = files[0];
            
            const reader = new FileReader();
            reader.readAsText(file, 'ISO-8859-1');
            reader.onload = function (event) {                
                csv({
                    output: "json",
                    delimiter: ";"
                })
                .fromString(event.target.result)
                .then(function(result){
                    for (let i = 0; i < optList.BOB.length; i+= 1) {
                        let tmp = result.findIndex((t) => t['BOB-Nummer'] === optList.BOB[i]); 
                        if(tmp >= 0){
                            optList.Trains.filter((t) => t.Vorgangsnummer === optList.BOB[i]).forEach((t) => {
                                t.VzG = result[tmp]['Bau: VzG-Strecke'];
                                t.Gewerk = result[tmp]['Gewerk'];
                                t.Arbeiten = result[tmp]['Arbeiten'];
                                t.BBR = result[tmp]['Regelungen: baubetriebl. R.[1]'];
                            });
                        }else{
                            optList.Trains.filter((t) => t.Vorgangsnummer === optList.BOB[i]).forEach((t) => {
                                t.VzG = 'NA';
                                t.Gewerk = 'NA';
                                t.Arbeiten = 'NA';
                                t.BBR = 'NA';
                            });
                        }                                            
                    }
                    
                    optList.loadVzG = true;
                    console.log(optList.Trains.length);
                    console.log(optList.Trains[0]);
                })                
                
            };
        };

        function handleDialog(event) {
            const { files } = event.target;
            const file = files[0];
            
            const reader = new FileReader();
            reader.readAsText(file, 'ISO-8859-1');
            reader.onload = function (event) {                
                csv({
                    output: "json",
                    delimiter: ";"
                })
                .fromString(event.target.result)
                .then(function(result){
                    for (let i = 0; i < result.length; i+= 1) {
                        const vt = result[i].Verkehrstag; 
                        result[i].Verkehrstag = {'VText': vt, 'VNumber': luxon.DateTime.fromFormat(vt, 'dd.MM.yyyy').ts};                                               
                    }
                    optList.Trains = result.filter((t) => (t.Regelungsart === 'Umleitung' || t.Regelungsart === 'Ausfall'));
                    optList.BOB = optList.Trains.map((t) => t.Vorgangsnummer);
                    optList.BOB = optList.BOB.filter((item, index) => optList.BOB.indexOf(item)===index);
                    optList.loadComplete = true;
                    console.log(optList.Trains.length);
                    console.log(optList.Trains[0]);
                })                
                
            };
        };
    };

    function OptService(){
        let service = this;
    };

})();