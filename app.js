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
        optList.Trains = [];
        
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        optList.fromDate = new Date().toLocaleDateString('de-DE', options);      



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
        });

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
                    optList.Trains = result;
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