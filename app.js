let express = require('express');
let axios = require('axios');
const cors = require('cors');
let fs = require('fs'); 
let app = express();
let PORT = 3000;

app.use(cors());

let finalReactions = [];    
let finalCandlesBetweenReactions = [];

async function findReactionsInSubset(candles) {

    let candlesBetweenReactions = [];
    let reactions = [];
    let finalFirstCandle 
    let finalLastCandle 
    let finalLowestCandle

    for (let i = 0; i < candles.length; i++) {
        for (let j = i + 1; j < candles.length; j++) {
            
            let firstCandle = candles[i]; // 2
            let lastCandle = candles[j]; // 3

            if(finalFirstCandle){

                if(firstCandle.high < lastCandle.high){
                    
                    if(finalFirstCandle.high < lastCandle.high){

                        if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

                            finalLastCandle = lastCandle
                            // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle]);
                            reactions.push([finalFirstCandle, finalLowestCandle, lastCandle])

                            let middleCandles = candles.slice(
                                candles.indexOf(finalFirstCandle) ,
                                candles.indexOf(finalLastCandle) +1
                            );

                            candlesBetweenReactions.push(middleCandles)
                            
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
    // console.log(reactions, candlesBetweenReactions);
    return {reactions, candlesBetweenReactions};
}

async function findReactionBetweenReaction (candles) {

  let candlesBetweenReactions = [];
  let reactions = [];
  let finalFirstCandle 
  let finalLastCandle 
  let finalLowestCandle

  for (let i = 0; i < 1; i++) {
      for (let j = i + 1; j < candles.length; j++) {
          
          
          let firstCandle = candles[i]; // 2
          let lastCandle = candles[j]; // 3
          
          if(finalFirstCandle){

              if(firstCandle.high < lastCandle.high){
                  
                  if(finalFirstCandle.high < lastCandle.high){

                      if( lastCandle.low > finalLowestCandle.low && finalFirstCandle.low !== finalLowestCandle.low){

                          finalLastCandle = lastCandle
                          // reactions.push([finalFirstCandle, finalLowestCandle, lastCandle]);
                          reactions.push([finalFirstCandle, finalLowestCandle, lastCandle])

                          let middleCandles = candles.slice(
                              candles.indexOf(finalFirstCandle) ,
                              candles.indexOf(finalLastCandle) + 1
                          );

                          candlesBetweenReactions.push(middleCandles)
                          
                          finalFirstCandle = null
                          finalLowestCandle =null
                          finalLastCandle = null

                          i++
                          continue;
                      }else{

                          finalFirstCandle = lastCandle //check marvi
                          finalLowestCandle = lastCandle //check marvi in other checkin function
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
              if(firstCandle.high < lastCandle.high){
                  finalFirstCandle = lastCandle;
                  finalLowestCandle = lastCandle

                  i++
                  continue;
                  
              }else{
                  i++
                  continue;
              }
          }
      }
  }
  // console.log("reactions,", reactions);
  return {reactions, candlesBetweenReactions};
}

async function findReactions(subsets) {

    let {reactions, candlesBetweenReactions} = await findReactionsInSubset(subsets)
    
    finalCandlesBetweenReactions.push(...candlesBetweenReactions);
    finalReactions.push(...reactions);

    for (let i = 0; i < finalCandlesBetweenReactions.length; i++) {

        if(finalCandlesBetweenReactions[i]?.length < 4) {
            i++;
        }

        let {reactions, candlesBetweenReactions} = await findReactionBetweenReaction(finalCandlesBetweenReactions[i])
        finalCandlesBetweenReactions.push(...candlesBetweenReactions);
        finalReactions.push(...reactions);

        // let res = await findReactionsInSubset(subsets)
        // finalCandlesBetweenReactions.push(...res?.candlesBetweenReactions);
        // finalReactions.push(...res?.reactions);
    }
                    
    // fs.appendFileSync('finalCandlesBetweenReactions.json', JSON.stringify(finalCandlesBetweenReactions, null, 2), 'utf8');   
    // fs.appendFileSync('finalReacations.json', JSON.stringify(finalReactions, null, 2), 'utf8');   
    // console.log("finalReactions", finalReactions);
    // console.log("finalReactions", finalReactions);

    return finalReactions;
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

        // let bars = await axios.get('http://127.0.0.1:5000/candles'); for request MARVI
        // console.log("bars", bars);   ATTENTION -> bars.data is array

        const data = fs.readFileSync('response-full.json', 'utf8');
        bars = JSON.parse(data);
        
        // let reactions = await findReactions(bars.data); for request MARVI
        let reactions = await findReactions(bars);
        fs.writeFileSync('test.json', JSON.stringify(reactions, null, 2), 'utf-8');
        // console.log("reactions", reactions);

        const formattedReactions = bars.map(item => ({
            c: item.close,
            h: item.high,
            l: item.low,
            o: item.open,
            x: new Date(item.time).getTime()
        }));

        for (let i = 0; i < reactions.length; i++) {
            let obj = {
                type: "box",
                xMin: new Date(reactions[i][0].time).getTime(), // Start time (in milliseconds)
                xMax: new Date(reactions[i][2].time).getTime() , // End time (in milliseconds)
                yMin: reactions[i][1].low, // Minimum price
                yMax: reactions[i][0].high, // Maximum price
                backgroundColor: getRandomRGBA(), // Semi-transparent green
                borderColor: "black",
                borderWidth: 0.5,
            }
            rectanlges.push(obj)
        }
       
          
        // fs.writeFileSync('bars.json', JSON.stringify(bars, null, 2), 'utf-8');
        // fs.writeFileSync('reactions.json', JSON.stringify(reactions, null, 2), 'utf-8');
        fs.writeFileSync('formattedReactions.json', JSON.stringify(formattedReactions, null, 2), 'utf-8');
        fs.writeFileSync('rectanlges.json', JSON.stringify(rectanlges, null, 2), 'utf-8');

        res.send({reactions, formattedReactions}); 
    } catch (error) {
        console.error('Error fetching data from Python API:', error.message);
        res.status(500).send('Error fetching candle data');
    }
});

app.listen(PORT, () => {
    console.log(`Express server running on http://127.0.0.1:${PORT}`);
});
