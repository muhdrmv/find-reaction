let express = require('express');
let axios = require('axios');
const cors = require('cors');
let fs = require('fs'); 
let app = express();
let PORT = 3000;

app.use(cors());

let finalAscendingReactions = [];    
let finalAscendingCandlesBetweenReactions = [];
let finalFullData = []

let rectanlges = [];
let behavioralStatus = [];
let bars = [];
let fibonachiLevelShow = [];


async function findAscendingReactionsInSubset(candles) {

    let candlesBetweenReactions = [];
    let fullData = [];
    let reactions = [];
    let finalFirstCandle 
    let finalLastCandle 
    let finalLowestCandle
    let isRed = false;
    let redCandles = null
    let k;

    for (let i = 0; i < candles.length; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3

            if( getCandleColor(candles[j]) == "red" ){
                isRed = true;

                if(redCandles){
                    if(redCandles.low > candles[j].low) redCandles = candles[j]
                }else{
                    redCandles = candles[j];
                }
            } 

            if(finalFirstCandle){

                if(firstCandle.high < lastCandle.high){
                    
                    if(finalFirstCandle.high < lastCandle.high){

                        if(isRed){

                            if( 
                                candles.indexOf(lastCandle) - candles.indexOf(finalFirstCandle) == 1 && 
                                getCandleColor(candles[candles.indexOf(finalFirstCandle)]) == "green" && 
                                getCandleColor(candles[candles.indexOf(lastCandle)]) == "red" 
                            ){
                                finalFirstCandle = lastCandle
                                i++
                            }else{

                                if(lastCandle.low < finalLowestCandle.low) finalLowestCandle = lastCandle;

                                finalLastCandle = lastCandle

                                const newEntry = [finalFirstCandle, finalLowestCandle, finalLastCandle];
                                reactions.push(newEntry);

                                let middleCandles = candles.slice(
                                    candles.indexOf(finalFirstCandle) ,
                                    candles.indexOf(finalLastCandle) + 1
                                );
                                
                                let d = {
                                    type : 'ascending',
                                    reactions : newEntry,
                                    candlesBetweenReactions : middleCandles,
                                    timeUTC : {
                                        start : finalFirstCandle?.time,
                                        finish : finalLastCandle?.time
                                    },
                                    timeToMS : {
                                        start : new Date(finalFirstCandle?.time).getTime(),
                                        finish : new Date(finalLastCandle?.time).getTime()
                                    },
                                    ceiling: finalFirstCandle.high,
                                    floor : finalLowestCandle.low
                                }
                                fullData.push(d)

                                isRed = false
                                redCandles = null
                                finalFirstCandle = null
                                finalLowestCandle = null
                                k = null
                                i++
                            }
                            
                        }else{
                            finalFirstCandle = lastCandle //check marvi
                            finalLowestCandle = lastCandle
                            k = i
                            i++
                        }
                    }else{
                        if( lastCandle.low < finalLowestCandle.low){
                            finalLowestCandle = lastCandle;
                        }
                        i++
                        // continue;
                    }
                }else{

                    if( lastCandle.low < finalLowestCandle.low){
                        finalLowestCandle = lastCandle;
                    }
                    i++
                    // continue;
                }
            }else{
                if(firstCandle.high < lastCandle.high){

                    if( 
                        (candles.indexOf(lastCandle) - candles.indexOf(firstCandle) == 1 && 
                        getCandleColor(candles[candles.indexOf(firstCandle)]) == "red" && 
                        getCandleColor(candles[candles.indexOf(lastCandle)]) == "green" )
                        ||
                        (candles.indexOf(lastCandle) - candles.indexOf(firstCandle) == 1 && 
                        getCandleColor(candles[candles.indexOf(firstCandle)]) == "red" && 
                        getCandleColor(candles[candles.indexOf(lastCandle)]) == "red" )
                    ){

                        finalFirstCandle = firstCandle

                        if(lastCandle.low  < firstCandle.low){
                            finalLowestCandle = lastCandle
                        }else{
                            finalLowestCandle = firstCandle
                        }

                        finalLastCandle = lastCandle

                        const newEntry = [finalFirstCandle, finalLowestCandle, finalLastCandle];
                        reactions.push(newEntry);

                        let middleCandles = []
                        
                        let d = {
                            type : 'ascending',
                            reactions : newEntry,
                            candlesBetweenReactions : middleCandles,
                            timeUTC : {
                                start : finalFirstCandle?.time,
                                finish : finalLastCandle?.time
                            },
                            timeToMS : {
                                start : new Date(finalFirstCandle?.time).getTime(),
                                finish : new Date(finalLastCandle?.time).getTime()
                            },
                            ceiling: finalFirstCandle.high,
                            floor : finalLowestCandle.low
                        }
                        fullData.push(d)

                        isRed = false
                        redCandles = null
                        finalFirstCandle = null
                        finalLowestCandle = null
                        k = null
                        i++

                    }else{
                        finalFirstCandle = lastCandle;
                        finalLowestCandle = lastCandle
                        k = i
                        i++
                    }
                }else{
                    finalFirstCandle = firstCandle;
                    if(lastCandle.low  < firstCandle.low){
                        finalLowestCandle = lastCandle
                    }else{
                        finalLowestCandle = firstCandle
                    }
                    k = i
                    i++
                }
            }

            if( j == candles.length - 1){
                // console.log("heree", i , j ,k );
                // console.log(candles[k]);

                if(!finalLastCandle){
                    i = k+1
                    j = k+1
                    finalFirstCandle = null
                    finalLowestCandle = null
                    // console.log("ddddddd", i, j, k);
                    // console.log("***************");
                }

                // lastCandle.high = finalFirstCandle.high + 1
                // finalLastCandle = lastCandle

                // reactions.push([finalFirstCandle, finalLowestCandle, finalLastCandle])

                // let middleCandles = candles.slice(
                //     candles.indexOf(finalFirstCandle) ,
                //     candles.indexOf(finalLastCandle) + 1
                // );

                // candlesBetweenReactions.push(middleCandles)
                
                // finalFirstCandle = null
                // finalLowestCandle =null
                // finalLastCandle = null

                // continue
            }            
        }
    }

    return {reactions, candlesBetweenReactions, fullData};
}

const findReactionAfterViolation = async (subsets) => {

    let { reactions, fullData } = await findAscendingReactionsInSubset(subsets)

    // fullData.forEach(d => { finalFullData.push(d) });
    reactions.forEach(d => { finalAscendingReactions.push(d) });

    for (let i = 0; i < reactions.length; i++) {
        let obj = {
            type: "box",
            xMin: new Date(reactions[i][0].time).getTime(), // Start time (in milliseconds)
            xMax: new Date(reactions[i][2].time).getTime() , // End time (in milliseconds)
            yMin: reactions[i][1].low, // Minimum price
            yMax: reactions[i][0].high, // Maximum price
            backgroundColor: getRandomRGBA(), // Semi-transparent green
            // borderColor: "green"
            borderWidth: 0.01,
        }
        rectanlges.push(obj)
    } 
    
    fs.writeFileSync('AscendingReactions.json', JSON.stringify(finalAscendingReactions, null, 2), 'utf-8');
    fs.writeFileSync('rectanlges.json', JSON.stringify(rectanlges, null, 2), 'utf-8');
    return { fullData }
}

async function findAscendingReactions(subsets) {

    let {reactions, fullData} = await findAscendingReactionsInSubset(subsets)

    fullData.forEach(d => { finalFullData.push(d) });
    finalAscendingReactions = reactions;

    for (let i = 0; i < finalAscendingReactions.length; i++) {
        let obj = {
            type: "box",
            xMin: new Date(finalAscendingReactions[i][0].time).getTime(), // Start time (in milliseconds)
            xMax: new Date(finalAscendingReactions[i][2].time).getTime() , // End time (in milliseconds)
            yMin: finalAscendingReactions[i][1].low, // Minimum price
            yMax: finalAscendingReactions[i][0].high, // Maximum price
            backgroundColor: getRandomRGBA(), // Semi-transparent green
            // borderColor: "green"
            borderWidth: 0.01,
        }
        rectanlges.push(obj)
    } 
    
    fs.writeFileSync('AscendingReactions.json', JSON.stringify(finalAscendingReactions, null, 2), 'utf-8');
    fs.writeFileSync('rectanlges.json', JSON.stringify(rectanlges, null, 2), 'utf-8');

    return finalAscendingReactions;
}

const deleteTheReactionAndDataWhenWeHaveViolationInReaction = async ( finalFullDataIndexInside ) => {

    let candleRectangleSimillarization = {
        xMin: finalFullDataIndexInside?.timeToMS?.start, 
        xMax: finalFullDataIndexInside?.timeToMS?.finish, 
        yMin: finalFullDataIndexInside.floor,
        yMax: finalFullDataIndexInside.ceiling
    }

    let candleFibonachiSimillarization = {
        xMin: finalFullDataIndexInside?.timeToMS?.start,
        xMax: finalFullDataIndexInside?.timeToMS?.finish,
        yMin: finalFullDataIndexInside?.fibonachiLevel['0.618'],
        yMax: finalFullDataIndexInside?.fibonachiLevel['0.618'],
        typeof: '0.618'
    }

    let Iindex = null
    let Jindex = null
    let Mindex = null
    let Nindex = null

    for (let i = 0; i < rectanlges.length; i++) {
        
        if(
            rectanlges[i]?.xMin == candleRectangleSimillarization?.xMin &&
            rectanlges[i]?.xMax == candleRectangleSimillarization?.xMax &&
            rectanlges[i]?.yMin == candleRectangleSimillarization?.yMin &&
            rectanlges[i]?.yMax == candleRectangleSimillarization?.yMax
        ){
            Iindex = i
        }
    }

    for (let j = 0; j < finalFullData.length; j++) {
       
        let item = JSON.stringify(finalFullData[j])
        
        if (item == JSON.stringify(finalFullDataIndexInside)) {
            Jindex = j
        }
    }

    for (let i = 0; i < fibonachiLevelShow.length; i++) {
        
        if(
            fibonachiLevelShow[i]?.xMin == candleFibonachiSimillarization?.xMin &&
            fibonachiLevelShow[i]?.xMax == candleFibonachiSimillarization?.xMax &&
            fibonachiLevelShow[i]?.yMin == candleFibonachiSimillarization?.yMin &&
            fibonachiLevelShow[i]?.yMax == candleFibonachiSimillarization?.yMax
        ){
            console.log(candleFibonachiSimillarization);
            Mindex = i
        }
    }
    
    for (let i = 0; i < finalAscendingReactions.length; i++) {
        
        if(
            finalAscendingReactions[i][0]?.time == finalFullDataIndexInside.timeUTC?.start &&
            finalAscendingReactions[i][2]?.time == finalFullDataIndexInside.timeUTC?.finish &&
            finalAscendingReactions[i][1]?.low == finalFullDataIndexInside?.floor &&
            finalAscendingReactions[i][0]?.high == finalFullDataIndexInside?.ceiling
        ){
            Nindex = i
        }
    }

    finalAscendingReactions.splice(Nindex, 1)
    finalFullData.splice(Jindex, 1);
    rectanlges.splice(Iindex, 1);
    fibonachiLevelShow.splice(Mindex, 2)
    
    fs.writeFileSync('fibonachiLevelsShowa.json', JSON.stringify(fibonachiLevelShow, null, 2), 'utf-8');
}

let finalDescendingReactions = [];    
let finalDescendingCandlesBetweenReactions = [];

async function findDescendingReactionsInSubset(candles) {

    let candlesBetweenReactions = [];
    let fullData = [];
    let reactions = [];
    let finalFirstCandle 
    let finalLastCandle 
    let finalHighestCandle
    let isGreen = false;
    let greenCandles = null
    let k;

    for (let i = 0; i < candles.length; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3

            if( getCandleColor(candles[j]) == "green" ){
                isGreen = true;

                if(greenCandles){
                    if(greenCandles.low > candles[j].low) greenCandles = candles[j]
                }else{
                    greenCandles = candles[j];
                }
            } 

            if(finalFirstCandle){

                if(firstCandle.low > lastCandle.low){

                    if(finalFirstCandle.low > lastCandle.low){

                        if(isGreen){

                            if(lastCandle.high > finalHighestCandle.high) finalHighestCandle = lastCandle;

                            finalLastCandle = lastCandle

                            const newEntry = [finalFirstCandle, finalHighestCandle, finalLastCandle];
                            reactions.push(newEntry);

                            let middleCandles = candles.slice(
                                candles.indexOf(finalFirstCandle) ,
                                candles.indexOf(finalLastCandle) + 1
                            );
                            
                            let d = {
                                type : 'descending',
                                reactions : newEntry,
                                candlesBetweenReactions : middleCandles,
                                timeUTC : {
                                    start : finalFirstCandle?.time,
                                    finish : finalLastCandle?.time
                                },
                                timeToMS : {
                                    start : new Date(finalFirstCandle?.time).getTime(),
                                    finish : new Date(finalLastCandle?.time).getTime()
                                },
                                ceiling: finalHighestCandle.high,
                                floor : finalFirstCandle.low
                            }
                            fullData.push(d)

                            isGreen = false
                            greenCandles = null
                            finalFirstCandle = null
                            finalHighestCandle = null
                            finalLastCandle = null
                            // k = null
                            i++

                        }else{
                            finalFirstCandle = lastCandle //check marvi
                            finalHighestCandle = lastCandle
                            k = i
                            i++
                        }
                    }else{
                        if( lastCandle.high > finalHighestCandle.high){
                            finalHighestCandle = lastCandle;
                        }
                        i++
                        // continue;
                    }
                }else{

                    if( lastCandle.high > finalHighestCandle.high){
                        finalHighestCandle = lastCandle;
                    }
                    i++
                    // continue;
                }
            }else{
                if(firstCandle.low > lastCandle.low){
                    finalFirstCandle = lastCandle;
                    finalHighestCandle = lastCandle
                    // continue;
                    
                }else{
                    finalFirstCandle = firstCandle;

                    if(lastCandle.high  > firstCandle.high){
                        finalHighestCandle = lastCandle
                    }else{
                        finalHighestCandle = firstCandle
                    }
                    // continue;
                }
                // console.log("i, j", i, j);
                // console.log("finalFirstCandle",finalFirstCandle );
                // console.log("finalHighestCandle",finalHighestCandle );
                // console.log("###############");
                k = i
                i++
            }

            if( j == candles.length - 1){
                // console.log("heree", i , j ,k );
                // console.log(candles[k]);

                if(!finalLastCandle){
                    // console.log("Ddsds", k);
                    i = k+1
                    j = k+1
                    finalFirstCandle = null
                    finalHighestCandle = null
                    // console.log("ddddddd", i, j, k);
                    // console.log("***************");
                }
            }            
        }
    }

    return {reactions, candlesBetweenReactions, fullData};
}

async function findDescendingReactions(subsets) {

    let {reactions, candlesBetweenReactions, fullData} = await findDescendingReactionsInSubset(subsets)
    fullData.forEach(d => { finalFullData.push(d) });
    finalDescendingCandlesBetweenReactions.push(...candlesBetweenReactions);
    finalDescendingReactions.push(...reactions);

    return finalDescendingReactions;
}

const calculateFibonachi = async ( finalFullData, lowestOfTheLeg ) => {

    const calculateFibonacciLevels = async (high, low) => {

        const levels = [0.618, 0.786];
        const fibLevels = {};
      
        levels.forEach(level => {
            fibLevels[level] = high - (high - low) * level;
        });

        return fibLevels;
    }

    for (let i = 0; i < finalFullData.length; i++) {
        
        // find low => the floor of the reaction [i - 1] || first of the leg
        //find high => the ceiling of the reaction [i]
        let low 

        if (i == 0) low  = lowestOfTheLeg
        else low  = finalFullData[i - 1]?.floor
        
        let high = finalFullData[i]?.ceiling
        let findFibonachiLevel = await calculateFibonacciLevels(high, low)
        finalFullData[i]["fibonachiLevel"] = findFibonachiLevel

        // drawing 
        let obj61 = {
            xMin: finalFullData[i]?.timeToMS?.start,
            xMax: finalFullData[i]?.timeToMS?.finish,
            yMin: findFibonachiLevel['0.618'],
            yMax: findFibonachiLevel['0.618'],
            borderColor: finalFullData[i]?.type == "ascending" ? 'orange' : "red",
            borderWidth: 1,
            typeof: '0.618'
        }
        let obj78 = {
            xMin: finalFullData[i]?.timeToMS?.start,
            xMax: finalFullData[i]?.timeToMS?.finish,
            yMin: findFibonachiLevel['0.786'],
            yMax: findFibonachiLevel['0.786'],
            borderColor: finalFullData[i]?.type == "ascending" ? 'orange' : "red",
            borderWidth: 1,
            typeof: '0.786'
        }
        fibonachiLevelShow.push(obj61)
        fibonachiLevelShow.push(obj78)
    }

    fs.writeFileSync('fibonachiLevelsShowa.json', JSON.stringify(fibonachiLevelShow, null, 2), 'utf-8');

    return fibonachiLevelShow
}

const behavioralAnalysisReactions = async ( finalFullData ) => {


    const X = (candlesBetween, type, fibo) => {

        let x = 0
        let lowestCandle = null

        const Y = async ({candle}) => {

            if(getCandleColor(candle) == 'green'){

                x++
                
                if(!lowestCandle || lowestCandle.low > candle.low ) {
                    lowestCandle = candle
                }
                
            }else{
                lowestCandle = candle
            }
        }

        for (let i = 0; i < candlesBetween.length; i++) {

            if(type == "ascending"){

                if(x == 0){
                    if(candlesBetween[i].low < fibo) Y({candle : candlesBetween[i]})
                }else {
                    if(lowestCandle.low > candlesBetween[i].low) Y({candle : candlesBetween[i]})
                }
            }
            
        }

        if( x == 0 ) x = 1
        return x
    }

    
    for (let i = 0; i < finalFullData.length; i++) {

        let behavioral = {};

        if(finalFullData[i]?.floor < finalFullData[i]?.fibonachiLevel['0.618']){ // barkhord

            let exitCandlestickScaleRangle = await X(finalFullData[i].candlesBetweenReactions, finalFullData[i].type, finalFullData[i]?.fibonachiLevel['0.618']);
            behavioral['scaleRange'] = true;
            behavioral['exitCandlestickScaleRangle'] = exitCandlestickScaleRangle;
        }else{

            behavioral['scaleRange'] = false
            behavioral['outstandingOrder'] = true
        }
        finalFullData[i]["behavioral"] = behavioral
    }

    return finalFullData;
}

const findBeyondTheEngulfAscending = async ( previousReactionData, currentReactionData, reationThatHasViolationIndex ) => {

    let previousFloor = previousReactionData?.floor;

    await deleteTheReactionAndDataWhenWeHaveViolationInReaction(finalFullData[reationThatHasViolationIndex]); // delete the reaction from rectangles when we have violation
    
    const findViolations = async (previousFloor, candles) => {
        
        let isViolation = false
        let whichCandleHasViolation = null
        let howManyViolations = 0 // if 1 == violation, if 2 == violation confirmed, if 2 > violation confirmed + (howManyViolations - 2)
        let continueCandleToFindReactions

        for (let i = 0; i < candles.length; i++) {
            
            if(candles[i].low < previousFloor){
                isViolation = true;
                previousFloor = candles[i].low
                whichCandleHasViolation = i
            }

            if(isViolation){
                if(getCandleColor(candles[i]) == "green"){
                    // found the violations
                    howManyViolations++

                    let violationType = "N"
                    
                    switch (howManyViolations) {
                        case 1:
                            violationType = "N"
                            break;
                        case 2:
                            violationType = "TN"
                            break;
                        
                        default:
                            violationType = "TN+" + (howManyViolations-1)
                            break;
                    }
                    
                    let obj = {
                        "type": "ascending",
                        "reactions": [], // not important
                        "candlesBetweenReactions": [], // not important
                        "timeUTC": {
                          "start": candles[i]?.time,
                          "finish": candles[i]?.time
                        },
                        "timeToMS": {
                          "start": new Date(candles[i].time).getTime(),
                          "finish": new Date(candles[i].time).getTime()
                        },
                        "ceiling": candles[i]?.high, // not important
                        "floor": candles[i]?.low,
                        "fibonachiLevel": {
                          "0.618": null, // not important
                          "0.786": null // not important
                        },
                        "behavioral": {
                          "scaleRange": null,
                          "outstandingOrder": null
                        },
                        "behavioralStatus": violationType
                    }

                    finalFullData.push(obj)
                    isViolation = false
                    continueCandleToFindReactions = i
                    console.log("here", i);
                }
            }
        }

        console.log("howManyViolations", howManyViolations);
        console.log("whichCandleHasViolation", whichCandleHasViolation);
        console.log("continueCandleToFindReactions", continueCandleToFindReactions);
        return {
            lowestCandle: previousFloor,
            continueCandleToFindReactions
        }
    }
    
    // it must be add fulldata when all things comlplete,
    // find the violation engulf 

    let { continueCandleToFindReactions } = await findViolations( previousFloor, currentReactionData?.candlesBetweenReactions );

    // ** we should find the reactions, after violation or violation confirmed  if we have ** ????

    let candlesAfterViolations = currentReactionData?.candlesBetweenReactions?.slice(continueCandleToFindReactions) // I need the last lowest candle 
    let lowestCandle = candlesAfterViolations[0]  // for starting of the lowest of the leg for drawing the fibonachi

    // find the reactions

    let { fullData } =  await findReactionAfterViolation(candlesAfterViolations)
    await calculateFibonachi(fullData, lowestCandle?.low); //  bars[0].low = lowst of the leg

    await behavioralAnalysisReactions(fullData)

    await specifyEngulf(fullData)

    for (let i = 0; i < fullData.length; i++) {

        if(fullData[i]?.behavioralStatus){

            let s = fullData[i].timeToMS.start
            let f = fullData[i].timeToMS.finish

            let obj = {
                xValue: f - ((f - s)/2),
                yValue: fullData[i].type == "ascending" ? fullData[i].floor - 1 : fullData[i].ceiling + 1,
                content: fullData[i]?.behavioralStatus,
                font: {
                  size: 12,
                  weight: "bolder",
                },
                color: "black",
                textAlign: "center"
            }

            behavioralStatus.push(obj)
        }
    } 

    // // specify engulf
    // await specifyEngulf(finalFullData)
    console.log("fullData",fullData);
    fs.writeFileSync('behavioralStatus.json', JSON.stringify(behavioralStatus, null, 2), 'utf-8');
    
}

const specifyEngulf = async ( finalFullData ) => {

    let engluf = null;

    for (let i = 1; i < finalFullData.length; i++) {

        let previousReactionData = finalFullData[i - 1];
        let currentReactionData = finalFullData[i];
        
        if( currentReactionData.floor <  previousReactionData.floor){

            // 2 model

            // 1: 
            if(!previousReactionData?.behavioral?.scaleRange && currentReactionData?.floor > engluf?.floor ){ // اگر واکنش قبلی وارد منطقه مقیاسی نشده بود و همچنین از واکنش دارای رفتار اینگالف هم پایین تر نرفته بود ولی زیر واکنش قبلی رو زده بود میشه (اینگالف ریست )

                finalFullData[i]["behavioralStatus"] = "er"
                engluf = finalFullData[i]

            }else{  // نقض و یا تایید نقض
                
                console.log("ffff", currentReactionData.timeUTC,' \n\n');
                // console.log("engluf", engluf);
                await findBeyondTheEngulfAscending( previousReactionData, currentReactionData, i );
                // await findAscendingReactionBetweenReaction(currentReactionData?.candlesBetweenReactions)
                // await calculateFibonachi(finalFullData)
    
                // do big things
                return;

                // outstanding order

                // n

                //tn

                // tn + 1
            }
        
        }
        else if( previousReactionData?.behavioralStatus == "er" ){

            // رفتار مبنا
           continue
        }
        else if( 
            currentReactionData?.behavioral?.scaleRange == true && 
            previousReactionData?.behavioral?.scaleRange == false 
        ){
            finalFullData[i]["behavioralStatus"] = "e"
            engluf = finalFullData[i]

        }
        else if(
            currentReactionData?.behavioral?.scaleRange == true && 
            previousReactionData?.behavioral?.scaleRange == true 
        ){
            if(currentReactionData?.behavioral?.exitCandlestickScaleRangle > previousReactionData?.behavioral?.exitCandlestickScaleRangle ){
                finalFullData[i]["behavioralStatus"] = "e"
                engluf = finalFullData[i]
            }
        }
    }

}

const getRandomRGBA = () => {
    const r = Math.floor(Math.random() * 56 + 200); // Keeping red high for a yellowish tone
    const g = Math.floor(Math.random() * 56 + 200); // Keeping green high for a yellow effect
    const b = Math.floor(Math.random() * 50); // Keeping blue low to maintain yellow hue
    const a = (Math.random() * (0.4 - 0.3) + 0.3).toFixed(2); // Opacity between 0.1 and 0.4
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getCandleColor(candle) {
    const { open, close } = candle;
    return close > open ? "green" : "red";
}

app.get('/candles', async (req, res) => {

    try {


        // let ssss = await axios.get('http://127.0.0.1:5000/candles'); //for request MARVI
        // fs.writeFileSync('bars.json', JSON.stringify(ssss.data, null, 2), 'utf-8');
        // console.log("bars", bars);   ATTENTION -> bars.data is array

        const data = fs.readFileSync('bars.json', 'utf8');
        bars = JSON.parse(data);

        const formattedCandles = bars.map(item => ({
            c: item.close,
            h: item.high,
            l: item.low,
            o: item.open,
            x: new Date(item.time).getTime()
        }));
        fs.writeFileSync('formattedCandles.json', JSON.stringify(formattedCandles, null, 2), 'utf-8');
        
        
        // let reactions = await findAscendingReactions(bars.data); for request MARVI

        let AscendingReactions = await findAscendingReactions(bars);


        // let descendingReactions = await findDescendingReactions(bars)
        // fs.writeFileSync('descendingReactions.json', JSON.stringify(descendingReactions, null, 2), 'utf-8');

        // for (let i = 0; i < descendingReactions.length; i++) {
        //     let obj = {
        //         type: "box",
        //         xMin: new Date(descendingReactions[i][0].time).getTime(), // Start time (in milliseconds)
        //         xMax: new Date(descendingReactions[i][2].time).getTime() , // End time (in milliseconds)
        //         yMin: descendingReactions[i][0].low, // Minimum price
        //         yMax: descendingReactions[i][1].high, // Maximum price
        //         backgroundColor: 'rgba(240, 96, 96, 0.2)', // Semi-transparent green
        //         // borderColor: "green"
        //         borderWidth: 0.01,
        //     }
        //     rectanlges.push(obj)
        // }
        
        // fs.writeFileSync('bars.json', JSON.stringify(bars, null, 2), 'utf-8');
        // fs.writeFileSync('reactions.json', JSON.stringify(reactions, null, 2), 'utf-8');


        // start calculate fibonachi and find levels
        let fibonachiLevelShow = await calculateFibonachi(finalFullData, bars[0].low); //  bars[0].low = lowst of the leg

        // Behavioral Analysis of Reactions
        await behavioralAnalysisReactions(finalFullData)

        // // specify engulf
        // await specifyEngulf(finalFullData)

        for (let i = 0; i < finalFullData.length; i++) {

            if(finalFullData[i]?.behavioralStatus){

                let s = finalFullData[i].timeToMS.start
                let f = finalFullData[i].timeToMS.finish

                let obj = {
                    xValue: f - ((f - s)/2),
                    yValue: finalFullData[i].type == "ascending" ? finalFullData[i].floor - 1 : finalFullData[i].ceiling + 1,
                    content: finalFullData[i]?.behavioralStatus,
                    font: {
                      size: 12,
                      weight: "bolder",
                    },
                    color: "black",
                    textAlign: "center"
                }

                behavioralStatus.push(obj)
            }
        }       

        fs.writeFileSync('behavioralStatus.json', JSON.stringify(behavioralStatus, null, 2), 'utf-8');
        

        fs.writeFileSync('finalFullData.json', JSON.stringify(finalFullData, null, 2), 'utf-8');

        res.send({formattedCandles}); 
    } catch (error) {
        console.error('Error fetching data from Python API:', error);
        res.status(500).send('Error fetching candle data');
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
