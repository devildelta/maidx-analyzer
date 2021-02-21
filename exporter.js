// ==UserScript==
// @name         maidx-analyzer-exporter
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.2.0
// @description  Export fetched score data to clipboard, which can be used in https://myjian.github.io/mai-tools/rating-calculator/
// @author       devildelta
// @match        https://maimaidx-eng.com/maimai-mobile/playerData/
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @updateURL    https://devildelta.github.io/maidx-analyzer/exporter.js
// @downloadURL  https://devildelta.github.io/maidx-analyzer/exporter.js
// ==/UserScript==

(function() {
    'use strict';

    const LEVEL_STRING = ["basic","advanced","expert","master","remaster"];
	const LEVEL_DISP_STRING = ["BASIC","ADVANCED","EXPERT","MASTER","Re:MASTER"];

    function initInLvl(resolve,reject){//promise executor
        //if not updated in last 24 hrs, grap a fresh copy
        if(!window.localStorage.getItem("lastUpdateTime") || (Date.now() - 86400000) > parseInt(window.localStorage.getItem("lastUpdateTime"))){
            let s = document.createElement('script');
            s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', 'https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/maidx_in_lv_splash.js');
            //s.setAttribute('src', 'https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/maidx_in_lv_dxplus.js');
            s.addEventListener('load',()=>{
                //parse into map for better searching
                let all_tracks = [];
                in_lv.forEach((e)=>{//in_lv is loaded from the src from @sgimera
                    let key = (e.dx ? "dx" : "st") + "\t" + e.n;
                    delete e.n;if(e.nn)delete e.nn;
                    console.log(key+" "+e);
                    window.localStorage.setItem(key,JSON.stringify(e));
                    all_tracks.push(key);
                });
                console.log("total track num = "+all_tracks.length);
                window.localStorage.setItem("update_mlist",update_mlist);
                window.localStorage.setItem("lastUpdateTime",Date.now());
                window.localStorage.setItem("all_tracks",all_tracks.join("\r\n"));
				console.log("level list refreshed.");
                resolve();
            });
            document.getElementsByTagName('head')[0].appendChild(s);
        } else {
			console.log("level list updated in 24 hours. Skip refresh.");
            resolve();
        }
    }
	function exLv(inLv){
		inLv = Math.abs(inLv);
		return Math.floor(inLv)+""+((inLv-Math.floor(inLv)) > 0.5 ? "+" : "");
	}
	
	function exportRating(){
		let ratings = [];
        for(let key of window.localStorage.getItem("all_tracks").split("\r\n")){
            let trackInfo = JSON.parse(window.localStorage.getItem(key));
            for(let i = 0;i < 5;i++){
                let inLv = trackInfo.lv[i];
                if(inLv === 0)break;
                let key_level = key+"\t"+LEVEL_STRING[i];
                let percentage = window.localStorage.getItem(key_level+"\tpercentage")||0;
				let info = key.split("\t");
				ratings.push([
					(info[1]),
					"null",
					LEVEL_DISP_STRING[i],
					exLv(inLv),
					info[0] === "dx"?"DX":"STANDARD",
					(percentage / 10000).toFixed(4)+"%"
				].join("\t"));
                //}
            }
        }
		navigator.clipboard.writeText(ratings.join("\n"))
		.then(function(){
			$(".basic_block").after($('<div class="m_5 m_t_10 t_r f_12">Output copied to clipboard.</div>'));
			console.log("Output copied to clipboard. ");
		}, function(err){
			console.error(err);
		})
	}

    $(document).ready(()=>{
        new Promise(initInLvl)
		.then(exportRating);
    });
})();

// currentRating -1 legacyRating +2 ?