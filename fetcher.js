javascript:(function(){
	//https://maimaidx-eng.com/maimai-mobile/record/musicLevel/search/?level=18
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
	if(document.URL.includes("maimaidx-eng.com/maimai-mobile/record/musicLevel/search")){
		//do data fetching
		Array.of(...$("div.pointer.w_450.m_15.p_3.f_0")).forEach((e)=>{
			let diff = imgsrc[$(e).find("img.h_20.f_l")[0].src];
			let type = imgsrc[$(e).find(".music_kind_icon")[0].src];
			let name = $(e).find(".music_name_block")[0].innerHTML;
			let lv = $(e).find(".music_lv_block")[0].innerHTML;
			let percentage = $(e).find(".music_score_block.w_120")[0];
			percentage = percentage?percentage.innerHTML.replace("\.","").replace("\%",""):"0";
			//console.log(type+" "+name+" "+diff+" "+lv+" "+percentage);
			window.localStorage.setItem(type+"\t"+name+"\t"+diff+"\tpercentage",percentage);
		});
	} else {
	}

})();void(0);