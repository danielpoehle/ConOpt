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
        optList.totalCount = 0;
        optList.trackList = [];
        optList.optGain = 0;
        optList.optReroute = 0;
        optList.optGainHAPlus = 0;
        optList.optRerouteHAPlus = 0;
        optList.hAPlus = ['2550', '4213', '4214', '4000', '4700', '5302', '6170', '1402', '3807', '6179', '1733', '1732', '2153', '3401', '6151', '1734', '1705', '1701', '1704', '1753', '4800', '4720', '1720', '4701', '3601', '3600', '6343', '3520', '6153', '3628', '5300', '2666', '3606', '3510', '3533', '3603', '2665', '1220', '1120', '6100', '1280', '2200', '1234', '1250', '1292', '6411', '5919', '6340', '6402', '6239', '6363', '6251', '6240', '6241', '2291', '6244', '6352', '2278', '5100', '5500', '6353', '6430', '5850', '1522', '2651', '5610', '5611', '5522', '5531', '5546', '5503', '5544', '4600', '6107', '5510', '6131', '6136', '6138', '6147', '6067', '6087', '6126', '6080', '6149', '6148', '6150', '6140', '6132', '6171', '5963', '5940', '5962', '5961', '5965', '2640', '2643', '2658', '1730', '1900', '1910', '2616', '2613', '2600', '2608', '5900', '1775', '1754', '1750', '1700', '4280', '5209', '5910', '4002', '6185', '6388', '1255', '5320', '5943', '5501', '6876', '6019', '6406', '6403', '6051', '2990', '2321', '2281', '2320', '2272', '2202', '1500', '2913', '2324', '2638', '2630', '2622', '2650', '2692', '2670', '2656', '2413', '5970', '3530', '3658', '3624', '3650', '1540', '1552', '2932', '2207', '2244', '2280', '2206', '2243', '2641', '2659', '2652', '2621', '5321', '1401', '1740', '6248', '4083', '4085', '3539', '6249', '4020', '4210', '5555', '1040', '1710', '1751', '1756', '3611', '3688', '3804', '4263', '4826', '6152', '4615', '1000', '2660', '6347', '6110', '4010', '3809', '2150', '2158', '2160', '2184', '2290', '2300', '2326', '3677', '5702', '5703', '5830', '2103', '2317', '2407', '6252', '4060', '6519', '1100', '1153', '1281', '1404', '1410', '1421', '1424', '1426', '1554', '2271', '1726', '1745', '1803', '2106', '2142', '2151', '2152', '2163', '2164', '2168', '2175', '3280', '3436', '2237', '2270', '3525', '2275', '2277', '2282', '2319', '2323', '2417', '2418', '2552', '2564', '2624', '3660', '2632', '2633', '2639', '3900', '2661', '2662', '2674', '2690', '2695', '2726', '2730', '2731', '2840', '2993', '3012', '3018', '3220', '3231', '3250', '3507', '3531', '4021', '4052', '3604', '3651', '3656', '3670', '3684', '3744', '3801', '3825', '3828', '3912', '3913', '3914', '3915', '3918', '3925', '6400', '4011', '4050', '4051', '4061', '4062', '4080', '4082', '4130', '4261', '4312', '4404', '4405', '4413', '4415', '4812', '4813', '4842', '5103', '5200', '5201', '5212', '5214', '5215', '5216', '5228', '5305', '5306', '5310', '5543', '5550', '5581', '5707', '5744', '5831', '5845', '5934', '6055', '6109', '6134', '6135', '6155', '6250', '6274', '6291', '6394', '6397', '6427', '6428', '6899'];


        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        optList.fromDate = new Date().toLocaleDateString('de-DE', options);   
        
        optList.analyzeTrains = function(bob1, bob2){
            optList.analyzed = false;
            optList.SavingsList = [];
            optList.sv = 0;
            let ret = {
                'gain': 0,
                'svList': []
            };
            if(bob1 === ''){ 
                console.log("Bob1 is empty");
                return(ret);}
            if(bob2 === ''){ 
                console.log("Bob2 is empty");
                return(ret);}
            let b1 = optList.Trains.filter((t) => t.Vorgangsnummer === bob1);
            let b2 = optList.Trains.filter((t) => t.Vorgangsnummer === bob2);

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
                
                let exclusionDays = t2.filter((t) => !t1.includes(t));
                let saving = [];
                let numCancel = 0;
                let numReroute = 0;

                for (let j = 0; j < exclusionDays.length; j++) {
                    let savingDay = optList.Trains.filter((t) => t.Zugnummer === intersectNumbers[i] && t.Verkehrstag.VText === exclusionDays[j]);
                    //console.log(savingDay);
                    if(savingDay.length === 1){
                        saving.push(exclusionDays[j]);
                        savingDay[0].Regelungsart === 'Umleitung' ? numReroute += 1 : numCancel += 1;                        
                    }                   
                }

                
                

                if(saving.length > 0){
                    ret.gain += saving.length;
                    ret.svList.push({
                      'ZNR': intersectNumbers[i],
                      'Savings': saving.length,
                      'Cancels': numCancel,
                      'Reroutes': numReroute,
                      'Days': saving.join(', ')
                    });
                }
                                
            }

            //console.log(b1);
            //console.log(b2);
            //console.log(optList.SavingsList);
            //console.log(intersectNumbers);
            optList.SavingsList = ret.svList;
            optList.sv = ret.gain;
            optList.analyzed = true;            
            //console.log(ret);
            return(ret);
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
                    'Anz': tmp.length,
                    'Strecke': tmp[0]['VzG']
                });

                optList.ZUEGE.push({
                    'Vorgang': vg[i],
                    'Anz': znr.length,
                    'Strecke': tmp[0]['VzG']
                });

                optList.VDAYS.push({
                    'Vorgang': vg[i],
                    'Anz': vd.length,
                    'Strecke': tmp[0]['VzG']
                });                
            }
            optList.countTrainsWithRestrictions(b);            
        };

        optList.countTrainsWithRestrictions = function(b){
            let allDays = b.map((t) => t.Verkehrstag.VText);
            allDays = allDays.filter((item, index) => allDays.indexOf(item)===index);
            optList.totalCount = 0;

                for (let j = 0; j < allDays.length; j+=1) {
                    let tmp = b.filter((t) => t.Verkehrstag.VText === allDays[j]);

                    let znr = tmp.map((t) => t.Zugnummer);
                    znr = znr.filter((item, index) => znr.indexOf(item)===index);
                    optList.totalCount += znr.length;
                }
        };

        optList.selectMother = function(vg){
            optList.BOB1 = vg; //mother
            optList.BOB2 = ''; //daughter
            optList.analyzeTrains();
            document.getElementById("nav-home-tab").click();
        };

        optList.analyzeAllTracks = function(){
            let allVzG = optList.Trains.map((t) => t.VzG);
            allVzG = allVzG.filter((item, index) => allVzG.indexOf(item)===index);
            optList.trackList = [];
            optList.optGain = 0;

            for (let i = 0; i < allVzG.length; i+=1) {
                optList.Strecke = allVzG[i];
                optList.findMother('Strecke');
                

                if(optList.BETR.length > 1){
                    optList.BETR.sort((a, b) => b.Anz - a.Anz);
                    optList.ZUEGE.sort((a, b) => b.Anz - a.Anz);
                    optList.VDAYS.sort((a, b) => b.Anz - a.Anz);

                    //first step: find mothers & daughters of the track number
                    let mothers = [];
                    if(optList.BETR.length <= 6){
                        //only take one mother
                        mothers.push(optList.VDAYS[0].Vorgang);                        
                    }else{
                        //select more than one mother
                        let mo = optList.VDAYS.filter((t) => t.Anz >= 10).map((t) => t.Vorgang);
                        mo.push(optList.VDAYS[0].Vorgang);
                        mo.push(optList.BETR[0].Vorgang);
                        mo.push(optList.ZUEGE[0].Vorgang);
                        mo = mo.filter((item, index) => mo.indexOf(item)===index);
                        mothers = mo;
                    }

                    let assignments = [];
                    for (let a = 0; a < mothers.length; a+=1) {
                        assignments.push({
                            'mother': mothers[a],
                            'daugthers': [],
                            'gainSum': 0,
                            'totalReroutes': 0
                        });                        
                    }

                    let daughters = optList.VDAYS.map((t) => t.Vorgang);
                    daughters = daughters.filter((t) => !mothers.includes(t));
                    
                    for (let j = 0; j < daughters.length; j+=1) {
                        let gain = 0;
                        let cancel = 0;
                        let reroute = 0;
                        let bestMother = '';
                        let saving = [];

                        for (let k = 0; k < mothers.length; k+=1) {
                            let result = optList.analyzeTrains(mothers[k], daughters[j]);
                            //console.log(daughters[j], mothers[k], result);
                            if(result.gain > gain){
                                //console.log("found assignment");
                                gain = result.gain;
                                cancel = result.svList.map((a) => a.Cancels).reduce((pv, cv) => pv + cv, 0);
                                reroute = result.svList.map((a) => a.Reroutes).reduce((pv, cv) => pv + cv, 0);
                                bestMother = mothers[k];
                                saving = result.svList;
                            }                            
                        }
                        if(gain > 0){
                            let m = assignments.find((m) => m.mother === bestMother);
                            m.daugthers.push({
                                'daughter': daughters[j],
                                'savingsList': saving,
                                'gain': gain,
                                'numCancels': cancel,
                                'numReroute': reroute
                            });
                            m.gainSum += gain;
                            m.totalReroutes += reroute;
                        }
                    }
                    //console.log(allVzG[i], assignments);   
                    //only include mothers with at least one daughter with gain
                    assignments = assignments.filter((a) => a.gainSum > 0); 
                    //console.log(allVzG[i], assignments);                    

                    if(assignments.length > 0){
                        let totalSum = assignments.map((a) => a.gainSum).reduce((pv, cv) => pv + cv, 0);
                        let totalSavedRoutes = assignments.map((a) => a.totalReroutes).reduce((pv, cv) => pv + cv, 0);
                        optList.trackList.push({
                            'VzG': allVzG[i],
                            'Assignments': assignments,
                            'totalGain': totalSum,
                            'numSavedReroutes': totalSavedRoutes
                        });
                    }
                } 
            }
            optList.countTrainsWithRestrictions(optList.Trains);
            optList.Strecke = '';
            optList.analyzed = false;
            optList.BETR = [];
            optList.optGain = optList.trackList.map((a) => a.totalGain).reduce((pv, cv) => pv + cv, 0);
            optList.optGainHAPlus = optList.trackList.filter((a) => optList.hAPlus.includes(a.VzG)).map((a) => a.totalGain).reduce((pv, cv) => pv + cv, 0);
            optList.optReroute = optList.trackList.map((a) => a.numSavedReroutes).reduce((pv, cv) => pv + cv, 0);
            optList.optRerouteHAPlus = optList.trackList.filter((a) => optList.hAPlus.includes(a.VzG)).map((a) => a.numSavedReroutes).reduce((pv, cv) => pv + cv, 0);
            console.log(optList.trackList);
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