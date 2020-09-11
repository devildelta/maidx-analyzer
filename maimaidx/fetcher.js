// ==UserScript==
// @name         maidx-analyzer-fetcher
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.0.2
// @description  Fetch the best scores from level page and stores into localStorage for later handle.
// @author       devildelta
// @match        https://maimaidx-eng.com/maimai-mobile/record/musicLevel/*
// @match        https://maimaidx-eng.com/maimai-mobile/record/musicGenre/*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @updateURL    https://devildelta.github.io/maidx-analyzer/fetcher.js
// @downloadURL  https://devildelta.github.io/maidx-analyzer/fetcher.js
// ==/UserScript==

(function() {
    'use strict';
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
		if(document.URL.includes("musicGenre"))fetch_musicGenre();
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
		injectStatistics(count+" best records stored for "+currentLevel);
		
	}
	
	function fetch_musicGenre(){
		//current level
		let diff = LEVEL_STRING[$(".diffbtn_selected").parent().val()];
		//do data fetching
		let count = 0;
		Array.of(...$("div.w_450.m_15.p_r.f_0")).forEach((e)=>{
			//music_master_btn_on
			let typesrc = $(e).find(e.id ? ("img.music_"+diff+"_btn_on") : ("img.music_kind_icon"))[0].src;
			let type = imgsrc[typesrc];
			let name = $(e).find("div.pointer > form > .music_name_block")[0].innerHTML;
			let lv = $(e).find("div.pointer > form > .music_lv_block")[0].innerHTML;
			let percentage = $(e).find("div.pointer > form > .music_score_block.w_120")[0];
			percentage = percentage?percentage.innerHTML.replace("\.","").replace("\%",""):"0";
			console.log(type+" "+name+" "+diff+" "+lv+" "+percentage);
			if(percentage > 0)count++;
			window.localStorage.setItem(type+"\t"+name+"\t"+diff+"\tpercentage",percentage);
		});
		injectStatistics(count+" best records stored for "+diff);
		
	}
	
	function injectStatistics(line){
		$("table.f_0").append($("<tr><td colspan='8' class='f_11'>"+line+"</td></tr>"));
	}
})();