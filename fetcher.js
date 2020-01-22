// ==UserScript==
// @name         maidx-analyzer-fetcher
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.0.1
// @description  Fetch the best scores from level page and stores into localStorage for later handle.
// @author       devildelta
// @match        https://maimaidx-eng.com/maimai-mobile/record/musicLevel/*
// @grant        none
// @updateURL    https://devildelta.github.io/maidx-analyzer/fetcher.js
// @downloadURL  https://devildelta.github.io/maidx-analyzer/fetcher.js
// ==/UserScript==

(function() {
    'use strict';
    let isVerbose = false;
    const LEVEL_STRING = ["basic","advanced","expert","master","remaster"];
	const imgsrc = {
		"https://maimaidx-eng.com/maimai-mobile/img/diff_basic.png" : "basic",
		"https://maimaidx-eng.com/maimai-mobile/img/diff_advanced.png" : "advanced",
		"https://maimaidx-eng.com/maimai-mobile/img/diff_expert.png" : "expert",
		"https://maimaidx-eng.com/maimai-mobile/img/diff_master.png" : "master",
		"https://maimaidx-eng.com/maimai-mobile/img/diff_remaster.png" : "remaster",
		"https://maimaidx-eng.com/maimai-mobile/img/music_dx.png" : "dx",
		"https://maimaidx-eng.com/maimai-mobile/img/music_standard.png" : "st"
	};
	$(document).ready(()=>{
		if(document.URL.includes("musicLevel"))fetch_musicLevel();
    });
	
	function fetch_musicLevel(){
		//current level
		let currentLevel = $("div.screw_block.m_15.f_15")[0].innerHTML;
		//do data fetching
		let count = 0;
		Array.of(...$("div.pointer.w_450.m_15.p_3.f_0")).forEach((e)=>{
			let diff = imgsrc[$(e).find("img.h_20.f_l")[0].src];
			let type = imgsrc[$(e).find(".music_kind_icon")[0].src];
			let name = $(e).find(".music_name_block")[0].innerHTML;
			let lv = $(e).find(".music_lv_block")[0].innerHTML;
			let percentage = $(e).find(".music_score_block.w_120")[0];
			percentage = percentage?percentage.innerHTML.replace("\.","").replace("\%",""):"0";
			console.log(type+" "+name+" "+diff+" "+lv+" "+percentage);
			if(percentage > 0)count++;
			window.localStorage.setItem(type+"\t"+name+"\t"+diff+"\tpercentage",percentage);
		});
		injectStatistics(count+" best records stored for level "+currentLevel);
		
	}
	
	function injectStatistics(line){
		$("table.f_0").append($("<tr><td colspan='8' class='f_11'>"+line+"</td></tr>"));
	}
})();