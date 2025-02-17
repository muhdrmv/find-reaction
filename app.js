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
                    finalFirstCandle = lastCandle;
                    finalLowestCandle = lastCandle
                    // continue;
                }else{
                    finalFirstCandle = firstCandle;
                    if(lastCandle.low  < firstCandle.low){
                        finalLowestCandle = lastCandle
                    }else{
                        finalLowestCandle = firstCandle
                    }
                    // continue;
                }
                k = i
                i++
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

async function findAscendingReactions(subsets) {

    let {reactions, candlesBetweenReactions, fullData} = await findAscendingReactionsInSubset(subsets)

    fullData.forEach(d => { finalFullData.push(d) });
    finalAscendingCandlesBetweenReactions.push(...candlesBetweenReactions);
    finalAscendingReactions.push(...reactions);

    return finalAscendingReactions;
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

const calculateFibonachi = async ( finalFullData ) => {

    let fibonachiLevelShow = [];

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

        if (i == 0) low  = 2807.31
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
}

const specifyEngulf = async ( finalFullData ) => {

    for (let i = 0; i < finalFullData.length; i++) {

        if( finalFullData[i + 1].behavioral?.scaleRange == 0 ){

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

        let rectanlges = [];
        let bars = [];

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
        fs.writeFileSync('AscendingReactions.json', JSON.stringify(AscendingReactions, null, 2), 'utf-8');

        for (let i = 0; i < AscendingReactions.length; i++) {
            let obj = {
                type: "box",
                xMin: new Date(AscendingReactions[i][0].time).getTime(), // Start time (in milliseconds)
                xMax: new Date(AscendingReactions[i][2].time).getTime() , // End time (in milliseconds)
                yMin: AscendingReactions[i][1].low, // Minimum price
                yMax: AscendingReactions[i][0].high, // Maximum price
                backgroundColor: getRandomRGBA(), // Semi-transparent green
                // borderColor: "green"
                borderWidth: 0.01,
            }
            rectanlges.push(obj)
        }       

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
        fs.writeFileSync('rectanlges.json', JSON.stringify(rectanlges, null, 2), 'utf-8');



        // start calculate fibonachi and find levels
        let fibonachiLevelShow = await calculateFibonachi(finalFullData);
        fs.writeFileSync('fibonachiLevelsShowa.json', JSON.stringify(fibonachiLevelShow, null, 2), 'utf-8');

        // Behavioral Analysis of Reactions
        await behavioralAnalysisReactions(finalFullData)

        // specify engulf
        // await specifyEngulf(finalFullData)
        

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
