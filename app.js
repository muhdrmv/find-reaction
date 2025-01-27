let express = require('express');
let axios = require('axios'); // For making HTTP requests
let fs = require('fs'); // Import the File System module

let app = express();
let PORT = 3000;


function findReactions(candles) {

    let finalReactions = [];
    let reactions = [];
    let minCandles = 3;

    let finalFirstCandle 
    let finalLastCandle 
    let finalLowestCandle

    for (let i = 0; i < candles.length; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3

            // console.log(" firstCandle " , firstCandle);
            // console.log(" lastCandle " , lastCandle);
            
            let lowestCandle
            // let middleCandles = candles.slice(i + 1, j);
            
            if(finalFirstCandle){

                if(firstCandle.high < lastCandle.high){
                    
                    if(finalFirstCandle.high < lastCandle.high){

                        if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

                            finalLastCandle = lastCandle
                            // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle]);
                            finalReactions.push([finalFirstCandle, finalLowestCandle, lastCandle])

                            finalFirstCandle = null
                            finalLowestCandle =null
                            finalLastCandle = null

                            i++
                            continue;
                        }else{
                            i++
                            continue;
                            // engulf perhaps
                        }
                    }else{
                        if( lastCandle.low < finalLowestCandle.low){

                            finalLowestCandle = lastCandle;
                        }
                        i++
                        continue;
                    }
                }else{

                    if( lastCandle.low < finalLowestCandle.low){

                        finalLowestCandle = lastCandle;
                    }
                    i++
                    continue;
                }
            }else{
                if(firstCandle.high > lastCandle.high){

                    finalFirstCandle = firstCandle;

                    if(lastCandle.low  < firstCandle.low){
                        finalLowestCandle = lastCandle
                    }else{
                        finalLowestCandle = firstCandle
                    }
                    i++
                    continue;
                    
                }else{
                    i++
                    continue;
                }
            }
                

        }
    }

    return finalReactions;
}

// Example input: Array of candlesticks with high and low prices





app.get('/candles', async (req, res) => {
    try {
        console.log("fsdfds");
        
        
        let response = await axios.get('http://127.0.0.1:5000/candles');
        

        let results = await findReactions(response.data);
        console.log("sdkslkd",results);

        fs.writeFileSync('reactions.json', JSON.stringify(results, null, 2), 'utf-8');
        res.json(results); 
    } catch (error) {
        console.error('Error fetching data from Python API:', error.message);
        res.status(500).send('Error fetching candle data');
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
