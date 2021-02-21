// ==UserScript==
// @name         maidx-analyzer-common
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.2.0
// @description  common functions
// @author       devildelta
// @grant        none
// @updateURL    https://devildelta.github.io/maidx-analyzer/common.js
// @downloadURL  https://devildelta.github.io/maidx-analyzer/common.js
// ==/UserScript==
(function() {
    'use strict';
    const CURRENT_VERSION = 15;//dx+
    const CURRENT_COUNT = 15;
    const LEGACY_COUNT = 25;
    const LEVEL_STRING = ["basic","advanced","expert","master","remaster"];
	const LEVEL_DISP_STRING = ["BASIC","ADVANCED","EXPERT","MASTER","Re:MASTER"];
    const GRADE_RATING_LIST = [0,250,500,750,1000,1200,1400,1500,1600,1700,1800,1850,1900,1950,2000,2010,2020,2030,2040,2050,2060,2070,2080,2090,2100];
    const imgsrc = {
        "https://maimaidx-eng.com/maimai-mobile/img/diff_basic.png" : "basic",
        "https://maimaidx-eng.com/maimai-mobile/img/diff_advanced.png" : "advanced",
        "https://maimaidx-eng.com/maimai-mobile/img/diff_expert.png" : "expert",
        "https://maimaidx-eng.com/maimai-mobile/img/diff_master.png" : "master",
        "https://maimaidx-eng.com/maimai-mobile/img/diff_remaster.png" : "remaster",
        "https://maimaidx-eng.com/maimai-mobile/img/music_dx.png" : "dx",
        "https://maimaidx-eng.com/maimai-mobile/img/music_standard.png" : "st"
    };
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
})();
