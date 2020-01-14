// ==UserScript==
// @name         maidx-analyzer-calculator
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.0
// @description  Calculate the rating from collected information, and inject into homepage for display.
// @author       devildelta
// @match        https://maimaidx-eng.com/maimai-mobile/playerData/
// @grant        none
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
    	function initInLvl(){
		let s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('src', 'https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/in_lv_dx.js');
		s.addEventListener('load',()=>{
			//parse into map for better searching
			let all_tracks = [];
			in_lv.forEach((e)=>{//in_lv is loaded from the src from @sgimera
				let key = (e.dx ? "dx" : "st") + "\t" + e.n + "\t";
				for(let i = 0;i<e.lv.length;i++){
					if(e.lv[i] === 0)break;//remas not exist;
					let keyl = key + LEVEL_STRING[i];
					console.log(keyl+" "+e.lv[i]);
					window.localStorage.setItem(keyl+"\tinLv",e.lv[i]);
					all_tracks.push(keyl);
				}
			});
			console.log("total track num = "+all_tracks.length);
			window.localStorage.setItem("update_mlist",update_mlist);
			window.localStorage.setItem("lastUpdateTime",Date.now());
			window.localStorage.setItem("all_tracks",all_tracks.join("\r\n"));
		});
		document.getElementsByTagName('head')[0].appendChild(s);
	}
    	function calculate(key,percentage){
			let inLv = window.localStorage.getItem(key+"\tinLv");
		if(!inLv){
			console.log("inner level not available");
			return null;
		} else if (inLv < 0){
			inLv = -1*inLv;
		}
		const rating =
		(percentage >= 1005000)?15:
		(percentage >= 1000000)?14:
		(percentage >= 999900)?13.5:
		(percentage >= 995000)?13:
		(percentage >= 990000)?12:
		(percentage >= 980000)?11:
		(percentage >= 970000)?10:
		(percentage >= 940000)?9.4:
		(percentage >= 900000)?9:
		(percentage >= 800000)?8:
		(percentage >= 750000)?7.5:
		(percentage >= 700000)?7:
		(percentage >= 600000)?6:
		(percentage >= 500000)?5:
		(percentage >= 400000)?4:
		(percentage >= 300000)?3:
		(percentage >= 200000)?2:
		(percentage >= 100000)?1:0;

		const tmp = Math.min(1005000,percentage) * rating * inLv;
		const tmpmod = tmp % 1000000;
		return (tmp-tmpmod)/1000000;
	}

    function aggregate(){
		let ratings = [];
		for(let key of window.localStorage.getItem("all_tracks").split("\r\n")){
			let percentage = window.localStorage.getItem(key+"\tpercentage")||0;
			let rating = calculate(key,percentage);
			if(rating>0)console.log(key+" "+rating);
			let info = key.split("\t");
			if(rating>0)ratings.push({isDX:info[0]==="dx",name:info[1],diff:info[2],rating:rating,inLv:window.localStorage.getItem(key+"\tinLv"),percentage:percentage});
		}
		console.log(ratings);
		//STD rating
		let ST = ratings.filter((e)=>e.isDX).sort((a,b)=>b.rating-a.rating).slice(0,15);
		console.log(ST);
		ST.forEach((e)=>injectHighRatingDetail(e.isDX,e.diff,e.name,e.inLv,e.rating,e.percentage));
		let DX = ratings.filter((e)=>!e.isDX).sort((a,b)=>b.rating-a.rating).slice(0,25);
		console.log(DX);
		DX.forEach((e)=>injectHighRatingDetail(e.isDX,e.diff,e.name,e.inLv,e.rating,e.percentage));
		let finalRating = ST.reduce((s,v)=>s+v.rating,0) + DX.reduce((s,v)=>s+v.rating,0);
		let STRating = ST.map((e)=>e.rating).reduce((s,v)=>s+v,0);
		let DXRating = DX.map((e)=>e.rating).reduce((s,v)=>s+v,0);
		//let gradeRating = map imgsrc to rating points.
		console.log(STRating+" + "+DXRating+" = "+finalRating);
		injectStatistics(STRating,DXRating);
	}
	
	function injectHighRatingDetail(isDX,diff,name,inLv,rating,percentage){
		let template = '<div class="music_score_back pointer w_400 m_3 p_5 f_0">'+'\n'
		+	'<img class="h_20 f_l diff">'+'\n'
		+	'<img class="music_kind_icon f_r">'+'\n'
		+	'<div class="clearfix"></div>'+'\n'
		+	'<div class="music_lv_block f_r t_c f_14"></div>'+'\n'
		+	'<div class="music_name_block w_349 t_l f_13 break"></div>'+'\n'
		+	'<div class="music_score_block w_80 t_r f_l f_12 rating"></div>'+'\n'
		+	'<div class="music_score_block w_96 t_r f_l f_12 percentage"></div>'+'\n'
		+	'<div class="clearfix"></div>'+'\n'
		+'</div>';
		let injectElement = $(template);
		injectElement.addClass("music_"+diff+"_score_back");
		injectElement.find(".diff").attr("src","https://maimaidx-eng.com/maimai-mobile/img/diff_"+diff+".png");
		injectElement.find(".music_kind_icon").attr("src","https://maimaidx-eng.com/maimai-mobile/img/music_"+(isDX?"dx":"standard")+".png");
		injectElement.find(".music_lv_block").html(inLv);
		injectElement.find(".music_name_block").html(name);
		injectElement.find(".music_score_block.rating").html(rating);
		injectElement.find(".music_score_block.percentage").html(percentage+"%");
		$("div.see_through_block").append(injectElement);
	}
	
	function injectStatistics(STRating,DXRating){
		$(".basic_block").after($("<div class='m_5 m_t_10 t_r f_12'>Standard Rating: "+STRating+" Rating per song: "+(STRating/15).toFixed(2)+"</div>"));
		$(".basic_block").after($("<div class='m_5 m_t_10 t_r f_12'>DX Rating: "+DXRating+" Rating per song: "+(DXRating/25).toFixed(2)+"</div>"));
	}
    $(document).ready(()=>{
        if(!window.localStorage.getItem("lastUpdateTime") || (Date.now() - 86400000) > parseInt(window.localStorage.getItem("lastUpdateTime"))){
            initInLvl();
        }
aggregate();
    });
})();

	//music_<diff>_score_back
	//src="https://maimaidx-eng.com/maimai-mobile/img/diff_basic.png"
	//src="https://maimaidx-eng.com/maimai-mobile/img/music_dx.png"
	/*
	<div class="music_score_back pointer w_450 m_15 p_3 f_0">
		<img class="h_20 f_l diff">
		<img class="music_kind_icon f_r">
		<div class="clearfix"></div>
		<div class="music_lv_block f_r t_c f_14"></div>
		<div class="music_name_block t_l f_13 break"></div>
	</div>
	
	*/