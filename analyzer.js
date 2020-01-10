(function(){
	const imgsrc = {
	"https://maimaidx-eng.com/maimai-mobile/img/diff_expert.png" : "expert",
	"https://maimaidx-eng.com/maimai-mobile/img/diff_master.png" : "master",
	"https://maimaidx-eng.com/maimai-mobile/img/diff_remaster.png" : "remaster",
	"https://maimaidx-eng.com/maimai-mobile/img/music_dx.png" : "dx",
	"https://maimaidx-eng.com/maimai-mobile/img/music_standard.png" : "standard"
};
Array.of(...$("div.pointer.w_450.m_15.p_3.f_0")).forEach((e)=>{
	let diff = imgsrc[$(e).find("img.h_20.f_l")[0].src];
	let type = imgsrc[$(e).find(".music_kind_icon")[0].src];
	let name = $(e).find(".music_name_block")[0].innerHTML;
	let lv = $(e).find(".music_lv_block")[0].innerHTML;
	let percentage = $(e).find(".music_score_block.w_120")[0];
	console.log(name+" "+diff+" "+type+" "+lv+" "+(percentage?percentage.innerHTML:"0%"));
})

})();void(0);