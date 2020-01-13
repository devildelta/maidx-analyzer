	function initInLvl(){
		let s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.setAttribute('src', 'https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/in_lv_dx.js'); 
		s.addEventListener('load',()=>{
			//parse into map for better searching
			all_tracks = [];
			in_lv.forEach((e)=>{
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
	function calculate(type,name,diff,percentage){
		let key = type+"\t"+name+"\t"+diff;
		return calculate(key);
	}
	function calculate(key,percentage){
			let inLv = window.localStorage.getItem(key+"\tinLv");
		if(!inLv){
			console.log("inner level not available");
			return null;
		} else if (inLv < 0){
			inLv = -1*inLv;
		}
		rating = 
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
		tmpmod = tmp % 1000000;
		return (tmp-tmpmod)/1000000;
	}
	//initialize internal level from sgimera
	//#adore#
	if(
		!window.localStorage.getItem("lastUpdateTime") || 
		(Date.now() - 86400000) > parseInt(window.localStorage.getItem("lastUpdateTime"))){
		initInLvl();
	} 
	//Reference: 
	//https://sgimera.github.io/mai_RatingAnalyzer/maidx_disp_rating.js
	//https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/
	//in_lv_dx.js
	//calc_rating_dx.js
	//display_rating_dx.js
	//check current url
	
	for(key of window.localStorage.getItem("all_tracks").split("\r\n")){
    rating = calculate(key,window.localStorage.getItem(key+"\tpercentage")||0);
    console.log(key+" "+rating);
}