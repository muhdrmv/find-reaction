let express = require('express');
let axios = require('axios');
const cors = require('cors');
let fs = require('fs'); 
let app = express();
let PORT = 3000;

app.use(cors());

let finalAscendingReactions = [];    
let finalAscendingCandlesBetweenReactions = [];

async function findAscendingReactionsInSubset(candles) {

    let candlesBetweenReactions = [];
    let reactions = [];
    let finalFirstCandle 
    let finalLastCandle 
    let finalLowestCandle

    for (let i = 0; i < candles.length; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3

            if( j == candles.length - 1){ //check the conditions
                
                lastCandle.high = finalFirstCandle.high + 1
                finalLastCandle = lastCandle

                reactions.push([finalFirstCandle, finalLowestCandle, finalLastCandle])

                let middleCandles = candles.slice(
                    candles.indexOf(finalFirstCandle) ,
                    candles.indexOf(finalLastCandle) + 1
                );

                candlesBetweenReactions.push(middleCandles)
                
                finalFirstCandle = null
                finalLowestCandle =null
                finalLastCandle = null

                // continue
            }

            if(finalFirstCandle){

                if(firstCandle.high < lastCandle.high){
                    
                    if(finalFirstCandle.high < lastCandle.high){

                        if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

                            finalLastCandle = lastCandle

                            const newEntry = [finalFirstCandle, finalLowestCandle, finalLastCandle];


                            reactions.push(newEntry);

                            let middleCandles = candles.slice(
                                candles.indexOf(finalFirstCandle) ,
                                candles.indexOf(finalLastCandle) + 1
                            );

                            candlesBetweenReactions.push(middleCandles)
                            // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle])
                            
                            finalFirstCandle = undefined
                            finalLowestCandle = undefined
                            finalLastCandle = undefined

                            i++
                            // continue;
                        }else{

                            finalFirstCandle = lastCandle //check marvi
                            finalLowestCandle = lastCandle //check marvi in other checkin function
                            i++
                            // continue;
                            // engulf perhaps
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
                    i++
                    // continue;
                    
                }else{
                    finalFirstCandle = firstCandle;
                    if(lastCandle.low  < firstCandle.low){
                        finalLowestCandle = lastCandle
                    }else{
                        finalLowestCandle = firstCandle
                    }
                    i++
                    // continue;
                }
            }

            // preivous model
            // if(finalFirstCandle){

            //     if(firstCandle.high < lastCandle.high){
                    
            //         if(finalFirstCandle.high < lastCandle.high){

            //             if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

            //                 finalLastCandle = lastCandle
            //                 // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle]);
            //                 reactions.push([finalFirstCandle, finalLowestCandle, lastCandle])

            //                 let middleCandles = candles.slice(
            //                     candles.indexOf(finalFirstCandle) ,
            //                     candles.indexOf(finalLastCandle) +1
            //                 );

            //                 candlesBetweenReactions.push(middleCandles)
                            
            //                 finalFirstCandle = null
            //                 finalLowestCandle =null
            //                 finalLastCandle = null

            //                 i++
            //                 continue;
            //             }else{
            //                 i++
            //                 continue;
            //                 // engulf perhaps
            //             }
            //         }else{
            //             if( lastCandle.low < finalLowestCandle.low){

            //                 finalLowestCandle = lastCandle;
            //             }
            //             i++
            //             continue;
            //         }
            //     }else{

            //         if( lastCandle.low < finalLowestCandle.low){

            //             finalLowestCandle = lastCandle;
            //         }
            //         i++
            //         continue;
            //     }
            // }else{
            //     if(firstCandle.high > lastCandle.high){

            //         finalFirstCandle = firstCandle;

            //         if(lastCandle.low  < firstCandle.low){
            //             finalLowestCandle = lastCandle
            //         }else{
            //             finalLowestCandle = firstCandle
            //         }
            //         i++
            //         continue;
                    
            //     }else{
            //         i++
            //         continue;
            //     }
            // }
        }
    }

    return {reactions, candlesBetweenReactions};
}

async function findAscendingReactionBetweenReaction (candles) {

    let candlesBetweenReactions = [];
    let reactions = [];
    let finalFirstCandle 
    let finalLastCandle 
    let finalLowestCandle


    function isDuplicateEntry(reactions, newEntry) {
        return reactions.some(existingEntry =>
            JSON.stringify(existingEntry) === JSON.stringify(newEntry)
        );
    }

    for (let i = 0; i < 1; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3
            if( 
                (firstCandle.time == "2025-02-07 19:15:00") 
                || (firstCandle.time == "2025-02-07 19:20:00") 
                || (firstCandle.time == "2025-02-07 19:25:00")
                || (firstCandle.time == "2025-02-07 19:30:00")
                || (firstCandle.time == "2025-02-07 19:35:00")
                || (firstCandle.time == "2025-02-07 19:40:00")
            ){
                // console.log("i j ", i, j);
                // console.log("firstCandle", firstCandle, );
                // console.log("lastCandle", lastCandle, );
                // console.log("finalFirstCandle", finalFirstCandle, );
                // console.log("finalLowestCandle", finalLowestCandle);
                // console.log("**************************");
            }
            if(finalFirstCandle){

                if(firstCandle.high < lastCandle.high){
                    
                    if(finalFirstCandle.high < lastCandle.high){

                        if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

                            finalLastCandle = lastCandle

                            const newEntry = [finalFirstCandle, finalLowestCandle, finalLastCandle];

                            if (!isDuplicateEntry(finalAscendingReactions, newEntry)) {

                                reactions.push(newEntry);

                                let middleCandles = candles.slice(
                                    candles.indexOf(finalFirstCandle) ,
                                    candles.indexOf(finalLastCandle) + 1
                                );
    
                                candlesBetweenReactions.push(middleCandles)
                                
                            }
                            // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle])

                            
                            finalFirstCandle = undefined
                            finalLowestCandle = undefined
                            finalLastCandle = undefined

                            i++
                            // continue;
                        }else{

                            finalFirstCandle = lastCandle //check marvi
                            finalLowestCandle = lastCandle //check marvi in other checkin function
                            i++
                            // continue;
                            // engulf perhaps
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

                    i++
                    // continue;
                    
                }else{
                    i++
                    // continue;
                }
            }
        }
    }
    return {reactions, candlesBetweenReactions};
}

async function findAscendingReactions(subsets) {

    let {reactions, candlesBetweenReactions} = await findAscendingReactionsInSubset(subsets)

    finalAscendingCandlesBetweenReactions.push(...candlesBetweenReactions);
    finalAscendingReactions.push(...reactions);
        
    for (let i = 0; i < finalAscendingCandlesBetweenReactions.length; i++) {

        if(finalAscendingCandlesBetweenReactions[i]?.length < 4) {
            i++;
        }

        let {reactions, candlesBetweenReactions} = await findAscendingReactionBetweenReaction(finalAscendingCandlesBetweenReactions[i])
        finalAscendingCandlesBetweenReactions.push(...candlesBetweenReactions);
        finalAscendingReactions.push(...reactions);

        // let res = await findAscendingReactionsInSubset(subsets)
        // finalAscendingCandlesBetweenReactions.push(...res?.candlesBetweenReactions);
        // finalAscendingReactions.push(...res?.reactions);
    }

    // fs.appendFileSync('finalAscendingCandlesBetweenReactions.json', JSON.stringify(finalAscendingCandlesBetweenReactions, null, 2), 'utf8');   
    // fs.appendFileSync('finalReacations.json', JSON.stringify(finalAscendingReactions, null, 2), 'utf8');   
    // console.log("finalAscendingReactions", finalAscendingReactions);
    // console.log("finalAscendingReactions", finalAscendingReactions);

    return finalAscendingReactions;
}


const getRandomRGBA = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = (Math.random() * 0.2).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
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
                borderColor: "green",
                borderWidth: 0.5,
            }
            rectanlges.push(obj)
        }       

        
        // fs.writeFileSync('bars.json', JSON.stringify(bars, null, 2), 'utf-8');
        // fs.writeFileSync('reactions.json', JSON.stringify(reactions, null, 2), 'utf-8');
        fs.writeFileSync('rectanlges.json', JSON.stringify(rectanlges, null, 2), 'utf-8');

        res.send({formattedCandles}); 
    } catch (error) {
        console.error('Error fetching data from Python API:', error);
        res.status(500).send('Error fetching candle data');
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
