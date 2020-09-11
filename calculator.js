// ==UserScript==
// @name         maidx-analyzer-calculator
// @namespace    https://devildelta.github.io/maidx-analyzer/
// @version      1.1.0
// @description  Calculate the rating from collected information, and inject into homepage for display.
// @author       devildelta
// @match        https://maimaidx-eng.com/maimai-mobile/playerData/
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @updateURL    https://devildelta.github.io/maidx-analyzer/calculator.js
// @downloadURL  https://devildelta.github.io/maidx-analyzer/calculator.js
// ==/UserScript==

(function() {
    'use strict';
    const CURRENT_VERSION = 14;//dx+
    const CURRENT_COUNT = 15;
    const LEGACY_COUNT = 25;
    const LEVEL_STRING = ["basic","advanced","expert","master","remaster"];
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
            //s.setAttribute('src', 'https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/maidx_in_lv_dxplus.js');
            s.setAttribute('src', 'https://devildelta.github.io/maidx-analyzer/in_lv_dx.js');
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
    function calculate(inLv,percentage){
        if(!percentage)return 0;
        //let inLv = window.localStorage.getItem(key+"\tinLv");
        if(!inLv){
            //console.log("inner level not available");
            return null;
        } else if (inLv < 0){
            inLv = -1*inLv;
            //console.log("Uncertain inner level")
        }
        const rating =
        (percentage >= 1005000)?14.0:
        (percentage >= 1000000)?13.5:
        (percentage >= 995000 )?13.2:
        (percentage >= 990000 )?13.0:
        (percentage >= 980000 )?12.7:
        (percentage >= 970000 )?12.5:
        (percentage >= 940000 )?10.5:
        (percentage >= 900000 )? 9.5:
        (percentage >= 800000 )? 8.5:
        (percentage >= 750000 )? 7.5:
        (percentage >= 700000 )? 7.0:
        (percentage >= 600000 )? 6.0:
        (percentage >= 500000 )? 5.0:
        (percentage >= 400000 )? 4.0:
        (percentage >= 300000 )? 3.0:
        (percentage >= 200000 )? 2.0:
        (percentage >= 100000 )? 1.0:
                                   0;

        const tmp = Math.min(1005000,percentage) * rating * inLv;
        const tmpmod = tmp % 1000000;
        return (tmp-tmpmod)/1000000;
    }

    function aggregate(){
        let playcount = parseInt($(".m_5.m_t_10.t_r.f_12").html().match("：(\\d+)")[1]);
        console.log("playcount = "+playcount);//get play count before inject the statistics
        let ratings = [];
        for(let key of window.localStorage.getItem("all_tracks").split("\r\n")){
            let trackInfo = JSON.parse(window.localStorage.getItem(key));
            for(let i = 0;i < 5;i++){
                let inLv = trackInfo.lv[i];
                if(inLv === 0)break;
                let key_level = key+"\t"+LEVEL_STRING[i];
                let percentage = window.localStorage.getItem(key_level+"\tpercentage")||0;
                let rating = calculate(inLv, percentage);
                if(rating > 0){
                    //console.log(key_level+" "+rating);
                    let info = key.split("\t");
                    ratings.push({
                        isDX:info[0]==="dx",
                        name:info[1],
                        diff:LEVEL_STRING[i],
                        rating:rating,
                        inLv:inLv,
                        percentage:percentage,
                        version:trackInfo.v
                    });
                }
                
            }
        }
        console.log(ratings);

        let legacyTracks = ratings
        .filter((e)=>e.version<CURRENT_VERSION)
        .sort((a,b)=>b.rating-a.rating)
        .slice(0,LEGACY_COUNT);
        console.log(legacyTracks);
        legacyTracks.forEach((e)=>injectHighRatingDetail(e.isDX,e.diff,e.name,e.inLv,e.rating,e.percentage));
        
        let currentTracks = ratings
        .filter((e)=>e.version==CURRENT_VERSION)
        .sort((a,b)=>b.rating-a.rating)
        .slice(0,CURRENT_COUNT);
        console.log(currentTracks);
        currentTracks.forEach((e)=>injectHighRatingDetail(e.isDX,e.diff,e.name,e.inLv,e.rating,e.percentage));
        
        let legacyRating = legacyTracks.map((e)=>e.rating).reduce((s,v)=>s+v,0);
        let currentRating = currentTracks.map((e)=>e.rating).reduce((s,v)=>s+v,0);
        /*
        初心者
        https://maimaidx-eng.com/maimai-mobile/img/grade_01e5MjC8SF.png
        二段
        https://maimaidx-eng.com/maimai-mobile/img/grade_06Wi5QUShL.png
        五段
        https://maimaidx-eng.com/maimai-mobile/img/grade_09sA8D6X7e.png
        九段
        https://maimaidx-eng.com/maimai-mobile/img/grade_13e4SAdtXj.png
        */
        let gradeLevel = (parseInt($("div.basic_block > > img.h_25.f_l").attr("src").match("grade_(\\d\\d)")[1])-1);
        //let gradeRating = (parseInt($("div.basic_block > > img.h_25.f_l").attr("src").match("grade_(\\d\\d)")[1])-1)*100;
        let gradeRating = GRADE_RATING_LIST[gradeLevel];
        let finalRating = legacyRating + currentRating + gradeRating;
        console.log("PC"+playcount+" : "+legacyRating+" + "+currentRating+" + "+gradeRating+" = "+finalRating);
        //assert
        if(parseInt($(".rating_block.f_11").text()) !== finalRating){
            alert("Inconsistent rating! Please update the rating records from Records>Song Scores.");
            //do not save if result is not consistent.
        } else {
            let historicalRatings = JSON.parse(window.localStorage.getItem("historical_ratings")||"[]");
            if(historicalRatings.findIndex((e)=>e.playcount === playcount) < 0)
                historicalRatings.push({
                    playcount:playcount,
                    rating:finalRating,
                    legacyRating:legacyRating,
                    currentRating:currentRating,
                    gradeRating:gradeRating,
                    legacyTracks:legacyTracks,
                    currentTracks:currentTracks
                });
            window.localStorage.setItem("historical_ratings",JSON.stringify(historicalRatings));
            //window.localStorage.setItem("ratingDetail",JSON.stringify(ratings));
        }
        
        injectStatistics(legacyRating,currentRating,gradeRating);
    }

    function injectHighRatingDetail(isDX,diff,name,inLv,rating,percentage){
        let template = '<div class="music_score_back pointer w_400 m_3 p_5 f_0">'+'\n'
        +   '<img class="h_20 f_l diff">'+'\n'
        +   '<img class="music_kind_icon f_r">'+'\n'
        +   '<div class="clearfix"></div>'+'\n'
        +   '<div class="music_lv_block f_r t_c f_14"></div>'+'\n'
        +   '<div class="music_name_block w_349 t_l f_13 break"></div>'+'\n'
        +   '<div class="music_score_block w_80 t_r f_l f_12 rating"></div>'+'\n'
        +   '<div class="music_score_block w_96 t_r f_l f_12 percentage"></div>'+'\n'
        +   '<div class="clearfix"></div>'+'\n'
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

    function injectStatistics(legacyRating,currentRating,gradeRating){
        let src = $("div.basic_block > > img.h_25.f_l").attr("src");//Current Grade image.
        $(".basic_block").after($("<table class='f_12' id='ratings'><tr><td></td><td>Rating</td><td>Rating per song</td></tr></table>"));
        $("#ratings").append($("<tr class='h_25'><td>Legacy Rating</td><td class='t_r'>"+legacyRating+"</td><td class='t_r'>"+(legacyRating/LEGACY_COUNT).toFixed(2)+"</td></tr>"))
        $("#ratings").append($("<tr class='h_25'><td>Current Rating</td><td class='t_r'>"+currentRating+"</td><td class='t_r'>"+(currentRating/CURRENT_COUNT).toFixed(2)+"</td></tr>"))
        $("#ratings").append($("<tr class='h_25'><td>Grade Rating</td><td class='t_r'>"+gradeRating+"</td><td class='t_r'><img class='h_25' src='"+src+"'></td></tr>"))
        $("#ratings").append($("<tr class='h_25'><td>Final Rating</td><td class='t_r'>"+(legacyRating + currentRating + gradeRating)+"</td><td></td></tr>"))
    }
    $(document).ready(()=>{
        new Promise(initInLvl).then(aggregate);
    });
})();

// currentRating -1 legacyRating +2 ?